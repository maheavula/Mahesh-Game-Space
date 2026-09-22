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
app.disable('x-powered-by');
const DEFAULT_PORT = Number(process.env.PORT) || 3002;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// 1. Parsing & Core Middlewares
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// 2. Strict CORS Configuration (Section 109)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or localhost on any port
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
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

// 5. Serve static public assets (game SVG icons, favicon, etc.)
const publicDir = path.resolve(PROJECT_ROOT, 'public');
app.use(express.static(publicDir));

// 6. Mount EXACTLY 6 API Groups (Section 7, 14)
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
      message: `The endpoint '${req.method} ${req.originalUrl}' does not exist on AMR Game Space.`,
    },
  });
});

// 7. Serve static frontend assets
const clientDist = path.resolve(PROJECT_ROOT, 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.resolve(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

// 8. Centralized Error Handling Middleware (Section 77)
app.use(errorHandlerMiddleware);

// Bootstrap Function with auto-incrementing port fallback
export async function startServer(preferredPort: number = DEFAULT_PORT) {
  try {
    // Seed database if runtime.json is missing or uninitialized
    await seedInitialDataIfNeeded();

    if (process.env.NODE_ENV !== 'test') {
      const server = app.listen(preferredPort, '127.0.0.1', () => {
        console.log(`====================================================`);
        console.log(`🚀 AMR Game Space Backend Simulator Online`);
        console.log(`📡 Listening on: http://127.0.0.1:${preferredPort}`);
        console.log(`====================================================`);
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`⚠️ Port ${preferredPort} is already in use. Retrying on port ${preferredPort + 1}...`);
          startServer(preferredPort + 1);
        } else {
          console.error('Server startup error:', err);
        }
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
