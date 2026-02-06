import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config';
import {
  authRoutes,
  userRoutes,
  farmerRoutes,
  dashboardRoutes,
  analyticsRoutes,
} from './routes';
import { errorHandler, notFound } from './middleware';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port in development
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Check against allowed origins
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
    
    // Allow any Vercel deployment (useful for development/staging)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AfriFarmers API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to AfriFarmers API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
