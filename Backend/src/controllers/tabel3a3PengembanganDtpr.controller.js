import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

/**
 * Helper PIVOT dinamis untuk 3 TAHUN (TS-2, TS-1, TS).
 * Helper ini digunakan untuk endpoint READ (list/export) yang perlu menampilkan tabel PIVOT.
 */
const getPivotClauses = (reqQuery) => {
    const years = ['ts_2', 'ts_1', 'ts']; // 3 tahun
    const params = [];
    const selectJumlah = [];
    const selectLinkBukti = [];

    for (const year of years) {
        const idTahunKey = `id_tahun_${year}`;
        const idTahunVal = reqQuery[idTahunKey];
        
        if (!idTahunVal) {
            throw new Error(`Query parameter ${idTahunKey} wajib ada.`);
        }
        
        const idTahunInt = parseInt(idTahunVal);
        params.push(idTahunInt);

        // 1. Buat SQL untuk SELECT Jumlah (untuk summary: jumlah_dtpr, untuk detail: COUNT)
        selectJumlah.push(
            `SUM(CASE WHEN t.id_tahun = ? THEN t.jumlah_dtpr ELSE 0 END) AS jumlah_${year}`
        );

        // 2. Buat SQL untuk SELECT Link Bukti
        selectLinkBukti.push(
            `MAX(CASE WHEN t.id_tahun = ? THEN t.link_bukti ELSE NULL END) AS link_bukti_${year}`
        );
    }

    let allSelects = [
        ...selectJumlah,
        ...selectLinkBukti
    ];

    // Params untuk jumlah (3) + params untuk link (3)
    let allParams = [...params, ...params];
    
    return {
        selectSql: `, ${allSelects.join(',\n')}`, 
        params: allParams
    };
};

/**
 * Helper PIVOT untuk detail pengembangan (berdasarkan dosen dan jenis)
 */
const getPivotClausesDetail = (reqQuery) => {
    const years = ['ts_2', 'ts_1', 'ts']; // 3 tahun
    const params = [];
    const selectJumlah = [];
    const selectLinkBukti = [];
    const selectLinkBuktiForCoalesce = []; // Untuk COALESCE tanpa alias (prioritas TS > TS-1 > TS-2)

    for (const year of years) {
        const idTahunKey = `id_tahun_${year}`;
        const idTahunVal = reqQuery[idTahunKey];
        
        if (!idTahunVal) {
            throw new Error(`Query parameter ${idTahunKey} wajib ada.`);
        }
        
        const idTahunInt = parseInt(idTahunVal);
        params.push(idTahunInt);

        // COUNT untuk jumlah pengembangan per dosen per tahun
        selectJumlah.push(
            `COUNT(CASE WHEN p.id_tahun = ? THEN 1 END) AS jumlah_${year}`
        );

        // Ambil link bukti dengan alias untuk kolom individual
        selectLinkBukti.push(
            `MAX(CASE WHEN p.id_tahun = ? THEN p.link_bukti ELSE NULL END) AS link_bukti_${year}`
        );
    }

    // Buat urutan untuk COALESCE dengan prioritas TS > TS-1 > TS-2 (urutan dibalik)
    const yearsForCoalesce = ['ts', 'ts_1', 'ts_2']; // Urutan prioritas: TS dulu
    const paramsForCoalesce = [];
    for (const year of yearsForCoalesce) {
        const idTahunKey = `id_tahun_${year}`;
        const idTahunVal = reqQuery[idTahunKey];
        const idTahunInt = parseInt(idTahunVal);
        paramsForCoalesce.push(idTahunInt);
        
        selectLinkBuktiForCoalesce.push(
            `MAX(CASE WHEN p.id_tahun = ? THEN p.link_bukti ELSE NULL END)`
        );
    }

    let allSelects = [
        ...selectJumlah,
        ...selectLinkBukti, // Kolom individual untuk setiap tahun
        // Ambil 1 link bukti (prioritas TS > TS-1 > TS-2)
        `COALESCE(${selectLinkBuktiForCoalesce.join(', ')}) AS link_bukti_display`
    ];

    // Params untuk jumlah (3) + params untuk link dengan alias (3) + params untuk COALESCE (3, urutan TS > TS-1 > TS-2)
    let allParams = [...params, ...params, ...paramsForCoalesce];
    
    return {
        selectSql: `, ${allSelects.join(',\n')}`, 
        params: allParams
    };
};

