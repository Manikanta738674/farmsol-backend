import mongoose from 'mongoose';
import { ENV } from './environment';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    console.warn(`[MongoDB] Warning: Initial database connection failed (${error.message || error}).`);
    console.warn('[MongoDB] The API server will continue running. Ensure MONGODB_URI is set in Render Environment Variables and MongoDB Atlas whitelist includes 0.0.0.0/0.');
  }
};
