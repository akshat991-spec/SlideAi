import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes         from './routes/auth.js';
import presentationRoutes from './routes/presentations.js';
import uploadRoutes       from './routes/upload.js';
import shareRoutes        from './routes/share.js';

const app = express();

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  // Add Vercel preview URLs pattern
  /https:\/\/.*\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls or any vercel/localhost origin
      if (!origin || origin.includes('localhost') || origin.includes('vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true, // allow cookies
  })
);

// ── Core middleware ───────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Ensure DB Connection for Serverless ───────────────────────────
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(503).json({
      message: 'Database connection failed. Please check MONGODB_URI configuration.',
      error: err.message,
    });
  }
});

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/presentations', presentationRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/share',         shareRoutes);

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────
app.use(errorHandler);

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

// ── Start server (Local Dev Only) ─────────────────────────────────
// Vercel handles the serverless execution using the exported app.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀  SlideAI server running on http://localhost:${PORT}`);
    console.log(`    Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
