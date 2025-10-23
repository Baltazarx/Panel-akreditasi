// src/routes/tabel2a1MahasiswaBaruAktif.route.js
import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listMahasiswaBaruAktif,
  getMahasiswaBaruAktifById,
  createMahasiswaBaruAktif,
  updateMahasiswaBaruAktif,
  softDeleteMahasiswaBaruAktif,
  restoreMahasiswaBaruAktif,
  hardDeleteMahasiswaBaruAktif,
} from '../controllers/tabel2a1MahasiswaBaruAktif.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ==========================================
 * ================ CRUD ====================
 * ==========================================
 */

// LIST
router.get('/', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'R'), listMahasiswaBaruAktif);

// DETAIL
router.get('/:id', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'R'), getMahasiswaBaruAktifById);

// CREATE
router.post('/', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'C'), createMahasiswaBaruAktif);

// UPDATE
router.put('/:id', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'U'), updateMahasiswaBaruAktif);

// SOFT DELETE — boleh dilakukan oleh unit (ALA, PMB, PRODI, dll.)
router.delete('/:id', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'D'), softDeleteMahasiswaBaruAktif);

// RESTORE — bisa oleh WAKET & TPM
router.post('/:id/restore', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'U'), restoreMahasiswaBaruAktif);

// HARD DELETE — hanya Superadmin (WAKET1/WAKET2)
router.delete('/:id/hard-delete', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'H'), hardDeleteMahasiswaBaruAktif);

/**
 * ==========================================
 * ============== EXPORT ROUTES =============
 * ==========================================
 */
const meta = {
  resourceKey: 'tabel_2a1_mahasiswa_baru_aktif',
  table: 'tabel_2a1_mahasiswa_baru_aktif',
  columns: [
    'id',
    'id_unit_prodi',
    'id_tahun',
    'jenis',
    'jalur',
    'jumlah_total',
    'jumlah_afirmasi',
    'jumlah_kebutuhan_khusus',
  ],
  headers: [
    'ID',
    'Unit Prodi',
    'Tahun',
    'Jenis',
    'Jalur',
    'Total',
    'Afirmasi',
    'Kebutuhan Khusus',
  ],
  title: (label) => `Tabel 2.A.1 — Mahasiswa Baru/Aktif (${label})`,
  orderBy: 'm.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// EXPORT HANDLERS (xlsx, docx, pdf)
router.get('/export', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'R'), exportHandler);
router.post('/export', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif', 'R'), makePdfAlias(exportHandler));

export default router;
