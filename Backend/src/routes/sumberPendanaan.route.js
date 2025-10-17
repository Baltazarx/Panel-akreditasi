// src/routes/sumberPendanaan.route.js
import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';
import { pool } from '../db.js';

console.log("Loading sumberPendanaan.route.js");
console.log("Request received for sumberPendanaanRouter");
export const sumberPendanaanRouter = Router();

const crud = crudFactory({
  table: 'sumber_pendanaan',
  idCol: 'id_sumber',
  allowedCols: ['id_tahun','sumber_dana','jumlah_dana','link_bukti'],
  resourceKey: 'sumber_pendanaan',
});

sumberPendanaanRouter.get('/', requireAuth, permit('sumber_pendanaan'), crud.list);
sumberPendanaanRouter.get('/:id(\\d+)', requireAuth, permit('sumber_pendanaan'), crud.getById);
sumberPendanaanRouter.post('/', requireAuth, permit('sumber_pendanaan'), crud.create);
sumberPendanaanRouter.put('/:id(\\d+)', requireAuth, permit('sumber_pendanaan'), crud.update);
sumberPendanaanRouter.delete('/:id(\\d+)/hard-delete', requireAuth, permit('sumber_pendanaan'), crud.hardRemove);
sumberPendanaanRouter.delete('/:id(\\d+)', requireAuth, permit('sumber_pendanaan'), crud.remove);
sumberPendanaanRouter.post('/:id(\\d+)/restore', requireAuth, permit('sumber_pendanaan'), crud.restore);
sumberPendanaanRouter.post('/restore-multiple', requireAuth, permit('sumber_pendanaan'), crud.restoreMultiple);

sumberPendanaanRouter.get('/summary', requireAuth, permit('sumber_pendanaan'), async (req, res) => {
  try {
    // Dapatkan tahun akademik terbaru (TS)
    const [tahunRows] = await pool.query(
      `SELECT id_tahun FROM sumber_pendanaan ORDER BY id_tahun DESC LIMIT 1`
    );

    // If no years are found in sumber_pendanaan, return an empty array for summary
    if (!tahunRows || tahunRows.length === 0) {
      return res.json([]);
    }

    const ts = tahunRows[0].id_tahun; // No need for fallback to current year if table is empty

    const years = [
      { key: 'ts', year: ts },
      { key: 'ts_minus_1', year: ts - 1 },
      { key: 'ts_minus_2', year: ts - 2 },
      { key: 'ts_minus_3', year: ts - 3 },
      { key: 'ts_minus_4', year: ts - 4 },
    ];

    const [summaryRows] = await pool.query(
      `SELECT
        sumber_dana,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts_minus_1,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts_minus_2,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts_minus_3,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts_minus_4,
        MAX(link_bukti) AS link_bukti
      FROM sumber_pendanaan
      WHERE id_tahun IN (?, ?, ?, ?, ?)
      GROUP BY sumber_dana
      ORDER BY sumber_dana`,
      [
        years[0].year,
        years[1].year,
        years[2].year,
        years[3].year,
        years[4].year,
        years[0].year,
        years[1].year,
        years[2].year,
        years[3].year,
        years[4].year,
      ]
    );

    return res.json(summaryRows);
  } catch (error) {
    console.error("Error fetching summary data:", error);
    return res.status(500).json({ error: 'Gagal memuat data ringkasan' });
  }
});

// ===== Export (satu handler utama) =====
const meta = {
  resourceKey: 'sumber_pendanaan',
  table: 'sumber_pendanaan',
  columns: ['id_sumber','id_tahun','sumber_dana','jumlah_dana','link_bukti'],
  headers: ['ID','Tahun','Sumber Dana','Jumlah Dana','Link Bukti'],
  title: (label) => `Sumber Pendanaan — ${label}`,
  orderBy: 'm.id_sumber ASC',
};
const exportHandler = makeExportHandler(meta, { requireYear: false });

// Endpoint utama (kalau mau pakai /export?format=pdf|docx)
sumberPendanaanRouter.get('/export', requireAuth, permit('sumber_pendanaan'), exportHandler);
sumberPendanaanRouter.post('/export', requireAuth, permit('sumber_pendanaan'), exportHandler);

// Endpoint explicit (biar FE lama yang call /export-doc /export-pdf tetap jalan)
sumberPendanaanRouter.get('/export-doc', requireAuth, permit('sumber_pendanaan'), makeDocAlias(exportHandler));
sumberPendanaanRouter.post('/export-doc', requireAuth, permit('sumber_pendanaan'), makeDocAlias(exportHandler));
sumberPendanaanRouter.get('/export-pdf', requireAuth, permit('sumber_pendanaan'), makePdfAlias(exportHandler));
sumberPendanaanRouter.post('/export-pdf', requireAuth, permit('sumber_pendanaan'), makePdfAlias(exportHandler));
