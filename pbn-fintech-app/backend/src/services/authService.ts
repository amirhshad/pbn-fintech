import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { CustomError } from '../middleware/errorHandler';
import { SmsService } from './smsService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const smsService = new SmsService();

export class AuthService {
  // Generate random 6-digit verification code
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate JWT token with session
  private async generateAuthToken(userId: string, deviceInfo?: string): Promise<string> {
    // Create session
    const session = await prisma.userSession.create({
      data: {
        userId,
        sessionToken: jwt.sign({ userId, timestamp: Date.now() }, process.env.JWT_SECRET!),
        deviceInfo: deviceInfo || 'Unknown device',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Generate JWT with session ID
    return jwt.sign(
      { userId, sessionId: session.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }

  // Register new user
  async register(data: {
    phoneNumber: string;
    fullName: string;
    dateOfBirth: Date;
    deviceInfo?: string;
  }) {
    const { phoneNumber, fullName, dateOfBirth, deviceInfo } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      throw new CustomError('User with this phone number already exists', 400);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        fullName,
        dateOfBirth,
        verificationStatus: 'PENDING',
      },
    });

    logger.info(`New user registered: ${phoneNumber}`);

    // Send phone verification
    await this.sendPhoneVerification(phoneNumber);

    // Generate auth token
    const token = await this.generateAuthToken(user.id, deviceInfo);

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        verificationStatus: user.verificationStatus,
        trustScore: Number(user.trustScore),
        createdAt: user.createdAt,
      },
      token,
    };
  }

  // Send phone verification code
  async sendPhoneVerification(phoneNumber: string) {
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (user.phoneVerified) {
      throw new CustomError('Phone number already verified', 400);
    }

    // Generate verification code
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with verification code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerificationCode: code,
        phoneVerificationExpiry: expiresAt,
      },
    });

    // Send SMS
    try {
      await smsService.sendVerificationCode(phoneNumber, code);
      logger.info(`Verification code sent to ${phoneNumber}`);
    } catch (error) {
      logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
      throw new CustomError('Failed to send verification code', 500);
    }

    return { message: 'Verification code sent' };
  }

  // Verify phone number
  async verifyPhone(phoneNumber: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (user.phoneVerified) {
      throw new CustomError('Phone number already verified', 400);
    }

    if (!user.phoneVerificationCode || !user.phoneVerificationExpiry) {
      throw new CustomError('No verification code found. Please request a new one.', 400);
    }

    if (new Date() > user.phoneVerificationExpiry) {
      throw new CustomError('Verification code has expired', 400);
    }

    if (user.phoneVerificationCode !== code) {
      throw new CustomError('Invalid verification code', 400);
    }

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        verificationStatus: 'PHONE_VERIFIED',
        phoneVerificationCode: null,
        phoneVerificationExpiry: null,
      },
    });

    logger.info(`Phone verified for user: ${phoneNumber}`);

    return {
      message: 'Phone number verified successfully',
      user: {
        id: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
        fullName: updatedUser.fullName,
        verificationStatus: updatedUser.verificationStatus,
        phoneVerified: updatedUser.phoneVerified,
      },
    };
  }

  // Login user (for returning users)
  async login(phoneNumber: string, deviceInfo?: string) {
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (!user.isActive) {
      throw new CustomError('Account is inactive', 403);
    }

    if (user.isBanned) {
      throw new CustomError('Account has been banned', 403);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate auth token
    const token = await this.generateAuthToken(user.id, deviceInfo);

    logger.info(`User logged in: ${phoneNumber}`);

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        verificationStatus: user.verificationStatus,
        trustScore: Number(user.trustScore),
        totalTransactions: user.totalTransactions,
        lastLoginAt: user.lastLoginAt,
      },
      token,
    };
  }

  // Logout user (invalidate session)
  async logout(sessionId: string) {
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    return { message: 'Logged out successfully' };
  }

  // Refresh token
  async refreshToken(oldToken: string) {
    try {
      const decoded = jwt.verify(oldToken, process.env.JWT_SECRET!) as {
        userId: string;
        sessionId: string;
      };

      const session = await prisma.userSession.findUnique({
        where: { id: decoded.sessionId, isActive: true },
        include: { user: true },
      });

      if (!session || new Date() > session.expiresAt) {
        throw new CustomError('Invalid session', 401);
      }

      // Generate new token with same session
      const newToken = jwt.sign(
        { userId: decoded.userId, sessionId: decoded.sessionId },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return {
        token: newToken,
        user: {
          id: session.user.id,
          phoneNumber: session.user.phoneNumber,
          fullName: session.user.fullName,
          verificationStatus: session.user.verificationStatus,
        },
      };
    } catch (error) {
      throw new CustomError('Invalid token', 401);
    }
  }

  // Get user profile
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviewsReceived: {
          select: {
            rating: true,
            reviewText: true,
            createdAt: true,
            reviewer: {
              select: { fullName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            givenTransactions: true,
            receivedTransactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      profilePhotoUrl: user.profilePhotoUrl,
      verificationStatus: user.verificationStatus,
      trustScore: Number(user.trustScore),
      totalTransactions: user.totalTransactions,
      successfulTransactions: user.successfulTransactions,
      memberSince: user.createdAt,
      recentReviews: user.reviewsReceived,
      transactionCounts: user._count,
    };
  }
}