import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

export const refJabatanFungsionalRouter = Router();

const refJabatanFungsionalCrud = crudFactory({
  table: 'ref_jabatan_fungsional',
  idCol: 'id_jafung',
  allowedCols: ['nama_jafung'],
  resourceKey: 'ref_jabatan_fungsional',
});

refJabatanFungsionalRouter.get('/', requireAuth, permit('ref_jabatan_fungsional'), refJabatanFungsionalCrud.list);
refJabatanFungsionalRouter.get('/:id', requireAuth, permit('ref_jabatan_fungsional'), refJabatanFungsionalCrud.getById);
refJabatanFungsionalRouter.post('/', requireAuth, permit('ref_jabatan_fungsional'), refJabatanFungsionalCrud.create);
refJabatanFungsionalRouter.put('/:id', requireAuth, permit('ref_jabatan_fungsional'), refJabatanFungsionalCrud.update);
refJabatanFungsionalRouter.delete('/:id', requireAuth, permit('ref_jabatan_fungsional'), refJabatanFungsionalCrud.remove);
