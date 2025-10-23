import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listDosen,
  getDosenById,
  createDosen,
  updateDosen,
  softDeleteDosen,
  restoreDosen,
  hardDeleteDosen
} from '../controllers/dosen.controller.js';

const router = express.Router();

// ===== CRUD + LIST SCOPED =====
router.get('/', requireAuth, permit('dosen', 'R'), listDosen);
router.get('/:id', requireAuth, permit('dosen', 'R'), getDosenById);
router.post('/', requireAuth, permit('dosen', 'C'), createDosen);
router.put('/:id', requireAuth, permit('dosen', 'U'), updateDosen);
router.delete('/:id', requireAuth, permit('dosen', 'D'), softDeleteDosen);
router.delete('/:id/hard-delete', requireAuth, permit('dosen', 'D'), hardDeleteDosen);
router.post('/:id/restore', requireAuth, permit('dosen', 'U'), restoreDosen);

export default router;
