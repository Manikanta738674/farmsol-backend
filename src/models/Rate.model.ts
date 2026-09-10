import mongoose, { Document, Schema } from 'mongoose';
import { IRate } from '@smartfarmer/shared';

export interface IRateDocument extends Omit<IRate, '_id'>, Document {}

const RateSchema = new Schema<IRateDocument>(
  {
    rateId: { type: String, required: true, unique: true, index: true },
    cropId: { type: String, required: true, index: true },
    scheme: { type: String, required: true, default: 'MSP-GOI' },
    ratePerQuintal: { type: Number, required: true },
    marketPricePerQuintal: { type: Number, required: true },
    effectiveFrom: { type: Date, required: true, default: Date.now },
    effectiveTo: { type: Date, required: true },
    source: { type: String, default: 'Department of Consumer Affairs (DoCA)' }
  },
  { timestamps: true }
);

export const RateModel = mongoose.model<IRateDocument>('Rate', RateSchema);
