import mongoose, { Document, Schema } from 'mongoose';
import { IWeighingRecord } from '@smartfarmer/shared';

export interface IWeighingRecordDocument extends Omit<IWeighingRecord, '_id'>, Document {}

const WeighingRecordSchema = new Schema<IWeighingRecordDocument>(
  {
    weighingId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, required: true, unique: true, index: true },
    centreId: { type: String, required: true, index: true },
    grossWeightKg: { type: Number, required: true },
    tareWeightKg: { type: Number, required: true },
    netWeightKg: { type: Number, required: true },
    netWeightQuintals: { type: Number, required: true },
    vehicleNumber: { type: String },
    scaleOperatorId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const WeighingRecordModel = mongoose.model<IWeighingRecordDocument>('WeighingRecord', WeighingRecordSchema);
