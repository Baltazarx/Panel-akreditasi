import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const tabel2b5KesesuaianKerjaRouter = Router();

const listTabel2b5KesesuaianKerja = async (req, res) => {
  const q = req.query || {};
  const idUnitProdiParam = q.id_unit_prodi ?? null;
  const idTahunLulusParam = q.id_tahun_lulus ?? q.tahun_lulus ?? null; 

  let sql = `
    SELECT
      kk.*,
      uk.nama_unit AS nama_unit_prodi,
      ta.tahun AS tahun_akademik
    FROM tabel_2b5_kesesuaian_kerja kk
    LEFT JOIN unit_kerja uk ON kk.id_unit_prodi = uk.id_unit
    LEFT JOIN tahun_akademik ta ON kk.id_tahun_lulus = ta.id_tahun
  `;
  const where = [];
  const params = [];

  if (idUnitProdiParam) {
    where.push('kk.id_unit_prodi = ?');
    params.push(idUnitProdiParam);
  }
  if (idTahunLulusParam) {
    where.push('kk.id_tahun_lulus = ?');
    params.push(idTahunLulusParam);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY kk.id ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data kesesuaian kerja' });
  }
};

const crud = crudFactory({
  table: 'tabel_2b5_kesesuaian_kerja',
  idCol: 'id',
  allowedCols: [
    'id_unit_prodi',
    'id_tahun_lulus',
    'jml_infokom',
    'jml_non_infokom',
    'jml_internasional',
    'jml_nasional',
    'jml_wirausaha',
  ],
  resourceKey: 'tabel_2b5_kesesuaian_kerja',
  list: listTabel2b5KesesuaianKerja,
});

// ---- CRUD ----
tabel2b5KesesuaianKerjaRouter.get('/', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), crud.list);
tabel2b5KesesuaianKerjaRouter.get('/:id(\d+)', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), crud.getById);
tabel2b5KesesuaianKerjaRouter.post('/', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), crud.create);
tabel2b5KesesuaianKerjaRouter.put('/:id(\d+)', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), crud.update);
tabel2b5KesesuaianKerjaRouter.delete('/:id', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), crud.remove);
tabel2b5KesesuaianKerjaRouter.post('/:id/restore', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), crud.restore);
tabel2b5KesesuaianKerjaRouter.delete('/:id/hard-delete', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'tabel_2b5_kesesuaian_kerja',
  table: 'tabel_2b5_kesesuaian_kerja',
  columns: [
    'id',
    'id_unit_prodi',
    'id_tahun_lulus',
    'jml_infokom',
    'jml_non_infokom',
    'jml_internasional',
    'jml_nasional',
    'jml_wirausaha',
  ],
  headers: [
    'ID',
    'Unit Prodi',
    'Tahun Lulus',
    'Jumlah Infokom',
    'Jumlah Non Infokom',
    'Jumlah Internasional',
    'Jumlah Nasional',
    'Jumlah Wirausaha',
  ],
  title: (label) => `Kesesuaian Kerja — ${label}`,
  orderBy: 'm.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: true });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
tabel2b5KesesuaianKerjaRouter.get('/export', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), exportHandler);
tabel2b5KesesuaianKerjaRouter.post('/export', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
tabel2b5KesesuaianKerjaRouter.get('/export-doc', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), makeDocAlias(exportHandler));
tabel2b5KesesuaianKerjaRouter.post('/export-doc', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), makeDocAlias(exportHandler));
tabel2b5KesesuaianKerjaRouter.get('/export-pdf', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), makePdfAlias(exportHandler));
tabel2b5KesesuaianKerjaRouter.post('/export-pdf', requireAuth, permit('tabel_2b5_kesesuaian_kerja'), makePdfAlias(exportHandler));

export default tabel2b5KesesuaianKerjaRouter;
