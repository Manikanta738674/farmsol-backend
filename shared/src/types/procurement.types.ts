import { QualityResult, PaymentStatus } from '../constants/stages';

export interface IQualityRecord {
  _id?: string;
  qualityId: string;
  bookingId: string;
  centreId: string;
  moisturePercentage: number;
  foreignMatterPercentage: number;
  grade: string; // 'Grade-A', 'Fair Average Quality (FAQ)', etc.
  result: QualityResult;
  rejectionReason?: string;
  operatorId: string;
  timestamp: Date;
}

export interface IWeighingRecord {
  _id?: string;
  weighingId: string;
  bookingId: string;
  centreId: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  netWeightQuintals: number;
  vehicleNumber?: string;
  scaleOperatorId: string;
  timestamp: Date;
}

export interface IProcurement {
  _id?: string;
  procurementId: string; // PR-2026-003421
  bookingId: string;
  farmerId: string;
  centreId: string;
  cropId: string;
  ratePerQuintal: number;
  totalQuintals: number;
  grossAmountINR: number;
  deductionsINR: number;
  netPayableINR: number;
  receiptNumber: string;
  status: 'COMPLETED';
  completedAt: Date;
  operatorId: string;
}

export interface IPayment {
  _id?: string;
  paymentId: string; // PAY-2026-005421
  procurementId: string;
  farmerId: string;
  amountINR: number;
  status: PaymentStatus;
  bankAccountRef: string; // Masked
  ifscCode: string;
  utrReference?: string;
  processedAt?: Date;
  updatedAt: Date;
}

export interface IGrievance {
  _id?: string;
  grievanceId: string; // GR-2026-00125
  farmerId: string;
  bookingId?: string;
  procurementId?: string;
  category: 'SLOT_BOOKING' | 'QUEUE_DELAY' | 'QUALITY_REJECTION' | 'WEIGHING_DISPUTE' | 'PAYMENT_PENDING' | 'OTHER';
  description: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  resolutionComment?: string;
  resolvedAt?: Date;
  createdAt: Date;
}
