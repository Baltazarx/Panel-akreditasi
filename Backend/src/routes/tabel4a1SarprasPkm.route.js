import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

// 1. Impor 7 fungsi dari controller 4A1
import {
    listTabel4a1SarprasPkm,
    getTabel4a1SarprasPkmById,
    createTabel4a1SarprasPkm,
    updateTabel4a1SarprasPkm,
    softDeleteTabel4a1SarprasPkm,
    hardDeleteTabel4a1SarprasPkm,
    exportTabel4a1SarprasPkm
} from '../controllers/tabel4a1SarprasPkm.controller.js';

const router = express.Router();

// 2. Tentukan resource key (nama tabelnya)
const resourceKey = 'tabel_4a1_sarpras_pkm';

/*
================================
 DEFINISI RUTE
================================
*/

// PENTING: Rute 'export' harus ada SEBELUM '/:id'
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel4a1SarprasPkm);

// Rute CRUD standar
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel4a1SarprasPkm);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel4a1SarprasPkmById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel4a1SarprasPkm);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel4a1SarprasPkm);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel4a1SarprasPkm);

// Rute Hard Delete (Super Admin / high-level)
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel4a1SarprasPkm);

export default router;