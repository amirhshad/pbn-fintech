import { PrismaClient } from '@prisma/client';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class CashRequestService {
  // Create a new cash request
  async createRequest(data: {
    userId: string;
    requestType: 'NEED_CASH' | 'HAVE_CASH';
    amount: number;
    locationLat: number;
    locationLng: number;
    locationDescription?: string;
    radiusKm?: number;
    specialRequirements?: string;
    minUserRating?: number;
  }) {
    const {
      userId,
      requestType,
      amount,
      locationLat,
      locationLng,
      locationDescription,
      radiusKm,
      specialRequirements,
      minUserRating,
    } = data;

    // Validate amount
    if (amount <= 0 || amount > 1000) {
      throw new CustomError('Amount must be between €1 and €1000', 400);
    }

    // Get user to check trust score and transaction limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (!user.isActive || user.isBanned) {
      throw new CustomError('Account is not active', 403);
    }

    // New user limits (trust score < 1.0)
    if (user.trustScore < 1.0) {
      if (amount > 200) {
        throw new CustomError('New users can only request up to €200', 400);
      }

      // Check daily transaction limit for new users
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayRequests = await prisma.cashRequest.count({
        where: {
          userId,
          createdAt: {
            gte: todayStart,
          },
        },
      });

      if (todayRequests >= 2) {
        throw new CustomError('New users are limited to 2 requests per day', 400);
      }
    }

    // Create the cash request
    const cashRequest = await prisma.cashRequest.create({
      data: {
        userId,
        requestType,
        amount,
        locationLat,
        locationLng,
        locationDescription,
        radiusKm: radiusKm || 5,
        specialRequirements,
        minUserRating,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            trustScore: true,
            totalTransactions: true,
          },
        },
      },
    });

    logger.info(`Cash request created: ${cashRequest.id} by user ${userId}`);

    return cashRequest;
  }

  // Get active requests near a location
  async findNearbyRequests(params: {
    locationLat: number;
    locationLng: number;
    radiusKm?: number;
    requestType?: 'NEED_CASH' | 'HAVE_CASH';
    minAmount?: number;
    maxAmount?: number;
    excludeUserId?: string;
  }) {
    const {
      locationLat,
      locationLng,
      radiusKm = 10,
      requestType,
      minAmount,
      maxAmount,
      excludeUserId,
    } = params;

    // Get all active requests
    const requests = await prisma.cashRequest.findMany({
      where: {
        status: 'ACTIVE',
        requestType: requestType || undefined,
        amount: {
          gte: minAmount,
          lte: maxAmount,
        },
        userId: excludeUserId ? { not: excludeUserId } : undefined,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate distance and filter by radius
    const nearbyRequests = requests
      .map((request) => {
        const distance = this.calculateDistance(
          locationLat,
          locationLng,
          request.locationLat,
          request.locationLng
        );

        return {
          ...request,
          distance: parseFloat(distance.toFixed(2)),
        };
      })
      .filter((request) => request.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearbyRequests;
  }

  // Get a specific cash request by ID
  async getRequestById(requestId: string) {
    const request = await prisma.cashRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            trustScore: true,
            totalTransactions: true,
            verificationStatus: true,
            profilePhotoUrl: true,
          },
        },
      },
    });

    if (!request) {
      throw new CustomError('Cash request not found', 404);
    }

    return request;
  }

  // Get all requests by a user
  async getUserRequests(userId: string, includeInactive = false) {
    const requests = await prisma.cashRequest.findMany({
      where: {
        userId,
        status: includeInactive ? undefined : 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests;
  }

  // Update a cash request
  async updateRequest(
    requestId: string,
    userId: string,
    updates: {
      locationLat?: number;
      locationLng?: number;
      locationDescription?: string;
      radiusKm?: number;
      specialRequirements?: string;
    }
  ) {
    // Verify ownership
    const request = await prisma.cashRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new CustomError('Cash request not found', 404);
    }

    if (request.userId !== userId) {
      throw new CustomError('You can only update your own requests', 403);
    }

    if (request.status !== 'ACTIVE') {
      throw new CustomError('Can only update active requests', 400);
    }

    const updatedRequest = await prisma.cashRequest.update({
      where: { id: requestId },
      data: updates,
    });

    logger.info(`Cash request updated: ${requestId}`);

    return updatedRequest;
  }

  // Cancel a cash request
  async cancelRequest(requestId: string, userId: string) {
    // Verify ownership
    const request = await prisma.cashRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new CustomError('Cash request not found', 404);
    }

    if (request.userId !== userId) {
      throw new CustomError('You can only cancel your own requests', 403);
    }

    if (request.status !== 'ACTIVE') {
      throw new CustomError('Request is already inactive', 400);
    }

    const cancelledRequest = await prisma.cashRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' },
    });

    logger.info(`Cash request cancelled: ${requestId}`);

    return cancelledRequest;
  }

  // Calculate distance between two points using Haversine formula
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
    const distance = R * c;

    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
