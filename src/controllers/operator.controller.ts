import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { BookingModel } from '../models/Booking.model';
import { CentreModel } from '../models/Centre.model';
import { CropModel } from '../models/Crop.model';
import { RateModel } from '../models/Rate.model';
import { QualityRecordModel } from '../models/QualityRecord.model';
import { WeighingRecordModel } from '../models/WeighingRecord.model';
import { ProcurementModel } from '../models/Procurement.model';
import { PaymentModel } from '../models/Payment.model';
import { FarmerModel } from '../models/Farmer.model';
import { QueueService } from '../services/queue.service';
import { QRService } from '../services/qr.service';
import { AuditService } from '../services/audit.service';
import { NotificationService } from '../services/notification.service';
import { getIO } from '../config/socket';
import {
  BookingStatus,
  QueueStage,
  QualityResult,
  PaymentStatus,
  IdGenerator,
  UserRole
} from '@smartfarmer/shared';

export class OperatorController {
  /**
   * Operator Dashboard Metrics
   */
  public static async getDashboard(req: AuthenticatedRequest, res: Response) {
    const centreId = (req.query.centreId as string) || req.user?.centreIds?.[0] || 'PC-AP-VZM-0012';
    const centre = await CentreModel.findOne({ centreId });

    const todayStr = new Date().toISOString().split('T')[0];

    const bookingsToday = await BookingModel.countDocuments({ centreId, bookingDate: todayStr });
    const arrivedToday = await BookingModel.countDocuments({ centreId, bookingDate: todayStr, arrivedAt: { $exists: true } });
    const completedToday = await BookingModel.countDocuments({ centreId, bookingDate: todayStr, status: BookingStatus.COMPLETED });
    const noShowToday = await BookingModel.countDocuments({ centreId, bookingDate: todayStr, status: BookingStatus.NO_SHOW });

    // Active tokens in stages
    const inWaiting = await BookingModel.countDocuments({ centreId, currentStage: QueueStage.WAITING, status: { $ne: BookingStatus.COMPLETED } });
    const inQuality = await BookingModel.countDocuments({ centreId, currentStage: QueueStage.QUALITY_ASSAYING, status: { $ne: BookingStatus.COMPLETED } });
    const inWeighing = await BookingModel.countDocuments({ centreId, currentStage: QueueStage.WEIGHING, status: { $ne: BookingStatus.COMPLETED } });
    const inProcurement = await BookingModel.countDocuments({ centreId, currentStage: QueueStage.PROCUREMENT, status: { $ne: BookingStatus.COMPLETED } });

    // Total procured quintals & payout today
    const procurementsToday = await ProcurementModel.find({ centreId });
    const totalProcuredQuintals = procurementsToday.reduce((acc, p) => acc + p.totalQuintals, 0);
    const totalDisbursedINR = procurementsToday.reduce((acc, p) => acc + p.netPayableINR, 0);

    return res.status(200).json({
      success: true,
      data: {
        centre,
        metrics: {
          bookingsToday,
          arrivedToday,
          completedToday,
          noShowToday,
          stages: {
            waiting: inWaiting,
            quality: inQuality,
            weighing: inWeighing,
            procurement: inProcurement
          },
          totalProcuredQuintals,
          totalDisbursedINR
        }
      }
    });
  }

