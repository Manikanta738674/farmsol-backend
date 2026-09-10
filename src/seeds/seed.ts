import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { CropModel } from '../models/Crop.model';
import { RateModel } from '../models/Rate.model';
import { CentreModel } from '../models/Centre.model';
import { OperatorModel } from '../models/Operator.model';
import { FarmerModel } from '../models/Farmer.model';
import { SlotModel } from '../models/Slot.model';
import { BookingModel } from '../models/Booking.model';
import { AuditLogModel } from '../models/AuditLog.model';
import { QualityRecordModel } from '../models/QualityRecord.model';
import { WeighingRecordModel } from '../models/WeighingRecord.model';
import { ProcurementModel } from '../models/Procurement.model';
import { PaymentModel } from '../models/Payment.model';
import { NotificationModel } from '../models/Notification.model';
import { GrievanceModel } from '../models/Grievance.model';
import { QRService } from '../services/qr.service';
import { BookingStatus, QueueStage, UserRole } from '@smartfarmer/shared';

const seed = async () => {
  console.log('[Seed] Connecting to database...');
  await connectDatabase();

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    CropModel.deleteMany({}),
    RateModel.deleteMany({}),
    CentreModel.deleteMany({}),
    OperatorModel.deleteMany({}),
    FarmerModel.deleteMany({}),
    SlotModel.deleteMany({}),
    BookingModel.deleteMany({}),
    AuditLogModel.deleteMany({}),
    QualityRecordModel.deleteMany({}),
    WeighingRecordModel.deleteMany({}),
    ProcurementModel.deleteMany({}),
    PaymentModel.deleteMany({}),
    NotificationModel.deleteMany({}),
    GrievanceModel.deleteMany({})
  ]);

  console.log('[Seed] Seeding Crops...');
  const crops = await CropModel.insertMany([
    {
      cropId: 'CR-PADDY-COMMON',
      name: 'Paddy (Common) / వరి / धान',
      variety: 'Swarna / MTU 1010',
      unit: 'Quintal',
      activeSeason: 'KHARIF-2026',
      qualityRules: {
        maxMoisturePercentage: 14.0,
        maxForeignMatterPercentage: 2.0
      }
    },
    {
      cropId: 'CR-PADDY-GRADE-A',
      name: 'Paddy (Grade A) / వరి (గ్రేడ్-ఎ) / धान (ग्रेड-ए)',
      variety: 'BPT 5204 (Samba Masuri)',
      unit: 'Quintal',
      activeSeason: 'KHARIF-2026',
      qualityRules: {
        maxMoisturePercentage: 14.0,
        maxForeignMatterPercentage: 1.5
      }
    },
    {
      cropId: 'CR-WHEAT',
      name: 'Wheat / గోధుమ / गेहूँ',
      variety: 'Sharbati / PBW 343',
      unit: 'Quintal',
      activeSeason: 'RABI-2026',
      qualityRules: {
        maxMoisturePercentage: 12.0,
        maxForeignMatterPercentage: 1.5
      }
    },
    {
      cropId: 'CR-CHANA',
      name: 'Gram (Chana) / శనగలు / चना',
      variety: 'Desi Chana',
      unit: 'Quintal',
      activeSeason: 'RABI-2026',
      qualityRules: {
        maxMoisturePercentage: 10.0,
        maxForeignMatterPercentage: 2.0
      }
    }
  ]);

  console.log('[Seed] Seeding MSP Rates...');
  await RateModel.insertMany([
    {
      rateId: 'RT-2026-PADDY-COMMON',
      cropId: 'CR-PADDY-COMMON',
      scheme: 'MSP-GOI-2026',
      ratePerQuintal: 2300,
      marketPricePerQuintal: 2180,
      effectiveFrom: new Date('2026-01-01'),
      effectiveTo: new Date('2026-12-31'),
      source: 'Ministry of Consumer Affairs & CACP'
    },
    {
      rateId: 'RT-2026-PADDY-GRADE-A',
      cropId: 'CR-PADDY-GRADE-A',
      scheme: 'MSP-GOI-2026',
      ratePerQuintal: 2320,
      marketPricePerQuintal: 2210,
      effectiveFrom: new Date('2026-01-01'),
      effectiveTo: new Date('2026-12-31'),
      source: 'Ministry of Consumer Affairs & CACP'
    },
    {
      rateId: 'RT-2026-WHEAT',
      cropId: 'CR-WHEAT',
      scheme: 'MSP-GOI-2026',
      ratePerQuintal: 2275,
      marketPricePerQuintal: 2150,
      effectiveFrom: new Date('2026-01-01'),
      effectiveTo: new Date('2026-12-31'),
      source: 'Ministry of Consumer Affairs & CACP'
    },
    {
      rateId: 'RT-2026-CHANA',
      cropId: 'CR-CHANA',
      scheme: 'MSP-GOI-2026',
      ratePerQuintal: 5440,
      marketPricePerQuintal: 5200,
      effectiveFrom: new Date('2026-01-01'),
      effectiveTo: new Date('2026-12-31'),
      source: 'Ministry of Consumer Affairs & CACP'
    }
  ]);

  console.log('[Seed] Seeding Procurement Centres (Mandis)...');
  const centres = await CentreModel.insertMany([
    {
      centreId: 'PC-AP-VZM-0012',
      name: 'Vizianagaram AMC RMC Yard (విజయనగరం మార్కెట్ యార్డ్)',
      state: 'Andhra Pradesh',
      district: 'Vizianagaram',
      address: 'Main Road, Near Railway Station, Vizianagaram, AP - 535003',
      dailyCapacityQuintals: 3500,
      operatingCounters: 4,
      operatingHours: { start: '08:00', end: '18:00' },
      eligibleCrops: ['CR-PADDY-COMMON', 'CR-PADDY-GRADE-A', 'CR-CHANA'],
      status: 'ACTIVE',
      location: { latitude: 18.1067, longitude: 83.3956 }
    },
    {
      centreId: 'PC-AP-GNT-0008',
      name: 'Guntur Agriculture Market Yard (గుంటూరు మార్కెట్ యార్డ్)',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      address: 'Collectorate Junction, Guntur, AP - 522004',
      dailyCapacityQuintals: 5000,
      operatingCounters: 5,
      eligibleCrops: ['CR-PADDY-COMMON', 'CR-PADDY-GRADE-A'],
      status: 'ACTIVE',
      location: { latitude: 16.3067, longitude: 80.4365 }
    },
    {
      centreId: 'PC-PB-KHN-0005',
      name: 'Khanna Asia Largest Grain Mandi (ਖੰਨਾ ਅਨਾਜ ਮੰਡੀ)',
      state: 'Punjab',
      district: 'Ludhiana',
      address: 'GT Road, Khanna, Ludhiana, Punjab - 141401',
      dailyCapacityQuintals: 8000,
      operatingCounters: 8,
      eligibleCrops: ['CR-WHEAT', 'CR-PADDY-COMMON'],
      status: 'ACTIVE',
      location: { latitude: 30.7046, longitude: 76.2166 }
    }
  ]);

  console.log('[Seed] Seeding Operators...');
  await OperatorModel.insertMany([
    {
      operatorId: 'OP-AP-001245',
      name: 'K. Srinivasa Rao (Operator - Vizianagaram)',
      mobile: '9876543210',
      role: 'OPERATOR',
      centreIds: ['PC-AP-VZM-0012'],
      status: 'ACTIVE'
    },
    {
      operatorId: 'OP-AP-002341',
      name: 'M. Venkat Reddy (Manager - Guntur)',
      mobile: '9876543211',
      role: 'CENTRE_MANAGER',
      centreIds: ['PC-AP-GNT-0008'],
      status: 'ACTIVE'
    },
    {
      operatorId: 'OP-PB-005112',
      name: 'Gurpreet Singh (Operator - Khanna)',
      mobile: '9876543212',
      role: 'OPERATOR',
      centreIds: ['PC-PB-KHN-0005'],
      status: 'ACTIVE'
    }
  ]);

  console.log('[Seed] Seeding Demo Farmers...');
  const farmers = await FarmerModel.insertMany([
    {
      farmerId: 'FR-AP-2026-000124',
      mobile: '9123456780',
      name: 'Venkata Manikanta',
      language: 'te',
      state: 'Andhra Pradesh',
      district: 'Vizianagaram',
      village: 'Garividi',
      landHoldingAcres: 4.2,
      verificationStatus: 'VERIFIED',
      bankAccountRef: 'XXXX-XXXX-4589',
      ifscCode: 'SBIN0001234'
    },
    {
      farmerId: 'FR-PB-2026-000342',
      mobile: '9123456781',
      name: 'Rameshwar Sharma',
      language: 'hi',
      state: 'Punjab',
      district: 'Ludhiana',
      village: 'Doraha',
      landHoldingAcres: 6.0,
      verificationStatus: 'VERIFIED',
      bankAccountRef: 'XXXX-XXXX-8921',
      ifscCode: 'PUNB0123400'
    }
  ]);

  console.log('[Seed] Generating Slots for today & tomorrow...');
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const datesToGenerate = [todayStr, tomorrowStr];
  const timeWindows = [
    { start: '08:00', end: '09:00', max: 300 },
    { start: '09:00', end: '10:00', max: 350 },
    { start: '10:00', end: '11:00', max: 350 },
    { start: '11:00', end: '12:00', max: 300 },
    { start: '13:00', end: '14:00', max: 350 },
    { start: '14:00', end: '15:00', max: 350 },
    { start: '15:00', end: '16:00', max: 300 },
    { start: '16:00', end: '17:00', max: 250 }
  ];

  for (const centre of centres) {
    for (const d of datesToGenerate) {
      for (const tw of timeWindows) {
        const slotId = `SLT-${centre.centreId.split('-').pop()}-${d}-${tw.start.replace(':', '')}`;
        await SlotModel.create({
          slotId,
          centreId: centre.centreId,
          date: d,
          startTime: tw.start,
          endTime: tw.end,
          maxCapacityQuintals: tw.max,
          bookedQuintals: tw.start === '09:00' ? 120 : tw.start === '10:00' ? 80 : 0,
          maxVehicles: 15,
          bookedVehicles: tw.start === '09:00' ? 3 : tw.start === '10:00' ? 2 : 0,
          status: 'OPEN'
        });
      }
    }
  }

  console.log('[Seed] Creating demo active bookings in queue...');
  const demoFarmer = farmers[0];
  const demoCentre = centres[0];
  const demoSlotId = `SLT-${demoCentre.centreId.split('-').pop()}-${todayStr}-1000`;

  const bookingId = 'BK-2026-000845';
  const tokenId = 'TK-VZM-0105';
  const qrDataUrl = await QRService.generateQRCodeDataURL(
    QRService.constructPayload(bookingId, tokenId, demoCentre.centreId, demoFarmer.farmerId)
  );

  await BookingModel.create({
    bookingId,
    farmerId: demoFarmer.farmerId,
    cropId: 'CR-PADDY-COMMON',
    centreId: demoCentre.centreId,
    slotId: demoSlotId,
    bookingDate: todayStr,
    timeWindow: '10:00 - 11:00',
    expectedQuantityQuintals: 50,
    tokenId,
    tokenSequence: 5,
    qrPayload: qrDataUrl,
    status: BookingStatus.ARRIVED,
    currentStage: QueueStage.WAITING,
    arrivedAt: new Date()
  });

  // Seed another booking currently at Quality check
  const b2BookingId = 'BK-2026-000844';
  const b2TokenId = 'TK-VZM-0104';
  const b2Qr = await QRService.generateQRCodeDataURL(
    QRService.constructPayload(b2BookingId, b2TokenId, demoCentre.centreId, 'FR-AP-2026-000999')
  );

  await BookingModel.create({
    bookingId: b2BookingId,
    farmerId: 'FR-AP-2026-000999',
    cropId: 'CR-PADDY-COMMON',
    centreId: demoCentre.centreId,
    slotId: demoSlotId,
    bookingDate: todayStr,
    timeWindow: '09:00 - 10:00',
    expectedQuantityQuintals: 40,
    tokenId: b2TokenId,
    tokenSequence: 4,
    qrPayload: b2Qr,
    status: BookingStatus.PROCESSING,
    currentStage: QueueStage.QUALITY_ASSAYING,
    arrivedAt: new Date(Date.now() - 25 * 60 * 1000)
  });

  // Seed a completed procurement from yesterday for history demonstration
  const pastBookingId = 'BK-2026-000720';
  const pastProcurementId = 'PR-2026-003421';
  const pastReceiptNo = 'RCPT-2026-418291';

  await BookingModel.create({
    bookingId: pastBookingId,
    farmerId: demoFarmer.farmerId,
    cropId: 'CR-PADDY-COMMON',
    centreId: demoCentre.centreId,
    slotId: `SLT-${demoCentre.centreId.split('-').pop()}-${todayStr}-0800`,
    bookingDate: todayStr,
    timeWindow: '08:00 - 09:00',
    expectedQuantityQuintals: 45,
    tokenId: 'TK-VZM-0098',
    tokenSequence: 1,
    qrPayload: qrDataUrl,
    status: BookingStatus.COMPLETED,
    currentStage: QueueStage.COMPLETED,
    arrivedAt: new Date(Date.now() - 2 * 3600 * 1000),
    completedAt: new Date(Date.now() - 3600 * 1000)
  });

  await QualityRecordModel.create({
    qualityId: 'QAL-2026-0098',
    bookingId: pastBookingId,
    centreId: demoCentre.centreId,
    moisturePercentage: 12.8,
    foreignMatterPercentage: 1.1,
    grade: 'FAQ (Grade A)',
    result: 'PASS',
    operatorId: 'OP-AP-001245'
  });

  await WeighingRecordModel.create({
    weighingId: 'WB-2026-0098',
    bookingId: pastBookingId,
    centreId: demoCentre.centreId,
    grossWeightKg: 4720,
    tareWeightKg: 220,
    netWeightKg: 4500,
    netWeightQuintals: 45.0,
    vehicleNumber: 'AP 35 TB 8844',
    scaleOperatorId: 'OP-AP-001245'
  });

  await ProcurementModel.create({
    procurementId: pastProcurementId,
    bookingId: pastBookingId,
    farmerId: demoFarmer.farmerId,
    centreId: demoCentre.centreId,
    cropId: 'CR-PADDY-COMMON',
    ratePerQuintal: 2300,
    totalQuintals: 45.0,
    grossAmountINR: 103500,
    deductionsINR: 0,
    netPayableINR: 103500,
    receiptNumber: pastReceiptNo,
    status: 'COMPLETED',
    operatorId: 'OP-AP-001245'
  });

  await PaymentModel.create({
    paymentId: 'PAY-2026-005421',
    procurementId: pastProcurementId,
    farmerId: demoFarmer.farmerId,
    amountINR: 103500,
    status: 'TRANSFERRED',
    bankAccountRef: demoFarmer.bankAccountRef,
    ifscCode: demoFarmer.ifscCode,
    utrReference: 'UTR-RBI-20260907-889100',
    processedAt: new Date()
  });

  console.log('[Seed] Database successfully populated with realistic Indian procurement master data!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
