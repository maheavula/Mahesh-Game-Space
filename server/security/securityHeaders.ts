import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// 1. Production-Grade Helmet Security Configuration
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Permitted for Vite HMR and local scripts
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: [
        "'self'",
        "http://localhost:5173",
        "ws://localhost:5173",
        "http://localhost:3002",
        "ws://localhost:3002",
        "http://localhost:3000",
        "ws://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3002",
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // Anti-clickjacking
      upgradeInsecureRequests: null, // Allow local HTTP simulation without forced HTTPS redirect loops
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  dnsPrefetchControl: { allow: false },
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  hidePoweredBy: true,
});

// 2. Custom Security Headers & Anti-Information-Disclosure Middleware
export function additionalSecurityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Strip technological fingerprinting & server information disclosure headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Anti-MIME-sniffing & Anti-clickjacking explicit enforcement
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Restrict sensitive browser features via Permissions-Policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), display-capture=(), battery=()'
  );

  // Prevent caching of private authenticated / API responses to prevent data leaks via caches
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  next();
}

// Combined security headers middleware
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  helmetMiddleware(req, res, (err) => {
    if (err) return next(err);
    additionalSecurityHeadersMiddleware(req, res, next);
  });
}
