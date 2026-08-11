import { Router } from 'express';
import { SessionService } from '../services/sessionService.js';
import { PersistenceService } from '../services/persistenceService.js';
import { SESSION_COOKIE_NAME } from '../security/authorization.js';
import { generateCsrfToken, setCsrfCookie } from '../security/csrfProtection.js';

const router = Router();

// GET /api/system/health
router.get('/health', async (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'online',
      application: 'Mahesh Game Space',
      mode: 'simulator',
      timestamp: new Date().toISOString(),
    },
  });
});

// GET /api/system/session
router.get('/session', async (req, res) => {
  const sessionId = req.cookies[SESSION_COOKIE_NAME] || req.headers['x-session-id'];
  let session = null;
  let user = null;

  if (sessionId && typeof sessionId === 'string') {
    const data = await PersistenceService.readData();
    const foundSession = data.sessions.find((s) => s.id === sessionId);

    if (foundSession && new Date(foundSession.expiresAt).getTime() > Date.now()) {
      session = foundSession;
      const foundUser = data.users.find((u) => u.id === foundSession.userId && u.status === 'active');
      if (foundUser) {
        const { passwordHash, ...rest } = foundUser;
        user = rest;
      }
    }
  }

  const csrfToken = req.cookies['mgs_csrf'] || generateCsrfToken();
  if (!req.cookies['mgs_csrf']) {
    setCsrfCookie(res, csrfToken);
  }

  res.json({
    success: true,
    data: {
      authenticated: Boolean(user),
      user,
      session,
      csrfToken,
    },
  });
});

// POST /api/system/session/refresh
router.post('/session/refresh', async (req, res, next) => {
  try {
    const sessionId = req.cookies[SESSION_COOKIE_NAME] || req.headers['x-session-id'];
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_SESSION', message: 'No active session token found.' },
      });
    }

    const refreshed = await SessionService.refreshSession(sessionId);
    if (!refreshed) {
      res.clearCookie(SESSION_COOKIE_NAME);
      return res.status(401).json({
        success: false,
        error: { code: 'SESSION_EXPIRED', message: 'Session expired.' },
      });
    }

    res.json({
      success: true,
      data: { session: refreshed },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/system/info
router.get('/info', async (req, res) => {
  const data = await PersistenceService.readData();
  res.json({
    success: true,
    data: {
      application: 'Mahesh Game Space',
      version: data.metadata.version || '1.0.0',
      mode: 'simulator',
      persistence: 'runtime.json',
      currency: 'INR (Paise representation)',
      apiGroups: [
        '/api/auth',
        '/api/catalog',
        '/api/cart',
        '/api/orders',
        '/api/admin',
        '/api/system',
      ],
      totalGamesCount: data.games.length,
      categoriesCount: data.categories.length,
      seededAt: data.metadata.seededAt,
      status: 'online',
    },
  });
});

export default router;
