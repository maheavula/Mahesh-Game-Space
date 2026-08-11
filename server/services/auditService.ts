import { PersistenceService } from './persistenceService.js';
import { AuditAction, AuditLog } from '../types/index.js';

export class AuditService {
  public static async logAction(
    userId: string | null,
    action: AuditAction,
    metadata: Record<string, any> = {}
  ): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      action,
      timestamp: new Date().toISOString(),
      metadata,
    };

    await PersistenceService.updateData((draft) => {
      draft.auditLogs.unshift(newLog);
      // Keep last 1000 logs in memory/disk
      if (draft.auditLogs.length > 1000) {
        draft.auditLogs = draft.auditLogs.slice(0, 1000);
      }
    });

    return newLog;
  }
}
