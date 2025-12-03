import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

import {
  listSumberRekognisi,
  getSumberRekognisiById,
  createSumberRekognisi,
  updateSumberRekognisi,
  softDeleteSumberRekognisi,
  restoreSumberRekognisi,
  hardDeleteSumberRekognisi,
} from '../controllers/tabel2dSumberRekognisi.controller.js';

const router = express.Router();

// KEY RBAC
const resourceKey = 'tabel_2d_sumber_rekognisi';

// ------------------ ROUTES ---------------------
router.get('/', requireAuth, permit(resourceKey, 'R'), listSumberRekognisi);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getSumberRekognisiById);

router.post('/', requireAuth, permit(resourceKey, 'C'), createSumberRekognisi);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateSumberRekognisi);

router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteSumberRekognisi);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreSumberRekognisi);

router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteSumberRekognisi);

// ------------------------------------------------
export default router;
