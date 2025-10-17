// src/routes/auditMutuInternal.route.js
import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js'; // Tambahkan import pool
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const auditMutuInternalRouter = Router();

// Fungsi list kustom dengan JOIN ke unit_kerja
const listAuditMutuInternal = async (req, res) => {
  const q = req.query || {};
  const tahunParam = q.id_tahun ?? q.tahun ?? null; // Dukung id_tahun atau tahun

  let sql = `
    SELECT
      ami.*,
      uk.nama_unit
    FROM audit_mutu_internal ami
    LEFT JOIN unit_kerja uk ON ami.id_unit = uk.id_unit
  `;
  const where = [];
  const params = [];

  if (tahunParam) {
    where.push('ami.id_tahun = ?');
    params.push(tahunParam);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY ami.id_ami ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data audit mutu internal' });
  }
};

const crud = crudFactory({
  table: 'audit_mutu_internal',
  idCol: 'id_ami',
  allowedCols: [
    'id_unit','id_tahun','frekuensi_audit','dokumen_spmi','laporan_audit_url',
    'jumlah_auditor_certified','jumlah_auditor_noncertified', 'bukti_certified_url'
  ],
  resourceKey: 'audit_mutu_internal',
  // Override list method
  list: listAuditMutuInternal,
});

// ---- CRUD ----
console.log("[auditMutuInternalRouter] Registering CRUD routes..."); // Added console.log
auditMutuInternalRouter.get('/', requireAuth, permit('audit_mutu_internal'), crud.list);
auditMutuInternalRouter.get('/:id(\d+)', requireAuth, permit('audit_mutu_internal'), crud.getById);
auditMutuInternalRouter.post('/', requireAuth, permit('audit_mutu_internal'), crud.create);
auditMutuInternalRouter.put('/:id(\d+)', requireAuth, permit('audit_mutu_internal'), crud.update);
auditMutuInternalRouter.delete('/:id', requireAuth, permit('audit_mutu_internal'), crud.remove);
auditMutuInternalRouter.post('/:id/restore', requireAuth, permit('audit_mutu_internal'), crud.restore);
auditMutuInternalRouter.delete('/:id/hard-delete', requireAuth, permit('audit_mutu_internal'), crud.hardRemove); // New hard delete route

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'audit_mutu_internal',
  table: 'audit_mutu_internal',
  columns: [
    'id_ami',
    'id_unit',
    'id_tahun',
    'frekuensi_audit',
    'dokumen_spmi',
    'laporan_audit_url',
    'jumlah_auditor_certified',
    'jumlah_auditor_noncertified',
  ],
  headers: [
    'ID',
    'Unit',
    'Tahun',
    'Frekuensi',
    'Dokumen SPMI',
    'Laporan Audit URL',
    'Auditor Certified',
    'Auditor Non-Certified',
  ],
  title: (label) => `Audit Mutu Internal — ${label}`, // label otomatis: "Tahun 2024" / "Tahun 5,6,7" / "Semua Tahun"
  orderBy: 'm.id_ami ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: false });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
auditMutuInternalRouter.get('/export', requireAuth, permit('audit_mutu_internal'), exportHandler);
auditMutuInternalRouter.post('/export', requireAuth, permit('audit_mutu_internal'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
auditMutuInternalRouter.get('/export-doc', requireAuth, permit('audit_mutu_internal'), makeDocAlias(exportHandler));
auditMutuInternalRouter.post('/export-doc', requireAuth, permit('audit_mutu_internal'), makeDocAlias(exportHandler));
auditMutuInternalRouter.get('/export-pdf', requireAuth, permit('audit_mutu_internal'), makePdfAlias(exportHandler));
auditMutuInternalRouter.post('/export-pdf', requireAuth, permit('audit_mutu_internal'), makePdfAlias(exportHandler));

export default auditMutuInternalRouter;