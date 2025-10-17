import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const tabel2b4MasaTungguRouter = Router();

const listTabel2b4MasaTunggu = async (req, res) => {
  const q = req.query || {};
  const idUnitProdiParam = q.id_unit_prodi ?? null;
  const idTahunLulusParam = q.id_tahun_lulus ?? q.tahun_lulus ?? null; // Dukung id_tahun_lulus atau tahun_lulus

  let sql = `
    SELECT
      mt.*,
      uk.nama_unit AS nama_unit_prodi,
      ta.tahun AS tahun_akademik
    FROM tabel_2b4_masa_tunggu mt
    LEFT JOIN unit_kerja uk ON mt.id_unit_prodi = uk.id_unit
    LEFT JOIN tahun_akademik ta ON mt.id_tahun_lulus = ta.id_tahun
  `;
  const where = [];
  const params = [];

  if (idUnitProdiParam) {
    where.push('mt.id_unit_prodi = ?');
    params.push(idUnitProdiParam);
  }
  if (idTahunLulusParam) {
    where.push('mt.id_tahun_lulus = ?');
    params.push(idTahunLulusParam);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY mt.id ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data masa tunggu' });
  }
};

const crud = crudFactory({
  table: 'tabel_2b4_masa_tunggu',
  idCol: 'id',
  allowedCols: [
    'id_unit_prodi',
    'id_tahun_lulus',
    'jumlah_lulusan',
    'jumlah_terlacak',
    'rata_rata_waktu_tunggu_bulan',
  ],
  resourceKey: 'tabel_2b4_masa_tunggu',
  list: listTabel2b4MasaTunggu,
});

// ---- CRUD ----
tabel2b4MasaTungguRouter.get('/', requireAuth, permit('tabel_2b4_masa_tunggu'), crud.list);
tabel2b4MasaTungguRouter.get('/:id(\d+)', requireAuth, permit('tabel_2b4_masa_tunggu'), crud.getById);
tabel2b4MasaTungguRouter.post('/', requireAuth, permit('tabel_2b4_masa_tunggu'), crud.create);
tabel2b4MasaTungguRouter.put('/:id(\d+)', requireAuth, permit('tabel_2b4_masa_tunggu'), crud.update);
tabel2b4MasaTungguRouter.delete('/:id', requireAuth, permit('tabel_2b4_masa_tunggu'), crud.remove);
tabel2b4MasaTungguRouter.post('/:id/restore', requireAuth, permit('tabel_2b4_masa_tunggu'), crud.restore);
tabel2b4MasaTungguRouter.delete('/:id/hard-delete', requireAuth, permit('tabel_2b4_masa_tunggu'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'tabel_2b4_masa_tunggu',
  table: 'tabel_2b4_masa_tunggu',
  columns: [
    'id',
    'id_unit_prodi',
    'id_tahun_lulus',
    'jumlah_lulusan',
    'jumlah_terlacak',
    'rata_rata_waktu_tunggu_bulan',
  ],
  headers: [
    'ID',
    'Unit Prodi',
    'Tahun Lulus',
    'Jumlah Lulusan',
    'Jumlah Terlacak',
    'Rata-rata Waktu Tunggu (Bulan)',
  ],
  title: (label) => `Masa Tunggu — ${label}`,
  orderBy: 'm.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: true });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
tabel2b4MasaTungguRouter.get('/export', requireAuth, permit('tabel_2b4_masa_tunggu'), exportHandler);
tabel2b4MasaTungguRouter.post('/export', requireAuth, permit('tabel_2b4_masa_tunggu'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
tabel2b4MasaTungguRouter.get('/export-doc', requireAuth, permit('tabel_2b4_masa_tunggu'), makeDocAlias(exportHandler));
tabel2b4MasaTungguRouter.post('/export-doc', requireAuth, permit('tabel_2b4_masa_tunggu'), makeDocAlias(exportHandler));
tabel2b4MasaTungguRouter.get('/export-pdf', requireAuth, permit('tabel_2b4_masa_tunggu'), makePdfAlias(exportHandler));
tabel2b4MasaTungguRouter.post('/export-pdf', requireAuth, permit('tabel_2b4_masa_tunggu'), makePdfAlias(exportHandler));

export default tabel2b4MasaTungguRouter;
