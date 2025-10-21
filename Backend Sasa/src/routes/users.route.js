import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  softDeleteUser,
  restoreUser,
  hardDeleteUser,
  listUnits,
  searchPegawai
} from '../controllers/users.controller.js';

const router = express.Router();

// ===== CRUD USERS =====
router.get('/', requireAuth, permit('users', 'R'), listUsers);
router.get('/:id', requireAuth, permit('users', 'R'), getUserById);
router.post('/', requireAuth, permit('users', 'C'), createUser);
router.put('/:id', requireAuth, permit('users', 'U'), updateUser);
router.delete('/:id', requireAuth, permit('users', 'D'), softDeleteUser);
router.post('/:id/restore', requireAuth, permit('users', 'U'), restoreUser);
router.delete('/:id/hard-delete', requireAuth, permit('users', 'D'), hardDeleteUser);

// ===== EXTRA ENDPOINTS =====
router.get('/extra/units', requireAuth, permit('users', 'R'), listUnits);
router.get('/extra/pegawai', requireAuth, permit('users', 'R'), searchPegawai);

export default router;
