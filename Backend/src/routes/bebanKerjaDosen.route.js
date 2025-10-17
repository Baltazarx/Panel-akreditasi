// src/routes/bebanKerjaDosen.route.js
import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const bebanKerjaDosenRouter = Router();

const crud = crudFactory({
  table: 'beban_kerja_dosen',
  idCol: 'id_beban_kerja',
  // tambahkan sks_manajemen jika kolom ada
  allowedCols: ['id_dosen','id_tahun','sks_pengajaran','sks_penelitian','sks_pkm','sks_manajemen'],
  resourceKey: 'beban_kerja_dosen',
});

// -------------------- REPORT PLACEHOLDER --------------------
bebanKerjaDosenRouter.get(
  '/report/:id_tahun',
  requireAuth,
  permit('beban_kerja_dosen'),
  async (_req, res) => res.status(501).json({ error: 'Not Implemented (placeholder)' })
);

// -------------------- LIST (dengan filter TS & role/unit) --------------------
const listByYearAndUnit = async (req, res) => {
  const q = req.query || {};
  const tahunParam = q.id_tahun ?? q.tahun ?? null;      // dukung id_tahun atau tahun
  const relasi = q.relasi ?? '0';

  const { id_unit, role } = req.user || {};
  const superRoles = new Set(['waket-1', 'waket-2', 'tpm', 'ketuastikom']);

  // kalau tidak minta relasi, minta tahun (biar tidak beban semua data)
  if (!tahunParam && String(relasi) !== '1') {
    return res.status(400).json({ error: 'Parameter "id_tahun" (atau "tahun") diperlukan' });
  }

  let sql = `
    SELECT
      b.*,
      p.nama_lengkap
    FROM beban_kerja_dosen b
    JOIN dosen d   ON b.id_dosen = d.id_dosen
    JOIN pegawai p ON d.id_pegawai = p.id_pegawai
  `;
  const where = [];
  const params = [];

  if (tahunParam) {
    where.push('b.id_tahun = ?');
    params.push(tahunParam);
  }

  if (!superRoles.has(role)) {
    where.push('p.id_unit = ?');
    params.push(id_unit);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY b.id_dosen ASC, b.id_tahun ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data beban kerja' });
  }
};

bebanKerjaDosenRouter.get('/', requireAuth, permit('beban_kerja_dosen'), listByYearAndUnit);

// -------------------- CRUD standar --------------------
bebanKerjaDosenRouter.get('/:id(\\d+)', requireAuth, permit('beban_kerja_dosen'), crud.getById);
bebanKerjaDosenRouter.post('/', requireAuth, permit('beban_kerja_dosen'), crud.create);
bebanKerjaDosenRouter.put('/:id(\\d+)', requireAuth, permit('beban_kerja_dosen'), crud.update);
bebanKerjaDosenRouter.delete('/:id(\\d+)', requireAuth, permit('beban_kerja_dosen'), crud.remove);
bebanKerjaDosenRouter.post('/:id(\\d+)/restore', requireAuth, permit('beban_kerja_dosen'), crud.restore);
bebanKerjaDosenRouter.post('/restore-multiple', requireAuth, permit('beban_kerja_dosen'), crud.restoreMultiple);
bebanKerjaDosenRouter.delete('/:id(\\d+)/hard-delete', requireAuth, permit('beban_kerja_dosen'), crud.hardRemove);

// -------------------- EXPORT (DOCX/PDF) --------------------
// NOTE: makeExportHandler akan export kolom dari tabel utama (m.*).
// Jika kamu butuh nama dosen (bukan id_dosen), bikin handler custom join pegawai.
// Untuk sekarang, kita export kolom raw sesuai meta.columns.
const meta = {
  resourceKey: 'beban_kerja_dosen',
  table: 'beban_kerja_dosen',
  columns: [
    'id_beban_kerja',
    'id_dosen',
    'id_tahun',
    'sks_pengajaran',
    'sks_penelitian',
    'sks_pkm',
    'sks_manajemen',
  ],
  headers: ['ID','Dosen','Tahun','SKS Pengajaran','SKS Penelitian','SKS PKM','SKS Manajemen'],
  title: (label) => `Beban Kerja Dosen — ${label}`,
  orderBy: 'm.id_beban_kerja ASC',
};
// Export utama: /export?format=docx|pdf + dukung id_tahun / id_tahun_in
const exportHandler = makeExportHandler(meta, { requireYear: false });

bebanKerjaDosenRouter.get('/export', requireAuth, permit('beban_kerja_dosen'), exportHandler);
bebanKerjaDosenRouter.post('/export', requireAuth, permit('beban_kerja_dosen'), exportHandler);

// Alias biar FE lama tetap bisa pakai /export-doc dan /export-pdf
bebanKerjaDosenRouter.get('/export-doc', requireAuth, permit('beban_kerja_dosen'), makeDocAlias(exportHandler));
bebanKerjaDosenRouter.post('/export-doc', requireAuth, permit('beban_kerja_dosen'), makeDocAlias(exportHandler));
bebanKerjaDosenRouter.get('/export-pdf', requireAuth, permit('beban_kerja_dosen'), makePdfAlias(exportHandler));
bebanKerjaDosenRouter.post('/export-pdf', requireAuth, permit('beban_kerja_dosen'), makePdfAlias(exportHandler));
