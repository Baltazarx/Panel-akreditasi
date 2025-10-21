import express from 'express';
import { listRefJabatanStruktural } from '../controllers/refJabatanStruktural.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

const router = express.Router();

// hanya GET daftar jabatan struktural
router.get('/', requireAuth, permit('ref_jabatan_struktural', 'R'), listRefJabatanStruktural);

export default router;
