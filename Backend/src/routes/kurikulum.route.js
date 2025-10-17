import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const kurikulumRouter = Router();

const listKurikulum = async (req, res) => {
  const q = req.query || {};
  const unitProdiParam = q.id_unit_prodi ?? null;
  const tahunMulaiBerlakuParam = q.tahun_mulai_berlaku ?? null;

  let sql = `
    SELECT
      k.*,
      uk.nama_unit AS nama_unit_prodi
    FROM kurikulum k
    LEFT JOIN unit_kerja uk ON k.id_unit_prodi = uk.id_unit
  `;
  const where = [];
  const params = [];

  if (unitProdiParam) {
    where.push('k.id_unit_prodi = ?');
    params.push(unitProdiParam);
  }
  if (tahunMulaiBerlakuParam) {
    where.push('k.tahun_mulai_berlaku = ?');
    params.push(tahunMulaiBerlakuParam);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY k.id_kurikulum ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data kurikulum' });
  }
};

const crud = crudFactory({
  table: 'kurikulum',
  idCol: 'id_kurikulum',
  allowedCols: ['id_unit_prodi', 'nama_kurikulum', 'tahun_mulai_berlaku'],
  resourceKey: 'kurikulum',
  list: listKurikulum,
});

// ---- CRUD ----
kurikulumRouter.get('/', requireAuth, permit('kurikulum'), crud.list);
kurikulumRouter.get('/:id(\d+)', requireAuth, permit('kurikulum'), crud.getById);
kurikulumRouter.post('/', requireAuth, permit('kurikulum'), crud.create);
kurikulumRouter.put('/:id(\d+)', requireAuth, permit('kurikulum'), crud.update);
kurikulumRouter.delete('/:id', requireAuth, permit('kurikulum'), crud.remove);
kurikulumRouter.post('/:id/restore', requireAuth, permit('kurikulum'), crud.restore);
kurikulumRouter.delete('/:id/hard-delete', requireAuth, permit('kurikulum'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'kurikulum',
  table: 'kurikulum',
  columns: [
    'id_kurikulum',
    'id_unit_prodi',
    'nama_kurikulum',
    'tahun_mulai_berlaku',
  ],
  headers: [
    'ID Kurikulum',
    'Unit Prodi',
    'Nama Kurikulum',
    'Tahun Mulai Berlaku',
  ],
  title: (label) => `Kurikulum — ${label}`,
  orderBy: 'm.id_kurikulum ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
kurikulumRouter.get('/export', requireAuth, permit('kurikulum'), exportHandler);
kurikulumRouter.post('/export', requireAuth, permit('kurikulum'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
kurikulumRouter.get('/export-doc', requireAuth, permit('kurikulum'), makeDocAlias(exportHandler));
kurikulumRouter.post('/export-doc', requireAuth, permit('kurikulum'), makeDocAlias(exportHandler));
kurikulumRouter.get('/export-pdf', requireAuth, permit('kurikulum'), makePdfAlias(exportHandler));
kurikulumRouter.post('/export-pdf', requireAuth, permit('kurikulum'), makePdfAlias(exportHandler));

export default kurikulumRouter;
