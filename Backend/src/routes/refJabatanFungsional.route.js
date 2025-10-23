import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listRefJabatanFungsional,
  getRefJabatanFungsionalById,
  createRefJabatanFungsional,
  updateRefJabatanFungsional,
  softDeleteRefJabatanFungsional,
  restoreRefJabatanFungsional,
  hardDeleteRefJabatanFungsional
} from '../controllers/refJabatanFungsional.controller.js';

const router = express.Router();

// ===== CRUD =====
router.get('/', requireAuth, permit('ref_jabatan_fungsional', 'R'), listRefJabatanFungsional);
router.get('/:id', requireAuth, permit('ref_jabatan_fungsional', 'R'), getRefJabatanFungsionalById);
router.post('/', requireAuth, permit('ref_jabatan_fungsional', 'C'), createRefJabatanFungsional);
router.put('/:id', requireAuth, permit('ref_jabatan_fungsional', 'U'), updateRefJabatanFungsional);
router.delete('/:id/hard-delete', requireAuth, permit('ref_jabatan_fungsional', 'D'), hardDeleteRefJabatanFungsional);
router.delete('/:id', requireAuth, permit('ref_jabatan_fungsional', 'D'), softDeleteRefJabatanFungsional);
router.post('/:id/restore', requireAuth, permit('ref_jabatan_fungsional', 'U'), restoreRefJabatanFungsional);

export default router;
