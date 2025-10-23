import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listSumberRekognisi,
  createSumberRekognisi,
  updateSumberRekognisi,
  hardDeleteSumberRekognisi 
} from '../controllers/sumberRekognisi.controller.js';

const router = express.Router();
const resourceKey = 'sumber_rekognisi_master'; // Resource key baru untuk RBAC

router.get('/', requireAuth, permit(resourceKey, 'R'), listSumberRekognisi);
router.post('/', requireAuth, permit(resourceKey, 'C'), createSumberRekognisi);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateSumberRekognisi);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), hardDeleteSumberRekognisi); // Langsung Hard Delete

export default router;
