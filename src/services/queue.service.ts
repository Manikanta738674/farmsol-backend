import { BookingModel } from '../models/Booking.model';
import { QueueEventModel } from '../models/QueueEvent.model';
import { CentreModel } from '../models/Centre.model';
import { FarmerModel } from '../models/Farmer.model';
import { CropModel } from '../models/Crop.model';
import { QueueStage, BookingStatus, UserRole } from '@smartfarmer/shared';
import { getIO } from '../config/socket';
import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';
import { ETAEngineService } from './eta-engine.service';

export class QueueService {
  /**
   * Scan QR at Gate & Mark Arrived
   */
  public static async markArrivedAtGate(
    bookingId: string,
    operatorId: string
  ): Promise<{ success: boolean; message: string; booking?: any }> {
    const booking = await BookingModel.findOne({ bookingId });
    if (!booking) {
      return { success: false, message: 'Invalid booking identifier' };
    }

    if (booking.status === BookingStatus.ARRIVED || booking.status === BookingStatus.IN_QUEUE || booking.status === BookingStatus.PROCESSING) {
      return { success: false, message: 'Farmer already marked arrived at gate for this slot' };
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return { success: false, message: 'Procurement already completed for this booking' };
    }

    booking.status = BookingStatus.ARRIVED;
    booking.currentStage = QueueStage.WAITING;
    booking.arrivedAt = new Date();
    await booking.save();

    // Record Queue Event
    const eventId = `QE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await QueueEventModel.create({
      eventId,
      bookingId: booking.bookingId,
      centreId: booking.centreId,
      tokenId: booking.tokenId,
      stage: QueueStage.GATE_ENTRY,
      eventType: 'STAGE_COMPLETED',
      operatorId,
      note: 'Gate entry verified via QR scan'
    });

    // Record Audit
    await AuditService.recordLog({
      actorId: operatorId,
      actorName: 'Gate Operator',
      role: UserRole.OPERATOR,
      action: 'GATE_ENTRY_VERIFIED',
      entity: 'Booking',
      entityId: booking.bookingId,
      centreId: booking.centreId,
      changes: { after: { status: booking.status, stage: booking.currentStage } }
    });

    // Send notifications to Farmer
    await NotificationService.send({
      farmerId: booking.farmerId,
      channel: 'PUSH',
      title: 'Gate Entry Confirmed 🌾',
      message: `Welcome to the procurement centre! Token ${booking.tokenId} is now queued for Quality Inspection.`,
      priority: 'HIGH'
    });

    // Broadcast update
    await this.broadcastQueueUpdate(booking.centreId);

    return { success: true, message: 'Gate check-in successful', booking };
  }

  /**
   * Move booking to the next stage
   */
  public static async advanceStage(
    bookingId: string,
    nextStage: QueueStage,
    operatorId: string,
    operatorName: string = 'Operator'
  ): Promise<{ success: boolean; message: string; booking?: any }> {
    const booking = await BookingModel.findOne({ bookingId });
    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }

    const previousStage = booking.currentStage;
    booking.currentStage = nextStage;
    booking.status = nextStage === QueueStage.COMPLETED ? BookingStatus.COMPLETED : BookingStatus.PROCESSING;
    if (nextStage === QueueStage.COMPLETED) {
      booking.completedAt = new Date();
    }
    await booking.save();

    // Record Queue Event
    const eventId = `QE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await QueueEventModel.create({
      eventId,
      bookingId: booking.bookingId,
      centreId: booking.centreId,
      tokenId: booking.tokenId,
      stage: nextStage,
      eventType: 'STAGE_ENTERED',
      operatorId,
      note: `Transitioned from ${previousStage} to ${nextStage}`
    });

    // Audit log
    await AuditService.recordLog({
      actorId: operatorId,
      actorName: operatorName,
      role: UserRole.OPERATOR,
      action: 'STAGE_TRANSITION',
      entity: 'Booking',
      entityId: booking.bookingId,
      centreId: booking.centreId,
      changes: { before: { stage: previousStage }, after: { stage: nextStage } }
    });

    // Notify farmer
    const stageFriendlyNames: Record<string, string> = {
      [QueueStage.QUALITY_ASSAYING]: 'Quality Assaying Counter',
      [QueueStage.WEIGHING]: 'Weighbridge Scale',
      [QueueStage.PROCUREMENT]: 'Procurement Desk',
      [QueueStage.COMPLETED]: 'Procurement Completed'
    };

    await NotificationService.send({
      farmerId: booking.farmerId,
      channel: 'PUSH',
      title: `Stage Update: Token ${booking.tokenId}`,
      message: `Your token is now called to the ${stageFriendlyNames[nextStage] || nextStage}. Please proceed immediately.`,
      priority: 'CRITICAL'
    });

    // Also fallback SMS if approaching critical counters
    if (nextStage === QueueStage.QUALITY_ASSAYING || nextStage === QueueStage.WEIGHING) {
      await NotificationService.sendSmsFallback(
        booking.farmerId,
        `Token ${booking.tokenId}: Please proceed to ${stageFriendlyNames[nextStage]}. - Govt. Procurement Portal`
      );
    }

    await this.broadcastQueueUpdate(booking.centreId);

    return { success: true, message: `Advanced to ${nextStage}`, booking };
  }

