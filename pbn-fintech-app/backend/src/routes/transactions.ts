import express from 'express';
import { TransactionService } from '../services/transactionService';
import { authenticateToken } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = express.Router();
const transactionService = new TransactionService();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'transactions' });
});

// Create a transaction from an accepted match
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { matchId } = req.body;

    if (!matchId) {
      throw new CustomError('Match ID is required', 400);
    }

    const transaction = await transactionService.createTransaction(matchId, userId);

    res.status(201).json({
      success: true,
      message: `Transaction created with code: ${transaction.transactionCode}. Both parties must confirm to complete.`,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// Confirm a transaction
router.post('/:transactionId/confirm', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { transactionId } = req.params;

    const transaction = await transactionService.confirmTransaction(transactionId, userId);

    res.json({
      success: true,
      message:
        transaction.status === 'COMPLETED'
          ? 'Transaction completed successfully! Trust scores have been updated.'
          : 'Your confirmation has been recorded. Waiting for other party to confirm.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific transaction
router.get('/:transactionId', authenticateToken, async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await transactionService.getTransaction(transactionId);

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

// Get all transactions for current user
router.get('/user/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { status } = req.query;

    const transactions = await transactionService.getUserTransactions(
      userId,
      status as string | undefined
    );

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

// Cancel a transaction
router.post('/:transactionId/cancel', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { transactionId } = req.params;
    const { reason } = req.body;

    const result = await transactionService.cancelTransaction(transactionId, userId, reason);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;