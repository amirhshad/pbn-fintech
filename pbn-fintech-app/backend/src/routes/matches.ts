import express from 'express';
import { MatchingService } from '../services/matchingService';
import { authenticateToken } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = express.Router();
const matchingService = new MatchingService();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'matches' });
});

// Find potential matches for a request
router.get('/find/:requestId', authenticateToken, async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const matches = await matchingService.findMatches(requestId);

    res.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
});

// Create a match between two requests
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { requestId1, requestId2 } = req.body;

    if (!requestId1 || !requestId2) {
      throw new CustomError('Both request IDs are required', 400);
    }

    const match = await matchingService.createMatch(requestId1, requestId2, userId);

    res.status(201).json({
      success: true,
      message: 'Match created successfully. Waiting for other user to accept.',
      data: match,
    });
  } catch (error) {
    next(error);
  }
});

// Accept a match
router.post('/:matchId/accept', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { matchId } = req.params;

    const match = await matchingService.acceptMatch(matchId, userId);

    res.json({
      success: true,
      message:
        match.status === 'ACCEPTED'
          ? 'Match accepted! Both users have agreed. You can now proceed to create a transaction.'
          : 'Match acceptance recorded. Waiting for other user to accept.',
      data: match,
    });
  } catch (error) {
    next(error);
  }
});

// Get all matches for current user
router.get('/user/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { status } = req.query;

    const matches = await matchingService.getUserMatches(userId, status as string | undefined);

    res.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
});

// Get specific match details
router.get('/:matchId', authenticateToken, async (req, res, next) => {
  try {
    const { matchId } = req.params;

    const match = await matchingService.getMatch(matchId);

    res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    next(error);
  }
});

export default router;