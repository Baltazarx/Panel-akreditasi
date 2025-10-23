import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
// Hapus 'updatePemetaan2b3' dari daftar import jika ada
import {
  listPemetaan2b3,
  exportPemetaan2b3
} from '../controllers/pemetaan2b3.controller.js';
import { makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

// === LIST PEMETAAN (LAPORAN) ===
// Rute ini hanya untuk menampilkan data (Read)
router.get('/', requireAuth, permit('pemetaan2b3', 'R'), listPemetaan2b3);

// === UPDATE PEMETAAN (DIHAPUS) ===
// Rute POST/PUT dihapus karena Tabel 2.B.3 adalah data turunan (laporan)
// router.post('/', requireAuth, permit('pemetaan2b3', 'U'), updatePemetaan2b3);

// === EXPORT (XLSX, DOCX, PDF) ===
router.get('/export', requireAuth, permit('pemetaan2b3', 'R'), exportPemetaan2b3);
router.get('/export-doc', requireAuth, permit('pemetaan2b3', 'R'), makeDocAlias(exportPemetaan2b3));
router.get('/export-pdf', requireAuth, permit('pemetaan2b3', 'R'), makePdfAlias(exportPemetaan2b3));

export default router;