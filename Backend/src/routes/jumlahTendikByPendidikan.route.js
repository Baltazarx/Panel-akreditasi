import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

export const jumlahTendikByPendidikanRouter = Router();

jumlahTendikByPendidikanRouter.get('/', async (req, res) => {
  try {
    const educationLevels = ["S3", "S2", "S1", "D4", "D3", "D2", "D1", "SMA/SMK/MA"];
    const selectColumns = educationLevels.map(level => `SUM(CASE WHEN kt.jenjang_pendidikan = '${level}' THEN 1 ELSE 0 END) AS '${level}'`).join(', ');

    const [rows] = await pool.query(
      `SELECT
         tk.jenis_tendik,
         uk.nama_unit AS unit_kerja,
         ${selectColumns}
       FROM kualifikasi_tendik kt
       JOIN tenaga_kependidikan tk ON kt.id_tendik = tk.id_tendik
       LEFT JOIN unit_kerja uk ON kt.id_unit = uk.id_unit
       GROUP BY tk.jenis_tendik, uk.nama_unit
       ORDER BY tk.jenis_tendik, uk.nama_unit`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching jumlah tendik by pendidikan:", error);
    res.status(500).json({ error: 'Gagal memuat jumlah tendik berdasarkan pendidikan' });
  }
});
