import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

import {
  listFleksibilitas,
  getFleksibilitasById,
  createOrUpdateFleksibilitas,
  softDeleteFleksibilitas,
  restoreFleksibilitas,
  hardDeleteFleksibilitas,
  exportFleksibilitas
} from '../controllers/tabel2cFleksibilitasPembelajaran.controller.js';

const router = express.Router();

// Resource key untuk RBAC
const resourceKey = 'tabel_2c_fleksibilitas_pembelajaran';

router.get('/', requireAuth, permit(resourceKey, 'R'), listFleksibilitas);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getFleksibilitasById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createOrUpdateFleksibilitas);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), createOrUpdateFleksibilitas);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteFleksibilitas);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreFleksibilitas);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteFleksibilitas);

// EXPORT
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportFleksibilitas);

export default router;
