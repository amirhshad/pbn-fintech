import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { CustomError, asyncHandler } from './errorHandler';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phoneNumber: string;
    verificationStatus: string;
    trustScore: number;
  };
}

// Verify JWT token and attach user to request
export const authenticate = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // Check for token in Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token in cookies (for web app)
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new CustomError('Access token required', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      sessionId: string;
    };

    // Check if session is still active
    const session = await prisma.userSession.findUnique({
      where: {
        id: decoded.sessionId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
            fullName: true,
            verificationStatus: true,
            trustScore: true,
            isActive: true,
            isBanned: true
          }
        }
      }
    });

    if (!session) {
      throw new CustomError('Invalid or expired session', 401);
    }

    // Check if user is active and not banned
    if (!session.user.isActive || session.user.isBanned) {
      throw new CustomError('Account is inactive or banned', 403);
    }

    // Update last used timestamp
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() }
    });

    // Attach user to request
    req.user = {
      id: session.user.id,
      phoneNumber: session.user.phoneNumber,
      verificationStatus: session.user.verificationStatus,
      trustScore: Number(session.user.trustScore)
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new CustomError('Invalid access token', 401);
    }
    throw error;
  }
});

// Require phone verification
export const requirePhoneVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401);
  }

  if (req.user.verificationStatus === 'PENDING') {
    throw new CustomError('Phone verification required', 403);
  }

  next();
};

// Require ID verification
export const requireIdVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401);
  }

  const allowedStatuses = ['ID_VERIFIED', 'FULLY_VERIFIED'];
  if (!allowedStatuses.includes(req.user.verificationStatus)) {
    throw new CustomError('ID verification required', 403);
  }

  next();
};

// Require minimum trust score
export const requireMinTrustScore = (minScore: number) => (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401);
  }

  if (req.user.trustScore < minScore) {
    throw new CustomError(`Minimum trust score of ${minScore} required`, 403);
  }

  next();
};

// Admin only access (for future admin features)
export const requireAdmin = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401);
  }

  // For now, check if user is in admin list (can be env variable)
  const adminPhones = process.env.ADMIN_PHONE_NUMBERS?.split(',') || [];

  if (!adminPhones.includes(req.user.phoneNumber)) {
    throw new CustomError('Admin access required', 403);
  }

  next();
});

// Alias for backward compatibility
export const authenticateToken = authenticate;