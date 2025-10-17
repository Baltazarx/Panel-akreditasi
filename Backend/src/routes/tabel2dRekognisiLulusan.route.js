import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const tabel2dRekognisiLulusanRouter = Router();

const listTabel2dRekognisiLulusan = async (req, res) => {
  const q = req.query || {};
  const idUnitProdiParam = q.id_unit_prodi ?? null;
  const idTahunParam = q.id_tahun ?? q.tahun ?? null;
  const sumberRekognisiParam = q.sumber_rekognisi ?? null;

  let sql = `
    SELECT
      rl.*,
      uk.nama_unit AS nama_unit_prodi,
      ta.tahun AS tahun_akademik
    FROM tabel_2d_rekognisi_lulusan rl
    LEFT JOIN unit_kerja uk ON rl.id_unit_prodi = uk.id_unit
    LEFT JOIN tahun_akademik ta ON rl.id_tahun = ta.id_tahun
  `;
  const where = [];
  const params = [];

  if (idUnitProdiParam) {
    where.push('rl.id_unit_prodi = ?');
    params.push(idUnitProdiParam);
  }
  if (idTahunParam) {
    where.push('rl.id_tahun = ?');
    params.push(idTahunParam);
  }
  if (sumberRekognisiParam) {
    where.push('rl.sumber_rekognisi = ?');
    params.push(sumberRekognisiParam);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY rl.id ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data rekognisi lulusan' });
  }
};

const crud = crudFactory({
  table: 'tabel_2d_rekognisi_lulusan',
  idCol: 'id',
  allowedCols: [
    'id_unit_prodi',
    'id_tahun',
    'sumber_rekognisi',
    'jumlah_rekognisi',
  ],
  resourceKey: 'tabel_2d_rekognisi_lulusan',
  list: listTabel2dRekognisiLulusan,
});

// ---- CRUD ----
tabel2dRekognisiLulusanRouter.get('/', requireAuth, permit('tabel_2d_rekognisi_lulusan'), crud.list);
tabel2dRekognisiLulusanRouter.get('/:id(\d+)', requireAuth, permit('tabel_2d_rekognisi_lulusan'), crud.getById);
tabel2dRekognisiLulusanRouter.post('/', requireAuth, permit('tabel_2d_rekognisi_lulusan'), crud.create);
tabel2dRekognisiLulusanRouter.put('/:id(\d+)', requireAuth, permit('tabel_2d_rekognisi_lulusan'), crud.update);
tabel2dRekognisiLulusanRouter.delete('/:id', requireAuth, permit('tabel_2d_rekognisi_lulusan'), crud.remove);
tabel2dRekognisiLulusanRouter.post('/:id/restore', requireAuth, permit('tabel_2d_rekognisi_lulusan'), crud.restore);
tabel2dRekognisiLulusanRouter.delete('/:id/hard-delete', requireAuth, permit('tabel_2d_rekognisi_lulusan'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'tabel_2d_rekognisi_lulusan',
  table: 'tabel_2d_rekognisi_lulusan',
  columns: [
    'id',
    'id_unit_prodi',
    'id_tahun',
    'sumber_rekognisi',
    'jumlah_rekognisi',
  ],
  headers: [
    'ID',
    'Unit Prodi',
    'Tahun',
    'Sumber Rekognisi',
    'Jumlah Rekognisi',
  ],
  title: (label) => `Rekognisi Lulusan — ${label}`,
  orderBy: 'm.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: true });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
tabel2dRekognisiLulusanRouter.get('/export', requireAuth, permit('tabel_2d_rekognisi_lulusan'), exportHandler);
tabel2dRekognisiLulusanRouter.post('/export', requireAuth, permit('tabel_2d_rekognisi_lulusan'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
tabel2dRekognisiLulusanRouter.get('/export-doc', requireAuth, permit('tabel_2d_rekognisi_lulusan'), makeDocAlias(exportHandler));
tabel2dRekognisiLulusanRouter.post('/export-doc', requireAuth, permit('tabel_2d_rekognisi_lulusan'), makeDocAlias(exportHandler));
tabel2dRekognisiLulusanRouter.get('/export-pdf', requireAuth, permit('tabel_2d_rekognisi_lulusan'), makePdfAlias(exportHandler));
tabel2dRekognisiLulusanRouter.post('/export-pdf', requireAuth, permit('tabel_2d_rekognisi_lulusan'), makePdfAlias(exportHandler));

export default tabel2dRekognisiLulusanRouter;
