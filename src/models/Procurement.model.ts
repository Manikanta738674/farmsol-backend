import mongoose, { Document, Schema } from 'mongoose';
import { IProcurement } from '@smartfarmer/shared';

export interface IProcurementDocument extends Omit<IProcurement, '_id'>, Document {}

const ProcurementSchema = new Schema<IProcurementDocument>(
  {
    procurementId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true },
    centreId: { type: String, required: true, index: true },
    cropId: { type: String, required: true, index: true },
    ratePerQuintal: { type: Number, required: true },
    totalQuintals: { type: Number, required: true },
    grossAmountINR: { type: Number, required: true },
    deductionsINR: { type: Number, default: 0 },
    netPayableINR: { type: Number, required: true },
    receiptNumber: { type: String, required: true, unique: true },
    status: { type: String, default: 'COMPLETED' },
    completedAt: { type: Date, default: Date.now },
    operatorId: { type: String, required: true }
  },
  { timestamps: true }
);

export const ProcurementModel = mongoose.model<IProcurementDocument>('Procurement', ProcurementSchema);
