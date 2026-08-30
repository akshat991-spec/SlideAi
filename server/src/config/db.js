import mongoose from 'mongoose';

/**
 * Global variable to cache the database connection across serverless invocations.
 */
let cachedConnection = null;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  try {
    cachedConnection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    cachedConnection = null;
    throw err;
  }
}
