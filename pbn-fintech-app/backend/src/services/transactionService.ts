import { PrismaClient } from '@prisma/client';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class TransactionService {
  // Create a transaction from an accepted match
  async createTransaction(matchId: string, userId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        request1: true,
        request2: true,
      },
    });

    if (!match) {
      throw new CustomError('Match not found', 404);
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new CustomError('You are not part of this match', 403);
    }

    if (match.status !== 'ACCEPTED') {
      throw new CustomError('Match must be accepted by both parties first', 400);
    }

    // Check if transaction already exists for this match
    const existingTransaction = await prisma.transaction.findFirst({
      where: { matchId },
    });

    if (existingTransaction) {
      throw new CustomError('Transaction already exists for this match', 400);
    }

    // Generate unique 6-digit transaction code
    const transactionCode = this.generateTransactionCode();

    // Determine who is giver and receiver
    const cashGiverId = match.user2Id; // user2 has cash (HAVE_CASH)
    const cashReceiverId = match.user1Id; // user1 needs cash (NEED_CASH)

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        matchId,
        amount: match.matchedAmount,
        platformFee: 2.0,
        transactionCode,
        cashGiverId,
        cashReceiverId,
        status: 'PENDING',
        timeoutAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      },
      include: {
        match: {
          include: {
            request1: { include: { user: { select: { id: true, fullName: true } } } },
            request2: { include: { user: { select: { id: true, fullName: true } } } },
          },
        },
        cashGiver: {
          select: { id: true, fullName: true, phoneNumber: true },
        },
        cashReceiver: {
          select: { id: true, fullName: true, phoneNumber: true },
        },
      },
    });

    // Update match status
    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'MEETING' },
    });

    logger.info(`Transaction created: ${transaction.id} with code ${transactionCode}`);

    return transaction;
  }

  // Confirm transaction (by either party)
  async confirmTransaction(transactionId: string, userId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        cashGiver: { select: { id: true, fullName: true } },
        cashReceiver: { select: { id: true, fullName: true } },
        match: true,
      },
    });

    if (!transaction) {
      throw new CustomError('Transaction not found', 404);
    }

    if (transaction.cashGiverId !== userId && transaction.cashReceiverId !== userId) {
      throw new CustomError('You are not part of this transaction', 403);
    }

    if (transaction.status === 'COMPLETED') {
      throw new CustomError('Transaction is already completed', 400);
    }

    if (transaction.status === 'CANCELLED' || transaction.status === 'TIMEOUT') {
      throw new CustomError('Transaction is no longer active', 400);
    }

    // Check if timed out
    if (transaction.timeoutAt && new Date() > transaction.timeoutAt) {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'TIMEOUT' },
      });
      throw new CustomError('Transaction has timed out', 400);
    }

    // Determine which party is confirming
    const isGiver = transaction.cashGiverId === userId;
    const updateData: any = {};

    if (isGiver) {
      if (transaction.giverConfirmed) {
        throw new CustomError('You have already confirmed this transaction', 400);
      }
      updateData.giverConfirmed = true;
      updateData.giverConfirmedAt = new Date();
    } else {
      if (transaction.receiverConfirmed) {
        throw new CustomError('You have already confirmed this transaction', 400);
      }
      updateData.receiverConfirmed = true;
      updateData.receiverConfirmedAt = new Date();
    }

    // Check if both parties have confirmed
    const otherConfirmed = isGiver
      ? transaction.receiverConfirmed
      : transaction.giverConfirmed;

    if (otherConfirmed) {
      // Both confirmed - complete the transaction
      updateData.status = 'COMPLETED';
      updateData.completedAt = new Date();

      // Update match status
      await prisma.match.update({
        where: { id: transaction.matchId },
        data: { status: 'COMPLETED' },
      });

      // Update user statistics
      await Promise.all([
        prisma.user.update({
          where: { id: transaction.cashGiverId },
          data: {
            totalTransactions: { increment: 1 },
            successfulTransactions: { increment: 1 },
          },
        }),
        prisma.user.update({
          where: { id: transaction.cashReceiverId },
          data: {
            totalTransactions: { increment: 1 },
            successfulTransactions: { increment: 1 },
          },
        }),
      ]);

      // Create fee payment records
      await Promise.all([
        prisma.feePayment.create({
          data: {
            userId: transaction.cashGiverId,
            transactionId: transaction.id,
            amount: 1.0,
            paymentType: 'TRANSACTION_FEE',
            status: 'PENDING',
          },
        }),
        prisma.feePayment.create({
          data: {
            userId: transaction.cashReceiverId,
            transactionId: transaction.id,
            amount: 1.0,
            paymentType: 'TRANSACTION_FEE',
            status: 'PENDING',
          },
        }),
      ]);

      logger.info(`Transaction completed: ${transactionId}`);
    } else {
      updateData.status = 'EXCHANGING';
      logger.info(
        `Transaction ${transactionId} confirmed by ${isGiver ? 'giver' : 'receiver'}. Waiting for other party.`
      );
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        cashGiver: { select: { id: true, fullName: true, phoneNumber: true } },
        cashReceiver: { select: { id: true, fullName: true, phoneNumber: true } },
        match: true,
      },
    });

    return updatedTransaction;
  }

  // Get transaction by ID
  async getTransaction(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        cashGiver: {
          select: { id: true, fullName: true, phoneNumber: true, trustScore: true },
        },
        cashReceiver: {
          select: { id: true, fullName: true, phoneNumber: true, trustScore: true },
        },
        match: {
          include: {
            request1: true,
            request2: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new CustomError('Transaction not found', 404);
    }

    return transaction;
  }

  // Get all transactions for a user
  async getUserTransactions(userId: string, status?: string) {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ cashGiverId: userId }, { cashReceiverId: userId }],
        status: status || undefined,
      },
      include: {
        cashGiver: { select: { id: true, fullName: true } },
        cashReceiver: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions;
  }

  // Cancel a transaction
  async cancelTransaction(transactionId: string, userId: string, reason?: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new CustomError('Transaction not found', 404);
    }

    if (transaction.cashGiverId !== userId && transaction.cashReceiverId !== userId) {
      throw new CustomError('You are not part of this transaction', 403);
    }

    if (transaction.status === 'COMPLETED') {
      throw new CustomError('Cannot cancel a completed transaction', 400);
    }

    if (transaction.status === 'CANCELLED') {
      throw new CustomError('Transaction is already cancelled', 400);
    }

    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'CANCELLED' },
    });

    logger.info(`Transaction cancelled: ${transactionId} by user ${userId}. Reason: ${reason || 'Not specified'}`);

    return { message: 'Transaction cancelled successfully' };
  }

  // Generate a random 6-digit transaction code
  private generateTransactionCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
