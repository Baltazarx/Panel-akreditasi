// src/routes/1.BAuditMutuInternal.route.js
import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listAuditMutuInternal,
  getAuditMutuInternalById,
  createAuditMutuInternal,
  updateAuditMutuInternal,
  softDeleteAuditMutuInternal,
  restoreAuditMutuInternal,
  hardDeleteAuditMutuInternal,
} from '../controllers/1.BAuditMutuInternal.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ==========================================
 * ================ CRUD ====================
 * ==========================================
 */

// LIST
router.get('/', requireAuth, permit('audit_mutu_internal', 'R'), listAuditMutuInternal);

// DETAIL
router.get('/:id', requireAuth, permit('audit_mutu_internal', 'R'), getAuditMutuInternalById);

// CREATE
router.post('/', requireAuth, permit('audit_mutu_internal', 'C'), createAuditMutuInternal);

// UPDATE
router.put('/:id', requireAuth, permit('audit_mutu_internal', 'U'), updateAuditMutuInternal);

// SOFT DELETE — boleh dilakukan oleh unit (TPM, WAKET, LPPM, dll.)
router.delete('/:id', requireAuth, permit('audit_mutu_internal', 'D'), softDeleteAuditMutuInternal);

// RESTORE — bisa oleh WAKET & TPM
router.post('/:id/restore', requireAuth, permit('audit_mutu_internal', 'U'), restoreAuditMutuInternal);

// HARD DELETE — hanya Superadmin (WAKET1/WAKET2)
router.delete('/:id/hard-delete', requireAuth, permit('audit_mutu_internal', 'H'), hardDeleteAuditMutuInternal);

/**
 * ==========================================
 * ============== EXPORT ROUTES =============
 * ==========================================
 */
const meta = {
  resourceKey: 'audit_mutu_internal',
  table: 'audit_mutu_internal',
  columns: [
    'id_ami',
    'id_unit',
    'id_tahun',
    'frekuensi_audit',
    'dokumen_spmi',
    'laporan_audit_url',
    'jumlah_auditor_certified',
    'jumlah_auditor_noncertified',
    'bukti_certified_url',
  ],
  headers: [
    'ID',
    'Unit',
    'Tahun',
    'Frekuensi',
    'Dokumen SPMI',
    'Laporan Audit URL',
    'Auditor Certified',
    'Auditor Non-Certified',
    'Bukti Certified URL',
  ],
  title: (label) => `Audit Mutu Internal — ${label}`,
  orderBy: 'ami.id_ami ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// EXPORT HANDLERS (xlsx, docx, pdf)
router.get('/export', requireAuth, permit('audit_mutu_internal', 'R'), exportHandler);
router.post('/export', requireAuth, permit('audit_mutu_internal', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('audit_mutu_internal', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('audit_mutu_internal', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('audit_mutu_internal', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('audit_mutu_internal', 'R'), makePdfAlias(exportHandler));

export default router;
