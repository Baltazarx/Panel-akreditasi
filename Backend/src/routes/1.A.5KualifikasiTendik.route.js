// src/routes/1.A.5KualifikasiTendik.route.js
import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listKualifikasiTendik,
  getKualifikasiTendikById,
  createKualifikasiTendik,
  updateKualifikasiTendik,
  softDeleteKualifikasiTendik,
  restoreKualifikasiTendik,
  hardDeleteKualifikasiTendik,
} from '../controllers/1.A.5KualifikasiTendik.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ==========================================
 * ================ CRUD ====================
 * ==========================================
 */

// LIST
router.get('/', requireAuth, permit('kualifikasi_tendik', 'R'), listKualifikasiTendik);

// DETAIL
router.get('/:id', requireAuth, permit('kualifikasi_tendik', 'R'), getKualifikasiTendikById);

// CREATE
router.post('/', requireAuth, permit('kualifikasi_tendik', 'C'), createKualifikasiTendik);

// UPDATE
router.put('/:id', requireAuth, permit('kualifikasi_tendik', 'U'), updateKualifikasiTendik);

// SOFT DELETE — boleh dilakukan oleh unit (Kepegawaian, WAKET, dll.)
router.delete('/:id', requireAuth, permit('kualifikasi_tendik', 'D'), softDeleteKualifikasiTendik);

// RESTORE — bisa oleh WAKET & TPM
router.post('/:id/restore', requireAuth, permit('kualifikasi_tendik', 'U'), restoreKualifikasiTendik);

// HARD DELETE — hanya Superadmin (WAKET1/WAKET2)
router.delete('/:id/hard-delete', requireAuth, permit('kualifikasi_tendik', 'H'), hardDeleteKualifikasiTendik);

/**
 * ==========================================
 * ============== EXPORT ROUTES =============
 * ==========================================
 */
const meta = {
  resourceKey: 'kualifikasi_tendik',
  table: 'kualifikasi_tendik',
  columns: ['id_kualifikasi', 'id_tendik', 'jenjang_pendidikan', 'id_unit'],
  headers: ['ID', 'Tendik', 'Jenjang', 'Unit'],
  title: (label) => `Kualifikasi Tendik — ${label}`,
  orderBy: 'm.id_kualifikasi ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// EXPORT HANDLERS (xlsx, docx, pdf)
router.get('/export', requireAuth, permit('kualifikasi_tendik', 'R'), exportHandler);
router.post('/export', requireAuth, permit('kualifikasi_tendik', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('kualifikasi_tendik', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('kualifikasi_tendik', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('kualifikasi_tendik', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('kualifikasi_tendik', 'R'), makePdfAlias(exportHandler));

export default router;
