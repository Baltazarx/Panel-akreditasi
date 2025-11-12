import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listTabel52SarprasPendidikan,
  getTabel52SarprasPendidikanById,
  createTabel52SarprasPendidikan,
  updateTabel52SarprasPendidikan,
  softDeleteTabel52SarprasPendidikan,
  restoreTabel52SarprasPendidikan,
  hardDeleteTabel52SarprasPendidikan,
  exportTabel52SarprasPendidikan
} from '../controllers/tabel52SarprasPendidikan.controller.js';

const router = express.Router();
const resourceKey = 'tabel_5_2_sarpras_pendidikan';

// Routes
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel52SarprasPendidikan);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel52SarprasPendidikanById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel52SarprasPendidikan);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel52SarprasPendidikan);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel52SarprasPendidikan);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreTabel52SarprasPendidikan);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel52SarprasPendidikan);

// Export Excel
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel52SarprasPendidikan);

export default router;

