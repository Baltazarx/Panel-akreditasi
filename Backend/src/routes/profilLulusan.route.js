import express from 'express';
const router = express.Router();
import { pool } from '../db.js';
import { requireAuth as authenticateToken } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { crudFactory } from '../utils/crudFactory.js';

// Create (Hanya Superadmin)
router.post('/', authenticateToken, permit(['superadmin']), crudFactory({ table: 'profil_lulusan', allowedCols: ['id_unit_prodi', 'kode_pl', 'deskripsi_pl'], idCol: 'id_pl' }).create);

// Read All (Semua bisa baca)
router.get('/', authenticateToken, permit(['superadmin', 'waket-1', 'waket-2', 'prodi-ti', 'prodi-mi', 'dosen', 'tpm', 'pimpinan']), crudFactory({ table: 'profil_lulusan', idCol: 'id_pl' }).list);

// Read One (Semua bisa baca)
router.get('/:id', authenticateToken, permit(['superadmin', 'waket-1', 'waket-2', 'prodi-ti', 'prodi-mi', 'dosen', 'tpm', 'pimpinan']), crudFactory({ table: 'profil_lulusan', idCol: 'id_pl' }).getById);

// Update (Hanya Superadmin)
router.put('/:id', authenticateToken, permit(['superadmin']), crudFactory({ table: 'profil_lulusan', allowedCols: ['id_unit_prodi', 'kode_pl', 'deskripsi_pl'], idCol: 'id_pl' }).update);

// Delete (Hanya Superadmin)
router.delete('/:id', authenticateToken, permit(['superadmin']), crudFactory({ table: 'profil_lulusan', idCol: 'id_pl' }).remove);

export default router;
