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

// ===== CRUD =====
router.get('/', requireAuth, permit('tenaga_kependidikan', 'R'), listTendik);
router.get('/:id', requireAuth, permit('tenaga_kependidikan', 'R'), getTendikById);
router.post('/', requireAuth, permit('tenaga_kependidikan', 'C'), createTendik);
router.put('/:id', requireAuth, permit('tenaga_kependidikan', 'U'), updateTendik);
router.delete('/:id/hard-delete', requireAuth, permit('tenaga_kependidikan', 'D'), hardDeleteTendik);
router.delete('/:id', requireAuth, permit('tenaga_kependidikan', 'D'), softDeleteTendik);
router.post('/:id/restore', requireAuth, permit('tenaga_kependidikan', 'U'), restoreTendik);

export default router;