  /**
   * Gate Entry: Scan QR Code or Token
   */
  public static async scanGateQR(req: AuthenticatedRequest, res: Response) {
    const { qrData, bookingId: manualBookingId } = req.body;
    const operatorId = req.user?.userId || 'OP-001';

    let targetBookingId = manualBookingId;

    if (qrData) {
      const parsed = QRService.parsePayload(qrData);
      if (parsed) {
        targetBookingId = parsed.bookingId;
      }
    }

    if (!targetBookingId) {
      return res.status(400).json({ success: false, message: 'Valid QR data or bookingId is required' });
    }

    const result = await QueueService.markArrivedAtGate(targetBookingId, operatorId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  }

  /**
   * Record Quality / Assaying parameters
   */
  public static async recordQuality(req: AuthenticatedRequest, res: Response) {
    const { bookingId, moisturePercentage, foreignMatterPercentage, grade, result, rejectionReason } = req.body;
    const operatorId = req.user?.userId || 'OP-001';

    const booking = await BookingModel.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const qualityId = `QAL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const qualityRecord = await QualityRecordModel.create({
      qualityId,
      bookingId: booking.bookingId,
      centreId: booking.centreId,
      moisturePercentage: parseFloat(moisturePercentage),
      foreignMatterPercentage: parseFloat(foreignMatterPercentage),
      grade: grade || 'FAQ (Grade A)',
      result: result as QualityResult,
      rejectionReason: result === QualityResult.REJECTED ? rejectionReason : undefined,
      operatorId,
      timestamp: new Date()
    });

    if (result === QualityResult.REJECTED) {
      booking.status = BookingStatus.CANCELLED;
      await booking.save();

      await NotificationService.send({
        farmerId: booking.farmerId,
        channel: 'PUSH',
        title: 'Crop Inspection Notice ⚠️',
        message: `Quality parameters did not meet FAQ thresholds: ${rejectionReason || 'High moisture content'}. You may consult the centre manager or submit a grievance.`,
        priority: 'CRITICAL'
      });

      await AuditService.recordLog({
        actorId: operatorId,
        actorName: req.user?.name || 'Assaying Officer',
        role: UserRole.OPERATOR,
        action: 'QUALITY_REJECTED',
        entity: 'Booking',
        entityId: booking.bookingId,
        centreId: booking.centreId,
        reason: rejectionReason
      });

      await QueueService.broadcastQueueUpdate(booking.centreId);
      return res.status(200).json({ success: true, message: 'Quality recorded (Rejected)', qualityRecord });
    }

    // Advance to Weighing
    await QueueService.advanceStage(
      booking.bookingId,
      QueueStage.WEIGHING,
      operatorId,
      req.user?.name || 'Assaying Officer'
    );

    return res.status(200).json({ success: true, message: 'Quality inspection passed. Advanced to weighbridge.', qualityRecord });
  }

  /**
   * Record Weighbridge readings
   */
  public static async recordWeighing(req: AuthenticatedRequest, res: Response) {
    const { bookingId, grossWeightKg, tareWeightKg, vehicleNumber } = req.body;
    const operatorId = req.user?.userId || 'OP-001';

    const booking = await BookingModel.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const gross = parseFloat(grossWeightKg);
    const tare = parseFloat(tareWeightKg);
    const netKg = gross - tare;
    if (netKg <= 0) {
      return res.status(400).json({ success: false, message: 'Gross weight must be strictly greater than tare weight' });
    }

    const netQuintals = Math.round((netKg / 100) * 100) / 100; // 1 Quintal = 100 Kg

    const weighingId = `WB-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const weighingRecord = await WeighingRecordModel.create({
      weighingId,
      bookingId: booking.bookingId,
      centreId: booking.centreId,
      grossWeightKg: gross,
      tareWeightKg: tare,
      netWeightKg: netKg,
      netWeightQuintals: netQuintals,
      vehicleNumber,
      scaleOperatorId: operatorId,
      timestamp: new Date()
    });

    // Advance to final Procurement desk
    await QueueService.advanceStage(
      booking.bookingId,
      QueueStage.PROCUREMENT,
      operatorId,
      req.user?.name || 'Weighbridge Operator'
    );

    return res.status(200).json({
      success: true,
      message: `Weighed: Net ${netQuintals} Quintals. Moved to procurement desk.`,
      weighingRecord
    });
  }

  /**
   * Finalize Procurement & Issue Digital Receipt
   */
  public static async completeProcurement(req: AuthenticatedRequest, res: Response) {
    const { bookingId, deductionsINR } = req.body;
    const operatorId = req.user?.userId || 'OP-001';

    const booking = await BookingModel.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const weighing = await WeighingRecordModel.findOne({ bookingId });
    if (!weighing) {
      return res.status(400).json({ success: false, message: 'Cannot complete procurement without weighing record' });
    }

    const rateDoc = await RateModel.findOne({ cropId: booking.cropId }).sort({ effectiveFrom: -1 });
    const ratePerQuintal = rateDoc?.ratePerQuintal || 2300;

    const grossAmount = Math.round(weighing.netWeightQuintals * ratePerQuintal);
    const deductions = deductionsINR ? parseFloat(deductionsINR) : 0;
    const netPayable = grossAmount - deductions;

    const procurementId = IdGenerator.generateProcurementId();
    const receiptNumber = `RCPT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const procurement = await ProcurementModel.create({
      procurementId,
      bookingId: booking.bookingId,
      farmerId: booking.farmerId,
      centreId: booking.centreId,
      cropId: booking.cropId,
      ratePerQuintal,
      totalQuintals: weighing.netWeightQuintals,
      grossAmountINR: grossAmount,
      deductionsINR: deductions,
      netPayableINR: netPayable,
      receiptNumber,
      status: 'COMPLETED',
      completedAt: new Date(),
      operatorId
    });

    // Create Payment Record (Simulated DBT Direct Benefit Transfer)
    const farmer = await FarmerModel.findOne({ farmerId: booking.farmerId });
    const paymentId = IdGenerator.generatePaymentId();
    const payment = await PaymentModel.create({
      paymentId,
      procurementId,
      farmerId: booking.farmerId,
      amountINR: netPayable,
      status: PaymentStatus.PROCESSING,
      bankAccountRef: farmer?.bankAccountRef || 'XXXX-XXXX-4589',
      ifscCode: farmer?.ifscCode || 'SBIN0001234',
      utrReference: `UTR-GOV-${Date.now()}`
    });

    // Mark booking completed
    booking.status = BookingStatus.COMPLETED;
    booking.currentStage = QueueStage.COMPLETED;
    booking.completedAt = new Date();
    await booking.save();

    // Audit Log
    await AuditService.recordLog({
      actorId: operatorId,
      actorName: req.user?.name || 'Procurement Officer',
      role: UserRole.OPERATOR,
      action: 'PROCUREMENT_COMPLETED',
      entity: 'Procurement',
      entityId: procurementId,
      centreId: booking.centreId,
      changes: { after: { netPayable, receiptNumber, paymentId } }
    });

    // Notify farmer
    await NotificationService.send({
      farmerId: booking.farmerId,
      channel: 'PUSH',
      title: 'Procurement Successful 🎉',
      message: `Procured ${weighing.netWeightQuintals} Qtl. Receipt: ${receiptNumber}. Payment ₹${netPayable.toLocaleString('en-IN')} initiated to your Aadhaar-linked bank account.`,
      priority: 'CRITICAL'
    });

    // SMS Fallback
    await NotificationService.sendSmsFallback(
      booking.farmerId,
      `Govt Procurement Complete: ${weighing.netWeightQuintals} Qtl procured at Rs.${ratePerQuintal}/Qtl. Net Rs.${netPayable.toLocaleString('en-IN')} sent to A/C ending ${farmer?.bankAccountRef?.slice(-4)}. Receipt: ${receiptNumber}.`
    );

    await QueueService.broadcastQueueUpdate(booking.centreId);

    return res.status(200).json({
      success: true,
      message: 'Procurement completed successfully',
      data: {
        procurement,
        payment
      }
    });
  }

  /**
   * Daily Centre Operations Report
   */
  public static async getDailyReports(req: AuthenticatedRequest, res: Response) {
    const centreId = (req.query.centreId as string) || 'PC-AP-VZM-0012';
    const procurements = await ProcurementModel.find({ centreId }).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      procurements.map(async (p) => {
        const farmer = await FarmerModel.findOne({ farmerId: p.farmerId });
        const crop = await CropModel.findOne({ cropId: p.cropId });
        const payment = await PaymentModel.findOne({ procurementId: p.procurementId });

        return {
          ...p.toObject(),
          farmerName: farmer?.name || 'Farmer',
          farmerMobile: farmer?.mobile,
          cropName: crop?.name || 'Crop',
          paymentStatus: payment?.status || 'PROCESSING',
          utrReference: payment?.utrReference
        };
      })
    );

    return res.status(200).json({ success: true, data: enriched });
  }

  /**
   * Settle Farmer Payment (Mark COMPLETED or PENDING) with Real-Time Socket & SMS
   */
  public static async settlePayment(req: AuthenticatedRequest, res: Response) {
    const { bookingId, paymentStatus, paymentMode = 'DBT_DIRECT', notes, utrCustom } = req.body;
    const operatorId = req.user?.userId || 'OP-001';

    const booking = await BookingModel.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let payment = await PaymentModel.findOne({ bookingId: booking.bookingId });
    const isCompleted = paymentStatus === 'COMPLETED';
    const targetStatus = isCompleted ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
    const utrRef = utrCustom || `UTR${Date.now()}`;

    if (!payment) {
      const weighing = await WeighingRecordModel.findOne({ bookingId: booking.bookingId });
      const rateDoc = await RateModel.findOne({ cropId: booking.cropId }).sort({ effectiveFrom: -1 });
      const rate = rateDoc?.ratePerQuintal || 2300;
      const netQty = weighing?.netWeightQuintals || booking.expectedQuantityQuintals || 45;
      const amountINR = Math.round(netQty * rate);

      payment = await PaymentModel.create({
        paymentId: IdGenerator.generatePaymentId(),
        procurementId: `PRC-${Date.now()}`,
        farmerId: booking.farmerId,
        amountINR,
        status: targetStatus,
        bankAccountRef: 'XXXX-XXXX-5512',
        ifscCode: 'SBIN0001234',
        utrReference: utrRef
      });
    } else {
      payment.status = targetStatus;
      payment.utrReference = utrRef;
      payment.updatedAt = new Date();
      await payment.save();
    }

    // Socket.IO real-time emission to Farmer, Mandi, and Central Admin
    try {
      const io = getIO();
      const payload = {
        bookingId: booking.bookingId,
        tokenId: booking.tokenId,
        farmerId: booking.farmerId,
        centreId: booking.centreId,
        amount: payment.amountINR,
        status: payment.status,
        utr: payment.utrReference,
        timestamp: new Date().toISOString(),
        paymentMode,
        notes
      };

      io.to(`farmer:${booking.farmerId}`).emit('payment:update', payload);
      io.to(`centre:${booking.centreId}`).emit('payment:update', payload);
      io.to('admin:dashboard').emit('payment:update', payload);
      io.emit('payment:update', payload);

      // Real-Time Telecom SMS Delivery
      const smsMessage = isCompleted
        ? `Dear Farmer, payment of Rs.${payment.amountINR.toLocaleString('en-IN')} for Token #${booking.tokenId} has been COMPLETED and credited via DBT. UTR: ${payment.utrReference}. - DoCA, Govt of India`
        : `Dear Farmer, payment of Rs.${payment.amountINR.toLocaleString('en-IN')} for Token #${booking.tokenId} is marked PENDING. Verification at Mandi Desk. - DoCA, Govt of India`;

      await NotificationService.sendSmsFallback(booking.farmerId, smsMessage);

      io.to(`farmer:${booking.farmerId}`).emit('sms:notification', {
        farmerId: booking.farmerId,
        sender: 'VD-FARMSOL',
        message: smsMessage,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        type: 'PAYMENT',
        status: payment.status
      });
      io.emit('sms:notification', {
        farmerId: booking.farmerId,
        sender: 'VD-FARMSOL',
        message: smsMessage,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        type: 'PAYMENT',
        status: payment.status
      });
    } catch (err) {
      console.warn('[OperatorController] Socket notification error:', err);
    }

    // Audit Log Stamping
    await AuditService.recordLog({
      actorId: operatorId,
      actorName: req.user?.name || 'Mandi Cashier / Officer',
      role: UserRole.OPERATOR,
      action: isCompleted ? 'PAYMENT_COMPLETED' : 'PAYMENT_PENDING',
      entity: 'Payment',
      entityId: payment.paymentId,
      centreId: booking.centreId,
      changes: { after: { status: targetStatus, amount: payment.amountINR, utr: payment.utrReference } }
    });

    return res.status(200).json({
      success: true,
      message: `Payment status updated to ${targetStatus}`,
      data: {
        payment,
        booking
      }
    });
  }
}
