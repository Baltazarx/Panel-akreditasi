import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { 
    listPemetaanCpmkCpl, 
    updatePemetaanCpmkCpl, 
    exportPemetaanCpmkCpl 
} from '../controllers/pemetaanCpmkCpl.controller.js';
import { makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

router.get('/', requireAuth, permit('pemetaanCpmkCpl','R'), listPemetaanCpmkCpl);
router.post('/', requireAuth, permit('pemetaanCpmkCpl','U'), updatePemetaanCpmkCpl);
router.get('/export', requireAuth, permit('pemetaanCpmkCpl','R'), exportPemetaanCpmkCpl);
router.get('/export-doc', requireAuth, permit('pemetaanCpmkCpl','R'), makeDocAlias(exportPemetaanCpmkCpl));
router.get('/export-pdf', requireAuth, permit('pemetaanCpmkCpl','R'), makePdfAlias(exportPemetaanCpmkCpl));

export default router;
