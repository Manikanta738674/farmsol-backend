import mongoose, { Document, Schema } from 'mongoose';
import { IOperator } from '@smartfarmer/shared';

export interface IOperatorDocument extends Omit<IOperator, '_id'>, Document {
  passwordHash?: string;
}

const OperatorSchema = new Schema<IOperatorDocument>(
  {
    operatorId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['OPERATOR', 'CENTRE_MANAGER'], default: 'OPERATOR' },
    centreIds: [{ type: String, required: true }],
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    passwordHash: { type: String, default: '' }
  },
  { timestamps: true }
);

export const OperatorModel = mongoose.model<IOperatorDocument>('Operator', OperatorSchema);
