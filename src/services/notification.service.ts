import { NotificationModel } from '../models/Notification.model';
import { IdGenerator } from '@smartfarmer/shared';
import { getIO } from '../config/socket';

export class NotificationService {
  public static async send(params: {
    farmerId: string;
    channel: 'PUSH' | 'SMS';
    title: string;
    message: string;
    priority?: 'HIGH' | 'CRITICAL' | 'NORMAL';
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const notificationId = `NT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      const doc = await NotificationModel.create({
        notificationId,
        farmerId: params.farmerId,
        channel: params.channel,
        title: params.title,
        message: params.message,
        priority: params.priority || 'NORMAL',
        status: 'SENT',
        metadata: params.metadata
      });

      console.log(`[Notification] [${params.channel}] to ${params.farmerId}: "${params.title}" - ${params.message}`);

      // Emit real-time notification to the farmer's connected socket
      try {
        const io = getIO();
        io.to(`farmer:${params.farmerId}`).emit('notification:received', {
          notificationId,
          channel: params.channel,
          title: params.title,
          message: params.message,
          priority: params.priority || 'NORMAL',
          metadata: params.metadata,
          timestamp: new Date().toISOString()
        });
      } catch (sErr) {
        // Socket not ready or no socket listener
      }
    } catch (err) {
      console.error('[NotificationService] Error sending notification:', err);
    }
  }

  public static async sendSmsFallback(farmerId: string, message: string): Promise<void> {
    // Critical fallback as mandated by SRS Section 12
    await this.send({
      farmerId,
      channel: 'SMS',
      title: 'Govt. Procurement SMS Alert',
      message,
      priority: 'CRITICAL'
    });
  }
}
