import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';

export const tabel2a2KeragamanAsalRouter = Router();

const listTabel2a2KeragamanAsal = async (req, res) => {
  const q = req.query || {};
  const idUnitProdiParam = q.id_unit_prodi ?? null;
  const idTahunParam = q.id_tahun ?? q.tahun ?? null;
  const kategoriParam = q.kategori_geografis ?? null;

  let sql = `
    SELECT
      ka.*,
      uk.nama_unit AS nama_unit_prodi,
      ta.tahun AS tahun_akademik
    FROM tabel_2a2_keragaman_asal ka
    LEFT JOIN unit_kerja uk ON ka.id_unit_prodi = uk.id_unit
    LEFT JOIN tahun_akademik ta ON ka.id_tahun = ta.id_tahun
  `;
  const where = [];
  const params = [];

  if (idUnitProdiParam) {
    where.push('ka.id_unit_prodi = ?');
    params.push(idUnitProdiParam);
  }
  if (idTahunParam) {
    where.push('ka.id_tahun = ?');
    params.push(idTahunParam);
  }
  if (kategoriParam) {
    where.push('ka.kategori_geografis = ?');
    params.push(kategoriParam);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY ka.id ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data keragaman asal' });
  }
};

// =============================================
// PERUBAHAN DI BAGIAN INI
// =============================================
const crud = crudFactory({
  table: 'tabel_2a2_keragaman_asal',
  idCol: 'id',
  allowedCols: [
    'id_unit_prodi',
    'id_tahun',
    'kategori_geografis',
    'nama_daerah_input',
    'jumlah_mahasiswa',
    'link_bukti',
    'is_afirmasi',         // Pastikan kolom ini ada
    'is_kebutuhan_khusus'  // Pastikan kolom ini ada
  ],
  resourceKey: 'tabel_2a2_keragaman_asal',
  list: listTabel2a2KeragamanAsal,
});
// =============================================
// AKHIR DARI PERUBAHAN
// =============================================

// ---- CRUD ----
tabel2a2KeragamanAsalRouter.get('/', requireAuth, permit('tabel_2a2_keragaman_asal'), crud.list);
tabel2a2KeragamanAsalRouter.get('/:id(\\d+)', requireAuth, permit('tabel_2a2_keragaman_asal'), crud.getById);
tabel2a2KeragamanAsalRouter.post('/', requireAuth, permit('tabel_2a2_keragaman_asal'), crud.create);
tabel2a2KeragamanAsalRouter.put('/:id(\\d+)', requireAuth, permit('tabel_2a2_keragaman_asal'), crud.update);
tabel2a2KeragamanAsalRouter.delete('/:id', requireAuth, permit('tabel_2a2_keragaman_asal'), crud.remove);
tabel2a2KeragamanAsalRouter.post('/:id/restore', requireAuth, permit('tabel_2a2_keragaman_asal'), crud.restore);
tabel2a2KeragamanAsalRouter.delete('/:id/hard-delete', requireAuth, permit('tabel_2a2_keragaman_asal'), crud.hardRemove);

export default tabel2a2KeragamanAsalRouter;