import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const cpmkRouter = Router();

const crud = crudFactory({
  table: 'cpmk',
  idCol: 'id_cpmk',
  allowedCols: ['id_unit_prodi', 'kode_cpmk', 'deskripsi_cpmk'],
  resourceKey: 'cpmk',
});

// ---- CRUD ----
cpmkRouter.get('/', requireAuth, permit('cpmk'), crud.list);
cpmkRouter.get('/:id(\\d+)', requireAuth, permit('cpmk'), crud.getById);
cpmkRouter.post('/', requireAuth, permit('cpmk'), crud.create);
cpmkRouter.put('/:id', requireAuth, permit('cpmk'), crud.update);
cpmkRouter.delete('/:id', requireAuth, permit('cpmk'), crud.remove);
cpmkRouter.post('/:id/restore', requireAuth, permit('cpmk'), crud.restore);
cpmkRouter.delete('/:id/hard-delete', requireAuth, permit('cpmk'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'cpmk',
  table: 'cpmk',
  columns: [
    'id_cpmk',
    'id_unit_prodi',
    'kode_cpmk',
    'deskripsi_cpmk',
  ],
  headers: [
    'ID CPMK',
    'ID Unit Prodi',
    'Kode CPMK',
    'Deskripsi CPMK',
  ],
  title: (label) => `CPMK — ${label}`,
  orderBy: 'm.id_cpmk ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
cpmkRouter.get('/export', requireAuth, permit('cpmk'), exportHandler);
cpmkRouter.post('/export', requireAuth, permit('cpmk'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
cpmkRouter.get('/export-doc', requireAuth, permit('cpmk'), makeDocAlias(exportHandler));
cpmkRouter.post('/export-doc', requireAuth, permit('cpmk'), makeDocAlias(exportHandler));
cpmkRouter.get('/export-pdf', requireAuth, permit('cpmk'), makePdfAlias(exportHandler));
cpmkRouter.post('/export-pdf', requireAuth, permit('cpmk'), makePdfAlias(exportHandler));

export default cpmkRouter;
