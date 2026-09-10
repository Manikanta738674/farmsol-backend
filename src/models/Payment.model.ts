import mongoose, { Document, Schema } from 'mongoose';
import { IPayment, PaymentStatus } from '@smartfarmer/shared';

export interface IPaymentDocument extends Omit<IPayment, '_id'>, Document {}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    procurementId: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true },
    amountINR: { type: Number, required: true },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PROCESSING },
    bankAccountRef: { type: String, required: true },
    ifscCode: { type: String, required: true },
    utrReference: { type: String },
    processedAt: { type: Date },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
