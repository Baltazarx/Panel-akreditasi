import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  try {
    // Ambil token dari cookie atau header
    const authHeader = req.headers.authorization || '';
    const token = req.cookies?.token || 
                  (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // user payload ditaruh di req.user

    next();
  } catch (err) {
    console.error('Auth error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    res.status(401).json({ error: 'Invalid token' });
  }
}
