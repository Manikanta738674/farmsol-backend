import { BookingStatus, CentreStatus, QueueStage } from '../constants/stages';
import { SupportedLanguage } from '../constants/languages';

export interface IFarmer {
  _id?: string;
  farmerId: string; // e.g. FR-AP-2026-000124
  mobile: string;
  name: string;
  language: SupportedLanguage;
  state: string;
  district: string;
  village: string;
  landHoldingAcres: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  bankAccountRef: string; // Masked e.g. 'XXXX-XXXX-4589'
  ifscCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICentre {
  _id?: string;
  centreId: string; // e.g. PC-AP-VZM-0012
  name: string;
  state: string;
  district: string;
  address: string;
  dailyCapacityQuintals: number;
  operatingCounters: number;
  operatingHours: {
    start: string; // '08:00'
    end: string;   // '18:00'
  };
  eligibleCrops: string[]; // Array of cropIds
  status: CentreStatus;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOperator {
  _id?: string;
  operatorId: string; // e.g. OP-AP-001245
  name: string;
  mobile: string;
  role: 'OPERATOR' | 'CENTRE_MANAGER';
  centreIds: string[]; // Assigned centre IDs
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICrop {
  _id?: string;
  cropId: string; // e.g. CR-PADDY-COMMON
  name: string;
  variety: string;
  unit: string; // e.g. 'Quintal'
  activeSeason: string; // e.g. 'KHARIF-2026'
  qualityRules: {
    maxMoisturePercentage: number;
    maxForeignMatterPercentage: number;
    gradeRequirements?: Record<string, any>;
  };
}

export interface IRate {
  _id?: string;
  rateId: string;
  cropId: string;
  scheme: string; // 'MSP-GOI' or state scheme
  ratePerQuintal: number; // in INR
  marketPricePerQuintal: number; // live market reference
  effectiveFrom: Date;
  effectiveTo: Date;
  source: string;
  updatedAt: Date;
}

export interface ISlot {
  _id?: string;
  slotId: string;
  centreId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // '09:00'
  endTime: string;   // '10:00'
  maxCapacityQuintals: number;
  bookedQuintals: number;
  maxVehicles: number;
  bookedVehicles: number;
  status: 'OPEN' | 'FULL' | 'CLOSED';
}

export interface IBooking {
  _id?: string;
  bookingId: string; // BK-2026-000845
  farmerId: string;
  cropId: string;
  centreId: string;
  slotId: string;
  bookingDate: string; // YYYY-MM-DD
  timeWindow: string; // '09:00 - 10:00'
  expectedQuantityQuintals: number;
  tokenId: string; // TK-PC001-0105
  tokenSequence: number;
  qrPayload: string;
  status: BookingStatus;
  currentStage: QueueStage;
  arrivedAt?: Date;
  completedAt?: Date;
  cancellationReason?: string;
  rescheduledFromBookingId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
