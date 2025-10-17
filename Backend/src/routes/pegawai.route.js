// src/routes/pegawai.route.js
import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

export const pegawaiRouter = Router();

// TODO: Sesuaikan allowedCols agar match schema DB tabel `pegawai`
const pegawaiCrud = crudFactory({
  table: 'pegawai',
  idCol: 'id_pegawai',
  allowedCols: ['nama_lengkap', 'pendidikan_terakhir'], // Sesuaikan dengan kolom tabel pegawai
  resourceKey: 'pegawai',
});

pegawaiRouter.get('/',      requireAuth, permit('pegawai'), pegawaiCrud.list);
pegawaiRouter.get('/:id',   requireAuth, permit('pegawai'), pegawaiCrud.getById);
pegawaiRouter.post('/',     requireAuth, permit('pegawai'), pegawaiCrud.create);
pegawaiRouter.put('/:id',   requireAuth, permit('pegawai'), pegawaiCrud.update);
pegawaiRouter.delete('/:id', requireAuth, permit('pegawai'), pegawaiCrud.remove);
