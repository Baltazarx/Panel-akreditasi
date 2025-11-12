import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listTabel5a1SistemTataKelola,
  getTabel5a1SistemTataKelolaById,
  createTabel5a1SistemTataKelola,
  updateTabel5a1SistemTataKelola,
  softDeleteTabel5a1SistemTataKelola,
  restoreTabel5a1SistemTataKelola,
  hardDeleteTabel5a1SistemTataKelola,
  exportTabel5a1SistemTataKelola
} from '../controllers/tabel51SistemTataKelola.controller.js';

const router = express.Router();
const resourceKey = 'tabel_5_1_sistem_tata_kelola';

// Routes
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel5a1SistemTataKelola);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel5a1SistemTataKelolaById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel5a1SistemTataKelola);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel5a1SistemTataKelola);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel5a1SistemTataKelola);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreTabel5a1SistemTataKelola);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel5a1SistemTataKelola);

// Export Excel
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel5a1SistemTataKelola);

export default router;

