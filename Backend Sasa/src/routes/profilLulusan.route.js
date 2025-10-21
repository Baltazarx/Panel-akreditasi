// src/routes/profilLulusan.route.js
import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import {
  listProfilLulusan,
  getProfilLulusanById,
  createProfilLulusan,
  updateProfilLulusan,
  softDeleteProfilLulusan,
  restoreProfilLulusan,
  hardDeleteProfilLulusan,
} from '../controllers/profilLulusan.controller.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

const router = express.Router();

/**
 * CRUD
 */
router.get('/', requireAuth, permit('profil_lulusan', 'R'), listProfilLulusan);
router.get('/:id', requireAuth, permit('profil_lulusan', 'R'), getProfilLulusanById);
router.post('/', requireAuth, permit('profil_lulusan', 'C'), createProfilLulusan);
router.put('/:id', requireAuth, permit('profil_lulusan', 'U'), updateProfilLulusan);
router.delete('/:id', requireAuth, permit('profil_lulusan', 'D'), softDeleteProfilLulusan);
router.post('/:id/restore', requireAuth, permit('profil_lulusan', 'U'), restoreProfilLulusan);
router.delete('/:id/hard-delete', requireAuth, permit('profil_lulusan', 'H'), hardDeleteProfilLulusan);

/**
 * EXPORT
 */
const meta = {
  resourceKey: 'profil_lulusan',
  table: 'profil_lulusan',
  columns: [
    'id_pl',
    'id_unit_prodi',
    'kode_pl',
    'deskripsi_pl',
  ],
  headers: [
    'ID',
    'Unit Prodi',
    'Kode PL',
    'Deskripsi PL',
  ],
  title: (label) => `Profil Lulusan — ${label}`,
  orderBy: 'pl.id_pl ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

router.get('/export', requireAuth, permit('profil_lulusan', 'R'), exportHandler);
router.post('/export', requireAuth, permit('profil_lulusan', 'R'), exportHandler);
router.get('/export-doc', requireAuth, permit('profil_lulusan', 'R'), makeDocAlias(exportHandler));
router.post('/export-doc', requireAuth, permit('profil_lulusan', 'R'), makeDocAlias(exportHandler));
router.get('/export-pdf', requireAuth, permit('profil_lulusan', 'R'), makePdfAlias(exportHandler));
router.post('/export-pdf', requireAuth, permit('profil_lulusan', 'R'), makePdfAlias(exportHandler));

export default router;
