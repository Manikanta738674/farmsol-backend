import mongoose, { Document, Schema } from 'mongoose';
import { IBooking, BookingStatus, QueueStage } from '@smartfarmer/shared';

export interface IBookingDocument extends Omit<IBooking, '_id'>, Document {}

const BookingSchema = new Schema<IBookingDocument>(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true },
    cropId: { type: String, required: true, index: true },
    centreId: { type: String, required: true, index: true },
    slotId: { type: String, required: true, index: true },
    bookingDate: { type: String, required: true, index: true },
    timeWindow: { type: String, required: true },
    expectedQuantityQuintals: { type: Number, required: true },
    tokenId: { type: String, required: true, unique: true, index: true },
    tokenSequence: { type: Number, required: true },
    qrPayload: { type: String, required: true },
    status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.CONFIRMED },
    currentStage: { type: String, enum: Object.values(QueueStage), default: QueueStage.GATE_ENTRY },
    arrivedAt: { type: Date },
    completedAt: { type: Date },
    cancellationReason: { type: String },
    rescheduledFromBookingId: { type: String }
  },
  { timestamps: true }
);

export const BookingModel = mongoose.model<IBookingDocument>('Booking', BookingSchema);
