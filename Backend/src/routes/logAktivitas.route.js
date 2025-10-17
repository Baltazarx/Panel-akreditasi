import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const logAktivitasRouter = Router();

const listLogAktivitas = async (req, res) => {
  const q = req.query || {};
  const idUserParam = q.id_user ?? null;
  const namaTabelParam = q.nama_tabel ?? null;

  let sql = `
    SELECT
      la.*,
      u.username
    FROM log_aktivitas la
    LEFT JOIN users u ON la.id_user = u.id_user
  `;
  const where = [];
  const params = [];

  if (idUserParam) {
    where.push('la.id_user = ?');
    params.push(idUserParam);
  }
  if (namaTabelParam) {
    where.push('la.nama_tabel = ?');
    params.push(namaTabelParam);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY la.id_log DESC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data log aktivitas' });
  }
};

const crud = crudFactory({
  table: 'log_aktivitas',
  idCol: 'id_log',
  allowedCols: ['id_user', 'aksi', 'nama_tabel', 'id_record', 'waktu_aksi', 'detail_perubahan'],
  resourceKey: 'log_aktivitas',
  softDelete: false, // Log aktivitas biasanya tidak di-soft delete
  withRestore: false, // Log aktivitas tidak perlu restore
  list: listLogAktivitas,
});

// ---- CRUD ----
logAktivitasRouter.get('/', requireAuth, permit('log_aktivitas'), crud.list);
logAktivitasRouter.get('/:id(\d+)', requireAuth, permit('log_aktivitas'), crud.getById);
logAktivitasRouter.post('/', requireAuth, permit('log_aktivitas'), crud.create);
logAktivitasRouter.put('/:id(\d+)', requireAuth, permit('log_aktivitas'), crud.update);
logAktivitasRouter.delete('/:id', requireAuth, permit('log_aktivitas'), crud.remove);
logAktivitasRouter.post('/:id/restore', requireAuth, permit('log_aktivitas'), crud.restore);
logAktivitasRouter.delete('/:id/hard-delete', requireAuth, permit('log_aktivitas'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'log_aktivitas',
  table: 'log_aktivitas',
  columns: [
    'id_log',
    'id_user',
    'aksi',
    'nama_tabel',
    'id_record',
    'waktu_aksi',
    'detail_perubahan',
  ],
  headers: [
    'ID Log',
    'ID User',
    'Aksi',
    'Nama Tabel',
    'ID Record',
    'Waktu Aksi',
    'Detail Perubahan',
  ],
  title: (label) => `Log Aktivitas — ${label}`,
  orderBy: 'm.id_log DESC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
logAktivitasRouter.get('/export', requireAuth, permit('log_aktivitas'), exportHandler);
logAktivitasRouter.post('/export', requireAuth, permit('log_aktivitas'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
logAktivitasRouter.get('/export-doc', requireAuth, permit('log_aktivitas'), makeDocAlias(exportHandler));
logAktivitasRouter.post('/export-doc', requireAuth, permit('log_aktivitas'), makeDocAlias(exportHandler));
logAktivitasRouter.get('/export-pdf', requireAuth, permit('log_aktivitas'), makePdfAlias(exportHandler));
logAktivitasRouter.post('/export-pdf', requireAuth, permit('log_aktivitas'), makePdfAlias(exportHandler));

export default logAktivitasRouter;
