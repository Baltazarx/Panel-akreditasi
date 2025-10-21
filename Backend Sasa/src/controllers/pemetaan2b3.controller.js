import { pool } from '../db.js';
import { buildWhere } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

/**
 * ============================================================
 * TABEL 2.B.3 — PETA PEMENUHAN CPL
 * ============================================================
 */

// === LIST (JSON) ===
export const listPemetaan2b3 = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'cpl', 'c');

    // Ambil semua semester yang ada di mata_kuliah
    const [semRows] = await pool.query(`SELECT DISTINCT semester FROM mata_kuliah ORDER BY semester ASC`);
    const semesters = semRows.map(r => r.semester);

    // Ambil data utama (relasi CPL-CPMK-MK)
    const sql = `
      SELECT
        c.id_cpl,
        c.kode_cpl,
        cpmk.id_cpmk,
        cpmk.kode_cpmk,
        mk.kode_mk,
        mk.semester
      FROM cpl c
      JOIN map_cpmk_cpl mc1 ON c.id_cpl = mc1.id_cpl
      JOIN cpmk ON mc1.id_cpmk = cpmk.id_cpmk
      JOIN map_cpmk_mk mc2 ON cpmk.id_cpmk = mc2.id_cpmk
      JOIN mata_kuliah mk ON mc2.id_mk = mk.id_mk
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY c.kode_cpl, cpmk.kode_cpmk, mk.semester
    `;
    
    // ======================================================================
    // === DEBUGGING: Cetak query dan parameter final sebelum dieksekusi ===
    // ======================================================================
    console.log("\n================== DEBUG START ==================");
    console.log("Final SQL Query yang akan dieksekusi oleh Node.js:");
    console.log(sql);
    console.log("\nParameters yang dikirim bersama query:");
    console.log(params);
    console.log("=================== DEBUG END ===================\n");
    // ======================================================================

    const [rows] = await pool.query(sql, params);

    // Bentuk struktur matrix
    const dataMap = {};
    for (const row of rows) {
      const key = `${row.kode_cpl}||${row.kode_cpmk}`;
      if (!dataMap[key]) {
        dataMap[key] = {
          kode_cpl: row.kode_cpl,
          kode_cpmk: row.kode_cpmk,
          semester_map: {}
        };
        semesters.forEach(s => { dataMap[key].semester_map[s] = []; });
      }
      if (row.semester) {
        dataMap[key].semester_map[row.semester].push(row.kode_mk);
      }
    }

    const result = {
      semesters,
      rows: Object.values(dataMap)
    };

    res.json(result);
  } catch (err) {
    console.error('Error listPemetaan2b3:', err);
    res.status(500).json({ error: 'List failed' });
  }
};

// === EXPORT EXCEL ===
export const exportPemetaan2b3 = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'cpl', 'c');
    const [semRows] = await pool.query(`SELECT DISTINCT semester FROM mata_kuliah ORDER BY semester ASC`);
    const semesters = semRows.map(r => r.semester);

    const sql = `
      SELECT
        c.kode_cpl,
        cpmk.kode_cpmk,
        mk.kode_mk,
        mk.semester
      FROM cpl c
      JOIN map_cpmk_cpl mc1 ON c.id_cpl = mc1.id_cpl
      JOIN cpmk ON mc1.id_cpmk = cpmk.id_cpmk
      JOIN map_cpmk_mk mc2 ON cpmk.id_cpmk = mc2.id_cpmk
      JOIN mata_kuliah mk ON mc2.id_mk = mk.id_mk
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY c.kode_cpl, cpmk.kode_cpmk, mk.semester
    `;
    const [rows] = await pool.query(sql, params);

    // Transformasi data jadi map
    const dataMap = {};
    for (const row of rows) {
      const key = `${row.kode_cpl}||${row.kode_cpmk}`;
      if (!dataMap[key]) {
        dataMap[key] = { kode_cpl: row.kode_cpl, kode_cpmk: row.kode_cpmk, sem: {} };
        semesters.forEach(s => { dataMap[key].sem[s] = []; });
      }
      if (row.semester) dataMap[key].sem[row.semester].push(row.kode_mk);
    }

    // Siapkan workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 2B.3');

    // Header
    const header = ['CPL', 'CPMK', ...semesters.map(s => `Semester ${s}`)];
    sheet.addRow(header);
    sheet.getRow(1).font = { bold: true };

    // Rows
    Object.values(dataMap).forEach(item => {
      const semValues = semesters.map(s => (item.sem[s].join(', ') || ''));
      sheet.addRow([item.kode_cpl, item.kode_cpmk, ...semValues]);
    });

    // Formatting
    sheet.columns.forEach((col, idx) => {
      col.width = idx <= 1 ? 18 : 15;
      col.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Tabel_2B3.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exportPemetaan2b3:', err);
    res.status(500).json({ error: 'Export failed' });
  }
};

