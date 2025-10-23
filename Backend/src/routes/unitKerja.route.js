import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { listUnitKerja } from '../controllers/unitKerja.controller.js';

const router = express.Router();

// ===== LIST ONLY =====
router.get('/', requireAuth, permit('unit_kerja', 'R'), listUnitKerja);

export default router;
