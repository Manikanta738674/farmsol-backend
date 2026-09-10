import mongoose, { Document, Schema } from 'mongoose';
import { ISlot } from '@smartfarmer/shared';

export interface ISlotDocument extends Omit<ISlot, '_id'>, Document {}

const SlotSchema = new Schema<ISlotDocument>(
  {
    slotId: { type: String, required: true, unique: true, index: true },
    centreId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    maxCapacityQuintals: { type: Number, required: true, default: 300 },
    bookedQuintals: { type: Number, required: true, default: 0 },
    maxVehicles: { type: Number, required: true, default: 15 },
    bookedVehicles: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['OPEN', 'FULL', 'CLOSED'], default: 'OPEN' }
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness of slot by centre, date and window
SlotSchema.index({ centreId: 1, date: 1, startTime: 1 }, { unique: true });

export const SlotModel = mongoose.model<ISlotDocument>('Slot', SlotSchema);
