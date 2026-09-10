import mongoose, { Document, Schema } from 'mongoose';
import { IFarmer } from '@smartfarmer/shared';

export interface IFarmerDocument extends Omit<IFarmer, '_id'>, Document {}

const FarmerSchema = new Schema<IFarmerDocument>(
  {
    farmerId: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    language: { type: String, enum: ['en', 'hi', 'te'], default: 'te' },
    state: { type: String, required: true, default: 'Andhra Pradesh' },
    district: { type: String, required: true },
    village: { type: String, required: true },
    landHoldingAcres: { type: Number, required: true, default: 2.5 },
    verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'VERIFIED' },
    bankAccountRef: { type: String, required: true, default: 'XXXX-XXXX-4589' },
    ifscCode: { type: String, required: true, default: 'SBIN0001234' }
  },
  { timestamps: true }
);

export const FarmerModel = mongoose.model<IFarmerDocument>('Farmer', FarmerSchema);
