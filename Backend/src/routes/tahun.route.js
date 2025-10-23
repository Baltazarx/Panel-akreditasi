import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listTahun,
  getTahunById,
  createTahun,
  updateTahun,
  deleteTahun
} from '../controllers/tahun.controller.js';

const router = express.Router();

// ===== CRUD =====
router.get('/', requireAuth, permit('tahun_akademik', 'R'), listTahun);
router.get('/:id', requireAuth, permit('tahun_akademik', 'R'), getTahunById);
router.post('/', requireAuth, permit('tahun_akademik', 'C'), createTahun);
router.put('/:id', requireAuth, permit('tahun_akademik', 'U'), updateTahun);
router.delete('/:id', requireAuth, permit('tahun_akademik', 'D'), deleteTahun);

export default router;
