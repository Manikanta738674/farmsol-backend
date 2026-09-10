import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { CentreModel } from '../models/Centre.model';
import { OperatorModel } from '../models/Operator.model';
import { FarmerModel } from '../models/Farmer.model';
import { CropModel } from '../models/Crop.model';
import { RateModel } from '../models/Rate.model';
import { SlotModel } from '../models/Slot.model';
import { BookingModel } from '../models/Booking.model';
import { ProcurementModel } from '../models/Procurement.model';
import { GrievanceModel } from '../models/Grievance.model';
import { AuditLogModel } from '../models/AuditLog.model';
import { AuditService } from '../services/audit.service';
import { IdGenerator, UserRole } from '@smartfarmer/shared';

export class AdminController {
  /**
   * System Analytics & Centre Health Scores
   */
  public static async getAnalytics(req: AuthenticatedRequest, res: Response) {
    const totalFarmers = await FarmerModel.countDocuments();
    const totalCentres = await CentreModel.countDocuments();
    const totalOperators = await OperatorModel.countDocuments();
    const totalBookings = await BookingModel.countDocuments();

    const procurements = await ProcurementModel.find();
    const totalQuintalsProcured = procurements.reduce((acc, p) => acc + p.totalQuintals, 0);
    const totalDisbursedINR = procurements.reduce((acc, p) => acc + p.netPayableINR, 0);

    const pendingGrievances = await GrievanceModel.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } });

    // Calculate Centre Health Scores (SRS Section 19.2)
    const centres = await CentreModel.find();
    const centreHealth = await Promise.all(
      centres.map(async (centre) => {
        const todayBookings = await BookingModel.countDocuments({ centreId: centre.centreId });
        const activeQueue = await BookingModel.countDocuments({
          centreId: centre.centreId,
          status: { $in: ['ARRIVED', 'IN_QUEUE', 'PROCESSING'] }
        });

        // Capacity utilization %
        const estCapacityBookings = Math.round(centre.dailyCapacityQuintals / 40);
        const utilization = Math.min(100, Math.round((todayBookings / Math.max(1, estCapacityBookings)) * 100));

        // Health Score (100 is optimal, penalize if overloaded >85% or queue backlog >30)
        let healthScore = 95;
        if (utilization > 85) healthScore -= 20;
        if (activeQueue > 25) healthScore -= 25;
        if (centre.status === 'PAUSED') healthScore = 40;

        return {
          centreId: centre.centreId,
          name: centre.name,
          district: centre.district,
          state: centre.state,
          healthScore: Math.max(20, healthScore),
          utilizationPercentage: utilization,
          activeQueue,
          todayBookings,
          status: centre.status
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalFarmers,
          totalCentres,
          totalOperators,
          totalBookings,
          totalQuintalsProcured,
          totalDisbursedINR,
          pendingGrievances
        },
        centreHealth
      }
    });
  }

  /**
   * Centres CRUD
   */
  public static async getCentres(req: AuthenticatedRequest, res: Response) {
    const centres = await CentreModel.find().sort({ state: 1, district: 1 });
    return res.status(200).json({ success: true, data: centres });
  }

  public static async createCentre(req: AuthenticatedRequest, res: Response) {
    const { name, state, district, address, dailyCapacityQuintals, operatingCounters, eligibleCrops } = req.body;
    const stateCode = state ? state.substring(0, 2).toUpperCase() : 'AP';
    const distCode = district ? district.substring(0, 3).toUpperCase() : 'DST';
    const centreId = IdGenerator.generateCentreId(stateCode, distCode);

    const centre = await CentreModel.create({
      centreId,
      name,
      state,
      district,
      address,
      dailyCapacityQuintals: dailyCapacityQuintals || 2000,
      operatingCounters: operatingCounters || 3,
      eligibleCrops: eligibleCrops || ['CR-PADDY-COMMON'],
      status: 'ACTIVE'
    });

    await AuditService.recordLog({
      actorId: req.user?.userId || 'ADMIN',
      actorName: req.user?.name || 'Admin',
      role: UserRole.ADMIN,
      action: 'CENTRE_CREATED',
      entity: 'Centre',
      entityId: centreId,
      centreId
    });

    return res.status(201).json({ success: true, data: centre });
  }

  public static async updateCentre(req: AuthenticatedRequest, res: Response) {
    const { centreId } = req.params;
    const updates = req.body;

    const centre = await CentreModel.findOneAndUpdate({ centreId }, updates, { new: true });
    return res.status(200).json({ success: true, data: centre });
  }

  /**
   * Crops & MSP Rates
   */
  public static async getCrops(req: AuthenticatedRequest, res: Response) {
    const crops = await CropModel.find();
    return res.status(200).json({ success: true, data: crops });
  }

  public static async getRates(req: AuthenticatedRequest, res: Response) {
    const rates = await RateModel.find().sort({ cropId: 1 });
    return res.status(200).json({ success: true, data: rates });
  }

  public static async updateRate(req: AuthenticatedRequest, res: Response) {
    const { cropId, ratePerQuintal, marketPricePerQuintal, scheme } = req.body;

    let rate = await RateModel.findOne({ cropId });
    const beforeRate = rate ? rate.ratePerQuintal : 0;

    if (rate) {
      rate.ratePerQuintal = parseFloat(ratePerQuintal);
      if (marketPricePerQuintal) rate.marketPricePerQuintal = parseFloat(marketPricePerQuintal);
      if (scheme) rate.scheme = scheme;
      rate.updatedAt = new Date();
      await rate.save();
    } else {
      rate = await RateModel.create({
        rateId: `RT-${Date.now()}`,
        cropId,
        ratePerQuintal: parseFloat(ratePerQuintal),
        marketPricePerQuintal: marketPricePerQuintal ? parseFloat(marketPricePerQuintal) : parseFloat(ratePerQuintal) - 100,
        scheme: scheme || 'MSP-GOI',
        effectiveFrom: new Date(),
        effectiveTo: new Date(Date.now() + 365 * 24 * 3600 * 1000)
      });
    }

    await AuditService.recordLog({
      actorId: req.user?.userId || 'ADMIN',
      actorName: req.user?.name || 'Admin',
      role: UserRole.ADMIN,
      action: 'RATE_UPDATED',
      entity: 'Rate',
      entityId: cropId,
      changes: { before: { rate: beforeRate }, after: { rate: rate.ratePerQuintal } }
    });

    return res.status(200).json({ success: true, data: rate });
  }

  /**
   * Operators
   */
  public static async getOperators(req: AuthenticatedRequest, res: Response) {
    const operators = await OperatorModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: operators });
  }

  public static async createOperator(req: AuthenticatedRequest, res: Response) {
    const { name, mobile, role, centreIds } = req.body;
    const operatorId = IdGenerator.generateOperatorId('AP');

    const operator = await OperatorModel.create({
      operatorId,
      name,
      mobile,
      role: role || 'OPERATOR',
      centreIds: centreIds || [],
      status: 'ACTIVE'
    });

    return res.status(201).json({ success: true, data: operator });
  }

  /**
   * Generate Slots for a Centre and Date Window
   */
  public static async generateSlots(req: AuthenticatedRequest, res: Response) {
    const { centreId, date, slotDurationMinutes = 60, capacityPerSlot = 300, maxVehicles = 15 } = req.body;

    const timeWindows = [
      { start: '08:00', end: '09:00' },
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
      { start: '16:00', end: '17:00' }
    ];

    const created = [];
    for (const tw of timeWindows) {
      const slotId = `SLT-${centreId.split('-').pop()}-${date}-${tw.start.replace(':', '')}`;
      const existing = await SlotModel.findOne({ slotId });
      if (!existing) {
        const doc = await SlotModel.create({
          slotId,
          centreId,
          date,
          startTime: tw.start,
          endTime: tw.end,
          maxCapacityQuintals: capacityPerSlot,
          bookedQuintals: 0,
          maxVehicles,
          bookedVehicles: 0,
          status: 'OPEN'
        });
        created.push(doc);
      }
    }

    return res.status(201).json({ success: true, message: `Generated ${created.length} slots for ${date}`, data: created });
  }

  /**
   * Immutable Audit Logs
   */
  public static async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    const logs = await AuditLogModel.find().sort({ timestamp: -1 }).limit(100);
    return res.status(200).json({ success: true, data: logs });
  }

  /**
   * Grievance Management
   */
  public static async getGrievances(req: AuthenticatedRequest, res: Response) {
    const grievances = await GrievanceModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: grievances });
  }

  public static async resolveGrievance(req: AuthenticatedRequest, res: Response) {
    const { grievanceId } = req.params;
    const { status, resolutionComment } = req.body;

    const grievance = await GrievanceModel.findOneAndUpdate(
      { grievanceId },
      { status, resolutionComment, resolvedAt: new Date() },
      { new: true }
    );

    return res.status(200).json({ success: true, data: grievance });
  }
}
