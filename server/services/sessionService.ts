import crypto from 'crypto';
import { PersistenceService } from './persistenceService.js';
import { Session } from '../types/index.js';

const SESSION_TTL_MINUTES = parseInt(process.env.SESSION_TTL_MINUTES || '60', 10);

export class SessionService {
  public static async createSession(userId: string): Promise<Session> {
    const sessionId = `SESSION-${crypto.randomBytes(32).toString('hex')}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MINUTES * 60 * 1000).toISOString();

    const session: Session = {
      id: sessionId,
      userId,
      createdAt: now.toISOString(),
      expiresAt,
      lastActivityAt: now.toISOString(),
    };

    await PersistenceService.updateData((draft) => {
      // Clean up expired sessions for this user or all users
      const currentMs = Date.now();
      draft.sessions = draft.sessions.filter(
        (s) => new Date(s.expiresAt).getTime() > currentMs
      );
      draft.sessions.push(session);
    });

    return session;
  }

  public static async invalidateSession(sessionId: string): Promise<void> {
    await PersistenceService.updateData((draft) => {
      draft.sessions = draft.sessions.filter((s) => s.id !== sessionId);
    });
  }

  public static async destroySession(sessionId: string): Promise<void> {
    return this.invalidateSession(sessionId);
  }

  public static async invalidateAllUserSessions(userId: string): Promise<void> {
    await PersistenceService.updateData((draft) => {
      draft.sessions = draft.sessions.filter((s) => s.userId !== userId);
    });
  }

  public static async destroyAllUserSessions(userId: string): Promise<void> {
    return this.invalidateAllUserSessions(userId);
  }

  public static async refreshSession(sessionId: string): Promise<Session | null> {
    return PersistenceService.updateData((draft) => {
      const session = draft.sessions.find((s) => s.id === sessionId);
      if (!session) return null;

      const now = new Date();
      if (new Date(session.expiresAt).getTime() < now.getTime()) {
        draft.sessions = draft.sessions.filter((s) => s.id !== sessionId);
        return null;
      }

      session.expiresAt = new Date(now.getTime() + SESSION_TTL_MINUTES * 60 * 1000).toISOString();
      session.lastActivityAt = now.toISOString();
      return session;
    });
  }
}
