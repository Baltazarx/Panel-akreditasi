// src/routes/tabel2a2KeragamanAsal.route.js
import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listKeragamanAsal,
  getKeragamanAsalById,
  createKeragamanAsal,
  updateKeragamanAsal,
  softDeleteKeragamanAsal,
  restoreKeragamanAsal,
  hardDeleteKeragamanAsal,
  softDeleteMultipleKeragamanAsal,
  hardDeleteMultipleKeragamanAsal,
  restoreMultipleKeragamanAsal,
} from '../controllers/tabel2a2KeragamanAsal.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * ==========================================
 * ================ CRUD ====================
 * ==========================================
 */

// LIST
router.get('/', requireAuth, permit('tabel_2a2_keragaman_asal', 'R'), listKeragamanAsal);

// DELETE MULTIPLE (SOFT DELETE) - harus sebelum route :id
router.post('/delete-multiple', requireAuth, permit('tabel_2a2_keragaman_asal', 'D'), softDeleteMultipleKeragamanAsal);

// HARD DELETE MULTIPLE - harus sebelum route :id
router.post('/hard-delete-multiple', requireAuth, permit('tabel_2a2_keragaman_asal', 'H'), hardDeleteMultipleKeragamanAsal);

// RESTORE MULTIPLE - harus sebelum route :id
router.post('/restore-multiple', requireAuth, permit('tabel_2a2_keragaman_asal', 'U'), restoreMultipleKeragamanAsal);

// DETAIL
router.get('/:id', requireAuth, permit('tabel_2a2_keragaman_asal', 'R'), getKeragamanAsalById);

// CREATE
router.post('/', requireAuth, permit('tabel_2a2_keragaman_asal', 'C'), createKeragamanAsal);

// UPDATE
router.put('/:id', requireAuth, permit('tabel_2a2_keragaman_asal', 'U'), updateKeragamanAsal);

// SOFT DELETE — boleh dilakukan oleh unit (Kemahasiswaan, Prodi, dll.)
router.delete('/:id', requireAuth, permit('tabel_2a2_keragaman_asal', 'D'), softDeleteKeragamanAsal);

// RESTORE — bisa oleh WAKET & TPM
router.post('/:id/restore', requireAuth, permit('tabel_2a2_keragaman_asal', 'U'), restoreKeragamanAsal);

// HARD DELETE — hanya Superadmin (WAKET1/WAKET2)
router.delete('/:id/hard-delete', requireAuth, permit('tabel_2a2_keragaman_asal', 'H'), hardDeleteKeragamanAsal);

/**
 * ==========================================
 * ============== EXPORT ROUTES =============
 * ==========================================
 */
const meta = {
  resourceKey: 'tabel_2a2_keragaman_asal',
  table: 'tabel_2a2_keragaman_asal',
  columns: [
    'id_unit_prodi',
    'id_tahun',
    'nama_daerah_input',
    'kategori_geografis',
    'is_afirmasi',
    'is_kebutuhan_khusus',
    'jumlah_mahasiswa',
    'link_bukti',
  ],
  headers: [
    'Prodi',
    'Tahun',
    'Daerah Asal',
    'Kategori',
    'Afirmasi',
    'Kebutuhan Khusus',
    'Jumlah',
    'Link Bukti',
  ],
  title: (label) => `Tabel 2.A.2 — Keragaman Asal Mahasiswa ${label}`,
  orderBy: 'm.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: true });

// EXPORT HANDLERS (xlsx, docx, pdf)
router.get('/export', requireAuth, permit('tabel_2a2_keragaman_asal', 'R'), exportHandler);
router.post('/export', requireAuth, permit('tabel_2a2_keragaman_asal', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('tabel_2a2_keragaman_asal', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('tabel_2a2_keragaman_asal', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('tabel_2a2_keragaman_asal', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('tabel_2a2_keragaman_asal', 'R'), makePdfAlias(exportHandler));

export default router;
