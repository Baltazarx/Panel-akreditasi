import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listKondisiMahasiswa,
  getKondisiMahasiswaById,
  createKondisiMahasiswa,
  updateKondisiMahasiswa,
  softDeleteKondisiMahasiswa,
  restoreKondisiMahasiswa,
  hardDeleteKondisiMahasiswa,
} from '../controllers/tabel2a3KondisiMahasiswa.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ==========================================
 * ================ CRUD ====================
 * ==========================================
 */

// LIST
router.get('/', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'R'), listKondisiMahasiswa);

// DETAIL
router.get('/:id', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'R'), getKondisiMahasiswaById);

// CREATE
router.post('/', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'C'), createKondisiMahasiswa);

// UPDATE
router.put('/:id', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'U'), updateKondisiMahasiswa);

// SOFT DELETE — boleh dilakukan oleh unit (Prodi, Kemahasiswaan, TPM)
router.delete('/:id', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'D'), softDeleteKondisiMahasiswa);

// RESTORE — bisa oleh WAKET & TPM
router.post('/:id/restore', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'U'), restoreKondisiMahasiswa);

// HARD DELETE — hanya Superadmin (WAKET1/WAKET2)
router.delete('/:id/hard-delete', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'H'), hardDeleteKondisiMahasiswa);

/**
 * ==========================================
 * ============== EXPORT ROUTES =============
 * ==========================================
 */

const meta = {
  resourceKey: 'tabel_2a3_kondisi_mahasiswa',
  table: 'tabel_2a3_kondisi_mahasiswa',
  columns: [
    'id_unit_prodi',
    'id_tahun',
    'jml_baru',
    'jml_aktif',
    'jml_lulus',
    'jml_do',
  ],
  headers: [
    'Prodi',
    'Tahun',
    'Mahasiswa Baru',
    'Mahasiswa Aktif',
    'Lulus',
    'Drop Out',
  ],
  title: (label) => `Tabel 2.A.3 — Kondisi Mahasiswa ${label}`,
  orderBy: 'km.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: true });

// EXPORT HANDLERS (xlsx, docx, pdf)
router.get('/export', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'R'), exportHandler);
router.post('/export', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('tabel_2a3_kondisi_mahasiswa', 'R'), makePdfAlias(exportHandler));

export default router;
