import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { BookingModel } from '../models/Booking.model';
import { SlotModel } from '../models/Slot.model';
import { CentreModel } from '../models/Centre.model';
import { CropModel } from '../models/Crop.model';
import { SlotRecommendationService } from '../services/slot-recommend.service';
import { QRService } from '../services/qr.service';
import { NotificationService } from '../services/notification.service';
import { AuditService } from '../services/audit.service';
import { IdGenerator, BookingStatus, QueueStage, UserRole } from '@smartfarmer/shared';

export class BookingController {
  /**
   * List eligible procurement centres for a crop
   */
  public static async getEligibleCentres(req: AuthenticatedRequest, res: Response) {
    const { cropId, state, district } = req.query;

    const query: any = { status: 'ACTIVE' };
    if (cropId) query.eligibleCrops = cropId;
    if (district) query.district = new RegExp(String(district), 'i');

    const centres = await CentreModel.find(query);
    return res.status(200).json({ success: true, data: centres });
  }

  /**
   * Get centre slot availability and smart recommendations
   */
  public static async getCentreAvailability(req: AuthenticatedRequest, res: Response) {
    const { centreId } = req.params;
    const { date, quantity } = req.query;

    const requestedDate = (date as string) || new Date().toISOString().split('T')[0];
    const requestedQty = quantity ? parseFloat(quantity as string) : 50;

    const recommendations = await SlotRecommendationService.getRecommendations(
      centreId,
      requestedDate,
      requestedQty
    );

    return res.status(200).json({ success: true, data: recommendations });
  }

