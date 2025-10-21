import { pool } from '../db.js';

export const getListUnitProdi = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_unit AS id_unit_prodi, nama_unit FROM unit_kerja WHERE deleted_at IS NULL'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error getListUnitProdi:', err);
    res.status(500).json({ error: 'Gagal mengambil daftar unit prodi' });
  }
};
