import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';

export const mapCplPlRouter = Router();

const crud = crudFactory({
  table: 'map_cpl_pl',
  idCol: ['id_cpl', 'id_pl'], // Set idCol to an array for composite key
  // allowedCols: ['id_cpl', 'id_pl'], // Removed allowedCols since we will handle it manually
  resourceKey: 'map_cpl_pl',
  softDelete: false,
  withRestore: false,
});

// ---- CRUD ----
mapCplPlRouter.get('/', requireAuth, permit('map_cpl_pl'), crud.list);
mapCplPlRouter.get('/:id_cpl/:id_pl', requireAuth, permit('map_cpl_pl'), crud.getById);
mapCplPlRouter.post('/', requireAuth, permit('map_cpl_pl'), crud.create);
mapCplPlRouter.put('/:id_cpl/:id_pl', requireAuth, permit('map_cpl_pl'), crud.updateComposite);
mapCplPlRouter.delete('/:id_cpl/:id_pl', requireAuth, permit('map_cpl_pl'), crud.removeComposite);
// Restore and hard-delete routes for composite keys are not directly supported by generic crud. Will be removed or custom implemented if needed
// mapCplPlRouter.post('/:id/restore', requireAuth, permit('map_cpl_pl'), crud.restore);
// mapCplPlRouter.delete('/:id/hard-delete', requireAuth, permit('map_cpl_pl'), crud.hardRemove);

export default mapCplPlRouter;
