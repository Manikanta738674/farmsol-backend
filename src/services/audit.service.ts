import { AuditLogModel } from '../models/AuditLog.model';
import { IdGenerator, UserRole } from '@smartfarmer/shared';

export class AuditService {
  public static async recordLog(params: {
    actorId: string;
    actorName: string;
    role: UserRole | 'SYSTEM';
    action: string;
    entity: string;
    entityId: string;
    centreId?: string;
    changes?: {
      before?: Record<string, any>;
      after?: Record<string, any>;
    };
    reason?: string;
    ipAddress?: string;
  }): Promise<void> {
    try {
      const auditId = IdGenerator.generateAuditId();
      await AuditLogModel.create({
        auditId,
        ...params,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('[AuditService] Failed to record audit log:', err);
    }
  }
}
