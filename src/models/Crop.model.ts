import mongoose, { Document, Schema } from 'mongoose';
import { ICrop } from '@smartfarmer/shared';

export interface ICropDocument extends Omit<ICrop, '_id'>, Document {}

const CropSchema = new Schema<ICropDocument>(
  {
    cropId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    variety: { type: String, required: true },
    unit: { type: String, required: true, default: 'Quintal' },
    activeSeason: { type: String, required: true, default: 'KHARIF-2026' },
    qualityRules: {
      maxMoisturePercentage: { type: Number, default: 14 },
      maxForeignMatterPercentage: { type: Number, default: 2 },
      gradeRequirements: { type: Schema.Types.Mixed, default: {} }
    }
  },
  { timestamps: true }
);

export const CropModel = mongoose.model<ICropDocument>('Crop', CropSchema);
