import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listTabel6KesesuaianVisiMisi,
  getTabel6KesesuaianVisiMisiById,
  getTabel6KesesuaianVisiMisiByProdi,
  createTabel6KesesuaianVisiMisi,
  updateTabel6KesesuaianVisiMisi,
  softDeleteTabel6KesesuaianVisiMisi,
  restoreTabel6KesesuaianVisiMisi,
  hardDeleteTabel6KesesuaianVisiMisi,
  exportTabel6KesesuaianVisiMisi
} from '../controllers/tabel6KesesuaianVisiMisi.controller.js';

const router = express.Router();
const resourceKey = 'tabel_6_kesesuaian_visi_misi';

// Routes
router.get('/', requireAuth, permit(resourceKey, 'R'), listTabel6KesesuaianVisiMisi);
router.get('/prodi/:id_unit_prodi', requireAuth, permit(resourceKey, 'R'), getTabel6KesesuaianVisiMisiByProdi);
router.get('/:id', requireAuth, permit(resourceKey, 'R'), getTabel6KesesuaianVisiMisiById);
router.post('/', requireAuth, permit(resourceKey, 'C'), createTabel6KesesuaianVisiMisi);
router.put('/:id', requireAuth, permit(resourceKey, 'U'), updateTabel6KesesuaianVisiMisi);
router.delete('/:id', requireAuth, permit(resourceKey, 'D'), softDeleteTabel6KesesuaianVisiMisi);
router.post('/:id/restore', requireAuth, permit(resourceKey, 'U'), restoreTabel6KesesuaianVisiMisi);
router.delete('/:id/hard', requireAuth, permit(resourceKey, 'H'), hardDeleteTabel6KesesuaianVisiMisi);

// Export Excel
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportTabel6KesesuaianVisiMisi);

export default router;

