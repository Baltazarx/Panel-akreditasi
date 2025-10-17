// src/routes/penggunaanDana.route.js
import { Router } from 'express';
import { pool } from '../db.js';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const penggunaanDanaRouter = Router();

const crud = crudFactory({
  table: 'penggunaan_dana',
  idCol: 'id_penggunaan_dana',
  allowedCols: ['id_tahun','jenis_penggunaan','jumlah_dana','link_bukti'],
  resourceKey: 'penggunaan_dana',
});

// CRUD
penggunaanDanaRouter.get('/', requireAuth, permit('penggunaan_dana'), crud.list);
penggunaanDanaRouter.get('/:id(\\d+)', requireAuth, permit('penggunaan_dana'), crud.getById);
penggunaanDanaRouter.post('/', requireAuth, permit('penggunaan_dana'), crud.create);
penggunaanDanaRouter.put('/:id(\\d+)', requireAuth, permit('penggunaan_dana'), crud.update);
penggunaanDanaRouter.delete('/:id(\\d+)', requireAuth, permit('penggunaan_dana'), crud.remove);
penggunaanDanaRouter.post('/:id(\\d+)/restore', requireAuth, permit('penggunaan_dana'), crud.restore);
penggunaanDanaRouter.post('/restore-multiple', requireAuth, permit('penggunaan_dana'), crud.restoreMultiple);
penggunaanDanaRouter.delete('/:id(\\d+)/hard-delete', requireAuth, permit('penggunaan_dana'), crud.hardRemove);

penggunaanDanaRouter.get('/ref-jenis-penggunaan', requireAuth, permit('penggunaan_dana'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT jenis_penggunaan FROM penggunaan_dana ORDER BY jenis_penggunaan');
    res.json(rows);
  } catch (error) {
    console.error("Error fetching distinct jenis_penggunaan:", error);
    res.status(500).json({ error: 'Gagal memuat jenis penggunaan dana' });
  }
});

penggunaanDanaRouter.get('/summary', requireAuth, permit('penggunaan_dana'), async (req, res) => {
  try {
    // Dapatkan tahun terbaru (TS)
    const [tahunRows] = await pool.query(
      `SELECT id_tahun FROM penggunaan_dana ORDER BY id_tahun DESC LIMIT 1`
    );

    if (!tahunRows || tahunRows.length === 0) {
      return res.json([]);
    }

    const ts = tahunRows[0].id_tahun;

    const years = [
      { key: 'ts', year: ts },
      { key: 'ts_minus_1', year: ts - 1 },
      { key: 'ts_minus_2', year: ts - 2 },
      { key: 'ts_minus_3', year: ts - 3 },
      { key: 'ts_minus_4', year: ts - 4 },
    ];

    const [summaryRows] = await pool.query(
      `SELECT
        jenis_penggunaan,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts_minus_1,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts_minus_2,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts_minus_3,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts_minus_4
      FROM penggunaan_dana
      WHERE id_tahun IN (?, ?, ?, ?, ?)
      GROUP BY jenis_penggunaan
      ORDER BY jenis_penggunaan`,
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

// ===== Export (TS-aware: id_tahun / id_tahun_in / tahun[legacy]) =====
const meta = {
  resourceKey: 'penggunaan_dana',
  table: 'penggunaan_dana',
  columns: ['id_penggunaan_dana','id_tahun','jenis_penggunaan','jumlah_dana','link_bukti'],
  headers: ['ID','Tahun','Jenis Penggunaan','Jumlah Dana','Link Bukti'],
  title: (label) => `Penggunaan Dana — ${label}`,
  // pakai alias m. untuk aman ketika JOIN
  orderBy: 'm.id_penggunaan_dana ASC',
};

// handler utama export (docx/pdf)
const exportHandler = makeExportHandler(meta, { requireYear: false });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf
penggunaanDanaRouter.get('/export', requireAuth, permit('penggunaan_dana'), exportHandler);
penggunaanDanaRouter.post('/export', requireAuth, permit('penggunaan_dana'), exportHandler);

// Alias biar FE lama yang nembak /export-doc & /export-pdf tetap work
penggunaanDanaRouter.get('/export-doc', requireAuth, permit('penggunaan_dana'), makeDocAlias(exportHandler));
penggunaanDanaRouter.post('/export-doc', requireAuth, permit('penggunaan_dana'), makeDocAlias(exportHandler));
penggunaanDanaRouter.get('/export-pdf', requireAuth, permit('penggunaan_dana'), makePdfAlias(exportHandler));
penggunaanDanaRouter.post('/export-pdf', requireAuth, permit('penggunaan_dana'), makePdfAlias(exportHandler));
