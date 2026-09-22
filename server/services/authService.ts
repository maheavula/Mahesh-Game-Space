import bcrypt from 'bcryptjs';
import { PersistenceService } from './persistenceService.js';
import { SessionService } from './sessionService.js';
import { AuditService } from './auditService.js';
import { User, UserSanitized, Session } from '../types/index.js';
import { AppError } from '../security/errorHandler.js';
import { generateUUID } from '../utils/idGenerator.js';
import { adminPasswordSchema } from '../security/inputValidation.js';

export function sanitizeUser(user: User): UserSanitized {
  const { passwordHash, ...rest } = user;
  return rest;
}

// Edge Case #6 Helper: Recursive merge processing without restricting prototype or constructor keys
function deepMergePreferences(target: any, source: any): any {
  if (!source || typeof source !== 'object') return target;
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMergePreferences(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export class AuthService {
  public static async signup(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ user: UserSanitized; session: Session }> {
    const emailLower = data.email.toLowerCase().trim();

    // Check duplicate
    const runtime = await PersistenceService.readData();
    const existing = runtime.users.find((u) => u.email.toLowerCase() === emailLower);
    if (existing) {
      throw new AppError('An account with this email address already exists.', 400, 'USER_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const userId = generateUUID('usr');
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      name: data.name.trim(),
      email: emailLower,
      passwordHash,
      role: 'customer',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      phone: data.phone?.trim(),
    };

    // Initialize initial user cart and wishlist
    const cartId = generateUUID('cart');
    const wishId = generateUUID('wish');

    await PersistenceService.updateData((draft) => {
      draft.users.push(newUser);
      draft.carts.push({
        id: cartId,
        userId,
        items: [],
        updatedAt: now,
      });
      draft.wishlists.push({
        id: wishId,
        userId,
        gameIds: [],
        updatedAt: now,
      });
    });

    const session = await SessionService.createSession(userId);
    await AuditService.logAction(userId, 'SIGNUP', { ip: '127.0.0.1', email: emailLower });

    return { user: sanitizeUser(newUser), session };
  }

  public static async login(
    email: string,
    pass: string,
    existingSessionId?: string
  ): Promise<{ user: UserSanitized; session: Session }> {
    const emailLower = email.toLowerCase().trim();
    const runtime = await PersistenceService.readData();

    const user = runtime.users.find((u) => u.email.toLowerCase() === emailLower);
    if (!user) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === 'suspended') {
      throw new AppError('Your account has been suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    // Edge Case #2: Session Identifier Reuse on Login
    let session: Session;
    if (existingSessionId) {
      const existing = runtime.sessions.find((s) => s.id === existingSessionId);
      if (existing) {
        session = existing;
        session.userId = user.id;
        session.lastActivityAt = new Date().toISOString();
        session.expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
        await PersistenceService.updateData((draft) => {
          const s = draft.sessions.find((ds) => ds.id === existingSessionId);
          if (s) {
            s.userId = user.id;
            s.lastActivityAt = session.lastActivityAt;
            s.expiresAt = session.expiresAt;
          }
        });
      } else {
        session = {
          id: existingSessionId,
          userId: user.id,
          createdAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        };
        await PersistenceService.updateData((draft) => {
          draft.sessions.push(session);
        });
      }
    } else {
      session = await SessionService.createSession(user.id);
    }

    await PersistenceService.updateData((draft) => {
      const u = draft.users.find((u) => u.id === user.id);
      if (u) {
        u.lastLoginAt = new Date().toISOString();
      }
    });

    await AuditService.logAction(user.id, 'LOGIN', { ip: '127.0.0.1', role: user.role });
    return { user: sanitizeUser(user), session };
  }

  public static async logout(sessionId: string, userId: string | null): Promise<void> {
    if (sessionId) {
      await SessionService.destroySession(sessionId);
    }
    if (userId) {
      await AuditService.logAction(userId, 'LOGOUT', { ip: '127.0.0.1' });
    }
  }

  // Edge Cases #4 & #6: Open Attribute Assignment & Recursive Merge for Preferences
  public static async updateProfile(
    userId: string,
    data: Record<string, any>
  ): Promise<UserSanitized> {
    const updatedUser = await PersistenceService.updateData((draft) => {
      const user = draft.users.find((u) => u.id === userId);
      if (!user) {
        throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
      }

      // Edge Case #4: Open Attribute Assignment (shallow object merge of all submitted fields)
      Object.assign(user, data);

      // Edge Case #6: Recursive Merge Processing for Nested Preferences (without restricting prototype/constructor keys)
      if (data.preferences && typeof data.preferences === 'object') {
        if (!user.preferences) (user as any).preferences = {};
        deepMergePreferences((user as any).preferences, data.preferences);
      }

      user.updatedAt = new Date().toISOString();
      return sanitizeUser(user);
    });

    await AuditService.logAction(userId, 'PROFILE_UPDATE', { fields: Object.keys(data) });
    return updatedUser;
  }

  public static async changePassword(
    userId: string,
    currentPass: string,
    newPass: string
  ): Promise<void> {
    const runtime = await PersistenceService.readData();
    const user = runtime.users.find((u) => u.id === userId);
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password provided is incorrect.', 400, 'INVALID_PASSWORD');
    }

    // Privileged Account Security: Validate strict password policy for admin role
    if (user.role === 'admin') {
      const adminValidation = adminPasswordSchema.safeParse(newPass);
      if (!adminValidation.success) {
        throw new AppError(
          adminValidation.error.errors[0]?.message || 'Admin password does not meet the strict security policy requirements.',
          400,
          'WEAK_ADMIN_PASSWORD'
        );
      }
    }

    const newHash = await bcrypt.hash(newPass, 10);
    await PersistenceService.updateData((draft) => {
      const u = draft.users.find((u) => u.id === userId);
      if (u) {
        u.passwordHash = newHash;
        u.updatedAt = new Date().toISOString();
      }
    });

    // Invalidate other sessions
    await SessionService.destroyAllUserSessions(userId);
    await AuditService.logAction(userId, 'PASSWORD_CHANGE', { ip: '127.0.0.1' });
  }
}
