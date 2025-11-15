import { PrismaClient } from '@prisma/client';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class MatchingService {
  // Find potential matches for a cash request
  async findMatches(requestId: string) {
    const request = await prisma.cashRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new CustomError('Cash request not found', 404);
    }

    if (request.status !== 'ACTIVE') {
      throw new CustomError('Request is not active', 400);
    }

    // Find opposite type requests (NEED_CASH <-> HAVE_CASH)
    const oppositeType = request.requestType === 'NEED_CASH' ? 'HAVE_CASH' : 'NEED_CASH';

    // Get potential matches
    const potentialMatches = await prisma.cashRequest.findMany({
      where: {
        status: 'ACTIVE',
        requestType: oppositeType,
        userId: { not: request.userId }, // Don't match with yourself
        // Amount should be close (within 20% tolerance)
        amount: {
          gte: request.amount * 0.8,
          lte: request.amount * 1.2,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            trustScore: true,
            totalTransactions: true,
            verificationStatus: true,
          },
        },
      },
    });

    // Calculate match scores based on distance and amount match
    const matches = potentialMatches
      .map((match) => {
        const distance = this.calculateDistance(
          request.locationLat,
          request.locationLng,
          match.locationLat,
          match.locationLng
        );

        // Skip if outside both radius limits
        if (distance > request.radiusKm && distance > match.radiusKm) {
          return null;
        }

        // Calculate match score (0-100)
        const distanceScore = Math.max(0, 100 - (distance / 10) * 50); // Closer = better
        const amountScore = 100 - Math.abs(request.amount - match.amount) * 5; // Closer amounts = better
        const trustScore = match.user.trustScore * 20; // Higher trust = better

        const matchScore = (distanceScore * 0.4 + amountScore * 0.4 + trustScore * 0.2);

        return {
          request: match,
          distance: parseFloat(distance.toFixed(2)),
          matchScore: parseFloat(matchScore.toFixed(2)),
        };
      })
      .filter((m) => m !== null)
      .sort((a, b) => (b?.matchScore || 0) - (a?.matchScore || 0));

    return matches;
  }

  // Create a match between two requests
  async createMatch(requestId1: string, requestId2: string, userId: string) {
    // Get both requests
    const [request1, request2] = await Promise.all([
      prisma.cashRequest.findUnique({ where: { id: requestId1 }, include: { user: true } }),
      prisma.cashRequest.findUnique({ where: { id: requestId2 }, include: { user: true } }),
    ]);

    if (!request1 || !request2) {
      throw new CustomError('One or both requests not found', 404);
    }

    // Verify user is part of one of the requests
    if (request1.userId !== userId && request2.userId !== userId) {
      throw new CustomError('You must be part of one of the requests', 403);
    }

    // Verify requests are active
    if (request1.status !== 'ACTIVE' || request2.status !== 'ACTIVE') {
      throw new CustomError('Both requests must be active', 400);
    }

    // Verify they are opposite types
    if (request1.requestType === request2.requestType) {
      throw new CustomError('Cannot match same request types', 400);
    }

    // Check for existing match
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { requestId1: requestId1, requestId2: requestId2 },
          { requestId1: requestId2, requestId2: requestId1 },
        ],
        status: { in: ['PENDING', 'ACCEPTED', 'MEETING'] },
      },
    });

    if (existingMatch) {
      throw new CustomError('A match already exists between these requests', 400);
    }

    // Ensure request1 is always NEED_CASH and request2 is HAVE_CASH for consistency
    const [needCashReq, haveCashReq] =
      request1.requestType === 'NEED_CASH' ? [request1, request2] : [request2, request1];

    // Calculate distance and match score
    const distance = this.calculateDistance(
      needCashReq.locationLat,
      needCashReq.locationLng,
      haveCashReq.locationLat,
      haveCashReq.locationLng
    );

    const matchScore = this.calculateMatchScore(needCashReq, haveCashReq, distance);

    // Create the match
    const match = await prisma.match.create({
      data: {
        requestId1: needCashReq.id,
        requestId2: haveCashReq.id,
        user1Id: needCashReq.userId,
        user2Id: haveCashReq.userId,
        matchedAmount: Math.min(needCashReq.amount, haveCashReq.amount),
        matchScore,
        status: 'PENDING',
      },
      include: {
        request1: {
          include: { user: { select: { id: true, fullName: true, trustScore: true } } },
        },
        request2: {
          include: { user: { select: { id: true, fullName: true, trustScore: true } } },
        },
      },
    });

    logger.info(`Match created: ${match.id} between users ${match.user1Id} and ${match.user2Id}`);

    return match;
  }

  // Accept a match
  async acceptMatch(matchId: string, userId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new CustomError('Match not found', 404);
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new CustomError('You are not part of this match', 403);
    }

    if (match.status !== 'PENDING') {
      throw new CustomError('Match is no longer pending', 400);
    }

    // Determine which user is accepting
    const isUser1 = match.user1Id === userId;
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (isUser1) {
      updateData.user1Accepted = true;
      updateData.user1AcceptedAt = new Date();
    } else {
      updateData.user2Accepted = true;
      updateData.user2AcceptedAt = new Date();
    }

    // Check if both users have now accepted
    const otherUserAccepted = isUser1 ? match.user2Accepted : match.user1Accepted;
    if (otherUserAccepted) {
      updateData.status = 'ACCEPTED';

      // Update both requests to MATCHED status
      await prisma.cashRequest.updateMany({
        where: {
          id: { in: [match.requestId1, match.requestId2] },
        },
        data: { status: 'MATCHED' },
      });
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        request1: {
          include: { user: { select: { id: true, fullName: true, phoneNumber: true } } },
        },
        request2: {
          include: { user: { select: { id: true, fullName: true, phoneNumber: true } } },
        },
      },
    });

    logger.info(`Match ${matchId} accepted by user ${userId}. Status: ${updatedMatch.status}`);

    return updatedMatch;
  }

  // Get matches for a user
  async getUserMatches(userId: string, status?: string) {
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: status || undefined,
      },
      include: {
        request1: {
          include: { user: { select: { id: true, fullName: true, trustScore: true } } },
        },
        request2: {
          include: { user: { select: { id: true, fullName: true, trustScore: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return matches;
  }

  // Get a specific match
  async getMatch(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        request1: {
          include: { user: { select: { id: true, fullName: true, trustScore: true, phoneNumber: true } } },
        },
        request2: {
          include: { user: { select: { id: true, fullName: true, trustScore: true, phoneNumber: true } } },
        },
        transactions: true,
      },
    });

    if (!match) {
      throw new CustomError('Match not found', 404);
    }

    return match;
  }

  // Calculate distance using Haversine formula
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateMatchScore(request1: any, request2: any, distance: number): number {
    const distanceScore = Math.max(0, 100 - (distance / 10) * 50);
    const amountScore = 100 - Math.abs(request1.amount - request2.amount) * 5;
    const avgTrustScore = ((request1.user.trustScore + request2.user.trustScore) / 2) * 20;

    return parseFloat((distanceScore * 0.4 + amountScore * 0.4 + avgTrustScore * 0.2).toFixed(2));
  }
}
