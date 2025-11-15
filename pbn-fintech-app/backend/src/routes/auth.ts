import express from 'express';
import { AuthService } from '../services/authService';
import { SmsService } from '../services/smsService';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../utils/validation';
import { registerSchema, phoneVerificationSchema } from '../utils/validation';
import { logger } from '../utils/logger';

const router = express.Router();
const authService = new AuthService();

// Register new user
router.post('/register', 
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { phoneNumber, fullName, dateOfBirth } = req.body;
    const deviceInfo = req.get('User-Agent') || 'Unknown device';

    // Format phone number
    const formattedPhone = SmsService.formatPhoneNumber(phoneNumber);
    
    if (!SmsService.isValidDutchPhoneNumber(formattedPhone)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid Dutch phone number format' }
      });
    }

    const result = await authService.register({
      phoneNumber: formattedPhone,
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      deviceInfo
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Verification code sent to phone.',
      data: result
    });
  })
);

// Send phone verification code
router.post('/send-verification',
  asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: { message: 'Phone number is required' }
      });
    }

    const formattedPhone = SmsService.formatPhoneNumber(phoneNumber);
    
    if (!SmsService.isValidDutchPhoneNumber(formattedPhone)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid Dutch phone number format' }
      });
    }

    const result = await authService.sendPhoneVerification(formattedPhone);

    res.json({
      success: true,
      data: result
    });
  })
);

// Verify phone number
router.post('/verify-phone',
  validateBody(phoneVerificationSchema),
  asyncHandler(async (req, res) => {
    const { phoneNumber, code } = req.body;
    
    const formattedPhone = SmsService.formatPhoneNumber(phoneNumber);
    const result = await authService.verifyPhone(formattedPhone, code);

    res.json({
      success: true,
      data: result
    });
  })
);

// Login user
router.post('/login',
  asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;
    const deviceInfo = req.get('User-Agent') || 'Unknown device';

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: { message: 'Phone number is required' }
      });
    }

    const formattedPhone = SmsService.formatPhoneNumber(phoneNumber);
    
    if (!SmsService.isValidDutchPhoneNumber(formattedPhone)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid Dutch phone number format' }
      });
    }

    const result = await authService.login(formattedPhone, deviceInfo);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  })
);

// Get current user profile
router.get('/profile',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const profile = await authService.getUserProfile(req.user!.id);

    res.json({
      success: true,
      data: { user: profile }
    });
  })
);

// Refresh auth token
router.post('/refresh-token',
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: { message: 'Token is required' }
      });
    }

    const result = await authService.refreshToken(token);

    res.json({
      success: true,
      data: result
    });
  })
);

// Logout user
router.post('/logout',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // Extract session ID from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({
        success: false,
        error: { message: 'No token provided' }
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sessionId: string };
    
    const result = await authService.logout(decoded.sessionId);

    res.json({
      success: true,
      data: result
    });
  })
);

// Health check for auth service
router.get('/health',
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Auth service is healthy',
      timestamp: new Date().toISOString()
    });
  })
);

export default router;