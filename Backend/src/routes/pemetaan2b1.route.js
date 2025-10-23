import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
// Hapus 'updatePemetaan2b1' dari daftar import
import {
  listPemetaan2b1,
  exportPemetaan2b1
} from '../controllers/pemetaan2b1.controller.js';
import { makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

// === LIST PEMETAAN ===
// Rute ini untuk menampilkan data (Read)
router.get('/', requireAuth, permit('pemetaan2b1', 'R'), listPemetaan2b1);

// === UPDATE PEMETAAN (DIHAPUS) ===
// Rute POST dihapus karena Tabel 2.B.1 adalah data turunan (laporan)
// router.post('/', requireAuth, permit('pemetaan2b1', 'U'), updatePemetaan2b1);

// === EXPORT (XLSX, DOCX, PDF) ===
router.get('/export', requireAuth, permit('pemetaan2b1', 'R'), exportPemetaan2b1);
router.get('/export-doc', requireAuth, permit('pemetaan2b1', 'R'), makeDocAlias(exportPemetaan2b1));
router.get('/export-pdf', requireAuth, permit('pemetaan2b1', 'R'), makePdfAlias(exportPemetaan2b1));

export default router;