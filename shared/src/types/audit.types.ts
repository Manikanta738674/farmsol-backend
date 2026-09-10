import { UserRole } from '../constants/stages';

export interface IAuditLog {
  _id?: string;
  auditId: string; // AUD-2026-000991
  actorId: string;
  actorName: string;
  role: UserRole | 'SYSTEM';
  action: string; // 'BOOKING_OVERRIDE', 'GATE_ENTRY', 'QUALITY_RECORDED', 'WEIGHING_RECORDED', 'PROCUREMENT_FINALIZED', etc.
  entity: string; // 'Booking', 'Centre', 'Rate', 'Queue', etc.
  entityId: string;
  centreId?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  reason?: string;
  ipAddress?: string;
  timestamp: Date;
}
