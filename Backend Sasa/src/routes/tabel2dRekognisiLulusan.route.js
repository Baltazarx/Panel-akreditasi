import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listRekognisi,
  createOrUpdateRekognisi,
  exportRekognisi,
  softDeleteRekognisi,  // <-- Tambahkan fungsi soft delete
  hardDeleteRekognisi   // <-- Tambahkan fungsi hard delete
} from '../controllers/rekognisiLulusan.controller.js';

const router = express.Router();
const resourceKey = 'rekognisi_lulusan'; // Nama resource untuk RBAC

router.get('/', requireAuth, permit(resourceKey, 'R'), listRekognisi);
router.post('/', requireAuth, permit(resourceKey, 'C'), createOrUpdateRekognisi); 
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportRekognisi);

// Rute untuk Soft Delete (izin 'D')
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteRekognisi);

// Rute untuk Hard Delete (izin 'H')
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteRekognisi);

export default router;

