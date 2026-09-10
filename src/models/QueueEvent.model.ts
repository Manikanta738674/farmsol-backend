import mongoose, { Document, Schema } from 'mongoose';
import { IQueueEvent, QueueStage } from '@smartfarmer/shared';

export interface IQueueEventDocument extends Omit<IQueueEvent, '_id'>, Document {}

const QueueEventSchema = new Schema<IQueueEventDocument>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, required: true, index: true },
    centreId: { type: String, required: true, index: true },
    tokenId: { type: String, required: true, index: true },
    stage: { type: String, enum: Object.values(QueueStage), required: true },
    eventType: {
      type: String,
      enum: ['STAGE_ENTERED', 'TOKEN_CALLED', 'STAGE_COMPLETED', 'STAGE_PAUSED', 'DELAYED', 'NO_SHOW'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    operatorId: { type: String, required: true },
    note: { type: String }
  },
  { timestamps: true }
);

export const QueueEventModel = mongoose.model<IQueueEventDocument>('QueueEvent', QueueEventSchema);
