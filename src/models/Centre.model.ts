import mongoose, { Document, Schema } from 'mongoose';
import { ICentre, CentreStatus } from '@smartfarmer/shared';

export interface ICentreDocument extends Omit<ICentre, '_id'>, Document {}

const CentreSchema = new Schema<ICentreDocument>(
  {
    centreId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, required: true },
    dailyCapacityQuintals: { type: Number, required: true, default: 2000 },
    operatingCounters: { type: Number, required: true, default: 3 },
    operatingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '18:00' }
    },
    eligibleCrops: [{ type: String }],
    status: { type: String, enum: Object.values(CentreStatus), default: CentreStatus.ACTIVE },
    location: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  { timestamps: true }
);

export const CentreModel = mongoose.model<ICentreDocument>('Centre', CentreSchema);
