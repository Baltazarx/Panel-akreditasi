import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

// 1. Impor 8 fungsi dari controller 4C3 (termasuk restore)
import {
    listTabel4c3HkiPkm,
    getTabel4c3HkiPkmById,
    createTabel4c3HkiPkm,
    updateTabel4c3HkiPkm,
    softDeleteTabel4c3HkiPkm,
    restoreTabel4c3HkiPkm,
    hardDeleteTabel4c3HkiPkm,
    exportTabel4c3HkiPkm
} from '../controllers/tabel4c3HkiPkm.controller.js';

const router = express.Router();

// 2. Tentukan resource key (nama tabelnya)
const resourceKey = 'tabel_4c3_hki_pkm';

/*
================================
 DEFINISI RUTE
================================
*/

// PENTING: Rute 'export' harus ada SEBELUM '/:id'
// (Controller akan membaca ?ts_id=... dari req.query)
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel4c3HkiPkm);

// Rute CRUD standar
// (Controller list akan membaca ?ts_id=... dari req.query)
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel4c3HkiPkm);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel4c3HkiPkmById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel4c3HkiPkm);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel4c3HkiPkm);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel4c3HkiPkm);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreTabel4c3HkiPkm);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel4c3HkiPkm);

export default router;