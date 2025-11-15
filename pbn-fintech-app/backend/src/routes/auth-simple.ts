import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Simple logger
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[AUTH] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[AUTH] ${msg}`, ...args)
};

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'pbn-fintech-test-secret-key';

// Helper functions
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const formatDutchPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  if (cleaned.startsWith('0')) {
    return '+31' + cleaned.substring(1);
  } else if (cleaned.startsWith('31')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('+31')) {
    return cleaned;
  }
  
  return '+31' + cleaned;
};

const isValidDutchPhone = (phone: string): boolean => {
  const dutchPhoneRegex = /^\+31[0-9]{9}$/;
  return dutchPhoneRegex.test(phone);
};

// Auth service health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { phoneNumber, fullName, dateOfBirth } = req.body;

    // Validate input
    if (!phoneNumber || !fullName || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        error: 'Phone number, full name, and date of birth are required'
      });
    }

    // Format and validate phone number
    const formattedPhone = formatDutchPhoneNumber(phoneNumber);
    
    if (!isValidDutchPhone(formattedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Dutch phone number. Must be in format +31XXXXXXXXX'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: formattedPhone }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this phone number already exists'
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        phoneNumber: formattedPhone,
        fullName: fullName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        phoneVerificationCode: verificationCode,
        phoneVerificationExpiry: codeExpiry,
        verificationStatus: 'PENDING'
      }
    });

    logger.info(`New user registered: ${formattedPhone}`);
    logger.info(`Verification code (TEST MODE): ${verificationCode}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Check logs for verification code (TEST MODE).',
      data: {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        verificationCode: verificationCode // ONLY FOR TESTING - remove in production
      }
    });

  } catch (error: any) {
    logger.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error.message
    });
  }
});

// Verify phone number
router.post('/verify-phone', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and verification code are required'
      });
    }

    const formattedPhone = formatDutchPhoneNumber(phoneNumber);

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber: formattedPhone }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.phoneVerified) {
      return res.status(400).json({
        success: false,
        error: 'Phone number already verified'
      });
    }

    if (!user.phoneVerificationCode || !user.phoneVerificationExpiry) {
      return res.status(400).json({
        success: false,
        error: 'No verification code found. Please register again.'
      });
    }

    if (new Date() > user.phoneVerificationExpiry) {
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired'
      });
    }

    if (user.phoneVerificationCode !== code.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        verificationStatus: 'PHONE_VERIFIED',
        phoneVerificationCode: null,
        phoneVerificationExpiry: null
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
        verificationStatus: updatedUser.verificationStatus
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`Phone verified for user: ${formattedPhone}`);

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        token,
        user: {
          id: updatedUser.id,
          phoneNumber: updatedUser.phoneNumber,
          fullName: updatedUser.fullName,
          verificationStatus: updatedUser.verificationStatus,
          phoneVerified: updatedUser.phoneVerified
        }
      }
    });

  } catch (error: any) {
    logger.error('Phone verification error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Phone verification failed',
      details: error.message
    });
  }
});

// Login user (for returning users)
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const formattedPhone = formatDutchPhoneNumber(phoneNumber);

    const user = await prisma.user.findUnique({
      where: { phoneNumber: formattedPhone }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.phoneVerified) {
      return res.status(400).json({
        success: false,
        error: 'Phone number not verified. Please complete verification first.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        phoneNumber: user.phoneNumber,
        verificationStatus: user.verificationStatus
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    logger.info(`User logged in: ${formattedPhone}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          verificationStatus: user.verificationStatus,
          trustScore: Number(user.trustScore),
          totalTransactions: user.totalTransactions
        }
      }
    });

  } catch (error: any) {
    logger.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message
    });
  }
});

// Get user profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        verificationStatus: true,
        trustScore: true,
        totalTransactions: true,
        successfulTransactions: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error: any) {
    logger.error('Profile fetch error:', error.message);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
});

export default router;