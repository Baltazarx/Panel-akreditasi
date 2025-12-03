import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

import {
  listRekognisi,
  getRekognisiById,
  createOrUpdateRekognisi,
  softDeleteRekognisi,
  restoreRekognisi,
  hardDeleteRekognisi,
  exportRekognisi
} from '../controllers/tabel2dRekognisiLulusan.controller.js';

const router = express.Router();

// KEY RBAC
const resourceKey = 'tabel_2d_rekognisi_lulusan';

// ------------------ ROUTES ---------------------
router.get('/', requireAuth, permit(resourceKey, 'R'), listRekognisi);
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportRekognisi);

router.get('/:id', requireAuth, permit(resourceKey, 'R'), getRekognisiById);

router.post('/', requireAuth, permit(resourceKey, 'C'), createOrUpdateRekognisi);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), createOrUpdateRekognisi);

router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteRekognisi);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreRekognisi);

router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteRekognisi);

// ------------------------------------------------
export default router;
