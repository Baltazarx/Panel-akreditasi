// src/routes/1.A.2SumberPendanaan.route.js
import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listSumberPendanaan,
  getSumberPendanaanById,
  createSumberPendanaan,
  updateSumberPendanaan,
  softDeleteSumberPendanaan,
  restoreSumberPendanaan,
  hardDeleteSumberPendanaan,
  restoreMultipleSumberPendanaan,
  summarySumberPendanaan,
} from '../controllers/1.A.2SumberPendanaan.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ==========================================
 * =============== SUMMARY =================
 * ==========================================
 */
router.get('/summary', requireAuth, permit('sumber_pendanaan', 'R'), summarySumberPendanaan);

/**
 * ==========================================
 * ================ CRUD ====================
 * ==========================================
 */

// LIST
router.get('/', requireAuth, permit('sumber_pendanaan', 'R'), listSumberPendanaan);

// DETAIL
router.get('/:id', requireAuth, permit('sumber_pendanaan', 'R'), getSumberPendanaanById);

// CREATE
router.post('/', requireAuth, permit('sumber_pendanaan', 'C'), createSumberPendanaan);

// UPDATE
router.put('/:id', requireAuth, permit('sumber_pendanaan', 'U'), updateSumberPendanaan);

// SOFT DELETE — boleh dilakukan oleh unit (LPPM, WAKET, dll.)
router.delete('/:id', requireAuth, permit('sumber_pendanaan', 'D'), softDeleteSumberPendanaan);

// RESTORE — bisa oleh WAKET & TPM
router.post('/:id/restore', requireAuth, permit('sumber_pendanaan', 'U'), restoreSumberPendanaan);

// RESTORE MULTIPLE — batch restore
router.post('/restore-multiple', requireAuth, permit('sumber_pendanaan', 'U'), restoreMultipleSumberPendanaan);

// HARD DELETE — hanya Superadmin (WAKET1/WAKET2)
router.delete('/:id/hard-delete', requireAuth, permit('sumber_pendanaan', 'H'), hardDeleteSumberPendanaan);

/**
 * ==========================================
 * ============== EXPORT ROUTES =============
 * ==========================================
 */
const meta = {
  resourceKey: 'sumber_pendanaan',
  table: 'sumber_pendanaan',
  columns: ['id_sumber', 'id_tahun', 'sumber_dana', 'jumlah_dana', 'link_bukti'],
  headers: ['ID', 'Tahun', 'Sumber Dana', 'Jumlah Dana', 'Link Bukti'],
  title: (label) => `Sumber Pendanaan — ${label}`,
  orderBy: 'm.id_sumber ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// EXPORT HANDLERS (xlsx, docx, pdf)
router.get('/export', requireAuth, permit('sumber_pendanaan', 'R'), exportHandler);
router.post('/export', requireAuth, permit('sumber_pendanaan', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('sumber_pendanaan', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('sumber_pendanaan', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('sumber_pendanaan', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('sumber_pendanaan', 'R'), makePdfAlias(exportHandler));

export default router;
