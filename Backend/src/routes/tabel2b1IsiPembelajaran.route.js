import express from 'express';
const router = express.Router();
import { pool } from '../db.js';
import { requireAuth as authenticateToken } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { crudFactory } from '../utils/crudFactory.js';

// Read All (Semua bisa baca) - custom query to join mata_kuliah and map_cpl_mk
router.get('/', authenticateToken, permit('tabel_2b1_isi_pembelajaran'), async (req, res) => {
  try {
    const { id_unit_prodi, id_tahun } = req.query;
    let query = `
      SELECT
        mk.id_mk,
        mk.kode_mk,
        mk.nama_mk,
        mk.sks,
        mk.semester,
        mk.id_unit_prodi,
        ta.id_tahun,
        mc.id_cpl,
        pl.id_pl
      FROM mata_kuliah mk
      JOIN kurikulum k ON mk.id_unit_prodi = k.id_unit_prodi
      JOIN tahun_akademik ta ON k.tahun_mulai_berlaku = ta.id_tahun
      LEFT JOIN map_cpl_mk mcmk ON mk.id_mk = mcmk.id_mk
      LEFT JOIN cpl mc ON mcmk.id_cpl = mc.id_cpl
      LEFT JOIN map_cpl_pl mcpp ON mc.id_cpl = mcpp.id_cpl
      LEFT JOIN profil_lulusan pl ON mcpp.id_pl = pl.id_pl
    `;
    const queryParams = [];
    const conditions = [];

    if (id_unit_prodi) {
      conditions.push('mk.id_unit_prodi = ?');
      queryParams.push(id_unit_prodi);
    }
    if (id_tahun) {
      conditions.push('ta.id_tahun = ?');
      queryParams.push(id_tahun);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY mk.id_unit_prodi, ta.id_tahun, mk.semester, mk.kode_mk;';

    const [rows] = await pool.execute(query, queryParams);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create (Hanya Superadmin)
router.post('/', authenticateToken, permit(['superadmin']), crudFactory({ table: 'tabel_2b1_isi_pembelajaran', allowedCols: ['id_unit_prodi', 'id_tahun', 'id_mk', 'id_cpl'], idCol: 'id' }).create);

// Read One (Semua bisa baca) - custom query
router.get('/:id', authenticateToken, permit(['superadmin', 'waket-1', 'waket-2', 'prodi-ti', 'prodi-mi', 'dosen', 'tpm', 'pimpinan']), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(`
      SELECT
        mk.id_mk,
        mk.kode_mk,
        mk.nama_mk,
        mk.sks,
        mk.semester,
        mk.id_unit_prodi,
        ta.id_tahun,
        mc.id_cpl,
        pl.id_pl
      FROM mata_kuliah mk
      JOIN kurikulum k ON mk.id_unit_prodi = k.id_unit_prodi
      JOIN tahun_akademik ta ON k.tahun_mulai_berlaku = ta.id_tahun
      LEFT JOIN map_cpl_mk mcmk ON mk.id_mk = mcmk.id_mk
      LEFT JOIN cpl mc ON mcmk.id_cpl = mc.id_cpl
      LEFT JOIN map_cpl_pl mcpp ON mc.id_cpl = mcpp.id_cpl
      LEFT JOIN profil_lulusan pl ON mcpp.id_pl = pl.id_pl
      WHERE mk.id_mk = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update (Hanya Superadmin)
router.put('/:id', authenticateToken, permit(['superadmin']), crudFactory({ table: 'tabel_2b1_isi_pembelajaran', allowedCols: ['id_unit_prodi', 'id_tahun', 'id_mk', 'id_cpl'], idCol: 'id' }).update);

// Delete (Hanya Superadmin)
router.delete('/:id', authenticateToken, permit(['superadmin']), crudFactory({ table: 'tabel_2b1_isi_pembelajaran', idCol: 'id' }).remove);

export default router;