// === FUNGSI CRUD SUMMARY (Jumlah DTPR) ===

/**
 * Mengambil data summary jumlah DTPR.
 * Jika ada parameter tahun (id_tahun_ts, id_tahun_ts_1, id_tahun_ts_2) -> PIVOT mode
 * Jika tidak ada parameter tahun -> RAW mode (semua data)
 */
export const listSummaryDtpr = async (req, res) => {
  try {
    const { id_tahun_ts, id_tahun_ts_1, id_tahun_ts_2 } = req.query;
    
    // Cek apakah ada parameter tahun untuk PIVOT mode
    const isPivotMode = id_tahun_ts && id_tahun_ts_1 && id_tahun_ts_2;

    if (isPivotMode) {
      // PIVOT MODE: Data di-pivot untuk 3 tahun
      const { selectSql, params: pivotParams } = getPivotClauses(req.query);
      const { where, params: whereParams } = await buildWhere(req, 'tabel_3a3_dtpr_tahunan', 't');
      const orderBy = buildOrderBy(req.query?.order_by, 'id', 't');

      // Ambil tahun-tahun dari query params untuk filter (TS-2, TS-1, TS)
      const tahunList = [
        parseInt(req.query.id_tahun_ts_2),
        parseInt(req.query.id_tahun_ts_1),
        parseInt(req.query.id_tahun_ts)
      ];

      // Build WHERE clause dengan filter tahun
      const whereClauses = [...where];
      // Filter: Hanya tampilkan data yang memiliki tahun dalam rentang TS-2 sampai TS
      whereClauses.push(`t.id_tahun IN (?, ?, ?)`);

      const sql = `
        SELECT 
          t.id_unit,
          uk.nama_unit AS nama_unit_prodi
          ${selectSql}

        FROM tabel_3a3_dtpr_tahunan t
        LEFT JOIN unit_kerja uk ON t.id_unit = uk.id_unit
        
        ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
        
        GROUP BY
          t.id_unit, uk.nama_unit
        ORDER BY ${orderBy}
        LIMIT 1
      `;

      // Gabungkan params: pivot dulu, baru where, lalu tahun filter
      const allParams = [...pivotParams, ...whereParams, ...tahunList];
      const [rows] = await pool.query(sql, allParams);

      // Jika tidak ada data, return struktur kosong
      if (rows.length === 0) {
        return res.json({
          id_unit: null,
          nama_unit_prodi: null,
          jumlah_ts_2: 0,
          jumlah_ts_1: 0,
          jumlah_ts: 0,
          link_bukti_ts_2: null,
          link_bukti_ts_1: null,
          link_bukti_ts: null
        });
      }

      res.json(rows[0]);
    } else {
      // RAW MODE: Semua data tanpa pivot
      const { where, params: whereParams } = await buildWhere(req, 'tabel_3a3_dtpr_tahunan', 't');
      const orderBy = buildOrderBy(req.query?.order_by, 'id', 't');

      const sql = `
        SELECT 
          t.id,
          t.id_unit,
          uk.nama_unit AS nama_unit_prodi,
          t.id_tahun,
          t.jumlah_dtpr,
          t.link_bukti,
          t.created_at,
          t.updated_at,
          t.deleted_at
        FROM tabel_3a3_dtpr_tahunan t
        LEFT JOIN unit_kerja uk ON t.id_unit = uk.id_unit
        
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        
        ORDER BY ${orderBy}
      `;

      const [rows] = await pool.query(sql, whereParams);
      res.json(rows);
    }

  } catch (err) {
    console.error("Error listSummaryDtpr:", err);
    res.status(500).json({ error: 'Gagal mengambil data summary DTPR', details: err.message });
  }
};

/**
 * [RAW] Mengambil data mentah summary untuk form Edit.
 */
