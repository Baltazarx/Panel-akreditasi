// src/routes/kualifikasiTendik.route.js
import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const kualifikasiTendikRouter = Router();

// Fungsi list kustom dengan JOIN ke tenaga_kependidikan dan pegawai
const listKualifikasiTendik = async (req, res) => {
  let sql = `
    SELECT
      kt.*,
      tk.nikp,
      p.nama_lengkap,
      p.pendidikan_terakhir,
      uk.nama_unit
    FROM kualifikasi_tendik kt
    LEFT JOIN tenaga_kependidikan tk ON kt.id_tendik = tk.id_tendik
    LEFT JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
    LEFT JOIN unit_kerja uk ON kt.id_unit = uk.id_unit
  `;
  const where = [];
  const params = [];

  // Tambahkan filter dan pengurutan jika diperlukan
  // if (req.query.id_unit) { where.push('kt.id_unit = ?'); params.push(req.query.id_unit); }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY kt.id_kualifikasi ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data kualifikasi tendik' });
  }
};

const crud = crudFactory({
  table: 'kualifikasi_tendik',
  idCol: 'id_kualifikasi',
  allowedCols: ['id_tendik','jenjang_pendidikan','id_unit'],
  resourceKey: 'kualifikasi_tendik',
  // Override list method
  list: listKualifikasiTendik,
});

// ---- CRUD ----
kualifikasiTendikRouter.get('/', requireAuth, permit('kualifikasi_tendik'), crud.list);
kualifikasiTendikRouter.get('/:id(\\d+)', requireAuth, permit('kualifikasi_tendik'), crud.getById);
kualifikasiTendikRouter.post('/', requireAuth, permit('kualifikasi_tendik'), crud.create);
kualifikasiTendikRouter.put('/:id(\\d+)', requireAuth, permit('kualifikasi_tendik'), crud.update);
kualifikasiTendikRouter.delete('/:id(\\d+)', requireAuth, permit('kualifikasi_tendik'), crud.remove);
kualifikasiTendikRouter.post('/:id(\\d+)/restore', requireAuth, permit('kualifikasi_tendik'), crud.restore);

// ---- EXPORT (DOCX/PDF) ----
// NOTE: Tabel ini tidak punya kolom id_tahun, jadi ekspor tidak perlu filter TS.
// makeExportHandler akan otomatis tidak mem-join tahun_akademik bila tidak ada id_tahun.
const meta = {
  resourceKey: 'kualifikasi_tendik',
  table: 'kualifikasi_tendik',
  columns: ['id_kualifikasi','id_tendik','jenjang_pendidikan','id_unit'],
  headers: ['ID','Tendik','Jenjang','Unit'],
  title: 'Kualifikasi Tendik',
  orderBy: 'm.id_kualifikasi ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// Endpoint utama: /export?format=docx|pdf
kualifikasiTendikRouter.get('/export', requireAuth, permit('kualifikasi_tendik'), exportHandler);
kualifikasiTendikRouter.post('/export', requireAuth, permit('kualifikasi_tendik'), exportHandler);

// Alias agar FE lama yang panggil /export-doc & /export-pdf tetap works
kualifikasiTendikRouter.get('/export-doc', requireAuth, permit('kualifikasi_tendik'), makeDocAlias(exportHandler));
kualifikasiTendikRouter.post('/export-doc', requireAuth, permit('kualifikasi_tendik'), makeDocAlias(exportHandler));
kualifikasiTendikRouter.get('/export-pdf', requireAuth, permit('kualifikasi_tendik'), makePdfAlias(exportHandler));
kualifikasiTendikRouter.post('/export-pdf', requireAuth, permit('kualifikasi_tendik'), makePdfAlias(exportHandler));

export default kualifikasiTendikRouter;
