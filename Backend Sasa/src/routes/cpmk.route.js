import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listCpmk,
  getCpmkById,
  createCpmk,
  updateCpmk,
  softDeleteCpmk,
  restoreCpmk,
  hardDeleteCpmk,
} from '../controllers/cpmk.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * CRUD
 */
router.get('/', requireAuth, permit('cpmk', 'R'), listCpmk);
router.get('/:id', requireAuth, permit('cpmk', 'R'), getCpmkById);
router.post('/', requireAuth, permit('cpmk', 'C'), createCpmk);
router.put('/:id', requireAuth, permit('cpmk', 'U'), updateCpmk);
router.delete('/:id', requireAuth, permit('cpmk', 'D'), softDeleteCpmk);
router.post('/:id/restore', requireAuth, permit('cpmk', 'U'), restoreCpmk);
router.delete('/:id/hard-delete', requireAuth, permit('cpmk', 'H'), hardDeleteCpmk);

/**
 * EXPORT
 */
const meta = {
  resourceKey: 'cpmk',
  table: 'cpmk',
  columns: ['id_cpmk', 'kode_cpmk', 'deskripsi_cpmk'],
  headers: ['ID', 'Kode CPMK', 'Deskripsi CPMK'],
  title: (label) => `Capaian Pembelajaran Mata Kuliah (CPMK) — ${label}`,
  orderBy: 'c.id_cpmk ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

router.get('/export', requireAuth, permit('cpmk', 'R'), exportHandler);
router.post('/export', requireAuth, permit('cpmk', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('cpmk', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('cpmk', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('cpmk', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('cpmk', 'R'), makePdfAlias(exportHandler));

export default router;
