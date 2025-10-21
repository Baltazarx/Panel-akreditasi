import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

export const mataKuliahRouter = Router();

const crud = crudFactory({
  table: 'mata_kuliah',
  idCol: 'id_mk',
  allowedCols: ['id_unit_prodi', 'kode_mk', 'nama_mk', 'sks', 'semester'],
  resourceKey: 'mata_kuliah',
});

// ---- CRUD ----
mataKuliahRouter.get('/', requireAuth, permit('mata_kuliah'), crud.list);
mataKuliahRouter.get('/:id(\\d+)', requireAuth, permit('mata_kuliah'), crud.getById);
mataKuliahRouter.post('/', requireAuth, permit('mata_kuliah'), crud.create);
mataKuliahRouter.put('/:id', requireAuth, permit('mata_kuliah'), crud.update);
mataKuliahRouter.delete('/:id', requireAuth, permit('mata_kuliah'), crud.remove);
mataKuliahRouter.post('/:id/restore', requireAuth, permit('mata_kuliah'), crud.restore);
mataKuliahRouter.delete('/:id/hard-delete', requireAuth, permit('mata_kuliah'), crud.hardRemove);

export default mataKuliahRouter;
