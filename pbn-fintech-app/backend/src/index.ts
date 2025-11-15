import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import http from 'http';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import cashRequestRoutes from './routes/cashRequests';
import matchRoutes from './routes/matches';
import transactionRoutes from './routes/transactions';
import locationRoutes from './routes/locations';

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env['NODE_ENV'] === 'production'
      ? process.env['FRONTEND_URL']
      : ["http://localhost:3000", "http://localhost:19000"],
    methods: ["GET", "POST"]
  }
});

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Redis
const redis = createClient({
  url: process.env['REDIS_URL'] || 'redis://localhost:6379'
});

// Connect to Redis
redis.connect().catch((err) => {
  logger.error('Redis connection error:', err);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production'
    ? process.env['FRONTEND_URL']
    : ["http://localhost:3000", "http://localhost:19000"],
  credentials: true
}));
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env['NODE_ENV']
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cash-requests', cashRequestRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/locations', locationRoutes);

// Socket.io for real-time features
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  // Join user to their personal room for notifications
  socket.on('join_user_room', (userId: string) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined room: user_${userId}`);
  });

  // Handle match notifications
  socket.on('new_match', (data: { userId: string; matchId: string; amount: number }) => {
    io.to(`user_${data.userId}`).emit('match_found', {
      matchId: data.matchId,
      amount: data.amount,
      timestamp: new Date().toISOString()
    });
    logger.info(`Match notification sent to user ${data.userId}`);
  });

  // Handle transaction updates
  socket.on('transaction_update', (data: { userId: string; transactionId: string; status: string }) => {
    io.to(`user_${data.userId}`).emit('transaction_status', {
      transactionId: data.transactionId,
      status: data.status,
      timestamp: new Date().toISOString()
    });
  });

  // Handle meeting coordination
  socket.on('meeting_message', (data: { matchId: string; senderId: string; receiverId: string; message: string }) => {
    io.to(`user_${data.receiverId}`).emit('new_message', {
      matchId: data.matchId,
      senderId: data.senderId,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
  await prisma.$disconnect();
  await redis.disconnect();
});

const PORT = process.env['PORT'] || 3000;

server.listen(PORT, () => {
  logger.info(`🚀 PBN Fintech API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env['NODE_ENV']}`);
  logger.info(`Database: ${process.env['DATABASE_URL'] ? 'Connected' : 'Not configured'}`);
});

// Export for testing
export { app, io, prisma, redis };