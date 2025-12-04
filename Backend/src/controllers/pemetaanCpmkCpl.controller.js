import { pool } from '../db.js';
import { buildWhere } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

/**
 * Pemetaan CPMK × CPL (matrix)
 * Ini adalah DATA SUMBER untuk tabel jembatan 'map_cpmk_cpl'
 */

// LIST (matrix JSON)
export const listPemetaanCpmkCpl = async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase();
    const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole);
    
    // Build WHERE clause berdasarkan role dan query parameter untuk CPMK
    let cpmkWhereClause = [];
    let cpmkQueryParams = [];
    
    if (!isSuperAdmin && req.user.id_unit) {
      // User prodi: hanya lihat CPMK milik prodi mereka
      cpmkWhereClause.push('cpmk.id_unit_prodi = ?');
      cpmkQueryParams.push(req.user.id_unit);
    } else if (req.query.id_unit_prodi) {
      // Superadmin dengan filter spesifik atau user prodi dengan query param
      cpmkWhereClause.push('cpmk.id_unit_prodi = ?');
      cpmkQueryParams.push(req.query.id_unit_prodi);
    }
    // Superadmin tanpa filter: lihat semua data (whereClause kosong)

    // PERBAIKAN: Ambil SEMUA CPL untuk header kolom (bukan hanya yang sudah ada mapping)
    // Filter CPL berdasarkan prodi yang sama dengan CPMK yang dipilih
    let sqlCpl = `
      SELECT DISTINCT cpl.id_cpl, cpl.kode_cpl
      FROM cpl
    `;
    let cplQueryParams = [];
    
    // Jika ada filter prodi untuk CPMK, filter CPL juga berdasarkan prodi yang sama
    const prodiId = req.query?.id_unit_prodi || (!isSuperAdmin ? req.user.id_unit : null);
    if (prodiId) {
      sqlCpl += ` WHERE cpl.id_unit_prodi = ?`;
      cplQueryParams.push(prodiId);
    }
    
    sqlCpl += ` ORDER BY cpl.kode_cpl ASC`;
    const [cplRows] = await pool.query(sqlCpl, cplQueryParams);
    const cplCodes = cplRows.map(p => p.kode_cpl);

    // Ambil semua CPMK untuk baris
    const sqlCpmk = `
      SELECT DISTINCT cpmk.id_cpmk, cpmk.kode_cpmk
      FROM cpmk
      ${cpmkWhereClause.length ? `WHERE ${cpmkWhereClause.join(' AND ')}` : ''}
      ORDER BY cpmk.kode_cpmk ASC
    `;
    const [cpmkRows] = await pool.query(sqlCpmk, cpmkQueryParams);

    // Ambil relasi map_cpmk_cpl
    const cpmkIds = cpmkRows.map(r => r.id_cpmk);
    let mapRows = [];
    if (cpmkIds.length) {
      const placeholders = cpmkIds.map(() => '?').join(',');
      const sqlMap = `
        SELECT mc.id_cpmk, cpl.kode_cpl
        FROM map_cpmk_cpl mc
        JOIN cpl ON mc.id_cpl = cpl.id_cpl
        WHERE mc.id_cpmk IN (${placeholders})
      `;
      const [mrows] = await pool.query(sqlMap, cpmkIds);
      mapRows = mrows;
    }

    // Build matrix rows
    const rows = cpmkRows.map(cpmk => {
      const flags = {};
      cplCodes.forEach(pc => { flags[pc] = false; });
      mapRows.forEach(m => {
        if (m.id_cpmk === cpmk.id_cpmk && cplCodes.includes(m.kode_cpl)) {
          flags[m.kode_cpl] = true;
        }
      });
      return { kode_cpmk: cpmk.kode_cpmk, row: flags };
    });

    res.json({ columns: cplCodes, rows });
  } catch (err) {
    console.error('Error listPemetaanCpmkCpl:', err);
    res.status(500).json({ error: 'List failed' });
  }
};

