// src/controllers/pemetaan2b2.controller.js
import { pool } from '../db.js';
import { buildWhere } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

/**
 * 2B.2 — Pemetaan CPL × Profil Lulusan (matrix)
 * Ini adalah DATA SUMBER untuk tabel jembatan 'map_cpl_pl'
 *
 * Output JSON (List):
 * {
 * columns: ['PL1','PL2',...],
 * rows: [ { kode_cpl: 'CPL01', row: { PL1: true, PL2: false, ... } }, ... ]
 * }
 *
 * Input JSON (Update):
 * {
 * rows: [ { kode_cpl: 'CPL01', row: { PL1: true, PL2: false, ... } }, ... ]
 * }
 *
 */

// LIST (matrix JSON)
export const listPemetaan2b2 = async (req, res) => {
  try {
    // gunakan buildWhere agar otomatis filter per prodi jika ada id_unit_prodi column
    const { where, params } = await buildWhere(req, 'cpl', 'cpl');

    // ambil semua PL untuk header
    // Query ini mengambil PL yang relevan (pernah dipetakan) dengan CPL prodi ini
    const sqlPl = `
      SELECT DISTINCT pl.id_pl, pl.kode_pl
      FROM profil_lulusan pl
      JOIN map_cpl_pl mc ON mc.id_pl = pl.id_pl
      JOIN cpl ON mc.id_cpl = cpl.id_cpl
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY pl.kode_pl ASC
    `;
    const [plRows] = await pool.query(sqlPl, params);
    const plCodes = plRows.map(p => p.kode_pl);

    // ambil semua CPL yang perlu ditampilkan (sesuai where)
    const sqlCpl = `
      SELECT DISTINCT cpl.id_cpl, cpl.kode_cpl
      FROM cpl
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY cpl.kode_cpl ASC
    `;
    const [cplRows] = await pool.query(sqlCpl, params);

    // ambil relasi map_cpl_pl untuk seluruh set CPL yang diambil (efisien)
    const cplIds = cplRows.map(r => r.id_cpl);
    let mapRows = [];
    if (cplIds.length) {
      const placeholders = cplIds.map(() => '?').join(',');
      const sqlMap = `
        SELECT mc.id_cpl, pl.kode_pl
        FROM map_cpl_pl mc
        JOIN profil_lulusan pl ON mc.id_pl = pl.id_pl
        WHERE mc.id_cpl IN (${placeholders})
      `;
      const [mrows] = await pool.query(sqlMap, cplIds);
      mapRows = mrows;
    }

    // build matrix rows
    const rows = cplRows.map(cpl => {
      const flags = {};
      // initialize all PL columns to false
      plCodes.forEach(pc => { flags[pc] = false; });
      // fill true where mapping exists
      mapRows.forEach(m => {
        if (m.id_cpl === cpl.id_cpl && plCodes.includes(m.kode_pl)) {
          flags[m.kode_pl] = true;
        }
      });
      return { kode_cpl: cpl.kode_cpl, row: flags };
    });

    res.json({ columns: plCodes, rows });
  } catch (err) {
    console.error('Error listPemetaan2b2 (matrix):', err);
    res.status(500).json({ error: 'List failed' });
  }
};

// EXPORT Excel (matrix layout matching dokumen LKPS)
export const exportPemetaan2b2 = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'cpl', 'cpl');

    // fetch PL codes (those that are mapped to the selected CPLs)
    const sqlPl = `
      SELECT DISTINCT pl.id_pl, pl.kode_pl
      FROM profil_lulusan pl
      JOIN map_cpl_pl mc ON mc.id_pl = pl.id_pl
      JOIN cpl ON mc.id_cpl = cpl.id_cpl
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY pl.kode_pl ASC
    `;
    const [plRows] = await pool.query(sqlPl, params);
    const plCodes = plRows.map(p => p.kode_pl);

    // fetch CPLs
    const sqlCpl = `
      SELECT DISTINCT cpl.id_cpl, cpl.kode_cpl
      FROM cpl
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY cpl.kode_cpl ASC
    `;
    const [cplRows] = await pool.query(sqlCpl, params);
    const cplIds = cplRows.map(r => r.id_cpl);

    // mapping rows
    let mapRows = [];
    if (cplIds.length) {
      const placeholders = cplIds.map(() => '?').join(',');
      const sqlMap = `
        SELECT mc.id_cpl, pl.kode_pl
        FROM map_cpl_pl mc
        JOIN profil_lulusan pl ON mc.id_pl = pl.id_pl
        WHERE mc.id_cpl IN (${placeholders})
      `;
      const [mrows] = await pool.query(sqlMap, cplIds);
      mapRows = mrows;
    }

    // prepare Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 2B.2');

    // Header: first column is "CPL" then PL columns
    const header = ['CPL', ...plCodes];
    sheet.addRow(header);

    // Data rows: each CPL as a row, cells '✓' or ''
    cplRows.forEach(cpl => {
      const flags = plCodes.map(code => {
        return mapRows.some(m => m.id_cpl === cpl.id_cpl && m.kode_pl === code) ? '✓' : '';
      });
      const row = [cpl.kode_cpl, ...flags];
      sheet.addRow(row);
    });

    // Styling minimal to resemble LKPS: bold header, column widths
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((col, idx) => {
      col.width = idx === 0 ? 18 : 12;
      col.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Tabel_2B2_matrix.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exportPemetaan2b2 (matrix):', err);
    res.status(500).json({ error: 'Export failed' });
  }
};

