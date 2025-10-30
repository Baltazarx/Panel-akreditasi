import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
// Nama fungsi disesuaikan
import {
  listTabel3a1SarprasPenelitian,
  getTabel3a1SarprasPenelitianById,
  createTabel3a1SarprasPenelitian,
  updateTabel3a1SarprasPenelitian,
  softDeleteTabel3a1SarprasPenelitian,
  hardDeleteTabel3a1SarprasPenelitian,
  exportTabel3a1SarprasPenelitian // <-- Tambahkan fungsi export
} from '../controllers/tabel3a1SarprasPenelitian.controller.js'; // Nama file disesuaikan

const router = express.Router();
// Resource key disesuaikan
const resourceKey = 'tabel_3a1_sarpras_penelitian'; 

// Nama fungsi di pemanggilan disesuaikan
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel3a1SarprasPenelitian);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel3a1SarprasPenelitianById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel3a1SarprasPenelitian);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel3a1SarprasPenelitian);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel3a1SarprasPenelitian);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel3a1SarprasPenelitian);

// === RUTE BARU UNTUK EXPORT ===
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel3a1SarprasPenelitian);

export default router;