  /**
   * Atomic Slot Booking
   */
  public static async createBooking(req: AuthenticatedRequest, res: Response) {
    const farmerId = req.user?.userId;
    const { cropId, centreId, slotId, expectedQuantity } = req.body;

    if (!cropId || !centreId || !slotId || !expectedQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking parameters: cropId, centreId, slotId, expectedQuantity'
      });
    }

    const qty = parseFloat(expectedQuantity);
    if (qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
    }

    // Atomic check and reserve on Slot
    const slot = await SlotModel.findOneAndUpdate(
      {
        slotId,
        centreId,
        $expr: {
          $lte: [{ $add: ['$bookedQuintals', qty] }, '$maxCapacityQuintals']
        }
      },
      {
        $inc: { bookedQuintals: qty, bookedVehicles: 1 }
      },
      { new: true }
    );

    if (!slot) {
      return res.status(409).json({
        success: false,
        message: 'Slot capacity exceeded. Please select another slot or centre.'
      });
    }

    // Generate unique IDs
    const bookingId = IdGenerator.generateBookingId();
    const tokenSeq = slot.bookedVehicles;
    const centreShortCode = centreId.split('-').pop() || 'PC001';
    const tokenId = IdGenerator.generateTokenId(centreShortCode, tokenSeq);

    // Construct and encode QR payload
    const rawPayload = QRService.constructPayload(bookingId, tokenId, centreId, farmerId || '');
    const qrDataUrl = await QRService.generateQRCodeDataURL(rawPayload);

    const booking = await BookingModel.create({
      bookingId,
      farmerId,
      cropId,
      centreId,
      slotId,
      bookingDate: slot.date,
      timeWindow: `${slot.startTime} - ${slot.endTime}`,
      expectedQuantityQuintals: qty,
      tokenId,
      tokenSequence: tokenSeq,
      qrPayload: qrDataUrl,
      status: BookingStatus.CONFIRMED,
      currentStage: QueueStage.GATE_ENTRY
    });

    // Audit log
    await AuditService.recordLog({
      actorId: farmerId || 'ANON',
      actorName: req.user?.name || 'Farmer',
      role: UserRole.FARMER,
      action: 'SLOT_BOOKED',
      entity: 'Booking',
      entityId: bookingId,
      centreId,
      changes: { after: { tokenId, date: slot.date, qty } }
    });

    // Send confirmation notification
    await NotificationService.send({
      farmerId: farmerId || '',
      channel: 'PUSH',
      title: 'Booking Confirmed! 🌾',
      message: `Token: ${tokenId} confirmed for ${slot.date} (${slot.startTime} - ${slot.endTime}).`,
      priority: 'HIGH'
    });

    return res.status(201).json({
      success: true,
      message: 'Slot booked successfully',
      data: booking
    });
  }

  /**
   * Cancel Booking
   */
  public static async cancelBooking(req: AuthenticatedRequest, res: Response) {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const farmerId = req.user?.userId;

    const booking = await BookingModel.findOne({ bookingId, farmerId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.ARRIVED) {
      return res.status(400).json({ success: false, message: 'Cannot cancel arrived or completed bookings' });
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = reason || 'Cancelled by farmer';
    await booking.save();

    // Release slot capacity atomically
    await SlotModel.updateOne(
      { slotId: booking.slotId },
      {
        $inc: {
          bookedQuintals: -booking.expectedQuantityQuintals,
          bookedVehicles: -1
        }
      }
    );

    // Audit
    await AuditService.recordLog({
      actorId: farmerId || 'ANON',
      actorName: req.user?.name || 'Farmer',
      role: UserRole.FARMER,
      action: 'BOOKING_CANCELLED',
      entity: 'Booking',
      entityId: bookingId,
      centreId: booking.centreId,
      reason: booking.cancellationReason
    });

    return res.status(200).json({ success: true, message: 'Booking successfully cancelled' });
  }

  /**
   * Reschedule Booking — release old slot, reserve new slot
   */
  public static async rescheduleBooking(req: AuthenticatedRequest, res: Response) {
    const { bookingId } = req.params;
    const { newSlotId, reason } = req.body;
    const farmerId = req.user?.userId;

    if (!newSlotId || !reason) {
      return res.status(400).json({ success: false, message: 'New slot and reason are required to reschedule' });
    }

    const booking = await BookingModel.findOne({ bookingId, farmerId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === BookingStatus.ARRIVED || booking.status === BookingStatus.COMPLETED) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule an arrived or completed booking' });
    }

    // Atomically reserve new slot
    const newSlot = await SlotModel.findOneAndUpdate(
      {
        slotId: newSlotId,
        centreId: booking.centreId,
        $expr: {
          $lte: [{ $add: ['$bookedQuintals', booking.expectedQuantityQuintals] }, '$maxCapacityQuintals']
        }
      },
      { $inc: { bookedQuintals: booking.expectedQuantityQuintals, bookedVehicles: 1 } },
      { new: true }
    );

    if (!newSlot) {
      return res.status(409).json({ success: false, message: 'Selected slot is full. Please choose another slot.' });
    }

    // Release old slot capacity
    await SlotModel.updateOne(
      { slotId: booking.slotId },
      { $inc: { bookedQuintals: -booking.expectedQuantityQuintals, bookedVehicles: -1 } }
    );

    // Update booking with new slot details
    booking.slotId = newSlotId;
    booking.bookingDate = newSlot.date;
    booking.timeWindow = `${newSlot.startTime} - ${newSlot.endTime}`;
    booking.status = BookingStatus.CONFIRMED;
    booking.cancellationReason = `Rescheduled: ${reason}`;
    await booking.save();

    await AuditService.recordLog({
      actorId: farmerId || 'ANON',
      actorName: req.user?.name || 'Farmer',
      role: UserRole.FARMER,
      action: 'BOOKING_RESCHEDULED',
      entity: 'Booking',
      entityId: bookingId,
      centreId: booking.centreId,
      reason,
      changes: { before: { slotId: booking.slotId }, after: { slotId: newSlotId, date: newSlot.date } }
    });

    await NotificationService.send({
      farmerId: farmerId || '',
      channel: 'PUSH',
      title: 'Booking Rescheduled ✅',
      message: `Your booking rescheduled to ${newSlot.date} (${newSlot.startTime} - ${newSlot.endTime}).`,
      priority: 'HIGH'
    });

    return res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: {
        bookingId: booking.bookingId,
        newDate: newSlot.date,
        newTimeWindow: `${newSlot.startTime} - ${newSlot.endTime}`
      }
    });
  }
}
