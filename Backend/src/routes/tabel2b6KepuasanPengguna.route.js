import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const tabel2b6KepuasanPenggunaRouter = Router();

const listTabel2b6KepuasanPengguna = async (req, res) => {
  const q = req.query || {};
  const idUnitProdiParam = q.id_unit_prodi ?? null;
  const idTahunParam = q.id_tahun ?? q.tahun ?? null;
  const jenisKemampuanParam = q.jenis_kemampuan ?? null;

  let sql = `
    SELECT
      kp.*,
      uk.nama_unit AS nama_unit_prodi,
      ta.tahun AS tahun_akademik
    FROM tabel_2b6_kepuasan_pengguna kp
    LEFT JOIN unit_kerja uk ON kp.id_unit_prodi = uk.id_unit
    LEFT JOIN tahun_akademik ta ON kp.id_tahun = ta.id_tahun
  `;
  const where = [];
  const params = [];

  if (idUnitProdiParam) {
    where.push('kp.id_unit_prodi = ?');
    params.push(idUnitProdiParam);
  }
  if (idTahunParam) {
    where.push('kp.id_tahun = ?');
    params.push(idTahunParam);
  }
  if (jenisKemampuanParam) {
    where.push('kp.jenis_kemampuan = ?');
    params.push(jenisKemampuanParam);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY kp.id ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data kepuasan pengguna' });
  }
};

const crud = crudFactory({
  table: 'tabel_2b6_kepuasan_pengguna',
  idCol: 'id',
  allowedCols: [
    'id_unit_prodi',
    'id_tahun',
    'jenis_kemampuan',
    'persen_sangat_baik',
    'persen_baik',
    'persen_cukup',
    'persen_kurang',
  ],
  resourceKey: 'tabel_2b6_kepuasan_pengguna',
  list: listTabel2b6KepuasanPengguna,
});

// ---- CRUD ----
tabel2b6KepuasanPenggunaRouter.get('/', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), crud.list);
tabel2b6KepuasanPenggunaRouter.get('/:id(\d+)', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), crud.getById);
tabel2b6KepuasanPenggunaRouter.post('/', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), crud.create);
tabel2b6KepuasanPenggunaRouter.put('/:id(\d+)', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), crud.update);
tabel2b6KepuasanPenggunaRouter.delete('/:id', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), crud.remove);
tabel2b6KepuasanPenggunaRouter.post('/:id/restore', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), crud.restore);
tabel2b6KepuasanPenggunaRouter.delete('/:id/hard-delete', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'tabel_2b6_kepuasan_pengguna',
  table: 'tabel_2b6_kepuasan_pengguna',
  columns: [
    'id',
    'id_unit_prodi',
    'id_tahun',
    'jenis_kemampuan',
    'persen_sangat_baik',
    'persen_baik',
    'persen_cukup',
    'persen_kurang',
  ],
  headers: [
    'ID',
    'Unit Prodi',
    'Tahun',
    'Jenis Kemampuan',
    'Persen Sangat Baik',
    'Persen Baik',
    'Persen Cukup',
    'Persen Kurang',
  ],
  title: (label) => `Kepuasan Pengguna — ${label}`,
  orderBy: 'm.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: true });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
tabel2b6KepuasanPenggunaRouter.get('/export', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), exportHandler);
tabel2b6KepuasanPenggunaRouter.post('/export', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
tabel2b6KepuasanPenggunaRouter.get('/export-doc', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), makeDocAlias(exportHandler));
tabel2b6KepuasanPenggunaRouter.post('/export-doc', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), makeDocAlias(exportHandler));
tabel2b6KepuasanPenggunaRouter.get('/export-pdf', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), makePdfAlias(exportHandler));
tabel2b6KepuasanPenggunaRouter.post('/export-pdf', requireAuth, permit('tabel_2b6_kepuasan_pengguna'), makePdfAlias(exportHandler));

export default tabel2b6KepuasanPenggunaRouter;
