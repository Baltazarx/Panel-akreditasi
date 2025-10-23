// src/routes/1.A.3PenggunaanDana.route.js
import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listPenggunaanDana,
  getPenggunaanDanaById,
  createPenggunaanDana,
  updatePenggunaanDana,
  softDeletePenggunaanDana,
  restorePenggunaanDana,
  hardDeletePenggunaanDana,
  restoreMultiplePenggunaanDana,
  refJenisPenggunaan,
  summaryPenggunaanDana,
} from '../controllers/1.A.3PenggunaanDana.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ==========================================
 * =============== CUSTOM ===================
 * ==========================================
 */
router.get('/ref-jenis-penggunaan', requireAuth, permit('penggunaan_dana', 'R'), refJenisPenggunaan);
router.get('/summary', requireAuth, permit('penggunaan_dana', 'R'), summaryPenggunaanDana);

/**
 * ==========================================
 * ================ CRUD ====================
 * ==========================================
 */

// LIST
router.get('/', requireAuth, permit('penggunaan_dana', 'R'), listPenggunaanDana);

// DETAIL
router.get('/:id', requireAuth, permit('penggunaan_dana', 'R'), getPenggunaanDanaById);

// CREATE
router.post('/', requireAuth, permit('penggunaan_dana', 'C'), createPenggunaanDana);

// UPDATE
router.put('/:id', requireAuth, permit('penggunaan_dana', 'U'), updatePenggunaanDana);

// SOFT DELETE — boleh dilakukan oleh unit (LPPM, WAKET, dll.)
router.delete('/:id', requireAuth, permit('penggunaan_dana', 'D'), softDeletePenggunaanDana);

// RESTORE — bisa oleh WAKET & TPM
router.post('/:id/restore', requireAuth, permit('penggunaan_dana', 'U'), restorePenggunaanDana);

// RESTORE MULTIPLE — batch restore
router.post('/restore-multiple', requireAuth, permit('penggunaan_dana', 'U'), restoreMultiplePenggunaanDana);

// HARD DELETE — hanya Superadmin (WAKET1/WAKET2)
router.delete('/:id/hard-delete', requireAuth, permit('penggunaan_dana', 'H'), hardDeletePenggunaanDana);

/**
 * ==========================================
 * ============== EXPORT ROUTES =============
 * ==========================================
 */
const meta = {
  resourceKey: 'penggunaan_dana',
  table: 'penggunaan_dana',
  columns: ['id_penggunaan_dana', 'id_tahun', 'jenis_penggunaan', 'jumlah_dana', 'link_bukti'],
  headers: ['ID', 'Tahun', 'Jenis Penggunaan', 'Jumlah Dana', 'Link Bukti'],
  title: (label) => `Penggunaan Dana — ${label}`,
  orderBy: 'm.id_penggunaan_dana ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// EXPORT HANDLERS (xlsx, docx, pdf)
router.get('/export', requireAuth, permit('penggunaan_dana', 'R'), exportHandler);
router.post('/export', requireAuth, permit('penggunaan_dana', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('penggunaan_dana', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('penggunaan_dana', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('penggunaan_dana', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('penggunaan_dana', 'R'), makePdfAlias(exportHandler));

export default router;
