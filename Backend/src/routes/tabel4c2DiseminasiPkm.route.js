import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

// 1. Impor 8 fungsi dari controller 4C2 (termasuk restore)
import {
    listTabel4c2DiseminasiPkm,
    getTabel4c2DiseminasiPkmById,
    createTabel4c2DiseminasiPkm,
    updateTabel4c2DiseminasiPkm,
    softDeleteTabel4c2DiseminasiPkm,
    restoreTabel4c2DiseminasiPkm,
    hardDeleteTabel4c2DiseminasiPkm,
    exportTabel4c2DiseminasiPkm
} from '../controllers/tabel4c2DiseminasiPkm.controller.js';

const router = express.Router();

// 2. Tentukan resource key (nama tabelnya)
const resourceKey = 'tabel_4c2_diseminasi_pkm';

/*
================================
 DEFINISI RUTE
================================
*/

// PENTING: Rute 'export' harus ada SEBELUM '/:id'
// (Controller akan membaca ?ts_id=... dari req.query)
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel4c2DiseminasiPkm);

// Rute CRUD standar
// (Controller list akan membaca ?ts_id=... dari req.query)
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel4c2DiseminasiPkm);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel4c2DiseminasiPkmById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel4c2DiseminasiPkm);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel4c2DiseminasiPkm);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel4c2DiseminasiPkm);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreTabel4c2DiseminasiPkm);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel4c2DiseminasiPkm);

export default router;