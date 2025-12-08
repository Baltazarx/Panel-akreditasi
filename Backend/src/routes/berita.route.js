import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listBerita,
  getBeritaById,
  createBerita,
  updateBerita,
  softDeleteBerita,
  restoreBerita,
  hardDeleteBerita,
  exportBerita
} from '../controllers/berita.controller.js';

const router = express.Router();
const resourceKey = 'berita'; 

router.get('/', requireAuth, permit(resourceKey, 'R'), listBerita);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getBeritaById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createBerita);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateBerita);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteBerita);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreBerita);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteBerita);
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportBerita);

export default router;

