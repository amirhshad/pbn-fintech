import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

// Simple logger for testing
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args)
};

// Initialize Express app
const app = express();
const prisma = new PrismaClient();

// Basic middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'PBN Fintech Auth Service'
  });
});

// Test database connection
app.get('/db-test', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    res.json({ 
      success: true, 
      message: 'Database connection working',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Database connection failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// Import auth routes
import authRoutes from './routes/auth-simple';
app.use('/api/auth', authRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Server error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 PBN Fintech Auth Service running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Database test: http://localhost:${PORT}/db-test`);
});

export { app, prisma, logger };