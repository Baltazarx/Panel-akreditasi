import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { listKabupatenKota } from '../controllers/refDaerah.controller.js';

const router = express.Router();

// ===== GET LIST =====
router.get('/', requireAuth, permit('ref_kabupaten_kota', 'R'), listKabupatenKota);

export default router;
