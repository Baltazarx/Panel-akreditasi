import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listTabel2b5KesesuaianKerja,
  getTabel2b5KesesuaianKerjaById,
  createTabel2b5KesesuaianKerja,
  updateTabel2b5KesesuaianKerja,
  softDeleteTabel2b5KesesuaianKerja,
  restoreTabel2b5KesesuaianKerja,
  hardDeleteTabel2b5KesesuaianKerja,
  summaryTabel2b5KesesuaianKerja,
  validateJumlahTabel2b5
} from '../controllers/tabel2b5KesesuaianKerja.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ======================
 * ====== CRUD =========
 * ======================
 */

// List all Tabel 2B5 Kesesuaian Kerja
router.get('/', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'R'), listTabel2b5KesesuaianKerja);

// Detail per ID
router.get('/:id', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'R'), getTabel2b5KesesuaianKerjaById);

// Create
router.post('/', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'C'), createTabel2b5KesesuaianKerja);

// Update
router.put('/:id', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'U'), updateTabel2b5KesesuaianKerja);

// Soft delete 
router.delete('/:id', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'D'), softDeleteTabel2b5KesesuaianKerja);

// Restore — hanya boleh dilakukan oleh WAKET/TPM
router.post('/:id/restore', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'U'), restoreTabel2b5KesesuaianKerja);

// Hard delete — hanya boleh oleh superadmin
router.delete('/:id/hard-delete', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'H'), hardDeleteTabel2b5KesesuaianKerja);

/**
 * ======================
 * ====== SUMMARY =======
 * ======================
 */

// Summary data untuk dashboard/statistik
router.get('/summary/data', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'R'), summaryTabel2b5KesesuaianKerja);

/**
 * ======================
 * ====== VALIDASI ======
 * ======================
 */

// Validasi jumlah tidak boleh lebih dari jumlah terlacak di tabel 2.B.4
router.get('/validate/jumlah', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'R'), validateJumlahTabel2b5);

/**
 * ======================
 * ====== EXPORT ========
 * ======================
 */

const meta = {
  resourceKey: 'tabel_2b5_kesesuaian_kerja',
  table: 'tabel_2b5_kesesuaian_kerja',
  columns: [
    'id', 
    'id_unit_prodi', 
    'id_tahun_lulus', 
    'jml_infokom', 
    'jml_non_infokom', 
    'jml_internasional', 
    'jml_nasional', 
    'jml_wirausaha',
    'jumlah_lulusan',
    'jumlah_terlacak',
    'rata_rata_waktu_tunggu_bulan'
  ],
  headers: [
    'ID', 
    'Unit Prodi', 
    'Tahun Lulus', 
    'Jumlah Infokom', 
    'Jumlah Non Infokom', 
    'Jumlah Internasional', 
    'Jumlah Nasional', 
    'Jumlah Wirausaha',
    'Jumlah Lulusan',
    'Jumlah Terlacak',
    'Rata-rata Waktu Tunggu (Bulan)'
  ],
  title: (label) => `Tabel 2.B.5 Kesesuaian Bidang Kerja Lulusan — ${label}`,
  orderBy: 't2b5.id_tahun_lulus DESC, t2b5.id_unit_prodi ASC',
};

// Export handler (xlsx, docx, pdf)
const exportHandler = makeExportHandler(meta, { requireYear: true });
router.get('/export', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'R'), exportHandler);
router.post('/export', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('tabel_2b5_kesesuaian_kerja', 'R'), makePdfAlias(exportHandler));

export default router;
