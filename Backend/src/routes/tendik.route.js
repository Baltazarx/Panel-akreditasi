import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listTendik,
  getTendikById,
  createTendik,
  updateTendik,
  softDeleteTendik,
  restoreTendik,
  hardDeleteTendik
} from '../controllers/tendik.controller.js';

const router = express.Router();
const resourceKey = 'tenaga_kependidikan'; 

router.get('/', requireAuth, permit(resourceKey, 'R'), listTendik);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTendikById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTendik);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTendik);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTendik);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'D'), restoreTendik);
router.delete('/:id/hard-delete', requireAuth, permit(resourceKey, 'H'), hardDeleteTendik);

export default router;