// === UPDATE (matrix JSON) ===
/**
 * Menerima data matriks CPL vs PL yang baru untuk prodi yang sedang login.
 * Menggunakan strategi "Delete All, Insert All" yang dibungkus transaksi
 * untuk memastikan konsistensi data.
 */
export const updatePemetaan2b2 = async (req, res) => {
  // Input body: { rows: [ { kode_cpl: 'CPL01', row: { PL1: true, ... } }, ... ] }
  const { rows } = req.body;
  
  // Ambil id_unit_prodi dari user yang login (diasumsikan oleh middleware requireAuth)
  const id_unit_prodi = req.user.id_unit_prodi;

  if (!id_unit_prodi) {
    return res.status(400).json({ error: 'User tidak memiliki id_unit_prodi. Update gagal.' });
  }
  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ error: 'Format data "rows" salah.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Ambil semua CPL untuk prodi ini (untuk ID lookup dan scope DELETE)
    const [cpls] = await connection.query(
      `SELECT id_cpl, kode_cpl FROM cpl WHERE id_unit_prodi = ?`,
      [id_unit_prodi]
    );
    const cplCodeToId = new Map(cpls.map(c => [c.kode_cpl, c.id_cpl]));
    const allCplIdsInProdi = cpls.map(c => c.id_cpl);

    // 2. Ambil semua PL di sistem (untuk ID lookup)
    const [pls] = await connection.query(`SELECT id_pl, kode_pl FROM profil_lulusan`);
    const plCodeToId = new Map(pls.map(p => [p.kode_pl, p.id_pl]));

    if (!allCplIdsInProdi.length) {
      // Prodi ini tidak punya CPL, tidak ada yang bisa di-update.
      await connection.commit();
      return res.status(200).json({ message: 'Tidak ada CPL untuk prodi ini.' });
    }

    // 3. DELETE semua mapping yang ada untuk CPL milik prodi ini
    const deletePlaceholders = allCplIdsInProdi.map(() => '?').join(',');
    await connection.query(
      `DELETE FROM map_cpl_pl WHERE id_cpl IN (${deletePlaceholders})`,
      allCplIdsInProdi
    );

    // 4. Siapkan data baru untuk di-INSERT
    const valuesToInsert = [];
    for (const cpl_row of rows) {
      // Ambil id_cpl dari kode_cpl yang dikirim client
      const id_cpl = cplCodeToId.get(cpl_row.kode_cpl);

      // Hanya proses CPL yang memang milik prodi ini
      if (id_cpl) {
        // Loop semua PL yang ada di dalam 'row'
        for (const [kode_pl, isChecked] of Object.entries(cpl_row.row)) {
          // Jika dicentang (true)
          if (isChecked) {
            // Ambil id_pl dari kode_pl
            const id_pl = plCodeToId.get(kode_pl);
            // Jika PL valid, tambahkan ke daftar untuk di-insert
            if (id_pl) {
              valuesToInsert.push([id_cpl, id_pl]);
            }
          }
        }
      }
    }

    // 5. INSERT data baru jika ada
    if (valuesToInsert.length > 0) {
      await connection.query(
        `INSERT INTO map_cpl_pl (id_cpl, id_pl) VALUES ?`,
        [valuesToInsert] // Format untuk bulk insert
      );
    }

    // 6. Selesai, commit transaksi
    await connection.commit();
    res.status(200).json({ message: 'Pemetaan 2B.2 (CPL vs PL) berhasil diperbarui!' });

  } catch (err) {
    // Jika ada error, batalkan semua perubahan
    await connection.rollback();
    console.error('Error updatePemetaan2b2:', err);
    res.status(500).json({ error: 'Update gagal, terjadi kesalahan server.' });
  } finally {
    // Kembalikan koneksi ke pool
    connection.release();
  }
};