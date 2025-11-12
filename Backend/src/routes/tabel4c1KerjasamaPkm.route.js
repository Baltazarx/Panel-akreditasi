import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

// 1. Impor 7 fungsi dari controller 4C1
import {
    listTabel4c1KerjasamaPkm,
    getTabel4c1KerjasamaPkmById,
    createTabel4c1KerjasamaPkm,
    updateTabel4c1KerjasamaPkm,
    softDeleteTabel4c1KerjasamaPkm,
    hardDeleteTabel4c1KerjasamaPkm,
    exportTabel4c1KerjasamaPkm
} from '../controllers/tabel4c1KerjasamaPkm.controller.js';

const router = express.Router();

// 2. Tentukan resource key (nama tabel induknya)
const resourceKey = 'tabel_4c1_kerjasama_pkm';

/*
================================
 DEFINISI RUTE
================================
*/

// PENTING: Rute 'export' harus ada SEBELUM '/:id'
// (Controller akan membaca ?ts_id=... dari req.query)
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel4c1KerjasamaPkm);

// Rute CRUD standar
// (Controller list akan membaca ?ts_id=... dari req.query)
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel4c1KerjasamaPkm);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel4c1KerjasamaPkmById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel4c1KerjasamaPkm);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel4c1KerjasamaPkm);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel4c1KerjasamaPkm);

// Rute Hard Delete (Super Admin / high-level)
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel4c1KerjasamaPkm);

export default router;