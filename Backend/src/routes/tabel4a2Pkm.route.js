import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

// 1. Impor 8 fungsi dari controller 4A2 (termasuk restore)
import {
    listTabel4a2Pkm,
    getTabel4a2PkmById,
    createTabel4a2Pkm,
    updateTabel4a2Pkm,
    softDeleteTabel4a2Pkm,
    restoreTabel4a2Pkm,
    hardDeleteTabel4a2Pkm,
    exportTabel4a2Pkm
} from '../controllers/tabel4a2Pkm.controller.js';

const router = express.Router();

// 2. Tentukan resource key (nama tabel induknya)
const resourceKey = 'tabel_4a2_pkm';

/*
================================
 DEFINISI RUTE
================================
*/

// PENTING: Rute 'export' harus ada SEBELUM '/:id'
// (Controller akan membaca ?ts_id=... dari req.query)
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel4a2Pkm);

// Rute CRUD standar
// (Controller akan membaca ?ts_id=... dari req.query)
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel4a2Pkm);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel4a2PkmById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel4a2Pkm);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel4a2Pkm);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel4a2Pkm);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreTabel4a2Pkm);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel4a2Pkm);

export default router;