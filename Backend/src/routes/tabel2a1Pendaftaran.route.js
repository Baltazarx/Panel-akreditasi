import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const tabel2a1PendaftaranRouter = Router();

const listTabel2a1Pendaftaran = async (req, res) => {
  const q = req.query || {};
  const idUnitProdiParam = q.id_unit_prodi ?? null;
  const idTahunParam = q.id_tahun ?? q.tahun ?? null;

  let sql = `
    SELECT
      p.*,
      uk.nama_unit AS nama_unit_prodi,
      ta.tahun AS tahun_akademik
    FROM tabel_2a1_pendaftaran p
    LEFT JOIN unit_kerja uk ON p.id_unit_prodi = uk.id_unit
    LEFT JOIN tahun_akademik ta ON p.id_tahun = ta.id_tahun
  `;
  const where = [];
  const params = [];

  if (idUnitProdiParam) {
    where.push('p.id_unit_prodi = ?');
    params.push(idUnitProdiParam);
  }
  if (idTahunParam) {
    where.push('p.id_tahun = ?');
    params.push(idTahunParam);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY p.id ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data pendaftaran' });
  }
};

const crud = crudFactory({
  table: 'tabel_2a1_pendaftaran',
  idCol: 'id',
  allowedCols: [
    'id_unit_prodi',
    'id_tahun',
    'daya_tampung',
    'pendaftar',
    'pendaftar_afirmasi',
    'pendaftar_kebutuhan_khusus',
  ],
  resourceKey: 'tabel_2a1_pendaftaran',
  list: listTabel2a1Pendaftaran,
});

// ---- CRUD ----
tabel2a1PendaftaranRouter.get('/', requireAuth, permit('tabel_2a1_pendaftaran'), crud.list);
tabel2a1PendaftaranRouter.get('/:id(\d+)', requireAuth, permit('tabel_2a1_pendaftaran'), crud.getById);
tabel2a1PendaftaranRouter.post('/', requireAuth, permit('tabel_2a1_pendaftaran'), crud.create);
tabel2a1PendaftaranRouter.put('/:id', requireAuth, permit('tabel_2a1_pendaftaran'), crud.update);
tabel2a1PendaftaranRouter.delete('/:id', requireAuth, permit('tabel_2a1_pendaftaran'), crud.remove);
tabel2a1PendaftaranRouter.post('/:id/restore', requireAuth, permit('tabel_2a1_pendaftaran'), crud.restore);
tabel2a1PendaftaranRouter.delete('/:id/hard-delete', requireAuth, permit('tabel_2a1_pendaftaran'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'tabel_2a1_pendaftaran',
  table: 'tabel_2a1_pendaftaran',
  columns: [
    'id',
    'id_unit_prodi',
    'id_tahun',
    'pendaftar',
    'pendaftar_afirmasi',
    'pendaftar_kebutuhan_khusus',
  ],
  headers: [
    'ID',
    'Unit Prodi',
    'Tahun',
    'Pendaftar',
    'Pendaftar Afirmasi',
    'Pendaftar Kebutuhan Khusus',
  ],
  title: (label) => `Pendaftaran — ${label}`,
  orderBy: 'm.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: true });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
tabel2a1PendaftaranRouter.get('/export', requireAuth, permit('tabel_2a1_pendaftaran'), exportHandler);
tabel2a1PendaftaranRouter.post('/export', requireAuth, permit('tabel_2a1_pendaftaran'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
tabel2a1PendaftaranRouter.get('/export-doc', requireAuth, permit('tabel_2a1_pendaftaran'), makeDocAlias(exportHandler));
tabel2a1PendaftaranRouter.post('/export-doc', requireAuth, permit('tabel_2a1_pendaftaran'), makeDocAlias(exportHandler));
tabel2a1PendaftaranRouter.get('/export-pdf', requireAuth, permit('tabel_2a1_pendaftaran'), makePdfAlias(exportHandler));
tabel2a1PendaftaranRouter.post('/export-pdf', requireAuth, permit('tabel_2a1_pendaftaran'), makePdfAlias(exportHandler));

export default tabel2a1PendaftaranRouter;
