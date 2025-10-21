// src/routes/1.A.4BebanKerjaDosen.route.js
import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listBebanKerjaDosen,
  getBebanKerjaDosenById,
  getBebanKerjaSummary,
  createBebanKerjaDosen,
  updateBebanKerjaDosen,
  softDeleteBebanKerjaDosen,
  restoreBebanKerjaDosen,
  restoreMultipleBebanKerjaDosen,
  hardDeleteBebanKerjaDosen,
  reportBebanKerjaDosen,
} from '../controllers/1.A.4BebanKerjaDosen.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ==========================================
 * ===== LIST + SUMMARY + REPORT ============
 * ==========================================
 */

// LIST
router.get('/', requireAuth, permit('beban_kerja_dosen', 'R'), listBebanKerjaDosen);

// SUMMARY
router.get('/summary', requireAuth, permit('beban_kerja_dosen', 'R'), getBebanKerjaSummary);

// REPORT
router.get('/report/:id_tahun', requireAuth, permit('beban_kerja_dosen', 'R'), reportBebanKerjaDosen);

/**
 * ==========================================
 * ================ CRUD ====================
 * ==========================================
 */

// DETAIL
router.get('/:id', requireAuth, permit('beban_kerja_dosen', 'R'), getBebanKerjaDosenById);

// CREATE
router.post('/', requireAuth, permit('beban_kerja_dosen', 'C'), createBebanKerjaDosen);

// UPDATE
router.put('/:id', requireAuth, permit('beban_kerja_dosen', 'U'), updateBebanKerjaDosen);

// SOFT DELETE — boleh dilakukan oleh unit (PRODI, WAKET, dll.)
router.delete('/:id', requireAuth, permit('beban_kerja_dosen', 'D'), softDeleteBebanKerjaDosen);

// RESTORE — bisa oleh WAKET & TPM
router.post('/:id/restore', requireAuth, permit('beban_kerja_dosen', 'U'), restoreBebanKerjaDosen);

// RESTORE MULTIPLE — batch restore
router.post('/restore-multiple', requireAuth, permit('beban_kerja_dosen', 'U'), restoreMultipleBebanKerjaDosen);

// HARD DELETE — hanya Superadmin (WAKET1/WAKET2)
router.delete('/:id/hard-delete', requireAuth, permit('beban_kerja_dosen', 'H'), hardDeleteBebanKerjaDosen);

/**
 * ==========================================
 * ============== EXPORT ROUTES =============
 * ==========================================
 */
const meta = {
  resourceKey: 'beban_kerja_dosen',
  table: 'beban_kerja_dosen',
  columns: [
    'id_beban_kerja',
    'id_dosen',
    'id_tahun',
    'sks_pengajaran',
    'sks_penelitian',
    'sks_pkm',
    'sks_manajemen',
  ],
  headers: ['ID', 'Dosen', 'Tahun', 'SKS Pengajaran', 'SKS Penelitian', 'SKS PKM', 'SKS Manajemen'],
  title: (label) => `Beban Kerja Dosen — ${label}`,
  orderBy: 'm.id_beban_kerja ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// EXPORT HANDLERS (xlsx, docx, pdf)
router.get('/export', requireAuth, permit('beban_kerja_dosen', 'R'), exportHandler);
router.post('/export', requireAuth, permit('beban_kerja_dosen', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('beban_kerja_dosen', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('beban_kerja_dosen', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('beban_kerja_dosen', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('beban_kerja_dosen', 'R'), makePdfAlias(exportHandler));

export default router;