  /**
   * Broadcast real-time queue snapshot to the centre room
   */
  public static async broadcastQueueUpdate(centreId: string): Promise<void> {
    try {
      const io = getIO();
      const centre = await CentreModel.findOne({ centreId });
      if (!centre) return;

      const activeBookings = await BookingModel.find({
        centreId,
        status: { $in: [BookingStatus.ARRIVED, BookingStatus.IN_QUEUE, BookingStatus.PROCESSING] }
      }).sort({ tokenSequence: 1 });

      // Gather farmer & crop metadata
      const enrichedTokens = await Promise.all(
        activeBookings.map(async (b) => {
          const farmer = await FarmerModel.findOne({ farmerId: b.farmerId });
          const crop = await CropModel.findOne({ cropId: b.cropId });
          const eta = await ETAEngineService.calculateETA(b.bookingId);

          return {
            bookingId: b.bookingId,
            tokenId: b.tokenId,
            farmerId: b.farmerId,
            farmerName: farmer?.name || 'Farmer',
            cropName: crop?.name || 'Crop',
            quantityQuintals: b.expectedQuantityQuintals,
            status: b.status,
            stage: b.currentStage,
            arrivedAt: b.arrivedAt,
            tokenSequence: b.tokenSequence,
            estimatedWaitMinutes: eta.estimatedWaitMinutes,
            farmersAhead: eta.farmersAhead
          };
        })
      );

      // Group by stages
      const stagesSummary: Record<string, any[]> = {
        [QueueStage.WAITING]: [],
        [QueueStage.QUALITY_ASSAYING]: [],
        [QueueStage.WEIGHING]: [],
        [QueueStage.PROCUREMENT]: []
      };

      enrichedTokens.forEach((item) => {
        if (stagesSummary[item.stage]) {
          stagesSummary[item.stage].push(item);
        }
      });

      // Centre level stats
      const totalToday = await BookingModel.countDocuments({
        centreId,
        bookingDate: new Date().toISOString().split('T')[0]
      });

      const payload = {
        centreId,
        centreName: centre.name,
        timestamp: new Date().toISOString(),
        totalActive: enrichedTokens.length,
        totalToday,
        stages: stagesSummary,
        allActiveTokens: enrichedTokens
      };

      // Emit to centre channel (for operator web and monitors)
      io.to(`centre:${centreId}`).emit('queue:updated', payload);

      // Also push individual updates to farmer channels
      for (const token of enrichedTokens) {
        io.to(`farmer:${token.farmerId}`).emit('live:queue:state', {
          centreId,
          centreName: centre.name,
          farmerToken: token.tokenId,
          farmersAhead: token.farmersAhead,
          currentStage: token.stage,
          estimatedWaitMinutes: token.estimatedWaitMinutes,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[QueueService] Error broadcasting queue update:', err);
    }
  }
}
