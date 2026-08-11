import { Request, Response, NextFunction } from 'express';
import { PersistenceService } from '../services/persistenceService.js';
import { User, Session, Role } from '../types/index.js';

export const SESSION_COOKIE_NAME = 'mgs_session';

// Extend Express Request interface to hold authenticated user and session
declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.cookies[SESSION_COOKIE_NAME] || req.headers['x-session-id'];

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.',
        },
      });
    }

    const data = await PersistenceService.readData();
    const session = data.sessions.find((s) => s.id === sessionId);

    if (!session) {
      res.clearCookie(SESSION_COOKIE_NAME);
      return res.status(401).json({
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Your session has expired or is invalid. Please log in again.',
        },
      });
    }

    // Check expiration
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      // Delete expired session
      await PersistenceService.updateData((draft) => {
        draft.sessions = draft.sessions.filter((s) => s.id !== sessionId);
      });
      res.clearCookie(SESSION_COOKIE_NAME);
      return res.status(401).json({
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Session timed out. Please log in again.',
        },
      });
    }

    const user = data.users.find((u) => u.id === session.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Associated user account no longer exists.',
        },
      });
    }

    if (user.status === 'suspended') {
      // Invalidate session for suspended user
      await PersistenceService.updateData((draft) => {
        draft.sessions = draft.sessions.filter((s) => s.id !== sessionId);
      });
      res.clearCookie(SESSION_COOKIE_NAME);
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended by administration. Please contact support.',
        },
      });
    }

    // Update last activity timestamp asynchronously
    session.lastActivityAt = new Date().toISOString();
    PersistenceService.updateData((draft) => {
      const s = draft.sessions.find((sess) => sess.id === sessionId);
      if (s) s.lastActivityAt = new Date().toISOString();
    }).catch(() => {});

    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(requiredRole: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires '${requiredRole}' privileges.`,
        },
      });
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole('admin')(req, res, next);
}
