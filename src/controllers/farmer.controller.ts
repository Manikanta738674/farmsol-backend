import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { FarmerModel } from '../models/Farmer.model';
import { BookingModel } from '../models/Booking.model';
import { RateModel } from '../models/Rate.model';
import { CropModel } from '../models/Crop.model';
import { ProcurementModel } from '../models/Procurement.model';
import { PaymentModel } from '../models/Payment.model';
import { NotificationModel } from '../models/Notification.model';
import { GrievanceModel } from '../models/Grievance.model';
import { CentreModel } from '../models/Centre.model';
import { ETAEngineService } from '../services/eta-engine.service';
import { BookingStatus, IdGenerator } from '@smartfarmer/shared';

export class FarmerController {
  public static async getProfile(req: AuthenticatedRequest, res: Response) {
    const farmerId = req.user?.userId;
    const farmer = await FarmerModel.findOne({ farmerId });
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }
    return res.status(200).json({ success: true, data: farmer });
  }

  public static async updateLanguage(req: AuthenticatedRequest, res: Response) {
    const farmerId = req.user?.userId;
    const { language } = req.body;
    await FarmerModel.updateOne({ farmerId }, { language });
    return res.status(200).json({ success: true, message: 'Language updated' });
  }

  public static async getDashboard(req: AuthenticatedRequest, res: Response) {
    const farmerId = req.user?.userId;
    const farmer = await FarmerModel.findOne({ farmerId });

    // Find latest active booking
    const activeBooking = await BookingModel.findOne({
      farmerId,
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.ARRIVED, BookingStatus.IN_QUEUE, BookingStatus.PROCESSING] }
    }).sort({ createdAt: -1 });

    let queueData = null;
    let centreData = null;
    let cropData = null;

    if (activeBooking) {
      centreData = await CentreModel.findOne({ centreId: activeBooking.centreId });
      cropData = await CropModel.findOne({ cropId: activeBooking.cropId });
      const eta = await ETAEngineService.calculateETA(activeBooking.bookingId);

      queueData = {
        bookingId: activeBooking.bookingId,
        tokenId: activeBooking.tokenId,
        centreName: centreData?.name || 'Procurement Centre',
        cropName: cropData?.name || 'Commodity',
        bookingDate: activeBooking.bookingDate,
        timeWindow: activeBooking.timeWindow,
        expectedQuantityQuintals: activeBooking.expectedQuantityQuintals,
        status: activeBooking.status,
        currentStage: activeBooking.currentStage,
        qrPayload: activeBooking.qrPayload,
        farmersAhead: eta.farmersAhead,
        estimatedWaitMinutes: eta.estimatedWaitMinutes,
        currentServedToken: eta.currentServedToken
      };
    }

    // Live Market Rates
    const rates = await RateModel.find().limit(5);
    const crops = await CropModel.find();
    const cropMap = new Map(crops.map((c) => [c.cropId, c.name]));

    const marketRates = rates.map((r) => ({
      cropId: r.cropId,
      cropName: cropMap.get(r.cropId) || r.cropId,
      ratePerQuintal: r.ratePerQuintal,
      marketPricePerQuintal: r.marketPricePerQuintal,
      source: r.source,
      updatedAt: r.updatedAt
    }));

    // Recent procurements
    const recentProcurements = await ProcurementModel.find({ farmerId }).sort({ createdAt: -1 }).limit(3);

    return res.status(200).json({
      success: true,
      data: {
        farmer,
        activeBooking: queueData,
        marketRates,
        recentProcurements
      }
    });
  }

  public static async getProcurementHistory(req: AuthenticatedRequest, res: Response) {
    const farmerId = req.user?.userId;
    const procurements = await ProcurementModel.find({ farmerId }).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      procurements.map(async (p) => {
        const crop = await CropModel.findOne({ cropId: p.cropId });
        const centre = await CentreModel.findOne({ centreId: p.centreId });
        const payment = await PaymentModel.findOne({ procurementId: p.procurementId });

        return {
          ...p.toObject(),
          cropName: crop?.name || 'Crop',
          centreName: centre?.name || 'Centre',
          paymentStatus: payment?.status || 'PROCESSING',
          utrReference: payment?.utrReference || 'UTR-SIMULATED-2026'
        };
      })
    );

    return res.status(200).json({ success: true, data: enriched });
  }

  public static async getNotifications(req: AuthenticatedRequest, res: Response) {
    const farmerId = req.user?.userId;
    const notifications = await NotificationModel.find({ farmerId }).sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({ success: true, data: notifications });
  }

  public static async createGrievance(req: AuthenticatedRequest, res: Response) {
    const farmerId = req.user?.userId;
    const { category, description, bookingId, procurementId } = req.body;

    if (!category || !description) {
      return res.status(400).json({ success: false, message: 'Category and description are required' });
    }

    const grievanceId = IdGenerator.generateGrievanceId();
    const grievance = await GrievanceModel.create({
      grievanceId,
      farmerId,
      bookingId,
      procurementId,
      category,
      description,
      status: 'SUBMITTED'
    });

    return res.status(201).json({
      success: true,
      message: 'Grievance ticket registered successfully',
      data: grievance
    });
  }

  /**
   * Get all bookings for the logged-in farmer
   */
  public static async getBookings(req: AuthenticatedRequest, res: Response) {
    const farmerId = req.user?.userId;
    const bookings = await BookingModel.find({ farmerId }).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const crop = await CropModel.findOne({ cropId: b.cropId });
        const centre = await CentreModel.findOne({ centreId: b.centreId });
        return {
          ...b.toObject(),
          cropName: crop?.name || b.cropId,
          centreName: centre?.name || b.centreId,
          centreDistrict: centre?.district || ''
        };
      })
    );

    return res.status(200).json({ success: true, data: enriched });
  }

  /**
   * Update farmer bank details for payment
   */
  public static async updateBankDetails(req: AuthenticatedRequest, res: Response) {
    const farmerId = req.user?.userId;
    const { accountNumber, ifscCode, accountHolderName, bankName } = req.body;

    if (!accountNumber || !ifscCode) {
      return res.status(400).json({ success: false, message: 'Account number and IFSC code are required' });
    }

    // Mask account number for storage — keep last 4 digits
    const masked = 'XXXX-XXXX-' + String(accountNumber).slice(-4);

    await FarmerModel.updateOne(
      { farmerId },
      {
        bankAccountRef: masked,
        ifscCode: ifscCode.toUpperCase(),
        accountHolderName: accountHolderName || req.user?.name,
        bankName: bankName || 'Bank'
      }
    );

    return res.status(200).json({ success: true, message: 'Bank details updated successfully' });
  }
}
