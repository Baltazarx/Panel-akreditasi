// src/routes/unitKerja.route.js
import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

export const unitKerjaRouter = Router();

unitKerjaRouter.get('/', requireAuth, permit('unit_kerja'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM unit_kerja ORDER BY id_unit');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get unit_kerja' });
  }
});
