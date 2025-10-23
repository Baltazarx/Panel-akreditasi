import { pool } from '../db.js';
import ExcelJS from 'exceljs';
import { buildWhere } from '../utils/queryHelper.js';

/**
 * ============================================================
 * 2B.1 – TABEL ISI PEMBELAJARAN (MK vs PL) - LAPORAN
 * ============================================================
 */

// === LIST (pivot) ===
export const listPemetaan2b1 = async (req, res) => {
  try {
    // === PERBAIKAN: Gunakan buildWhere untuk filter berdasarkan mata_kuliah ===
    const { where, params } = await buildWhere(req, 'mata_kuliah', 'mk');

    // Ambil semua PL yang relevan dengan MK yang sudah difilter
    // Ini membuat header kolom lebih bersih dan relevan
    const sqlPl = `
      SELECT DISTINCT pl.id_pl, pl.kode_pl
      FROM profil_lulusan pl
      JOIN map_cpl_pl m3 ON pl.id_pl = m3.id_pl
      JOIN cpl ON m3.id_cpl = cpl.id_cpl
      JOIN map_cpmk_cpl m2 ON cpl.id_cpl = m2.id_cpl
      JOIN cpmk ON m2.id_cpmk = cpmk.id_cpmk
      JOIN map_cpmk_mk m1 ON cpmk.id_cpmk = m1.id_cpmk
      JOIN mata_kuliah mk ON m1.id_mk = mk.id_mk
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY pl.kode_pl ASC
    `;
    const [plList] = await pool.query(sqlPl, params);

    // Ambil data MK → PL melalui rantai CPMK dan CPL
    // === PERBAIKAN: Terapkan 'where' dan 'params' ke query utama ===
    const sqlRows = `
      SELECT 
        mk.id_mk, mk.kode_mk, mk.nama_mk, mk.sks, mk.semester,
        pl.id_pl, pl.kode_pl
      FROM mata_kuliah mk
      LEFT JOIN map_cpmk_mk m1 ON mk.id_mk = m1.id_mk
      LEFT JOIN cpmk ON m1.id_cpmk = cpmk.id_cpmk
      LEFT JOIN map_cpmk_cpl m2 ON cpmk.id_cpmk = m2.id_cpmk
      LEFT JOIN cpl ON m2.id_cpl = cpl.id_cpl
      LEFT JOIN map_cpl_pl m3 ON cpl.id_cpl = m3.id_cpl
      LEFT JOIN profil_lulusan pl ON m3.id_pl = pl.id_pl
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY mk.kode_mk, pl.kode_pl
    `;
    const [rows] = await pool.query(sqlRows, params);

    // Buat pivot: setiap MK punya daftar PL yang dicapai
    const mkMap = {};
    rows.forEach(r => {
      if (!mkMap[r.id_mk]) {
        mkMap[r.id_mk] = {
          id_mk: r.id_mk,
          kode_mk: r.kode_mk,
          nama_mk: r.nama_mk,
          sks: r.sks,
          semester: r.semester,
          profil_lulusan: {}
        };
      }
      if (r.id_pl) {
        mkMap[r.id_mk].profil_lulusan[r.kode_pl] = true;
      }
    });

    const result = Object.values(mkMap);
    res.json({ columns: plList.map(p => p.kode_pl), data: result });
  } catch (err) {
    console.error("Error listPemetaan2b1:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// === EXPORT EXCEL (pivot matrix) ===
export const exportPemetaan2b1 = async (req, res) => {
  try {
    // === PERBAIKAN: Gunakan buildWhere untuk filter berdasarkan mata_kuliah ===
    const { where, params } = await buildWhere(req, 'mata_kuliah', 'mk');

    const sqlPl = `
      SELECT DISTINCT pl.id_pl, pl.kode_pl
      FROM profil_lulusan pl
      JOIN map_cpl_pl m3 ON pl.id_pl = m3.id_pl
      JOIN cpl ON m3.id_cpl = cpl.id_cpl
      JOIN map_cpmk_cpl m2 ON cpl.id_cpl = m2.id_cpl
      JOIN cpmk ON m2.id_cpmk = cpmk.id_cpmk
      JOIN map_cpmk_mk m1 ON cpmk.id_cpmk = m1.id_cpmk
      JOIN mata_kuliah mk ON m1.id_mk = mk.id_mk
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY pl.kode_pl ASC
    `;
    const [plList] = await pool.query(sqlPl, params);

    const sqlRows = `
      SELECT 
        mk.id_mk, mk.kode_mk, mk.nama_mk, mk.sks, mk.semester,
        pl.id_pl, pl.kode_pl
      FROM mata_kuliah mk
      LEFT JOIN map_cpmk_mk m1 ON mk.id_mk = m1.id_mk
      LEFT JOIN cpmk ON m1.id_cpmk = cpmk.id_cpmk
      LEFT JOIN map_cpmk_cpl m2 ON cpmk.id_cpmk = m2.id_cpmk
      LEFT JOIN cpl ON m2.id_cpl = cpl.id_cpl
      LEFT JOIN map_cpl_pl m3 ON cpl.id_cpl = m3.id_cpl
      LEFT JOIN profil_lulusan pl ON m3.id_pl = pl.id_pl
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY mk.kode_mk, pl.kode_pl
    `;
    const [rows] = await pool.query(sqlRows, params);

    const mkMap = {};
    rows.forEach(r => {
      if (!mkMap[r.id_mk]) {
        mkMap[r.id_mk] = {
          kode_mk: r.kode_mk,
          nama_mk: r.nama_mk,
          sks: r.sks,
          semester: r.semester,
          profil_lulusan: {}
        };
      }
      if (r.kode_pl) mkMap[r.id_mk].profil_lulusan[r.kode_pl] = true;
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 2B.1');
    const header = ['No', 'Mata Kuliah', 'SKS', 'Semester', ...plList.map(p => p.kode_pl)];
    sheet.addRow(header);

    let no = 1;
    Object.values(mkMap).forEach(mk => {
      const row = [
        no++,
        mk.nama_mk,
        mk.sks,
        mk.semester,
        ...plList.map(pl => (mk.profil_lulusan[pl.kode_pl] ? '✅' : ''))
      ];
      sheet.addRow(row);
    });

    sheet.columns.forEach(col => { col.width = 15; });
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Tabel_2B1.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exportPemetaan2b1:", err);
    res.status(500).json({ error: 'Export failed' });
  }
};

