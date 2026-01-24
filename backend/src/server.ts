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
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌱 AfriFarmers Backend API Server                       ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(10)}                        ║
║                                                           ║
║   API Endpoints:                                          ║
║   • Auth:      POST /api/auth/login, /register            ║
║   • Users:     GET/POST/PUT/DELETE /api/users             ║
║   • Farmers:   GET/POST/PUT/DELETE /api/farmers           ║
║   • Dashboard: GET /api/dashboard                         ║
║   • Analytics: GET /api/analytics                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
