import mongoose, { Document, Schema } from 'mongoose';
import { IQualityRecord, QualityResult } from '@smartfarmer/shared';

export interface IQualityRecordDocument extends Omit<IQualityRecord, '_id'>, Document {}

const QualityRecordSchema = new Schema<IQualityRecordDocument>(
  {
    qualityId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, required: true, unique: true, index: true },
    centreId: { type: String, required: true, index: true },
    moisturePercentage: { type: Number, required: true },
    foreignMatterPercentage: { type: Number, required: true },
    grade: { type: String, default: 'FAQ (Fair Average Quality)' },
    result: { type: String, enum: Object.values(QualityResult), required: true },
    rejectionReason: { type: String },
    operatorId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const QualityRecordModel = mongoose.model<IQualityRecordDocument>('QualityRecord', QualityRecordSchema);
