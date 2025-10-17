// src/routes/tendik.route.js
import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

export const tendikRouter = Router();

const crud = crudFactory({
  table: 'tenaga_kependidikan',
  idCol: 'id_tendik',
  allowedCols: ['id_pegawai', 'nikp'],
  resourceKey: 'tenaga_kependidikan',
});

tendikRouter.get('/', requireAuth, permit('tenaga_kependidikan'), crud.list);
tendikRouter.get('/:id', requireAuth, permit('tenaga_kependidikan'), crud.getById);
tendikRouter.post('/', requireAuth, permit('tenaga_kependidikan'), crud.create);
tendikRouter.put('/:id', requireAuth, permit('tenaga_kependidikan'), crud.update);
tendikRouter.delete('/:id', requireAuth, permit('tenaga_kependidikan'), crud.remove);
