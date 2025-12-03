import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

import {
  listBentukPembelajaran,
  getBentukPembelajaranById,
  createBentukPembelajaran,
  updateBentukPembelajaran,
  softDeleteBentukPembelajaran,
  restoreBentukPembelajaran,
  hardDeleteBentukPembelajaran,
  exportBentukPembelajaran
} from '../controllers/tabel2cBentukPembelajaran.controller.js';

const router = express.Router();

// Sesuaikan nama resource untuk RBAC
const resourceKey = 'tabel_2c_bentuk_pembelajaran';

router.get('/', requireAuth, permit(resourceKey, 'R'), listBentukPembelajaran);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getBentukPembelajaranById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createBentukPembelajaran);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateBentukPembelajaran);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteBentukPembelajaran);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreBentukPembelajaran);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteBentukPembelajaran);

// EXPORT
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportBentukPembelajaran);

export default router;
