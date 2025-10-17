import { Router } from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const loginRouter = Router();

function signToken(user) {
  // role langsung dari DB (kolom `role` di tabel users)
  const roleKey = user.role;
  return jwt.sign(
    {
      id_user: user.id_user,
      username: user.username,
      id_unit: user.id_unit,
      role: roleKey,
      nama_unit: user.nama_unit,
    },
    config.jwtSecret,
    { expiresIn: '12h' }
  );
}

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 12 * 60 * 60 * 1000,
  path: '/',
};

loginRouter.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });

  const [rows] = await pool.query(
    `SELECT u.*, uk.nama_unit
     FROM users u
     LEFT JOIN unit_kerja uk ON u.id_unit = uk.id_unit
     WHERE BINARY u.username = ? AND u.is_active = 1`,
    [username]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Username atau password salah' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Username atau password salah' });

  const token = signToken(user);
  res.cookie('token', token, cookieOpts);
  // Kirim ringkas; FE bisa panggil /me untuk detail sesi
  return res.json({ ok: true });
});

loginRouter.get('/me', (req, res) => {
  const h = req.headers.authorization || '';
  const token = req.cookies?.token || (h.startsWith('Bearer ') ? h.slice(7) : null);
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const claims = jwt.verify(token, config.jwtSecret);
    return res.json({
      id_user: claims.id_user,
      username: claims.username,
      id_unit: claims.id_unit,
      role: claims.role || null,
      nama_unit: claims.nama_unit || null,
    });
  } catch {
    return res.status(401).json({ error: 'Invalid/expired session' });
  }
});

loginRouter.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOpts);
  return res.json({ ok: true });
});
