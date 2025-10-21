import { pool } from '../db.js';
import { makeExportHandler, makeDocAlias, makePdfAlias } from '../utils/exporter.js';

/**
 * =============================================
 * ============ TABEL 2.B.1 – Isi Pembelajaran =
 * =============================================
 */
export const tabel2b1 = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        mk.kode_mk,
        mk.nama_mk,
        mk.sks,
        mk.semester,
        GROUP_CONCAT(DISTINCT cpl.kode_cpl SEPARATOR ', ') AS cpl_terkait,
        GROUP_CONCAT(DISTINCT pl.kode_pl SEPARATOR ', ') AS pl_terkait
      FROM mata_kuliah mk
      LEFT JOIN map_cpl_mk mcm ON mk.id_mk = mcm.id_mk
      LEFT JOIN cpl ON mcm.id_cpl = cpl.id_cpl
      LEFT JOIN map_cpl_pl mcp ON cpl.id_cpl = mcp.id_cpl
      LEFT JOIN profil_lulusan pl ON mcp.id_pl = pl.id_pl
      WHERE mk.id_unit_prodi = ?
      GROUP BY mk.id_mk
      ORDER BY mk.semester ASC, mk.kode_mk ASC
    `, [req.user.id_unit]);
    res.json(rows);
  } catch (err) {
    console.error('Error tabel2b1:', err);
    res.status(500).json({ error: 'Gagal mengambil data Tabel 2.B.1' });
  }
};

/**
 * =============================================
 * ============ TABEL 2.B.2 – CPL vs PL =========
 * =============================================
 */
export const tabel2b2 = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        cpl.kode_cpl,
        cpl.deskripsi_cpl,
        GROUP_CONCAT(DISTINCT pl.kode_pl SEPARATOR ', ') AS pl_terkait
      FROM cpl
      LEFT JOIN map_cpl_pl mcp ON cpl.id_cpl = mcp.id_cpl
      LEFT JOIN profil_lulusan pl ON mcp.id_pl = pl.id_pl
      WHERE cpl.id_unit_prodi = ?
      GROUP BY cpl.id_cpl
      ORDER BY cpl.kode_cpl ASC
    `, [req.user.id_unit]);
    res.json(rows);
  } catch (err) {
    console.error('Error tabel2b2:', err);
    res.status(500).json({ error: 'Gagal mengambil data Tabel 2.B.2' });
  }
};

/**
 * =============================================
 * ============ TABEL 2.B.3 – CPL vs MK =========
 * =============================================
 */
export const tabel2b3 = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        cpl.kode_cpl,
        cpl.deskripsi_cpl,
        GROUP_CONCAT(DISTINCT CONCAT(mk.kode_mk, ' (S', mk.semester, ')') SEPARATOR ', ') AS mk_terkait
      FROM cpl
      LEFT JOIN map_cpl_mk mcm ON cpl.id_cpl = mcm.id_cpl
      LEFT JOIN mata_kuliah mk ON mcm.id_mk = mk.id_mk
      WHERE cpl.id_unit_prodi = ?
      GROUP BY cpl.id_cpl
      ORDER BY cpl.kode_cpl ASC
    `, [req.user.id_unit]);
    res.json(rows);
  } catch (err) {
    console.error('Error tabel2b3:', err);
    res.status(500).json({ error: 'Gagal mengambil data Tabel 2.B.3' });
  }
};

/**
 * EXPORTERS (XLSX, DOCX, PDF)
 */
export const exportHandlers = {
  tabel2b1: makeExportHandler({
    table: 'laporan_tabel_2b1',
    title: (label) => `Tabel 2.B.1 – Isi Pembelajaran (${label})`,
    headers: ['Kode MK', 'Nama MK', 'SKS', 'Semester', 'CPL Terkait', 'Profil Lulusan'],
    columns: ['kode_mk', 'nama_mk', 'sks', 'semester', 'cpl_terkait', 'pl_terkait'],
  }),
  tabel2b2: makeExportHandler({
    table: 'laporan_tabel_2b2',
    title: (label) => `Tabel 2.B.2 – Pemetaan CPL dan PL (${label})`,
    headers: ['Kode CPL', 'Deskripsi CPL', 'Profil Lulusan Terkait'],
    columns: ['kode_cpl', 'deskripsi_cpl', 'pl_terkait'],
  }),
  tabel2b3: makeExportHandler({
    table: 'laporan_tabel_2b3',
    title: (label) => `Tabel 2.B.3 – Peta Pemenuhan CPL (${label})`,
    headers: ['Kode CPL', 'Deskripsi CPL', 'Mata Kuliah & Semester'],
    columns: ['kode_cpl', 'deskripsi_cpl', 'mk_terkait'],
  }),
};
