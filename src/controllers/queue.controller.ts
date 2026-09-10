import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { BookingModel } from '../models/Booking.model';
import { CentreModel } from '../models/Centre.model';
import { QueueService } from '../services/queue.service';
import { ETAEngineService } from '../services/eta-engine.service';
import { NotificationService } from '../services/notification.service';
import { AuditService } from '../services/audit.service';
import { BookingStatus, QueueStage, UserRole } from '@smartfarmer/shared';

export class QueueController {
  /**
   * Get live queue details for a booking
   */
  public static async getBookingQueueStatus(req: AuthenticatedRequest, res: Response) {
    const { bookingId } = req.params;
    const booking = await BookingModel.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const centre = await CentreModel.findOne({ centreId: booking.centreId });
    const eta = await ETAEngineService.calculateETA(bookingId);

    return res.status(200).json({
      success: true,
      data: {
        bookingId: booking.bookingId,
        tokenId: booking.tokenId,
        centreId: booking.centreId,
        centreName: centre?.name || 'Procurement Centre',
        currentStage: booking.currentStage,
        status: booking.status,
        farmersAhead: eta.farmersAhead,
        estimatedWaitMinutes: eta.estimatedWaitMinutes,
        currentServedToken: eta.currentServedToken,
        centreLoadPercentage: eta.centreLoadPercentage,
        arrivedAt: booking.arrivedAt,
        tokenSequence: booking.tokenSequence
      }
    });
  }

  /**
   * Operator calls next token to counter
   */
  public static async callToken(req: AuthenticatedRequest, res: Response) {
    const { tokenId } = req.params;
    const { targetStage } = req.body;
    const operatorId = req.user?.userId || 'OP-001';

    const booking = await BookingModel.findOne({ tokenId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    const stageToAdvance = (targetStage as QueueStage) || QueueStage.QUALITY_ASSAYING;
    const result = await QueueService.advanceStage(
      booking.bookingId,
      stageToAdvance,
      operatorId,
      req.user?.name || 'Operator'
    );

    return res.status(200).json(result);
  }

  /**
   * Operator marks farmer as No-Show
   */
  public static async markNoShow(req: AuthenticatedRequest, res: Response) {
    const { tokenId } = req.params;
    const { reason } = req.body;
    const operatorId = req.user?.userId || 'OP-001';

    const booking = await BookingModel.findOne({ tokenId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    booking.status = BookingStatus.NO_SHOW;
    await booking.save();

    await AuditService.recordLog({
      actorId: operatorId,
      actorName: req.user?.name || 'Operator',
      role: UserRole.OPERATOR,
      action: 'MARKED_NO_SHOW',
      entity: 'Booking',
      entityId: booking.bookingId,
      centreId: booking.centreId,
      reason: reason || 'Farmer failed to arrive within grace window'
    });

    await NotificationService.send({
      farmerId: booking.farmerId,
      channel: 'PUSH',
      title: 'Slot Marked No-Show ⚠️',
      message: `Token ${booking.tokenId} was marked as No-Show. You can reschedule to another available slot.`,
      priority: 'HIGH'
    });

    await QueueService.broadcastQueueUpdate(booking.centreId);

    return res.status(200).json({ success: true, message: 'Token marked as No-Show' });
  }
}
