import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const tabel2a1MahasiswaBaruAktifRouter = Router();

const listTabel2a1MahasiswaBaruAktif = async (req, res) => {
  const q = req.query || {};
  const idUnitProdiParam = q.id_unit_prodi ?? null;
  const idTahunParam = q.id_tahun ?? q.tahun ?? null;
  const jenisParam = q.jenis ?? null;
  const jalurParam = q.jalur ?? null;

  let sql = `
    SELECT
      maba.*,
      uk.nama_unit AS nama_unit_prodi,
      ta.tahun AS tahun_akademik
    FROM tabel_2a1_mahasiswa_baru_aktif maba
    LEFT JOIN unit_kerja uk ON maba.id_unit_prodi = uk.id_unit
    LEFT JOIN tahun_akademik ta ON maba.id_tahun = ta.id_tahun
  `;
  const where = [];
  const params = [];

  if (idUnitProdiParam) {
    where.push('maba.id_unit_prodi = ?');
    params.push(idUnitProdiParam);
  }
  if (idTahunParam) {
    where.push('maba.id_tahun = ?');
    params.push(idTahunParam);
  }
  if (jenisParam) {
    where.push('maba.jenis = ?');
    params.push(jenisParam);
  }
  if (jalurParam) {
    where.push('maba.jalur = ?');
    params.push(jalurParam);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY maba.id ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data mahasiswa baru aktif' });
  }
};

const crud = crudFactory({
  table: 'tabel_2a1_mahasiswa_baru_aktif',
  idCol: 'id',
  allowedCols: [
    'id_unit_prodi',
    'id_tahun',
    'daya_tampung',
    'jenis',
    'jalur',
    'jumlah_diterima',
    'jumlah_afirmasi',
    'jumlah_kebutuhan_khusus',
  ],
  resourceKey: 'tabel_2a1_mahasiswa_baru_aktif',
  list: listTabel2a1MahasiswaBaruAktif,
});

// ---- CRUD ----
tabel2a1MahasiswaBaruAktifRouter.get('/', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), crud.list);
tabel2a1MahasiswaBaruAktifRouter.get('/:id(\d+)', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), crud.getById);
tabel2a1MahasiswaBaruAktifRouter.post('/', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), crud.create);

// --- Endpoint untuk update daya_tampung ---
tabel2a1MahasiswaBaruAktifRouter.put(
  '/daya-tampung',
  requireAuth,
  permit('tabel_2a1_mahasiswa_baru_aktif'),
  async (req, res) => {
    try {
      const { id_unit_prodi, id_tahun, daya_tampung } = req.body;
      if (!id_unit_prodi || !id_tahun || daya_tampung === undefined) {
        return res.status(400).json({ error: 'id_unit_prodi, id_tahun, dan daya_tampung diperlukan' });
      }

      const [result] = await pool.query(
        `UPDATE tabel_2a1_mahasiswa_baru_aktif
         SET daya_tampung = ?
         WHERE id_unit_prodi = ? AND id_tahun = ?`,
        [daya_tampung, id_unit_prodi, id_tahun]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Data daya tampung tidak ditemukan untuk diupdate' });
      }

      res.json({ message: 'Daya tampung berhasil diperbarui', affectedRows: result.affectedRows });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Gagal memperbarui daya tampung' });
    }
  }
);

tabel2a1MahasiswaBaruAktifRouter.put('/:id', crud.update);
tabel2a1MahasiswaBaruAktifRouter.delete('/:id', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), crud.remove);
tabel2a1MahasiswaBaruAktifRouter.post('/:id/restore', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), crud.restore);
tabel2a1MahasiswaBaruAktifRouter.delete('/:id/hard-delete', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'tabel_2a1_mahasiswa_baru_aktif',
  table: 'tabel_2a1_mahasiswa_baru_aktif',
  columns: [
    'id',
    'id_unit_prodi',
    'id_tahun',
    'jenis',
    'jalur',
    'jumlah_diterima',
    'jumlah_afirmasi',
    'jumlah_kebutuhan_khusus',
  ],
  headers: [
    'ID',
    'Unit Prodi',
    'Tahun',
    'Jenis',
    'Jalur',
    'Jumlah Total',
    'Jumlah Afirmasi',
    'Jumlah Kebutuhan Khusus',
  ],
  title: (label) => `Mahasiswa Baru Aktif — ${label}`,
  orderBy: 'm.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: true });

// Endpoint utama: /export (GET/POST) + ?format=docx|pdf + dukung id_tahun / id_tahun_in / tahun
tabel2a1MahasiswaBaruAktifRouter.get('/export', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), exportHandler);
tabel2a1MahasiswaBaruAktifRouter.post('/export', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), exportHandler);

// Alias agar FE lama yang pakai /export-doc & /export-pdf tetap jalan
tabel2a1MahasiswaBaruAktifRouter.get('/export-doc', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), makeDocAlias(exportHandler));
tabel2a1MahasiswaBaruAktifRouter.post('/export-doc', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), makeDocAlias(exportHandler));
tabel2a1MahasiswaBaruAktifRouter.get('/export-pdf', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), makePdfAlias(exportHandler));
tabel2a1MahasiswaBaruAktifRouter.post('/export-pdf', requireAuth, permit('tabel_2a1_mahasiswa_baru_aktif'), makePdfAlias(exportHandler));