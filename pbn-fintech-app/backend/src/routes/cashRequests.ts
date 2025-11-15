import express from 'express';
import { CashRequestService } from '../services/cashRequestService';
import { authenticateToken } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = express.Router();
const cashRequestService = new CashRequestService();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'cash-requests' });
});

// Create a new cash request
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const {
      requestType,
      amount,
      locationLat,
      locationLng,
      locationDescription,
      radiusKm,
      specialRequirements,
      minUserRating,
    } = req.body;

    // Validation
    if (!requestType || !['NEED_CASH', 'HAVE_CASH'].includes(requestType)) {
      throw new CustomError('Invalid request type. Must be NEED_CASH or HAVE_CASH', 400);
    }

    if (!amount || typeof amount !== 'number') {
      throw new CustomError('Amount is required and must be a number', 400);
    }

    if (typeof locationLat !== 'number' || typeof locationLng !== 'number') {
      throw new CustomError('Valid location coordinates are required', 400);
    }

    const cashRequest = await cashRequestService.createRequest({
      userId,
      requestType,
      amount,
      locationLat,
      locationLng,
      locationDescription,
      radiusKm,
      specialRequirements,
      minUserRating,
    });

    res.status(201).json({
      success: true,
      data: cashRequest,
    });
  } catch (error) {
    next(error);
  }
});

// Get nearby cash requests
router.get('/nearby', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const {
      lat,
      lng,
      radius,
      type,
      minAmount,
      maxAmount,
    } = req.query;

    // Validation
    if (!lat || !lng) {
      throw new CustomError('Location coordinates (lat, lng) are required', 400);
    }

    const requests = await cashRequestService.findNearbyRequests({
      locationLat: parseFloat(lat as string),
      locationLng: parseFloat(lng as string),
      radiusKm: radius ? parseInt(radius as string) : 10,
      requestType: type as 'NEED_CASH' | 'HAVE_CASH' | undefined,
      minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
      excludeUserId: userId, // Don't show user's own requests
    });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
});

// Get specific cash request by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await cashRequestService.getRequestById(id);

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
});

// Get all requests by current user
router.get('/user/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const includeInactive = req.query.includeInactive === 'true';

    const requests = await cashRequestService.getUserRequests(userId, includeInactive);

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
});

// Update a cash request
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const {
      locationLat,
      locationLng,
      locationDescription,
      radiusKm,
      specialRequirements,
    } = req.body;

    const updatedRequest = await cashRequestService.updateRequest(id, userId, {
      locationLat,
      locationLng,
      locationDescription,
      radiusKm,
      specialRequirements,
    });

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
});

// Cancel a cash request
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const cancelledRequest = await cashRequestService.cancelRequest(id, userId);

    res.json({
      success: true,
      message: 'Cash request cancelled successfully',
      data: cancelledRequest,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
