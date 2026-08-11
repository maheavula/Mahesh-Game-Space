import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export const CSRF_COOKIE_NAME = 'mgs_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export function generateCsrfToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function setCsrfCookie(res: Response, token: string): void {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Accessible by frontend JavaScript to include in headers
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Allow safe HTTP methods (GET, HEAD, OPTIONS)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // If no CSRF cookie exists, generate one
    if (!req.cookies[CSRF_COOKIE_NAME]) {
      const token = generateCsrfToken();
      setCsrfCookie(res, token);
    }
    return next();
  }

  // Exempt public auth endpoints like login/signup if initial session is being established
  if (req.path === '/api/auth/login' || req.path === '/api/auth/signup') {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] || req.headers[CSRF_HEADER_NAME.toLowerCase()];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INVALID_CSRF_TOKEN',
        message: 'Invalid or missing CSRF token.',
      },
    });
  }

  next();
}
