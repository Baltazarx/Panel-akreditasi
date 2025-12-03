/*
============================================================
 FILE: routes/tabel3c2Publikasi.route.js
 
 Rute untuk CRUD Tabel 3.C.2 Publikasi Penelitian.
 Dibuat konsisten dengan 3.C.1 (termasuk /export dan /:id/hard)
============================================================
*/

import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

// 1. Impor 8 fungsi dari controller 3C2 (termasuk restore)
import {
    listTabel3c2Publikasi,
    getTabel3c2PublikasiById,
    createTabel3c2Publikasi,
    updateTabel3c2Publikasi,
    softDeleteTabel3c2Publikasi,
    restoreTabel3c2Publikasi,
    hardDeleteTabel3c2Publikasi,
    exportTabel3c2Publikasi
} from '../controllers/tabel3c2Publikasi.controller.js';

const router = express.Router();

// 2. Tentukan resource key (nama tabelnya)
const resourceKey = 'tabel_3c2_publikasi_penelitian';

/*
================================
 DEFINISI RUTE
================================
*/

// PENTING: Rute 'export' harus ada SEBELUM '/:id'
// (Sama seperti 3C1, rute ini akan membaca ?ts_id=... dari controller)
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel3c2Publikasi);

// Rute CRUD standar
// (Sama seperti 3C1, rute list ini akan membaca ?ts_id=... dari controller)
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel3c2Publikasi);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel3c2PublikasiById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel3c2Publikasi);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel3c2Publikasi);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel3c2Publikasi);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreTabel3c2Publikasi);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel3c2Publikasi);

export default router;