import bcrypt from 'bcryptjs';
import { PersistenceService } from './persistenceService.js';
import { SessionService } from './sessionService.js';
import { AuditService } from './auditService.js';
import { User, UserSanitized, Session } from '../types/index.js';
import { AppError } from '../security/errorHandler.js';

export function sanitizeUser(user: User): UserSanitized {
  const { passwordHash, ...rest } = user;
  return rest;
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
    const userId = `USR-${10000 + runtime.users.length + 1}`;
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

    // Initialize user, cart, wishlist atomically
    await PersistenceService.updateData((draft) => {
      draft.users.push(newUser);
      draft.carts.push({
        id: `CART-${10000 + draft.carts.length + 1}`,
        userId,
        items: [],
        updatedAt: now,
      });
      draft.wishlists.push({
        id: `WISH-${10000 + draft.wishlists.length + 1}`,
        userId,
        gameIds: [],
        updatedAt: now,
      });
    });

    const session = await SessionService.createSession(userId);
    await AuditService.logAction(userId, 'SIGNUP', { email: emailLower });

    return {
      user: sanitizeUser(newUser),
      session,
    };
  }

  public static async login(
    email: string,
    password: string
  ): Promise<{ user: UserSanitized; session: Session }> {
    const emailLower = email.toLowerCase().trim();
    const runtime = await PersistenceService.readData();
    const user = runtime.users.find((u) => u.email.toLowerCase() === emailLower);

    // OWASP A07 requirement: Generic message for invalid credentials
    if (!user) {
      await AuditService.logAction(null, 'LOGIN', { email: emailLower, result: 'FAILURE_INVALID_CREDENTIALS' });
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      await AuditService.logAction(user.id, 'LOGIN', { result: 'FAILURE_INVALID_CREDENTIALS' });
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === 'suspended') {
      await AuditService.logAction(user.id, 'LOGIN', { result: 'FAILURE_SUSPENDED' });
      throw new AppError('Your account has been suspended by administration.', 403, 'ACCOUNT_SUSPENDED');
    }

    // Session rotation: Invalidate old sessions and create fresh session
    await SessionService.invalidateAllUserSessions(user.id);
    const session = await SessionService.createSession(user.id);

    // Update last login
    const now = new Date().toISOString();
    await PersistenceService.updateData((draft) => {
      const u = draft.users.find((usr) => usr.id === user.id);
      if (u) {
        u.lastLoginAt = now;
        u.updatedAt = now;
      }
    });

    user.lastLoginAt = now;
    await AuditService.logAction(user.id, 'LOGIN', { result: 'SUCCESS' });

    return {
      user: sanitizeUser(user),
      session,
    };
  }

  public static async logout(sessionId: string, userId: string | null): Promise<void> {
    await SessionService.invalidateSession(sessionId);
    await AuditService.logAction(userId, 'LOGOUT');
  }

  public static async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; avatarUrl?: string }
  ): Promise<UserSanitized> {
    const updated = await PersistenceService.updateData((draft) => {
      const u = draft.users.find((usr) => usr.id === userId);
      if (!u) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      if (data.name) u.name = data.name.trim();
      if (data.phone !== undefined) u.phone = data.phone.trim();
      if (data.avatarUrl !== undefined) u.avatarUrl = data.avatarUrl;
      u.updatedAt = new Date().toISOString();
      return u;
    });

    await AuditService.logAction(userId, 'PROFILE_UPDATE');
    return sanitizeUser(updated);
  }

  public static async changePassword(
    userId: string,
    currentPass: string,
    newPass: string
  ): Promise<void> {
    const runtime = await PersistenceService.readData();
    const user = runtime.users.find((u) => u.id === userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    const isValid = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect.', 400, 'INVALID_PASSWORD');
    }

    const newHash = await bcrypt.hash(newPass, 10);
    await PersistenceService.updateData((draft) => {
      const u = draft.users.find((usr) => usr.id === userId);
      if (u) {
        u.passwordHash = newHash;
        u.updatedAt = new Date().toISOString();
      }
    });

    // Invalidate existing sessions
    await SessionService.invalidateAllUserSessions(userId);
    await AuditService.logAction(userId, 'PASSWORD_CHANGE');
  }
}
