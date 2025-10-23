import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listMataKuliah,
  getMataKuliahById,
  createMataKuliah,
  updateMataKuliah,
  softDeleteMataKuliah,
  restoreMataKuliah,
  hardDeleteMataKuliah,
} from '../controllers/mataKuliah.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * CRUD
 */
router.get('/', requireAuth, permit('mata_kuliah', 'R'), listMataKuliah);
router.get('/:id', requireAuth, permit('mata_kuliah', 'R'), getMataKuliahById);
router.post('/', requireAuth, permit('mata_kuliah', 'C'), createMataKuliah);
router.put('/:id', requireAuth, permit('mata_kuliah', 'U'), updateMataKuliah);
router.delete('/:id', requireAuth, permit('mata_kuliah', 'D'), softDeleteMataKuliah);
router.post('/:id/restore', requireAuth, permit('mata_kuliah', 'U'), restoreMataKuliah);
router.delete('/:id/hard-delete', requireAuth, permit('mata_kuliah', 'H'), hardDeleteMataKuliah);

/**
 * EXPORT
 */
const meta = {
  resourceKey: 'mata_kuliah',
  table: 'mata_kuliah',
  columns: ['id_mk', 'kode_mk', 'nama_mk', 'sks', 'semester'],
  headers: ['ID', 'Kode MK', 'Nama MK', 'SKS', 'Semester'],
  title: (label) => `Mata Kuliah — ${label}`,
  orderBy: 'm.id_mk ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

router.get('/export', requireAuth, permit('mata_kuliah', 'R'), exportHandler);
router.post('/export', requireAuth, permit('mata_kuliah', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('mata_kuliah', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('mata_kuliah', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('mata_kuliah', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('mata_kuliah', 'R'), makePdfAlias(exportHandler));

export default router;
