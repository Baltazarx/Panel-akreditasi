import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listTabel2b6KepuasanPengguna,
  getTabel2b6KepuasanPenggunaById,
  createTabel2b6KepuasanPengguna,
  updateTabel2b6KepuasanPengguna,
  softDeleteTabel2b6KepuasanPengguna,
  restoreTabel2b6KepuasanPengguna,
  hardDeleteTabel2b6KepuasanPengguna,
  summaryTabel2b6KepuasanPengguna,
  getJenisKemampuanTersedia,
  getDataStatistikTabel2b6
} from '../controllers/tabel2b6KepuasanPengguna.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ======================
 * ====== CRUD ==========
 * ======================
 */

// List data
router.get('/', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'R'), listTabel2b6KepuasanPengguna);

// Detail data
router.get('/:id', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'R'), getTabel2b6KepuasanPenggunaById);

// Create data
router.post('/', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'C'), createTabel2b6KepuasanPengguna);

// Update data
router.put('/:id', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'U'), updateTabel2b6KepuasanPengguna);

// Soft delete
router.delete('/:id', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'D'), softDeleteTabel2b6KepuasanPengguna);

// Restore
router.post('/:id/restore', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'U'), restoreTabel2b6KepuasanPengguna);

// Hard delete
router.delete('/:id/hard-delete', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'H'), hardDeleteTabel2b6KepuasanPengguna);

/**
 * ======================
 * ====== SUMMARY =======
 * ======================
 */

// Summary data untuk dashboard/statistik
router.get('/summary/data', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'R'), summaryTabel2b6KepuasanPengguna);

// Get jenis kemampuan yang tersedia
router.get('/available/jenis-kemampuan', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'R'), getJenisKemampuanTersedia);

// Get data statistik tambahan (alumni, responden, mahasiswa aktif)
router.get('/statistik/data', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'R'), getDataStatistikTabel2b6);

/**
 * ======================
 * ====== EXPORT ========
 * ======================
 */

const meta = {
  resourceKey: 'tabel_2b6_kepuasan_pengguna',
  table: 'tabel_2b6_kepuasan_pengguna',
  columns: [
    'id', 
    'id_unit_prodi', 
    'id_tahun', 
    'jenis_kemampuan', 
    'persen_sangat_baik', 
    'persen_baik', 
    'persen_cukup', 
    'persen_kurang'
  ],
  headers: [
    'ID', 
    'Unit Prodi', 
    'Tahun Akademik', 
    'Jenis Kemampuan', 
    'Persen Sangat Baik', 
    'Persen Baik', 
    'Persen Cukup', 
    'Persen Kurang'
  ],
  title: (label) => `Tabel 2.B.6 Kepuasan Pengguna Lulusan — ${label}`,
  orderBy: 't2b6.id_tahun DESC, t2b6.id_unit_prodi ASC',
  requireYear: true,
};

// Export Excel/CSV
router.get('/export', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'R'), makeExportHandler(meta));
router.post('/export', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'R'), makeExportHandler(meta));

// Export Word Document
router.get('/export-doc', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'R'), makeDocAlias(meta));
router.post('/export-doc', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'R'), makeDocAlias(meta));

// Export PDF
router.get('/export-pdf', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'R'), makePdfAlias(meta));
router.post('/export-pdf', requireAuth, permit('tabel_2b6_kepuasan_pengguna', 'R'), makePdfAlias(meta));

export default router;
