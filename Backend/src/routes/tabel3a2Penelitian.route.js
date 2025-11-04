import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
// Ganti nama file dan fungsi yang diimpor
import {
  listTabel3a2Penelitian,
  getTabel3a2PenelitianById,
  createTabel3a2Penelitian,
  updateTabel3a2Penelitian,
  softDeleteTabel3a2Penelitian,
  hardDeleteTabel3a2Penelitian,
  exportTabel3a2Penelitian 
} from '../controllers/tabel3a2Penelitian.controller.js'; // <-- Nama file controller

const router = express.Router();
// Ganti resource key
const resourceKey = 'tabel_3a2_penelitian'; 

// Ganti semua pemanggilan fungsi
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel3a2Penelitian);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel3a2PenelitianById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel3a2Penelitian);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel3a2Penelitian);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel3a2Penelitian);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel3a2Penelitian);

// Rute export
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel3a2Penelitian);

export default router;
