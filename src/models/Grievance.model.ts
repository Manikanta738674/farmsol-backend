import mongoose, { Document, Schema } from 'mongoose';
import { IGrievance } from '@smartfarmer/shared';

export interface IGrievanceDocument extends Omit<IGrievance, '_id'>, Document {}

const GrievanceSchema = new Schema<IGrievanceDocument>(
  {
    grievanceId: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true },
    bookingId: { type: String, index: true },
    procurementId: { type: String, index: true },
    category: {
      type: String,
      enum: ['SLOT_BOOKING', 'QUEUE_DELAY', 'QUALITY_REJECTION', 'WEIGHING_DISPUTE', 'PAYMENT_PENDING', 'OTHER'],
      required: true
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
      default: 'SUBMITTED'
    },
    resolutionComment: { type: String },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

export const GrievanceModel = mongoose.model<IGrievanceDocument>('Grievance', GrievanceSchema);
