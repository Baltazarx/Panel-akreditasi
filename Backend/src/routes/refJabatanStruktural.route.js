import express from 'express';
import { pool } from '../db.js';

export const refJabatanStrukturalRouter = express.Router();

refJabatanStrukturalRouter.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ref_jabatan_struktural ORDER BY nama_jabatan ASC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});
