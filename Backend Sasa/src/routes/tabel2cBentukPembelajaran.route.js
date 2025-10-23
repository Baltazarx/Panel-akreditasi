import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listBentukPembelajaran,
  createBentukPembelajaran,
  updateBentukPembelajaran,
  hardDeleteBentukPembelajaran // <-- Ganti dari softDelete ke hardDelete
} from '../controllers/bentukPembelajaran.controller.js';

const router = express.Router();
// Definisikan resource key baru untuk RBAC
const resourceKey = 'bentuk_pembelajaran_master'; 

router.get('/', requireAuth, permit(resourceKey, 'R'), listBentukPembelajaran);
router.post('/', requireAuth, permit(resourceKey, 'C'), createBentukPembelajaran);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateBentukPembelajaran);

// PERBAIKAN: Gunakan hardDeleteBentukPembelajaran untuk DELETE /:id
// Asumsi: izin 'D' sekarang berarti hard delete untuk resource ini
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), hardDeleteBentukPembelajaran);

export default router;

