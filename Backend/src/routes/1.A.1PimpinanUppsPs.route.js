// src/routes/1.A.1PimpinanUppsPs.route.js
import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listPimpinanUppsPs,
  getPimpinanUppsPsById,
  createPimpinanUppsPs,
  updatePimpinanUppsPs,
  softDeletePimpinanUppsPs,
  restorePimpinanUppsPs,
  hardDeletePimpinanUppsPs,
} from '../controllers/1.A.1PimpinanUppsPs.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ==========================================
 * ================ CRUD ====================
 * ==========================================
 */

// LIST
router.get('/', requireAuth, permit('pimpinan_upps_ps', 'R'), listPimpinanUppsPs);

// DETAIL
router.get('/:id', requireAuth, permit('pimpinan_upps_ps', 'R'), getPimpinanUppsPsById);

// CREATE
router.post('/', requireAuth, permit('pimpinan_upps_ps', 'C'), createPimpinanUppsPs);

// UPDATE
router.put('/:id', requireAuth, permit('pimpinan_upps_ps', 'U'), updatePimpinanUppsPs);

// SOFT DELETE — boleh dilakukan oleh unit (WAKET, PRODI, dll.)
router.delete('/:id', requireAuth, permit('pimpinan_upps_ps', 'D'), softDeletePimpinanUppsPs);

// RESTORE — WAKET & TPM boleh
router.post('/:id/restore', requireAuth, permit('pimpinan_upps_ps', 'U'), restorePimpinanUppsPs);

// HARD DELETE — hanya Superadmin (WAKET1/WAKET2)
router.delete('/:id/hard-delete', requireAuth, permit('pimpinan_upps_ps', 'H'), hardDeletePimpinanUppsPs);

/**
 * ==========================================
 * ============== EXPORT ROUTES =============
 * ==========================================
 */
const meta = {
  resourceKey: 'pimpinan_upps_ps',
  table: 'pimpinan_upps_ps',
  columns: [
    'id_pimpinan',
    'id_unit',
    'id_pegawai',
    'id_jabatan',
    'periode_mulai',
    'periode_selesai',
    'tupoksi',
  ],
  headers: [
    'ID',
    'Unit',
    'Pegawai',
    'Jabatan',
    'Mulai',
    'Selesai',
    'Tupoksi',
  ],
  title: (label) => `Pimpinan UPPS/PS — ${label}`,
  orderBy: 'p.id_pimpinan ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// EXPORT HANDLERS (xlsx, docx, pdf)
router.get('/export', requireAuth, permit('pimpinan_upps_ps', 'R'), exportHandler);
router.post('/export', requireAuth, permit('pimpinan_upps_ps', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('pimpinan_upps_ps', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('pimpinan_upps_ps', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('pimpinan_upps_ps', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('pimpinan_upps_ps', 'R'), makePdfAlias(exportHandler));

export default router;
