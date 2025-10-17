import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = req.cookies?.token || (h.startsWith('Bearer ') ? h.slice(7) : null);

  if (process.env.NODE_ENV !== 'production') {
    console.log('Token received:', token ? '[REDACTED]' : '(none)');
  }

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
