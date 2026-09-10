import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationDocument extends Document {
  notificationId: string;
  farmerId: string;
  channel: 'PUSH' | 'SMS';
  title: string;
  message: string;
  priority: 'HIGH' | 'CRITICAL' | 'NORMAL';
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  metadata?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    notificationId: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true },
    channel: { type: String, enum: ['PUSH', 'SMS'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['HIGH', 'CRITICAL', 'NORMAL'], default: 'NORMAL' },
    status: { type: String, enum: ['SENT', 'DELIVERED', 'FAILED'], default: 'SENT' },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