export const getSummaryDtprById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT t.*, uk.nama_unit AS nama_unit_prodi
             FROM tabel_3a3_dtpr_tahunan t
             LEFT JOIN unit_kerja uk ON t.id_unit = uk.id_unit
             WHERE t.id = ?`, 
            [id]
        );
        
        if (!rows[0]) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        
        res.json(rows[0]);

    } catch (err) {
        console.error("Error getSummaryDtprById:", err);
        res.status(500).json({ error: 'Gagal mengambil detail data', details: err.message });
    }
};

/**
 * Membuat atau update data summary DTPR untuk satu tahun.
 */
export const saveSummaryDtpr = async (req, res) => {
  let connection;
  try {
    const { id_unit, id_tahun, jumlah_dtpr, link_bukti } = req.body;

    if (!id_unit || !id_tahun) {
      return res.status(400).json({ error: 'Unit dan Tahun wajib diisi.' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Cek apakah sudah ada data untuk unit dan tahun ini
    const [existing] = await connection.query(
      'SELECT id FROM tabel_3a3_dtpr_tahunan WHERE id_unit = ? AND id_tahun = ? AND deleted_at IS NULL',
      [id_unit, id_tahun]
    );

    const data = {
      id_unit,
      id_tahun,
      jumlah_dtpr: jumlah_dtpr || 0,
      link_bukti: link_bukti || null
    };

    if (existing.length > 0) {
      // Update
      if (await hasColumn('tabel_3a3_dtpr_tahunan', 'updated_by') && req.user?.id_user) {
        data.updated_by = req.user.id_user;
      }
      await connection.query('UPDATE tabel_3a3_dtpr_tahunan SET ? WHERE id = ?', [data, existing[0].id]);
      await connection.commit();
      res.json({ message: 'Data summary DTPR berhasil diperbarui', id: existing[0].id });
    } else {
      // Create
      if (await hasColumn('tabel_3a3_dtpr_tahunan', 'created_by') && req.user?.id_user) {
        data.created_by = req.user.id_user;
      }
      const [result] = await connection.query('INSERT INTO tabel_3a3_dtpr_tahunan SET ?', [data]);
      await connection.commit();
      res.status(201).json({ message: 'Data summary DTPR berhasil dibuat', id: result.insertId });
    }

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error saveSummaryDtpr:", err);
    res.status(500).json({ error: 'Gagal menyimpan data summary DTPR', details: err.sqlMessage || err.message });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * [SOFT DELETE] Hanya menghapus summary.
 */
export const softDeleteSummaryDtpr = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_3a3_dtpr_tahunan', 'deleted_by')) { 
      payload.deleted_by = req.user?.id_user || null; 
    }
    const [result] = await pool.query('UPDATE tabel_3a3_dtpr_tahunan SET ? WHERE id = ?', [payload, id]);
    if (result.affectedRows === 0) { 
      return res.status(404).json({ error: 'Data tidak ditemukan.' }); 
    }
    res.json({ message: 'Data summary berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteSummaryDtpr:", err);
    res.status(500).json({ error: 'Gagal menghapus data' });
  }
};

// === FUNGSI CRUD DETAIL (Pengembangan DTPR) ===

/**
 * Mengambil data detail pengembangan DTPR.
 * Jika ada parameter tahun (id_tahun_ts, id_tahun_ts_1, id_tahun_ts_2) -> PIVOT mode
 * Jika tidak ada parameter tahun -> RAW mode (semua data)
 */
export const listDetailPengembangan = async (req, res) => {
  try {
    const { id_tahun_ts, id_tahun_ts_1, id_tahun_ts_2 } = req.query;
    
    // Cek apakah ada parameter tahun untuk PIVOT mode
    const isPivotMode = id_tahun_ts && id_tahun_ts_1 && id_tahun_ts_2;

    if (isPivotMode) {
      // PIVOT MODE: Data di-pivot untuk 3 tahun
      const { selectSql, params: pivotParams } = getPivotClausesDetail(req.query);
      const { where, params: whereParams } = await buildWhere(req, 'tabel_3a3_pengembangan', 'p');
      const orderBy = buildOrderBy(req.query?.order_by, 'id_pengembangan', 'p');

      // Ambil tahun-tahun dari query params untuk filter (TS-2, TS-1, TS)
      const tahunList = [
        parseInt(req.query.id_tahun_ts_2),
        parseInt(req.query.id_tahun_ts_1),
        parseInt(req.query.id_tahun_ts)
      ];

      // Build WHERE clause dengan filter tahun
      const whereClauses = [...where];
      // Filter: Hanya tampilkan pengembangan yang memiliki tahun dalam rentang TS-2 sampai TS
      whereClauses.push(`p.id_tahun IN (?, ?, ?)`);

      const sql = `
        SELECT 
          p.id_unit,
          uk.nama_unit AS nama_unit_prodi,
          p.id_dosen,
          pg.nama_lengkap AS nama_dtpr,
          p.jenis_pengembangan
          ${selectSql}

        FROM tabel_3a3_pengembangan p
        LEFT JOIN dosen d ON p.id_dosen = d.id_dosen
        LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
        LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
        
        ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
        
        GROUP BY
          p.id_unit, uk.nama_unit, p.id_dosen, pg.nama_lengkap, p.jenis_pengembangan
        ORDER BY ${orderBy}
      `;

      // Gabungkan params: pivot dulu, baru where, lalu tahun filter
      const allParams = [...pivotParams, ...whereParams, ...tahunList];
      const [rows] = await pool.query(sql, allParams);

      // Ganti link_bukti (per baris) dengan link_bukti_display (pivot)
      const finalRows = rows.map(row => {
          row.link_bukti = row.link_bukti_display;
          delete row.link_bukti_display;
          return row;
      });

      res.json(finalRows);
    } else {
      // RAW MODE: Semua data tanpa pivot
      const { where, params: whereParams } = await buildWhere(req, 'tabel_3a3_pengembangan', 'p');
      const orderBy = buildOrderBy(req.query?.order_by, 'id_pengembangan', 'p');

      const sql = `
        SELECT 
          p.id_pengembangan,
          p.id_unit,
          uk.nama_unit AS nama_unit_prodi,
          p.id_dosen,
          pg.nama_lengkap AS nama_dtpr,
          p.jenis_pengembangan,
          p.id_tahun,
          p.link_bukti,
          p.created_at,
          p.updated_at,
          p.deleted_at
        FROM tabel_3a3_pengembangan p
        LEFT JOIN dosen d ON p.id_dosen = d.id_dosen
        LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
        LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
        
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        
        ORDER BY ${orderBy}
      `;

      const [rows] = await pool.query(sql, whereParams);
      res.json(rows);
    }

  } catch (err) {
    console.error("Error listDetailPengembangan:", err);
    res.status(500).json({ error: 'Gagal mengambil data detail pengembangan', details: err.message });
  }
};

/**
 * [RAW] Mengambil data mentah detail pengembangan untuk mengisi form Edit.
 */
export const getDetailPengembanganById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT p.*, 
                    uk.nama_unit AS nama_unit_prodi,
                    pg.nama_lengkap AS nama_dtpr
             FROM tabel_3a3_pengembangan p
             LEFT JOIN dosen d ON p.id_dosen = d.id_dosen
             LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
             LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
             WHERE p.id_pengembangan = ?`, 
            [id]
        );
        
        if (!rows[0]) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        
        res.json(rows[0]);

    } catch (err) {
        console.error("Error getDetailPengembanganById:", err);
        res.status(500).json({ error: 'Gagal mengambil detail data', details: err.message });
    }
};

