// src/routes/tahun.route.js
import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

export const tahunRouter = Router();

// Konfigurasi crudFactory disederhanakan
const tahunCrud = crudFactory({
  table: 'tahun_akademik',
  idCol: 'id_tahun',
  // Kolom 'semester' dihapus dari daftar kolom yang diizinkan
  allowedCols: ['tahun'], 
  resourceKey: 'tahun_akademik', // Menggunakan nama tabel agar konsisten
});

// Middleware otentikasi dan otorisasi diterapkan ke semua rute di bawahnya
tahunRouter.use(requireAuth, permit('tahun_akademik'));

// Definisi rute CRUD
tahunRouter.get('/', tahunCrud.list);
tahunRouter.get('/:id', tahunCrud.getById);
tahunRouter.post('/', tahunCrud.create);
tahunRouter.put('/:id', tahunCrud.update);
tahunRouter.delete('/:id', tahunCrud.remove);
