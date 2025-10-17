// src/routes/unitSpmi.route.js (1.B)
import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { crudFactory } from '../utils/crudFactory.js';

const factory = crudFactory({
  table: 'unit_spmi',
  idCol: 'id_spmi',
  resourceKey: 'tabel_1b',
  allowedCols: [
    'id_unit','id_tahun','dokumen_spmi',
    'jumlah_auditor_certified','jumlah_auditor_noncertified',
    'frekuensi_tahun','bukti_certified_url','laporan_audit_uri'
  ] // sesuai struktur di dump :contentReference[oaicite:21]{index=21}
});

export const unitSpmiRouter = Router();
unitSpmiRouter.use(requireAuth, permit('tabel_1b'));
unitSpmiRouter.get('/', factory.list);
unitSpmiRouter.get('/:id', factory.getById);
unitSpmiRouter.post('/', factory.create);
unitSpmiRouter.put('/:id', factory.update);
unitSpmiRouter.delete('/:id', factory.remove);
