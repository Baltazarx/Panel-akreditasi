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
    // [QUERY BARU]
    // Mengambil data user, pegawai, unit, dan role
    const sql = `
      SELECT 
        u.id_user,
        u.username,
        u.password,
        u.is_active,
        u.id_unit,
        p.id_pegawai,
        p.nama_lengkap,
        p.id_jabatan,
        uk.nama_unit,
        uk.kode_role
      FROM users u
      LEFT JOIN pegawai p ON u.id_pegawai = p.id_pegawai
      LEFT JOIN unit_kerja uk ON u.id_unit = uk.id_unit
      WHERE u.username = ? AND u.deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username tidak ditemukan' });
    }

    const user = rows[0];

    // Cek Aktif
    if (!user.is_active) {
      return res.status(403).json({ error: 'Akun dinonaktifkan' });
    }

    // Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password salah' });
    }

    // [VALIDASI KETUA UNIT]
    // Hanya ketua unit yang diizinkan login
    if (user.id_jabatan !== 1) {
      return res.status(403).json({ error: 'Akses Ditolak. Hanya Ketua Unit yang diizinkan login.' });
    }

    // [VALIDASI ROLE]
    if (!user.kode_role) {
      return res.status(403).json({ error: `Unit Kerja '${user.nama_unit}' belum memiliki hak akses (kode_role). Hubungi Admin.` });
    }

    // Payload Token
    const payload = {
      id_user: user.id_user,
      id_pegawai: user.id_pegawai,
      username: user.username,

      // Data Dinamis dari Pegawai/Unit
      id_unit: user.id_unit,
      role: user.kode_role,
      nama_lengkap: user.nama_lengkap
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    res.cookie('token', token, { httpOnly: true });

    res.json({
      message: 'Login berhasil',
      token,
      user: payload
    });

  } catch (err) {
    console.error('Login error:', err);
    // Log detail error untuk debugging
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * GET /api/me
 */
loginRouter.get('/me', (req, res) => {
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
      id_pegawai: decoded.id_pegawai,
      username: decoded.username,
      nama_lengkap: decoded.nama_lengkap,
      id_unit: decoded.id_unit,
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