import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

export const tabel2a3KondisiMahasiswaRouter = Router();

// ===== LIST: Ambil maba+aktif dari tabel_2a1, lulus+do dari tabel_2a3 =====
const listTabel2a3KondisiMahasiswa = async (req, res) => {
  try {
    const sql = `
      SELECT 
          t1.id_unit_prodi,
          t1.id_tahun,
          SUM(CASE WHEN t1.jenis = 'baru' THEN 
              (t1.jumlah_diterima + t1.jumlah_afirmasi + t1.jumlah_kebutuhan_khusus) ELSE 0 END) AS jumlah_maba,
          SUM(CASE WHEN t1.jenis = 'aktif' THEN 
              (t1.jumlah_diterima + t1.jumlah_afirmasi + t1.jumlah_kebutuhan_khusus) ELSE 0 END) AS jumlah_mhs_aktif,
          COALESCE(t3.jml_lulus, 0) AS jml_lulus,
          COALESCE(t3.jml_do, 0) AS jml_do
      FROM tabel_2a1_mahasiswa_baru_aktif t1
      LEFT JOIN tabel_2a3_kondisi_mahasiswa t3
             ON t1.id_unit_prodi = t3.id_unit_prodi
            AND t1.id_tahun = t3.id_tahun
      WHERE t1.jenis IN ('baru','aktif')
      GROUP BY t1.id_unit_prodi, t1.id_tahun, t3.jml_lulus, t3.jml_do
      ORDER BY t1.id_tahun;
    `;

    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (e) {
    console.error("Error listTabel2a3:", e);
    res.status(500).json({ error: 'Gagal memuat data kondisi mahasiswa' });
  }
};

// ===== CRUD Factory (khusus lulus/do) =====
const crud = crudFactory({
  table: 'tabel_2a3_kondisi_mahasiswa',
  idCol: 'id',
  allowedCols: [
    'id_unit_prodi',
    'id_tahun',
    'jml_lulus',
    'jml_do',
  ],
  resourceKey: 'tabel_2a3_kondisi_mahasiswa',
  list: listTabel2a3KondisiMahasiswa,
});

// ---- CRUD ----
tabel2a3KondisiMahasiswaRouter.get('/', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), crud.list);
tabel2a3KondisiMahasiswaRouter.get('/:id(\\d+)', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), crud.getById);
tabel2a3KondisiMahasiswaRouter.post('/', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), crud.create);
tabel2a3KondisiMahasiswaRouter.put('/:id(\\d+)', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), crud.update);
tabel2a3KondisiMahasiswaRouter.delete('/:id', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), crud.remove);
tabel2a3KondisiMahasiswaRouter.post('/:id/restore', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), crud.restore);
tabel2a3KondisiMahasiswaRouter.delete('/:id/hard-delete', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), crud.hardRemove);

// ---- EXPORT (DOCX/PDF, TS-aware) ----
const meta = {
  resourceKey: 'tabel_2a3_kondisi_mahasiswa',
  table: 'tabel_2a3_kondisi_mahasiswa',
  columns: [
    'id',
    'id_unit_prodi',
    'id_tahun',
    'jml_lulus',
    'jml_do',
  ],
  headers: [
    'ID',
    'Unit Prodi',
    'Tahun',
    'Jumlah Lulus',
    'Jumlah DO',
  ],
  title: (label) => `Kondisi Mahasiswa — ${label}`,
  orderBy: 'm.id ASC',
};

const exportHandler = makeExportHandler(meta, { requireYear: true });

tabel2a3KondisiMahasiswaRouter.get('/export', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), exportHandler);
tabel2a3KondisiMahasiswaRouter.post('/export', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), exportHandler);
tabel2a3KondisiMahasiswaRouter.get('/export-doc', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), makeDocAlias(exportHandler));
tabel2a3KondisiMahasiswaRouter.post('/export-doc', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), makeDocAlias(exportHandler));
tabel2a3KondisiMahasiswaRouter.get('/export-pdf', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), makePdfAlias(exportHandler));
tabel2a3KondisiMahasiswaRouter.post('/export-pdf', requireAuth, permit('tabel_2a3_kondisi_mahasiswa'), makePdfAlias(exportHandler));

export default tabel2a3KondisiMahasiswaRouter;
