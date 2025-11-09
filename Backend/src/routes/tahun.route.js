import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

// [PERUBAHAN]: Impor fungsi baru 'listTahunDropdown'
import {
  listTahun,
  getTahunById,
  createTahun,
  updateTahun,
  deleteTahun,
  listTahunDropdown  // <-- 1. Impor fungsi ini
} from '../controllers/tahun.controller.js';

const router = express.Router();
const resourceKey = 'tahun_akademik'; // (Saya aktifkan lagi RBAC-nya)

/*
================================
 DEFINISI RUTE
================================
*/

// [PERUBAHAN]: Tambahkan route ini
// PENTING: Rute '/dropdown' harus ada SEBELUM '/:id'
// Ini adalah endpoint yang akan dipakai frontend untuk mengisi dropdown "Pilih Tahun TS".
router.get(
    '/dropdown', 
    requireAuth, 
    permit(resourceKey, 'R'), // (Diamankan dengan 'Read' a.k.a 'R')
    listTahunDropdown         // <-- 2. Panggil fungsi baru
);

// --- Rute CRUD standar (tidak berubah) ---
router.get('/', requireAuth, permit(resourceKey, 'R'), listTahun);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTahunById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTahun);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTahun);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), deleteTahun);

export default router;