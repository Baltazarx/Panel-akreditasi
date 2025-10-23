import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { listPemetaan2b2, updatePemetaan2b2, exportPemetaan2b2 } from '../controllers/pemetaan2b2.controller.js';
import { makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

router.get('/', requireAuth, permit('pemetaan2b2','R'), listPemetaan2b2);
router.post('/', requireAuth, permit('pemetaan2b2','U'), updatePemetaan2b2);
router.get('/export', requireAuth, permit('pemetaan2b2','R'), exportPemetaan2b2);
router.get('/export-doc', requireAuth, permit('pemetaan2b2','R'), makeDocAlias(exportPemetaan2b2));
router.get('/export-pdf', requireAuth, permit('pemetaan2b2','R'), makePdfAlias(exportPemetaan2b2));

export default router;