// UPDATE (matrix JSON)
export const updatePemetaanCpmkCpl = async (req, res) => {
  const { rows, id_unit_prodi: id_unit_prodi_from_body } = req.body;
  const userRole = req.user.role?.toLowerCase();
  
  // Cek apakah user adalah superadmin
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole);
  
  // Prioritas: id_unit_prodi dari body (jika superadmin mengirim), lalu dari user yang login
  // Fallback: jika id_unit_prodi tidak ada, coba gunakan id_unit
  let id_unit_prodi = id_unit_prodi_from_body || req.user?.id_unit_prodi || req.user?.id_unit;
  
  if (!isSuperAdmin && !id_unit_prodi) {
    return res.status(400).json({ error: 'User tidak memiliki id_unit_prodi.' });
  }
  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ error: 'Format data "rows" salah.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Ambil semua CPMK (superadmin tanpa filter) atau CPMK milik prodi ini (user prodi atau superadmin dengan filter)
    let cpmkQuery = `SELECT id_cpmk, kode_cpmk FROM cpmk`;
    let queryParams = [];
    
    if (id_unit_prodi) {
      cpmkQuery += ` WHERE id_unit_prodi = ?`;
      queryParams = [id_unit_prodi];
    }
    
    const [cpmks] = await connection.query(cpmkQuery, queryParams);
    const cpmkCodeToId = new Map(cpmks.map(c => [c.kode_cpmk, c.id_cpmk]));
    const allCpmkIdsInProdi = cpmks.map(c => c.id_cpmk);

    // 2. Ambil semua CPL di sistem (atau filter berdasarkan prodi jika diperlukan)
    // Untuk konsistensi, filter CPL berdasarkan prodi yang sama dengan CPMK jika ada filter
    let cplQuery = `SELECT id_cpl, kode_cpl FROM cpl`;
    let cplQueryParams = [];
    if (id_unit_prodi) {
      cplQuery += ` WHERE id_unit_prodi = ?`;
      cplQueryParams = [id_unit_prodi];
    }
    const [cpls] = await connection.query(cplQuery, cplQueryParams);
    const cplCodeToId = new Map(cpls.map(p => [p.kode_cpl, p.id_cpl]));

    if (!allCpmkIdsInProdi.length) {
      await connection.commit();
      return res.status(200).json({ message: 'Tidak ada CPMK untuk prodi ini.' });
    }

    // 3. DELETE semua mapping yang ada untuk CPMK yang relevant
    // Superadmin: delete semua mapping untuk semua CPMK
    // User prodi: delete mapping hanya untuk CPMK milik prodi ini
    const deletePlaceholders = allCpmkIdsInProdi.map(() => '?').join(',');
    await connection.query(
      `DELETE FROM map_cpmk_cpl WHERE id_cpmk IN (${deletePlaceholders})`,
      allCpmkIdsInProdi
    );

    // 4. Siapkan data baru untuk di-INSERT
    const valuesToInsert = [];
    for (const cpmk_row of rows) {
      const id_cpmk = cpmkCodeToId.get(cpmk_row.kode_cpmk);
      if (id_cpmk) {
        for (const [kode_cpl, isChecked] of Object.entries(cpmk_row.row)) {
          if (isChecked) {
            const id_cpl = cplCodeToId.get(kode_cpl);
            if (id_cpl) {
              valuesToInsert.push([id_cpmk, id_cpl]);
            }
          }
        }
      }
    }

    // 5. INSERT data baru jika ada
    if (valuesToInsert.length > 0) {
      await connection.query(
        `INSERT INTO map_cpmk_cpl (id_cpmk, id_cpl) VALUES ?`,
        [valuesToInsert]
      );
    }

    await connection.commit();
    res.status(200).json({ message: 'Pemetaan CPMK ke CPL berhasil diperbarui!' });

  } catch (err) {
    await connection.rollback();
    console.error('Error updatePemetaanCpmkCpl:', err);
    res.status(500).json({ error: 'Update gagal.' });
  } finally {
    connection.release();
  }
};

// EXPORT Excel
export const exportPemetaanCpmkCpl = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'cpmk', 'cpmk');

    // PERBAIKAN: Ambil SEMUA CPL untuk header kolom (bukan hanya yang sudah ada mapping)
    // Filter CPL berdasarkan prodi yang sama dengan CPMK yang dipilih
    let sqlCpl = `
      SELECT DISTINCT cpl.id_cpl, cpl.kode_cpl
      FROM cpl
    `;
    let cplQueryParams = [];
    
    // Jika ada filter prodi untuk CPMK, filter CPL juga berdasarkan prodi yang sama
    const prodiId = req.query?.id_unit_prodi;
    if (prodiId) {
      sqlCpl += ` WHERE cpl.id_unit_prodi = ?`;
      cplQueryParams.push(prodiId);
    }
    
    sqlCpl += ` ORDER BY cpl.kode_cpl ASC`;
    const [cplRows] = await pool.query(sqlCpl, cplQueryParams);
    const cplCodes = cplRows.map(p => p.kode_cpl);

    // Ambil semua CPMK untuk baris
    const sqlCpmk = `
      SELECT DISTINCT cpmk.id_cpmk, cpmk.kode_cpmk
      FROM cpmk
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY cpmk.kode_cpmk ASC
    `;
    const [cpmkRows] = await pool.query(sqlCpmk, params);
    const cpmkIds = cpmkRows.map(r => r.id_cpmk);

    // Ambil relasi map_cpmk_cpl
    let mapRows = [];
    if (cpmkIds.length) {
      const placeholders = cpmkIds.map(() => '?').join(',');
      const sqlMap = `
        SELECT mc.id_cpmk, cpl.kode_cpl
        FROM map_cpmk_cpl mc
        JOIN cpl ON mc.id_cpl = cpl.id_cpl
        WHERE mc.id_cpmk IN (${placeholders})
      `;
      const [mrows] = await pool.query(sqlMap, cpmkIds);
      mapRows = mrows;
    }

    // Siapkan Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pemetaan CPMK ke CPL');

    // Header: Kolom pertama "CPMK", lalu kolom-kolom CPL
    const header = ['CPMK', ...cplCodes];
    sheet.addRow(header);

    // Data rows: setiap CPMK sebagai baris, sel berisi '✓' atau ''
    cpmkRows.forEach(cpmk => {
      const flags = cplCodes.map(code => {
        return mapRows.some(m => m.id_cpmk === cpmk.id_cpmk && m.kode_cpl === code) ? '✓' : '';
      });
      const row = [cpmk.kode_cpmk, ...flags];
      sheet.addRow(row);
    });

    // Styling
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((col, idx) => {
      col.width = idx === 0 ? 18 : 12;
      col.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Kirim file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Pemetaan_CPMK_CPL.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exportPemetaanCpmkCpl:', err);
    res.status(500).json({ error: 'Export failed' });
  }
};

