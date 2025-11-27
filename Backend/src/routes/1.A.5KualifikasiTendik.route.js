import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

// [PERBAIKAN] Nama fungsi harus SAMA PERSIS dengan yang di-export di Controller
import { 
    listKualifikasiTendik, 
    exportKualifikasiTendik 
} from '../controllers/1.A.5KualifikasiTendik.controller.js'; 

const router = express.Router();
const resourceKey = 'tabel_1a5'; // Pastikan key ini ada di roles.js

/*
================================
 DEFINISI RUTE (READ-ONLY)
================================
*/

// Hanya ada GET (List & Export)
// Tidak ada POST/PUT/DELETE karena data dihitung otomatis dari Pegawai & Tendik
router.get('/export', requireAuth, permit(resourceKey, 'R'), exportKualifikasiTendik);
router.get('/', requireAuth, permit(resourceKey, 'R'), listKualifikasiTendik);

export default router;