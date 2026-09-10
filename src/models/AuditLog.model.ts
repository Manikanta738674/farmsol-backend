import mongoose, { Document, Schema } from 'mongoose';
import { IAuditLog } from '@smartfarmer/shared';

export interface IAuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    auditId: { type: String, required: true, unique: true, index: true },
    actorId: { type: String, required: true, index: true },
    actorName: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    centreId: { type: String, index: true },
    changes: {
      before: { type: Schema.Types.Mixed },
      after: { type: Schema.Types.Mixed }
    },
    reason: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

export const AuditLogModel = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
