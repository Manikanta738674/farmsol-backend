import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { ENV } from './config/environment';
import { connectDatabase } from './config/database';
import { initSocket } from './config/socket';
import { errorHandler } from './middlewares/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import farmerRoutes from './routes/farmer.routes';
import bookingRoutes from './routes/booking.routes';
import queueRoutes from './routes/queue.routes';
import operatorRoutes from './routes/operator.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server, ENV.CORS_ORIGIN);

// Global Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  const dbStates = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const dbStatus = dbStates[mongoose.connection.readyState] || 'Unknown';
  res.status(200).json({
    status: 'HEALTHY',
    service: 'Smart Agricultural Procurement Platform API',
    department: 'Department of Consumer Affairs (DoCA)',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

import { persistentStore } from './services/persistentStore';

// API Routes
app.get('/api/v1/centres', (req, res) => {
  res.json({ success: true, data: persistentStore.getCollection('centres') });
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/farmer', farmerRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/queue', queueRoutes);
app.use('/api/v1/operator', operatorRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error Handling Middleware
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(ENV.PORT, '0.0.0.0', () => {
      console.log(`================================================================`);
      console.log(`🚀 Smart Procurement API Server running on http://0.0.0.0:${ENV.PORT}`);
      console.log(`🌾 Ministry of Consumer Affairs, Food & Public Distribution (DoCA)`);
      console.log(`🔗 Health Check: http://localhost:${ENV.PORT}/api/health`);
      console.log(`📱 Android Emulator Access: http://10.0.2.2:${ENV.PORT}/api/v1`);
      console.log(`================================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export { app, server };
