import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const tabel2cPembelajaranLuarProdiRouter = Router();

const listTabel2cPembelajaranLuarProdi = async (req, res) => {
  const q = req.query || {};
  const idUnitProdiParam = q.id_unit_prodi ?? null;
  const idTahunParam = q.id_tahun ?? q.tahun ?? null;
  const bentukPembelajaranParam = q.bentuk_pembelajaran ?? null;

  let sql = `
    SELECT
      plp.*,
      uk.nama_unit AS nama_unit_prodi,
      ta.tahun AS tahun_akademik
    FROM tabel_2c_pembelajaran_luar_prodi plp
    LEFT JOIN unit_kerja uk ON plp.id_unit_prodi = uk.id_unit
    LEFT JOIN tahun_akademik ta ON plp.id_tahun = ta.id_tahun
  `;
  const where = [];
  const params = [];

  if (idUnitProdiParam) {
    where.push('plp.id_unit_prodi = ?');
    params.push(idUnitProdiParam);
  }
  if (idTahunParam) {
    where.push('plp.id_tahun = ?');
    params.push(idTahunParam);
  }
  if (bentukPembelajaranParam) {
    where.push('plp.bentuk_pembelajaran = ?');
    params.push(bentukPembelajaranParam);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY plp.id ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data pembelajaran luar prodi' });
  }
};

const crud = crudFactory({
  table: 'tabel_2c_pembelajaran_luar_prodi',
  idCol: 'id',
  allowedCols: [
    'id_unit_prodi',
    'id_tahun',
    'bentuk_pembelajaran',
    'jumlah_mahasiswa',
  ],
  resourceKey: 'tabel_2c_pembelajaran_luar_prodi',
  list: listTabel2cPembelajaranLuarProdi,
});

// ---- CRUD ----
tabel2cPembelajaranLuarProdiRouter.get('/', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), crud.list);
tabel2cPembelajaranLuarProdiRouter.get('/:id(\d+)', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), crud.getById);
tabel2cPembelajaranLuarProdiRouter.post('/', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), crud.create);
tabel2cPembelajaranLuarProdiRouter.put('/:id(\d+)', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), crud.update);
tabel2cPembelajaranLuarProdiRouter.delete('/:id', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), crud.remove);
tabel2cPembelajaranLuarProdiRouter.post('/:id/restore', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), crud.restore);
tabel2cPembelajaranLuarProdiRouter.delete('/:id/hard-delete', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'tabel_2c_pembelajaran_luar_prodi',
  table: 'tabel_2c_pembelajaran_luar_prodi',
  columns: [
    'id',
    'id_unit_prodi',
    'id_tahun',
    'bentuk_pembelajaran',
    'jumlah_mahasiswa',
  ],
  headers: [
    'ID',
    'Unit Prodi',
    'Tahun',
    'Bentuk Pembelajaran',
    'Jumlah Mahasiswa',
  ],
  title: (label) => `Pembelajaran Luar Prodi — ${label}`,
  orderBy: 'm.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: true });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
tabel2cPembelajaranLuarProdiRouter.get('/export', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), exportHandler);
tabel2cPembelajaranLuarProdiRouter.post('/export', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
tabel2cPembelajaranLuarProdiRouter.get('/export-doc', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), makeDocAlias(exportHandler));
tabel2cPembelajaranLuarProdiRouter.post('/export-doc', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), makeDocAlias(exportHandler));
tabel2cPembelajaranLuarProdiRouter.get('/export-pdf', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), makePdfAlias(exportHandler));
tabel2cPembelajaranLuarProdiRouter.post('/export-pdf', requireAuth, permit('tabel_2c_pembelajaran_luar_prodi'), makePdfAlias(exportHandler));

export default tabel2cPembelajaranLuarProdiRouter;
