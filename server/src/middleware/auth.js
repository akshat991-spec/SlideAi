import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware: verifies the JWT from the HTTP-only cookie.
 * Attaches req.user on success; returns 401 on failure.
 */
export async function protect(req, res, next) {
  try {
    // Read token from cookie (primary) or Authorization header (fallback for Vercel preview)
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Please log in.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (without password)
    const user = await User.findById(decoded.id).lean();
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token. Please log in.' });
  }
}