/**
 * Membuat data detail pengembangan baru.
 */
export const createDetailPengembangan = async (req, res) => {
  try {
    const { 
      id_unit, 
      id_dosen, 
      jenis_pengembangan, 
      id_tahun, 
      link_bukti 
    } = req.body;

    if (!id_unit || !id_dosen || !jenis_pengembangan || !id_tahun) {
      return res.status(400).json({ error: 'Unit, Dosen, Jenis Pengembangan, dan Tahun wajib diisi.' });
    }

    const data = {
      id_unit,
      id_dosen,
      jenis_pengembangan,
      id_tahun,
      link_bukti: link_bukti || null
    };

    if (await hasColumn('tabel_3a3_pengembangan', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [result] = await pool.query('INSERT INTO tabel_3a3_pengembangan SET ?', [data]);
    res.status(201).json({ message: 'Data pengembangan DTPR berhasil dibuat', id: result.insertId });

  } catch (err) {
    console.error("Error createDetailPengembangan:", err);
    res.status(500).json({ error: 'Gagal membuat data pengembangan', details: err.sqlMessage || err.message });
  }
};

/**
 * Memperbarui data detail pengembangan.
 */
export const updateDetailPengembangan = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      id_unit, 
      id_dosen, 
      jenis_pengembangan, 
      id_tahun, 
      link_bukti 
    } = req.body;

    if (!id_unit || !id_dosen || !jenis_pengembangan || !id_tahun) {
      return res.status(400).json({ error: 'Unit, Dosen, Jenis Pengembangan, dan Tahun wajib diisi.' });
    }

    const data = {
      id_unit,
      id_dosen,
      jenis_pengembangan,
      id_tahun,
      link_bukti: link_bukti || null
    };

    if (await hasColumn('tabel_3a3_pengembangan', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    const [result] = await pool.query('UPDATE tabel_3a3_pengembangan SET ? WHERE id_pengembangan = ?', [data, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }
    res.json({ message: 'Data pengembangan DTPR berhasil diperbarui' });

  } catch (err) {
    console.error("Error updateDetailPengembangan:", err);
    res.status(500).json({ error: 'Gagal memperbarui data pengembangan', details: err.sqlMessage || err.message });
  }
};

/**
 * [SOFT DELETE] Hanya menghapus detail pengembangan.
 */
export const softDeleteDetailPengembangan = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_3a3_pengembangan', 'deleted_by')) { 
      payload.deleted_by = req.user?.id_user || null; 
    }
    const [result] = await pool.query('UPDATE tabel_3a3_pengembangan SET ? WHERE id_pengembangan = ?', [payload, id]);
    if (result.affectedRows === 0) { 
      return res.status(404).json({ error: 'Data tidak ditemukan.' }); 
    }
    res.json({ message: 'Data pengembangan berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteDetailPengembangan:", err);
    res.status(500).json({ error: 'Gagal menghapus data' });
  }
};

/**
 * [EXPORT/PIVOT] Ekspor data PIVOT 3 tahun ke Excel.
 */
export const exportTabel3a3 = async (req, res) => {
    try {
        // 1. Ambil data summary
        const { selectSql: selectSqlSummary, params: pivotParamsSummary } = getPivotClauses(req.query);
        const { where: whereSummary, params: whereParamsSummary } = await buildWhere(req, 'tabel_3a3_dtpr_tahunan', 't');
        
        const tahunListSummary = pivotParamsSummary.slice(0, 3);
        const whereClausesSummary = [...whereSummary];
        whereClausesSummary.push(`t.id_tahun IN (?, ?, ?)`);

        const sqlSummary = `
          SELECT 
            uk.nama_unit AS nama_unit_prodi
            ${selectSqlSummary}
          FROM tabel_3a3_dtpr_tahunan t
          LEFT JOIN unit_kerja uk ON t.id_unit = uk.id_unit
          ${whereClausesSummary.length ? `WHERE ${whereClausesSummary.join(' AND ')}` : ''}
          GROUP BY t.id_unit, uk.nama_unit
          LIMIT 1
        `;
        
        const allParamsSummary = [...pivotParamsSummary, ...whereParamsSummary, ...tahunListSummary];
        const [summaryRows] = await pool.query(sqlSummary, allParamsSummary);
        const summaryData = summaryRows[0] || {};

        // 2. Ambil data detail
        const { selectSql: selectSqlDetail, params: pivotParamsDetail } = getPivotClausesDetail(req.query);
        const { where: whereDetail, params: whereParamsDetail } = await buildWhere(req, 'tabel_3a3_pengembangan', 'p');
        
        const tahunListDetail = pivotParamsDetail.slice(0, 3);
        const whereClausesDetail = [...whereDetail];
        whereClausesDetail.push(`p.id_tahun IN (?, ?, ?)`);

        const sqlDetail = `
          SELECT 
            p.jenis_pengembangan,
            pg.nama_lengkap AS nama_dtpr
            ${selectSqlDetail}
          FROM tabel_3a3_pengembangan p
          LEFT JOIN dosen d ON p.id_dosen = d.id_dosen
          LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
          LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
          ${whereClausesDetail.length ? `WHERE ${whereClausesDetail.join(' AND ')}` : ''}
          GROUP BY p.id_pengembangan, p.jenis_pengembangan, pg.nama_lengkap
        `;
        
        const allParamsDetail = [...pivotParamsDetail, ...whereParamsDetail, ...tahunListDetail];
        const [detailRows] = await pool.query(sqlDetail, allParamsDetail);

        // 3. Buat Workbook Excel
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Tabel 3.A.3');

        // 4. Header Summary
        sheet.mergeCells('A1:E1');
        sheet.getCell('A1').value = 'Tabel 3.A.3 Pengembangan DTPR di Bidang Penelitian';
        sheet.getCell('A1').font = { bold: true, size: 14 };
        sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

        // 5. Header Tabel (Summary)
        sheet.mergeCells('A2:A3');
        sheet.getCell('A2').value = 'Tahun Akademik';
        sheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        sheet.mergeCells('B2:D2');
        sheet.getCell('B2').value = 'Jumlah Dosen DTPR';
        sheet.getCell('B2').alignment = { horizontal: 'center', vertical: 'middle' };
        
        sheet.getCell('B3').value = 'TS-2';
        sheet.getCell('C3').value = 'TS-1';
        sheet.getCell('D3').value = 'TS';
        sheet.getCell('E2').value = 'Link Bukti';
        sheet.mergeCells('E2:E3');
        sheet.getCell('E2').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

        // 6. Data Summary
        sheet.getCell('B4').value = summaryData.jumlah_ts_2 || 0;
        sheet.getCell('C4').value = summaryData.jumlah_ts_1 || 0;
        sheet.getCell('D4').value = summaryData.jumlah_ts || 0;
        sheet.getCell('E4').value = summaryData.link_bukti_ts || summaryData.link_bukti_ts_1 || summaryData.link_bukti_ts_2 || '';

        // 7. Header Detail
        sheet.getCell('A5').value = 'Jenis Pengembangan DTPR';
        sheet.getCell('B5').value = 'Nama DTPR';
        sheet.mergeCells('C5:E5');
        sheet.getCell('C5').value = 'Jumlah';
        sheet.getCell('C5').alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getCell('F5').value = 'Link Bukti';
        
        sheet.getCell('C6').value = 'TS-2';
        sheet.getCell('D6').value = 'TS-1';
        sheet.getCell('E6').value = 'TS';

        // 8. Data Detail
        let rowIndex = 7;
        detailRows.forEach(row => {
            sheet.getCell(`A${rowIndex}`).value = row.jenis_pengembangan || '';
            sheet.getCell(`B${rowIndex}`).value = row.nama_dtpr || '';
            sheet.getCell(`C${rowIndex}`).value = row.jumlah_ts_2 || 0;
            sheet.getCell(`D${rowIndex}`).value = row.jumlah_ts_1 || 0;
            sheet.getCell(`E${rowIndex}`).value = row.jumlah_ts || 0;
            sheet.getCell(`F${rowIndex}`).value = row.link_bukti_display || '';
            rowIndex++;
        });

        // 9. Styling
        [2, 3, 5, 6].forEach(rowNum => {
            sheet.getRow(rowNum).font = { bold: true };
            sheet.getRow(rowNum).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });

        sheet.columns = [
            { header: 'Jenis Pengembangan', key: 'jenis_pengembangan', width: 30 },
            { header: 'Nama DTPR', key: 'nama_dtpr', width: 30 },
            { header: 'TS-2', key: 'jumlah_ts_2', width: 15 },
            { header: 'TS-1', key: 'jumlah_ts_1', width: 15 },
            { header: 'TS', key: 'jumlah_ts', width: 15 },
            { header: 'Link Bukti', key: 'link_bukti', width: 30 }
        ];

        // 10. Kirim file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Tabel_3A3_Pengembangan_DTPR.xlsx');
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Error exportTabel3a3:", err);
        res.status(500).json({ error: 'Gagal mengekspor data', details: err.message });
    }
};

