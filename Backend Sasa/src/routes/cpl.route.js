import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listCpl,
  getCplById,
  createCpl,
  updateCpl,
  softDeleteCpl,
  restoreCpl,
  hardDeleteCpl,
} from '../controllers/cpl.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ======================
 * ====== CRUD =========
 * ======================
 */

// List all CPL (filtered otomatis per prodi login)
router.get('/', requireAuth, permit('cpl', 'R'), listCpl);

// Detail per ID
router.get('/:id', requireAuth, permit('cpl', 'R'), getCplById);

// Create (otomatis isi id_unit_prodi kalau role = prodi)
router.post('/', requireAuth, permit('cpl', 'C'), createCpl);

// Update
router.put('/:id', requireAuth, permit('cpl', 'U'), updateCpl);

// Soft delete — bisa dilakukan oleh prodi masing-masing
router.delete('/:id', requireAuth, permit('cpl', 'D'), softDeleteCpl);

// Restore — hanya boleh dilakukan oleh WAKET/TPM
router.post('/:id/restore', requireAuth, permit('cpl', 'U'), restoreCpl);

// Hard delete — hanya boleh oleh superadmin
router.delete('/:id/hard-delete', requireAuth, permit('cpl', 'H'), hardDeleteCpl);

/**
 * ======================
 * ====== EXPORT ========
 * ======================
 */

const meta = {
  resourceKey: 'cpl',
  table: 'cpl',
  columns: ['id_cpl', 'id_unit_prodi', 'kode_cpl', 'deskripsi_cpl'],
  headers: ['ID', 'Unit Prodi', 'Kode CPL', 'Deskripsi CPL'],
  title: (label) => `Capaian Pembelajaran Lulusan (CPL) — ${label}`,
  orderBy: 'c.id_cpl ASC',
};

// Export handler (xlsx, docx, pdf)
const exportHandler = makeExportHandler(meta, { requireYear: false });
router.get('/export', requireAuth, permit('cpl', 'R'), exportHandler);
router.post('/export', requireAuth, permit('cpl', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('cpl', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('cpl', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('cpl', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('cpl', 'R'), makePdfAlias(exportHandler));

export default router;
