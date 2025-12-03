/*
============================================================
 FILE: routes/tabel3c1Kerjasama.routes.js
============================================================
*/

import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

// 1. Impor 8 fungsi dari controller 3C1 (versi revisi 5 tahun + restore)
import {
    listTabel3c1Kerjasama,
    getTabel3c1KerjasamaById,
    createTabel3c1Kerjasama,
    updateTabel3c1Kerjasama,
    softDeleteTabel3c1Kerjasama,
    restoreTabel3c1Kerjasama,
    hardDeleteTabel3c1Kerjasama,
    exportTabel3c1Kerjasama
} from '../controllers/tabel3c1Kerjasama.controller.js';

const router = express.Router();

// 2. Tentukan resource key baru
const resourceKey = 'tabel_3c1_kerjasama_penelitian';

/*
================================
 DEFINISI RUTE
================================
*/

// PENTING: Rute 'export' harus ada SEBELUM '/:id'
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel3c1Kerjasama);

// Rute CRUD standar
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel3c1Kerjasama);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel3c1KerjasamaById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel3c1Kerjasama);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel3c1Kerjasama);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel3c1Kerjasama);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreTabel3c1Kerjasama);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel3c1Kerjasama);

export default router;