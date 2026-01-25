import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listSummaryDtpr,
  getSummaryDtprById,
  saveSummaryDtpr,
  softDeleteSummaryDtpr,
  restoreSummaryDtpr,
  hardDeleteSummaryDtpr,
  listDetailPengembangan,
  getDetailPengembanganById,
  createDetailPengembangan,
  updateDetailPengembangan,
  softDeleteDetailPengembangan,
  restoreDetailPengembangan,
  hardDeleteDetailPengembangan,
  exportTabel3a3
} from '../controllers/tabel3a3PengembanganDtpr.controller.js';

const router = express.Router();
const resourceKey = 'tabel_3a3_pengembangan_dtpr';

// === SUMMARY (Jumlah DTPR) ===
router.get('/summary', requireAuth, permit(resourceKey, 'R'), listSummaryDtpr);
router.get('/summary/:id', requireAuth, permit(resourceKey, 'R'), getSummaryDtprById);
router.post('/summary', requireAuth, permit(resourceKey, 'C'), saveSummaryDtpr);
router.put('/summary/:id', requireAuth, permit(resourceKey, 'U'), saveSummaryDtpr);
router.delete('/summary/:id', requireAuth, permit(resourceKey, 'D'), softDeleteSummaryDtpr);
router.post('/summary/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreSummaryDtpr);
router.delete('/summary/:id/hard', requireAuth, permit(resourceKey, 'D'), hardDeleteSummaryDtpr);

// === DETAIL (Pengembangan DTPR) ===
router.get('/detail', requireAuth, permit(resourceKey, 'R'), listDetailPengembangan);
router.get('/detail/:id', requireAuth, permit(resourceKey, 'R'), getDetailPengembanganById);
router.post('/detail', requireAuth, permit(resourceKey, 'C'), createDetailPengembangan);
router.put('/detail/:id', requireAuth, permit(resourceKey, 'U'), updateDetailPengembangan);
router.delete('/detail/:id', requireAuth, permit(resourceKey, 'D'), softDeleteDetailPengembangan);
router.post('/detail/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreDetailPengembangan);
router.delete('/detail/:id/hard', requireAuth, permit(resourceKey, 'D'), hardDeleteDetailPengembangan);

// === EXPORT ===
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel3a3);

export default router;

