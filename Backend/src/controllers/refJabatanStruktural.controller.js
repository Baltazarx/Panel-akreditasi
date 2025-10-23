import { pool } from '../db.js';

// ===== LIST =====
export const listRefJabatanStruktural = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM ref_jabatan_struktural ORDER BY nama_jabatan ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error listRefJabatanStruktural:", err);
    res.status(500).json({ error: 'Gagal memuat daftar jabatan struktural' });
  }
};
