import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  try {
    const bearer = req.headers.authorization || '';
    const tokenFromBearer = bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
    const token = req.cookies?.token || tokenFromBearer; // cookie dulu, bearer fallback
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const claims = jwt.verify(token, config.jwtSecret);
    req.user = {
      id_user: claims.id_user,
      username: claims.username,
      id_unit: claims.id_unit,
      role: claims.role || null,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
