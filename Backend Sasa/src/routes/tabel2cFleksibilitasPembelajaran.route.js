import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listFleksibilitas,
  createOrUpdateFleksibilitas,
  softDeleteFleksibilitas,
  exportFleksibilitas,
  hardDeleteFleksibilitas // <-- Tambahkan fungsi hard delete
} from '../controllers/fleksibilitasPembelajaran.controller.js';

const router = express.Router();
const resourceKey = 'fleksibilitas_pembelajaran';

router.get('/', requireAuth, permit(resourceKey, 'R'), listFleksibilitas);
router.post('/', requireAuth, permit(resourceKey, 'C'), createOrUpdateFleksibilitas); 
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteFleksibilitas);

// === RUTE EXPORT ===
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportFleksibilitas);

// === RUTE BARU UNTUK HARD DELETE ===
// Hanya bisa diakses oleh super admin dengan izin 'H'
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteFleksibilitas);

export default router;

