// src/auth/login.route.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { config } from '../config.js';

export const loginRouter = express.Router();

/**
 * POST /api/login
 */
loginRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND is_active = 1 LIMIT 1',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username tidak ditemukan atau akun nonaktif' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password salah' });
    }

    const payload = {
      id_user: user.id_user,
      username: user.username,
      id_unit_prodi: user.id_unit, // <--- ubah nama field-nya di sini bro
      role: user.role
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    res.cookie('token', token, { httpOnly: true });
    res.json({
      token,
      user: payload
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/me
 * Ambil informasi user dari token
 */
loginRouter.get('/me', (req, res) => {
  // Ambil token dari cookie atau header
  const headerAuth = req.headers.authorization || '';
  const token =
    req.cookies?.token ||
    (headerAuth.startsWith('Bearer ') ? headerAuth.slice(7) : null);

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    res.json({
      id_user: decoded.id_user,
      username: decoded.username,
      id_unit_prodi: decoded.id_unit_prodi,
      role: decoded.role
    });
  } catch (err) {
    console.error('Token verify error:', err);
    return res.status(401).json({ error: 'Token tidak valid atau sudah expired' });
  }
});

/**
 * POST /api/logout
 */
loginRouter.post('/logout', (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ message: 'Logout berhasil' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
