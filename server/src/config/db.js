import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * Exits the process on failure so the server doesn't start in a broken state.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  }
}
