import { Router } from 'express';
import { AuthService } from '../services/authService.js';
import { authRateLimiter } from '../security/rateLimiter.js';
import { validateBody, signupSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../security/inputValidation.js';
import { requireAuth, SESSION_COOKIE_NAME } from '../security/authorization.js';
import { generateCsrfToken, setCsrfCookie } from '../security/csrfProtection.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', authRateLimiter, validateBody(signupSchema), async (req, res, next) => {
  try {
    const { user, session } = await AuthService.signup(req.body);

    res.cookie(SESSION_COOKIE_NAME, session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    res.status(201).json({
      success: true,
      data: {
        user,
        session: { id: session.id, expiresAt: session.expiresAt },
        csrfToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, session } = await AuthService.login(email, password);

    res.cookie(SESSION_COOKIE_NAME, session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    res.json({
      success: true,
      data: {
        user,
        session: { id: session.id, expiresAt: session.expiresAt },
        csrfToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const sessionId = req.cookies[SESSION_COOKIE_NAME] || req.headers['x-session-id'];
    await AuthService.logout(sessionId as string, req.user?.id || null);

    res.clearCookie(SESSION_COOKIE_NAME);
    res.json({
      success: true,
      data: { message: 'Logged out successfully.' },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const csrfToken = req.cookies['mgs_csrf'] || generateCsrfToken();
  if (!req.cookies['mgs_csrf']) {
    setCsrfCookie(res, csrfToken);
  }

  res.json({
    success: true,
    data: {
      user: req.user,
      session: {
        id: req.session?.id,
        expiresAt: req.session?.expiresAt,
      },
      csrfToken,
    },
  });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, validateBody(updateProfileSchema), async (req, res, next) => {
  try {
    const updated = await AuthService.updateProfile(req.user!.id, req.body);
    res.json({
      success: true,
      data: { user: updated },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, validateBody(changePasswordSchema), async (req, res, next) => {
  try {
    await AuthService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    res.json({
      success: true,
      data: { message: 'Password changed successfully. Please log in again.' },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
