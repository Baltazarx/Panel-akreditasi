import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listTabel2b4MasaTunggu,
  getTabel2b4MasaTungguById,
  createTabel2b4MasaTunggu,
  updateTabel2b4MasaTunggu,
  softDeleteTabel2b4MasaTunggu,
  restoreTabel2b4MasaTunggu,
  hardDeleteTabel2b4MasaTunggu,
  summaryTabel2b4MasaTunggu,
  getDataForTabel2b5
} from '../controllers/tabel2b4MasaTunggu.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ======================
 * ====== CRUD =========
 * ======================
 */

// List all Tabel 2B4 Masa Tunggu (filtered otomatis per prodi login)
router.get('/', requireAuth, permit('tabel_2b4_masa_tunggu', 'R'), listTabel2b4MasaTunggu);

// Detail per ID
router.get('/:id', requireAuth, permit('tabel_2b4_masa_tunggu', 'R'), getTabel2b4MasaTungguById);

// Create (otomatis isi id_unit_prodi kalau role = kemahasiswaan)
router.post('/', requireAuth, permit('tabel_2b4_masa_tunggu', 'C'), createTabel2b4MasaTunggu);

// Update
router.put('/:id', requireAuth, permit('tabel_2b4_masa_tunggu', 'U'), updateTabel2b4MasaTunggu);

// Soft delete — bisa dilakukan oleh kemahasiswaan masing-masing
router.delete('/:id', requireAuth, permit('tabel_2b4_masa_tunggu', 'D'), softDeleteTabel2b4MasaTunggu);

// Restore — hanya boleh dilakukan oleh WAKET/TPM
router.post('/:id/restore', requireAuth, permit('tabel_2b4_masa_tunggu', 'U'), restoreTabel2b4MasaTunggu);

// Hard delete — hanya boleh oleh superadmin
router.delete('/:id/hard-delete', requireAuth, permit('tabel_2b4_masa_tunggu', 'H'), hardDeleteTabel2b4MasaTunggu);

/**
 * ======================
 * ====== SUMMARY =======
 * ======================
 */

// Summary data untuk dashboard/statistik
router.get('/summary/data', requireAuth, permit('tabel_2b4_masa_tunggu', 'R'), summaryTabel2b4MasaTunggu);

/**
 * ======================
 * ====== INTEGRATION ===
 * ======================
 */

// Get data untuk digunakan di tabel 2B5
router.get('/for-tabel2b5/data', requireAuth, permit('tabel_2b4_masa_tunggu', 'R'), getDataForTabel2b5);

/**
 * ======================
 * ====== EXPORT ========
 * ======================
 */

const meta = {
  resourceKey: 'tabel_2b4_masa_tunggu',
  table: 'tabel_2b4_masa_tunggu',
  columns: [
    'id', 
    'id_unit_prodi', 
    'id_tahun_lulus', 
    'jumlah_lulusan', 
    'jumlah_terlacak', 
    'rata_rata_waktu_tunggu_bulan'
  ],
  headers: [
    'ID', 
    'Unit Prodi', 
    'Tahun Lulus', 
    'Jumlah Lulusan', 
    'Jumlah Terlacak', 
    'Rata-rata Waktu Tunggu (Bulan)'
  ],
  title: (label) => `Tabel 2.B.4 Rata-rata Masa Tunggu Lulusan — ${label}`,
  orderBy: 't2b4.id_tahun_lulus DESC, t2b4.id_unit_prodi ASC',
};

// Export handler (xlsx, docx, pdf)
const exportHandler = makeExportHandler(meta, { requireYear: true });
router.get('/export', requireAuth, permit('tabel_2b4_masa_tunggu', 'R'), exportHandler);
router.post('/export', requireAuth, permit('tabel_2b4_masa_tunggu', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('tabel_2b4_masa_tunggu', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('tabel_2b4_masa_tunggu', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('tabel_2b4_masa_tunggu', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('tabel_2b4_masa_tunggu', 'R'), makePdfAlias(exportHandler));

export default router;
