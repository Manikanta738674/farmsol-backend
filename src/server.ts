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

// Root Route
app.get('/', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FARMSOL - Govt. of India Procurement API Engine</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; text-align: center; }
          .card { max-width: 680px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 40px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          .badge { display: inline-block; background: #10b981; color: #022c22; font-weight: 700; padding: 6px 16px; border-radius: 9999px; font-size: 14px; margin-bottom: 20px; }
          h1 { color: #38bdf8; font-size: 28px; margin: 0 0 10px 0; }
          p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; }
          .endpoints { text-align: left; background: #090d16; padding: 20px; border-radius: 12px; font-family: monospace; font-size: 13px; color: #a7f3d0; margin-bottom: 24px; border: 1px solid #1e293b; }
          .endpoints div { margin-bottom: 8px; }
          .endpoints a { color: #38bdf8; text-decoration: none; }
          .endpoints a:hover { text-decoration: underline; }
          .footer { color: #64748b; font-size: 13px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">ONLINE & OPERATIONAL</div>
          <h1>FARMSOL Backend API Engine</h1>
          <p>National Farmer Digital Procurement Portal & Realtime Mandi Logistics Cloud Server<br/>Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution</p>
          <div class="endpoints">
            <div>🟢 <strong>GET</strong> <a href="/api/health" target="_blank">/api/health</a> - Health Check</div>
            <div>🟢 <strong>GET</strong> <a href="/api/v1/centres" target="_blank">/api/v1/centres</a> - Mandi Centres Endpoint</div>
            <div>🔐 <strong>POST</strong> /api/v1/auth/otp/request - Send OTP</div>
            <div>🔐 <strong>POST</strong> /api/v1/auth/otp/verify - Verify OTP & Sign In</div>
            <div>📦 <strong>GET/POST</strong> /api/v1/farmer/* - Farmer Bookings & Passes</div>
            <div>⚡ <strong>GET/POST</strong> /api/v1/operator/* - Mandi Gate & Weighbridge Operator</div>
            <div>🛡️ <strong>GET/POST</strong> /api/v1/admin/* - DoCA Mandi Command Centre</div>
          </div>
          <p>Real-time Socket.IO WebSockets active on <code>wss://farmsol-backend.onrender.com</code></p>
          <div class="footer">Version 1.0.0 &bull; Render Cloud Production Server &bull; Govt of India</div>
        </div>
      </body>
      </html>
    `);
  }
  res.json({
    status: 'ONLINE',
    service: 'FARMSOL DoCA National Procurement API Engine',
    version: '1.0.0',
    documentation: 'https://farmsol-backend.onrender.com/api/health',
    timestamp: new Date().toISOString()
  });
});

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
