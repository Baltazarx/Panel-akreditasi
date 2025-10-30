// src/routes/tabel2a1Pendaftaran.route.js
import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listPendaftaran,
  getPendaftaranById,
  createPendaftaran,
  updatePendaftaran,
  softDeletePendaftaran,
  restorePendaftaran,
  hardDeletePendaftaran,
  restoreMultiplePendaftaran,
} from '../controllers/tabel2a1Pendaftaran.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ==========================================
 * ================ CRUD ====================
 * ==========================================
 */

// LIST
router.get('/', requireAuth, permit('tabel_2a1_pendaftaran', 'R'), listPendaftaran);

// DETAIL
router.get('/:id', requireAuth, permit('tabel_2a1_pendaftaran', 'R'), getPendaftaranById);

// CREATE
router.post('/', requireAuth, permit('tabel_2a1_pendaftaran', 'C'), createPendaftaran);

// UPDATE
router.put('/:id', requireAuth, permit('tabel_2a1_pendaftaran', 'U'), updatePendaftaran);

// SOFT DELETE — boleh dilakukan oleh unit (ALA, PMB, PRODI, dll.)
router.delete('/:id', requireAuth, permit('tabel_2a1_pendaftaran', 'D'), softDeletePendaftaran);

// RESTORE — bisa oleh WAKET & TPM
router.post('/:id/restore', requireAuth, permit('tabel_2a1_pendaftaran', 'U'), restorePendaftaran);

// RESTORE MULTIPLE — batch restore
router.post('/restore-multiple', requireAuth, permit('tabel_2a1_pendaftaran', 'U'), restoreMultiplePendaftaran);

// HARD DELETE — hanya Superadmin (WAKET1/WAKET2)
router.delete('/:id/hard-delete', requireAuth, permit('tabel_2a1_pendaftaran', 'H'), hardDeletePendaftaran);

/**
 * ==========================================
 * ============== EXPORT ROUTES =============
 * ==========================================
 */
const meta = {
  resourceKey: 'tabel_2a1_pendaftaran',
  table: 'tabel_2a1_pendaftaran',
  columns: [
    'id',
    'id_unit_prodi',
    'id_tahun',
    'daya_tampung',
    'pendaftar',
    'pendaftar_afirmasi',
    'pendaftar_kebutuhan_khusus',
  ],
  headers: [
    'ID',
    'Unit Prodi',
    'Tahun',
    'Daya Tampung',
    'Pendaftar',
    'Afirmasi',
    'Kebutuhan Khusus',
  ],
  title: (label) => `Tabel 2.A.1 — Pendaftaran (${label})`,
  orderBy: 'm.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// EXPORT HANDLERS (xlsx, docx, pdf)
router.get('/export', requireAuth, permit('tabel_2a1_pendaftaran', 'R'), exportHandler);
router.post('/export', requireAuth, permit('tabel_2a1_pendaftaran', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('tabel_2a1_pendaftaran', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('tabel_2a1_pendaftaran', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('tabel_2a1_pendaftaran', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('tabel_2a1_pendaftaran', 'R'), makePdfAlias(exportHandler));

export default router;
