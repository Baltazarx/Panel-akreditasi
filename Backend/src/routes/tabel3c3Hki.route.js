/*
============================================================
 FILE: routes/tabel3c3Hki.routes.js
 
 Rute untuk CRUD Tabel 3.C.3 HKI.
 Dibuat konsisten dengan 3.C.1 dan 3.C.2.
============================================================
*/

import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

// 1. Impor 7 fungsi dari controller 3C3
import {
    listTabel3c3Hki,
    getTabel3c3HkiById,
    createTabel3c3Hki,
    updateTabel3c3Hki,
    softDeleteTabel3c3Hki,
    hardDeleteTabel3c3Hki,
    exportTabel3c3Hki
} from '../controllers/tabel3c3Hki.controller.js';

const router = express.Router();

// 2. Tentukan resource key (nama tabelnya)
const resourceKey = 'tabel_3c3_hki';

/*
================================
 DEFINISI RUTE
================================
*/

// PENTING: Rute 'export' harus ada SEBELUM '/:id'
// (Controller akan membaca ?ts_id=... dari req.query)
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel3c3Hki);

// Rute CRUD standar
// (Controller akan membaca ?ts_id=... dari req.query)
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel3c3Hki);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel3c3HkiById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel3c3Hki);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel3c3Hki);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel3c3Hki);

// Rute Hard Delete (Super Admin / high-level)
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel3c3Hki);

export default router;