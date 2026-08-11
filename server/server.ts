import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { seedInitialDataIfNeeded } from './services/seedService.js';
import { securityHeadersMiddleware } from './security/securityHeaders.js';
import { generalRateLimiter } from './security/rateLimiter.js';
import { csrfProtectionMiddleware } from './security/csrfProtection.js';
import { errorHandlerMiddleware } from './security/errorHandler.js';

// Import 6 API Route Groups
import authRoutes from './routes/authRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

export const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// 1. Parsing & Core Middlewares
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// 2. Strict CORS Configuration (Section 109)
app.use(
  cors({
    origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'x-session-id'],
  })
);

// 3. Security Headers & Rate Limiting (Section 68, 75)
app.use(securityHeadersMiddleware);
app.use(generalRateLimiter);

// 4. CSRF Protection Middleware (Section 108)
app.use(csrfProtectionMiddleware);

// 5. Mount EXACTLY 6 API Groups (Section 7, 14)
app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);

// Catch-all 404 for missing API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'API_ENDPOINT_NOT_FOUND',
      message: `The endpoint '${req.method} ${req.originalUrl}' does not exist on Mahesh Game Space.`,
    },
  });
});

// Serve static frontend assets in production mode
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(PROJECT_ROOT, 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientDist, 'index.html'));
  });
}

// 6. Centralized Error Handling Middleware (Section 77)
app.use(errorHandlerMiddleware);

// Bootstrap Function
export async function startServer() {
  try {
    // Seed database if runtime.json is missing or uninitialized
    await seedInitialDataIfNeeded();

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 Mahesh Game Space Backend Simulator Online`);
        console.log(`📡 Listening on: http://localhost:${PORT}`);
        console.log(`🔒 OWASP Security Controls & CSRF Protection Active`);
        console.log(`💾 Persistence Target: /data/runtime.json`);
        console.log(`====================================================`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
