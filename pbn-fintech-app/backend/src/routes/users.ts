import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { authenticate, requirePhoneVerification, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery } from '../utils/validation';
import { paginationSchema } from '../utils/validation';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile (public view)
router.get('/:userId/profile',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        profilePhotoUrl: true,
        trustScore: true,
        totalTransactions: true,
        successfulTransactions: true,
        createdAt: true,
        verificationStatus: true,
        reviewsReceived: {
          select: {
            rating: true,
            reviewText: true,
            createdAt: true,
            reviewer: {
              select: { fullName: true }
            }
          },
          where: { isVisible: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Calculate average rating
    const avgRating = user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / user.reviewsReceived.length
      : 0;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          profilePhotoUrl: user.profilePhotoUrl,
          trustScore: Number(user.trustScore),
          totalTransactions: user.totalTransactions,
          successfulTransactions: user.successfulTransactions,
          memberSince: user.createdAt,
          verificationStatus: user.verificationStatus,
          averageRating: Math.round(avgRating * 10) / 10,
          recentReviews: user.reviewsReceived
        }
      }
    });
  })
);

// Update user profile
router.put('/profile',
  authenticate,
  requirePhoneVerification,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { fullName, profilePhotoUrl, locationLat, locationLng } = req.body;
    const userId = req.user!.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(profilePhotoUrl && { profilePhotoUrl }),
        ...(locationLat && locationLng && {
          locationLat,
          locationLng,
          locationUpdatedAt: new Date()
        })
      },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        profilePhotoUrl: true,
        verificationStatus: true,
        trustScore: true,
        locationLat: true,
        locationLng: true,
        locationUpdatedAt: true,
        updatedAt: true
      }
    });

    logger.info(`User profile updated: ${userId}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  })
);

// Update user location
router.put('/location',
  authenticate,
  requirePhoneVerification,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { latitude, longitude, accuracy } = req.body;
    const userId = req.user!.id;

    if (!latitude || !longitude) {
      throw new CustomError('Latitude and longitude are required', 400);
    }

    // Validate Netherlands coordinates
    if (latitude < 50.7 || latitude > 53.6 || longitude < 3.3 || longitude > 7.3) {
      throw new CustomError('Location must be within Netherlands', 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        locationLat: latitude,
        locationLng: longitude,
        locationUpdatedAt: new Date()
      }
    });

    logger.info(`User location updated: ${userId}`);

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        latitude,
        longitude,
        updatedAt: new Date().toISOString()
      }
    });
  })
);

// Get user's transaction history
router.get('/transactions',
  authenticate,
  requirePhoneVerification,
  validateQuery(paginationSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query as any;
    const skip = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          OR: [
            { cashGiverId: userId },
            { cashReceiverId: userId }
          ]
        },
        include: {
          cashGiver: {
            select: { id: true, fullName: true, profilePhotoUrl: true }
          },
          cashReceiver: {
            select: { id: true, fullName: true, profilePhotoUrl: true }
          },
          match: {
            select: { 
              agreedLocation: true,
              scheduledTime: true
            }
          },
          reviews: {
            where: { reviewedUserId: userId },
            select: { rating: true, reviewText: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { cashGiverId: userId },
            { cashReceiverId: userId }
          ]
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        transactions: transactions.map(transaction => ({
          id: transaction.id,
          amount: Number(transaction.amount),
          status: transaction.status,
          userRole: transaction.cashGiverId === userId ? 'giver' : 'receiver',
          otherUser: transaction.cashGiverId === userId 
            ? transaction.cashReceiver 
            : transaction.cashGiver,
          agreedLocation: transaction.match.agreedLocation,
          scheduledTime: transaction.match.scheduledTime,
          completedAt: transaction.completedAt,
          createdAt: transaction.createdAt,
          userReview: transaction.reviews[0] || null
        })),
        pagination: {
          current: page,
          total: Math.ceil(totalCount / limit),
          count: totalCount,
          perPage: limit
        }
      }
    });
  })
);

// Get user statistics
router.get('/stats',
  authenticate,
  requirePhoneVerification,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.id;

    const [user, transactionStats, reviewStats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          trustScore: true,
          totalTransactions: true,
          successfulTransactions: true,
          createdAt: true
        }
      }),
      prisma.transaction.groupBy({
        by: ['status'],
        where: {
          OR: [
            { cashGiverId: userId },
            { cashReceiverId: userId }
          ]
        },
        _count: { status: true }
      }),
      prisma.userReview.aggregate({
        where: { reviewedUserId: userId, isVisible: true },
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Calculate success rate
    const completedTransactions = transactionStats.find(stat => stat.status === 'COMPLETED')?._count.status || 0;
    const totalTransactions = transactionStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

    res.json({
      success: true,
      data: {
        stats: {
          trustScore: Number(user.trustScore),
          totalTransactions: user.totalTransactions,
          successfulTransactions: user.successfulTransactions,
          successRate: Math.round(successRate * 10) / 10,
          averageRating: reviewStats._avg.rating ? Math.round(Number(reviewStats._avg.rating) * 10) / 10 : 0,
          totalReviews: reviewStats._count.rating,
          memberSince: user.createdAt,
          transactionBreakdown: transactionStats
        }
      }
    });
  })
);

// Search users (for admin purposes or public directory)
router.get('/search',
  authenticate,
  requirePhoneVerification,
  validateQuery(paginationSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { page = 1, limit = 10, name, minRating } = req.query as any;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      isActive: true,
      isBanned: false,
      verificationStatus: { in: ['PHONE_VERIFIED', 'ID_VERIFIED', 'FULLY_VERIFIED'] }
    };

    if (name) {
      whereClause.fullName = {
        contains: name,
        mode: 'insensitive'
      };
    }

    if (minRating) {
      whereClause.trustScore = {
        gte: parseFloat(minRating)
      };
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          profilePhotoUrl: true,
          trustScore: true,
          totalTransactions: true,
          createdAt: true,
          _count: {
            select: {
              reviewsReceived: {
                where: { isVisible: true }
              }
            }
          }
        },
        orderBy: [
          { trustScore: 'desc' },
          { totalTransactions: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          fullName: user.fullName,
          profilePhotoUrl: user.profilePhotoUrl,
          trustScore: Number(user.trustScore),
          totalTransactions: user.totalTransactions,
          totalReviews: user._count.reviewsReceived,
          memberSince: user.createdAt
        })),
        pagination: {
          current: page,
          total: Math.ceil(totalCount / limit),
          count: totalCount,
          perPage: limit
        }
      }
    });
  })
);

export default router;