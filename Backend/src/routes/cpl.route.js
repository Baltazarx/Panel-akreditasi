import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const cplRouter = Router();

const crud = crudFactory({
  table: 'cpl',
  idCol: 'id_cpl',
  allowedCols: ['id_unit_prodi', 'kode_cpl', 'deskripsi_cpl'],
  resourceKey: 'cpl',
});

// ---- CRUD ----
cplRouter.get('/', requireAuth, permit('cpl'), crud.list);
cplRouter.get('/:id(\d+)', requireAuth, permit('cpl'), crud.getById);
cplRouter.post('/', requireAuth, permit('cpl'), crud.create);
cplRouter.put('/:id', (req, res, next) => { console.log('CPL PUT route hit! (no regex)', req.params.id); next(); }, requireAuth, permit('cpl'), crud.update);
cplRouter.delete('/:id', requireAuth, permit('cpl'), crud.remove);
cplRouter.post('/:id/restore', requireAuth, permit('cpl'), crud.restore);
cplRouter.delete('/:id/hard-delete', requireAuth, permit('cpl'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'cpl',
  table: 'cpl',
  columns: [
    'id_cpl',
    'id_kurikulum',
    'kode_cpl',
    'deskripsi_cpl',
  ],
  headers: [
    'ID CPL',
    'ID Kurikulum',
    'Kode CPL',
    'Deskripsi CPL',
  ],
  title: (label) => `CPL — ${label}`,
  orderBy: 'm.id_cpl ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
cplRouter.get('/export', requireAuth, permit('cpl'), exportHandler);
cplRouter.post('/export', requireAuth, permit('cpl'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
cplRouter.get('/export-doc', requireAuth, permit('cpl'), makeDocAlias(exportHandler));
cplRouter.post('/export-doc', requireAuth, permit('cpl'), makeDocAlias(exportHandler));
cplRouter.get('/export-pdf', requireAuth, permit('cpl'), makePdfAlias(exportHandler));
cplRouter.post('/export-pdf', requireAuth, permit('cpl'), makePdfAlias(exportHandler));

export default cplRouter;
