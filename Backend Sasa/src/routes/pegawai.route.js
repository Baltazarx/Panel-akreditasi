import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listPegawai,
  getPegawaiById,
  createPegawai,
  updatePegawai,
  deletePegawai
} from '../controllers/pegawai.controller.js';

const router = express.Router();

// ===== CRUD =====
router.get('/', requireAuth, permit('pegawai', 'R'), listPegawai);
router.get('/:id', requireAuth, permit('pegawai', 'R'), getPegawaiById);
router.post('/', requireAuth, permit('pegawai', 'C'), createPegawai);
router.put('/:id', requireAuth, permit('pegawai', 'U'), updatePegawai);
router.delete('/:id', requireAuth, permit('pegawai', 'D'), deletePegawai);

export default router;
