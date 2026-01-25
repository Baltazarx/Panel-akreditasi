/*
============================================================
 FILE: tabel3a3PengembanganDtpr.controller.js
 
 [PERBAIKAN GEMINI]: 
 - Memperbaiki error 1055 (only_full_group_by)
 - Mengganti default 'ORDER BY' di listSummaryDtpr
 - Mengganti default 'ORDER BY' di listDetailPengembangan
 - Menyamakan 'GROUP BY' di export agar konsisten
============================================================
*/

import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

/**
 * Helper PIVOT dinamis untuk 5 TAHUN (TS-4, TS-3, TS-2, TS-1, TS).
 * Helper ini digunakan untuk endpoint READ (list/export) yang perlu menampilkan tabel PIVOT.
 */
const getPivotClauses = (reqQuery) => {
  const years = ['ts_4', 'ts_3', 'ts_2', 'ts_1', 'ts']; // 5 tahun
  const params = [];
  const selectJumlah = [];
  const selectLinkBukti = [];
  const allSelects = [];


  for (const year of years) {
    const idTahunKey = `id_tahun_${year}`;
    const idTahunVal = reqQuery[idTahunKey];

    if (!idTahunVal) {
      throw new Error(`Query parameter ${idTahunKey} wajib ada.`);
    }

    const idTahunInt = parseInt(idTahunVal);
    if (isNaN(idTahunInt)) {
      throw new Error(`Query parameter ${idTahunKey} bukan angka valid (Ditemukan: ${idTahunVal}).`);
    }
    params.push(idTahunInt);

    // 1. Buat SQL untuk SELECT Jumlah (untuk summary: jumlah_dtpr, untuk detail: COUNT)
    selectJumlah.push(
      `SUM(CASE WHEN t.id_tahun = ? THEN t.jumlah_dtpr ELSE 0 END) AS jumlah_${year}`
    );

    // 2. Buat SQL untuk SELECT Link Bukti
    selectLinkBukti.push(
      `MAX(CASE WHEN t.id_tahun = ? THEN t.link_bukti ELSE NULL END) AS link_bukti_${year}`
    );

    // 3. Buat SQL untuk SELECT ID (untuk CRUD)
    allSelects.push(
      `MAX(CASE WHEN t.id_tahun = ? THEN t.id ELSE NULL END) AS id_${year}`
    );
  }

  allSelects.unshift(...selectJumlah, ...selectLinkBukti);

  // Params untuk jumlah (5) + params untuk link (5) + params untuk id (5)
  let allParams = [...params, ...params, ...params];


  return {
    selectSql: `, ${allSelects.join(',\n')}`,
    params: allParams
  };
};

/**
 * Helper PIVOT untuk detail pengembangan (berdasarkan dosen dan jenis)
 */
const getPivotClausesDetail = (reqQuery) => {
  const years = ['ts_4', 'ts_3', 'ts_2', 'ts_1', 'ts']; // 5 tahun: TS-4, TS-3, TS-2, TS-1, TS
  const allSelects = [];
  const allParams = [];

  // Build SELECT dan params dalam urutan yang sama
  for (const year of years) {
    const idTahunKey = `id_tahun_${year}`;
    const idTahunVal = reqQuery[idTahunKey];

    if (!idTahunVal) {
      throw new Error(`Query parameter ${idTahunKey} wajib ada.`);
    }

    const idTahunInt = parseInt(idTahunVal);
    if (isNaN(idTahunInt)) {
      throw new Error(`Query parameter ${idTahunKey} bukan angka valid (Ditemukan: ${idTahunVal}).`);
    }

    // 1. COUNT untuk jumlah pengembangan per tahun
    allSelects.push(`COUNT(CASE WHEN p.id_tahun = ? THEN 1 END) AS jumlah_${year}`);
    allParams.push(idTahunInt);

    // 2. MAX untuk ID pengembangan per tahun (untuk CRUD)
    allSelects.push(`MAX(CASE WHEN p.id_tahun = ? THEN p.id_pengembangan ELSE NULL END) AS id_pengembangan_${year}`);
    allParams.push(idTahunInt);

    // 3. MAX untuk link bukti per tahun
    allSelects.push(`MAX(CASE WHEN p.id_tahun = ? THEN p.link_bukti ELSE NULL END) AS link_bukti_${year}`);
    allParams.push(idTahunInt);
  }

  // 4. COALESCE untuk link_bukti_display (prioritas TS > TS-1 > TS-2 > TS-3 > TS-4)
  const yearsForCoalesce = ['ts', 'ts_1', 'ts_2', 'ts_3', 'ts_4'];
  const coalesceParts = [];
  for (const year of yearsForCoalesce) {
    const idTahunKey = `id_tahun_${year}`;
    const idTahunVal = reqQuery[idTahunKey];
    const idTahunInt = parseInt(idTahunVal);

    coalesceParts.push(`MAX(CASE WHEN p.id_tahun = ? THEN p.link_bukti ELSE NULL END)`);
    allParams.push(idTahunInt);
  }
  allSelects.push(`COALESCE(${coalesceParts.join(', ')}) AS link_bukti_display`);

  return {
    selectSql: `, ${allSelects.join(',\n')}`,
    params: allParams
  };
};

// === FUNGSI CRUD SUMMARY (Jumlah DTPR) ===

/**
 * Mengambil data summary jumlah DTPR.
 * Jika ada parameter tahun (id_tahun_ts, id_tahun_ts_1, id_tahun_ts_2, id_tahun_ts_3, id_tahun_ts_4) -> PIVOT mode
 * Jika tidak ada parameter tahun -> RAW mode (semua data)
 */
export const listSummaryDtpr = async (req, res) => {
  try {
    const { id_tahun_ts, id_tahun_ts_1, id_tahun_ts_2, id_tahun_ts_3, id_tahun_ts_4 } = req.query;

    // Cek apakah ada parameter tahun untuk PIVOT mode
    const isPivotMode = id_tahun_ts && id_tahun_ts_1 && id_tahun_ts_2 && id_tahun_ts_3 && id_tahun_ts_4;

    if (isPivotMode) {
      // PIVOT MODE: Data di-pivot untuk 5 tahun
      const { selectSql, params: pivotParams } = getPivotClauses(req.query);
      const { where, params: whereParams } = await buildWhere(req, 'tabel_3a3_dtpr_tahunan', 't');

      // [PERBAIKAN]: Default ORDER BY diubah dari 'id' ke 'id_unit' (karena 'id' tidak ada di GROUP BY)
      const orderBy = buildOrderBy(req.query?.order_by, 'id_unit', 't');

      // Ambil tahun-tahun dari query params untuk filter (TS-4, TS-3, TS-2, TS-1, TS)
      const tahunList = [
        parseInt(req.query.id_tahun_ts_4),
        parseInt(req.query.id_tahun_ts_3),
        parseInt(req.query.id_tahun_ts_2),
        parseInt(req.query.id_tahun_ts_1),
        parseInt(req.query.id_tahun_ts)
      ];

      // Build WHERE clause: Support soft-delete filter
      const showDeleted = req.query.is_deleted === '1' || req.query.include_deleted === '1';
      const whereClauses = [showDeleted ? "t.deleted_at IS NOT NULL" : "t.deleted_at IS NULL"];
      whereClauses.push(`t.id_tahun IN (?, ?, ?, ?, ?)`);

      const sql = `
        SELECT 
          0 AS id_unit,
          'INSTITUSI' AS nama_unit_prodi
          ${selectSql}
        FROM tabel_3a3_dtpr_tahunan t
        WHERE ${whereClauses.join(' AND ')}
      `;

      // Params untuk selectSql (15) + params untuk where (5)
      const allParams = [...pivotParams, ...tahunList];
      const [rows] = await pool.query(sql, allParams);

      // Selalu return baris pertama (hasil agregasi global)
      res.json(rows[0] || {
        nama_unit_prodi: 'INSTITUSI',
        jumlah_ts_4: 0, jumlah_ts_3: 0, jumlah_ts_2: 0, jumlah_ts_1: 0, jumlah_ts: 0,
        link_bukti_ts_4: null, link_bukti_ts_3: null, link_bukti_ts_2: null, link_bukti_ts_1: null, link_bukti_ts: null,
        id_ts_4: null, id_ts_3: null, id_ts_2: null, id_ts_1: null, id_ts: null
      });
    } else {
      // Helper function untuk sorting data berdasarkan Nama DTPR (A-Z)
      const sortRowsByLatest = (rowsArray) => {
        return [...rowsArray].sort((a, b) => {
          // 1. Prioritaskan Nama DTPR (A-Z) sesuai request terbaru
          const namaA = (a.nama_dtpr || "").toLowerCase();
          const namaB = (b.nama_dtpr || "").toLowerCase();
          if (namaA !== namaB) {
            return namaA.localeCompare(namaB);
          }

          // 2. Jika nama sama, urutkan berdasarkan created_at terbaru
          if (a.created_at && b.created_at) {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateB.getTime() - dateA.getTime();
            }
          }

          // 3. Fallback ke ID terbesar
          const getIdField = (obj) => {
            // Assuming 'id' is the primary key for summary, 'id_pengembangan' for detail
            return obj.id ? 'id' : (obj.id_pengembangan ? 'id_pengembangan' : null);
          };
          const idFieldA = getIdField(a);
          const idFieldB = getIdField(b);
          return (b[idFieldB] || 0) - (a[idFieldA] || 0);
        });
      };
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

/**
 * [RESTORE] Memulihkan summary DTPR yang sudah di-soft delete.
 */
export const restoreSummaryDtpr = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE tabel_3a3_dtpr_tahunan SET deleted_at = NULL, deleted_by = NULL WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }
    res.json({ message: 'Data summary berhasil dipulihkan' });
  } catch (err) {
    console.error("Error restoreSummaryDtpr:", err);
    res.status(500).json({ error: 'Gagal memulihkan data' });
  }
};

/**
 * [HARD DELETE] Menghapus summary DTPR secara permanen.
 */
export const hardDeleteSummaryDtpr = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tabel_3a3_dtpr_tahunan WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }
    res.json({ message: 'Data summary berhasil dihapus permanen' });
  } catch (err) {
    console.error("Error hardDeleteSummaryDtpr:", err);
    res.status(500).json({ error: 'Gagal menghapus data permanen' });
  }
};

// === FUNGSI CRUD DETAIL (Pengembangan DTPR) ===

/**
 * Mengambil data detail pengembangan DTPR.
 * Jika ada parameter tahun (id_tahun_ts, id_tahun_ts_1, id_tahun_ts_2, id_tahun_ts_3, id_tahun_ts_4) -> PIVOT mode
 * Jika tidak ada parameter tahun -> RAW mode (semua data)
 */
export const listDetailPengembangan = async (req, res) => {
  try {
    const { id_tahun_ts, id_tahun_ts_1, id_tahun_ts_2, id_tahun_ts_3, id_tahun_ts_4 } = req.query;

    // Cek apakah ada parameter tahun untuk PIVOT mode
    const isPivotMode = id_tahun_ts && id_tahun_ts_1 && id_tahun_ts_2 && id_tahun_ts_3 && id_tahun_ts_4;

    if (isPivotMode) {
      // PIVOT MODE: Data di-pivot untuk 5 tahun
      const { selectSql, params: pivotParams } = getPivotClausesDetail(req.query);
      const { where, params: whereParams } = await buildWhere(req, 'tabel_3a3_pengembangan', 'p');

      // [PERBAIKAN]: Default ORDER BY diubah dari 'nama_dtpr' (alias) 
      //              menjadi 'nama_lengkap' (nama kolom asli di tabel 'pg')
      const orderBy = buildOrderBy(req.query?.order_by, 'nama_lengkap', 'pg');

      // Ambil tahun-tahun dari query params untuk filter (TS-4, TS-3, TS-2, TS-1, TS)
      const tahunList = [
        parseInt(req.query.id_tahun_ts_4),
        parseInt(req.query.id_tahun_ts_3),
        parseInt(req.query.id_tahun_ts_2),
        parseInt(req.query.id_tahun_ts_1),
        parseInt(req.query.id_tahun_ts)
      ];

      // Build WHERE clause: Support soft-delete filter
      const showDeleted = req.query.is_deleted === '1' || req.query.include_deleted === '1';
      const whereClauses = [showDeleted ? "p.deleted_at IS NOT NULL" : "p.deleted_at IS NULL"];
      whereClauses.push(`p.id_tahun IN (?, ?, ?, ?, ?)`);

      const sql = `
        SELECT 
          NULL AS id_unit,
          'INSTITUSI' AS nama_unit_prodi,
          p.id_dosen,
          pg.nama_lengkap AS nama_dtpr,
          p.jenis_pengembangan,
          MAX(p.deleted_at) AS deleted_at
          ${selectSql}

        FROM tabel_3a3_pengembangan p
        LEFT JOIN dosen d ON p.id_dosen = d.id_dosen
        LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
        LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
        
        WHERE ${whereClauses.join(' AND ')}
        
        GROUP BY
          p.id_dosen, pg.nama_lengkap, p.jenis_pengembangan
        ORDER BY ${orderBy}
      `;

      // Gabungkan params: pivot detail (15*3? No, check helper) + tahun filter (5)
      const allParams = [...pivotParams, ...tahunList];
      const [rows] = await pool.query(sql, allParams);

      // Ganti link_bukti (per baris) dengan link_bukti_display (pivot)
      const finalRows = rows.map(row => {
        row.link_bukti = row.link_bukti_display;
        // row.id_pengembangan diset ke id_pengembangan_ts (default action target)
        row.id_pengembangan = row.id_pengembangan_ts;
        delete row.link_bukti_display;
        return row;
      });

      res.json(finalRows);

    } else {
      // RAW MODE: Semua data tanpa pivot
      const { where, params: whereParams } = await buildWhere(req, 'tabel_3a3_pengembangan', 'p');

      // TAMBAHAN: Filter untuk Hybrid Mode (Modal Detail Records)
      const finalWhere = [...where];
      const finalParams = [...whereParams];

      if (req.query?.id_dosen) {
        finalWhere.push(`p.id_dosen = ?`);
        finalParams.push(req.query.id_dosen);
      }
      if (req.query?.jenis_pengembangan) {
        finalWhere.push(`p.jenis_pengembangan = ?`);
        finalParams.push(req.query.jenis_pengembangan);
      }

      const orderBy = buildOrderBy(req.query?.order_by, 'nama_lengkap', 'pg'); // Urutkan berdasarkan Nama DTPR A-Z

      const sql = `
        SELECT
          p.id_pengembangan,
          p.id_unit,
          uk.nama_unit AS nama_unit_prodi,
          p.id_dosen,
          pg.nama_lengkap AS nama_dtpr,
          p.jenis_pengembangan,
          p.id_tahun,
          t.tahun_akademik,
          p.link_bukti,
          p.created_at,
          p.updated_at,
          p.deleted_at
        FROM tabel_3a3_pengembangan p
        LEFT JOIN dosen d ON p.id_dosen = d.id_dosen
        LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
        LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
        LEFT JOIN tahun_akademik t ON p.id_tahun = t.id_tahun
        
        ${finalWhere.length ? `WHERE ${finalWhere.join(' AND ')}` : ''}
        
        ORDER BY ${orderBy}
      `;

      const [rows] = await pool.query(sql, finalParams);
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
 * [RESTORE] Memulihkan data detail pengembangan yang sudah di-soft delete.
 */
export const restoreDetailPengembangan = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE tabel_3a3_pengembangan SET deleted_at = NULL, deleted_by = NULL WHERE id_pengembangan = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }
    res.json({ message: 'Data pengembangan berhasil dipulihkan' });
  } catch (err) {
    console.error("Error restoreDetailPengembangan:", err);
    res.status(500).json({ error: 'Gagal memulihkan data' });
  }
};

/**
 * [HARD DELETE] Menghapus data detail pengembangan secara permanen.
 */
export const hardDeleteDetailPengembangan = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tabel_3a3_pengembangan WHERE id_pengembangan = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }
    res.json({ message: 'Data pengembangan berhasil dihapus permanen' });
  } catch (err) {
    console.error("Error hardDeleteDetailPengembangan:", err);
    res.status(500).json({ error: 'Gagal menghapus data permanen' });
  }
};

/**
 * [EXPORT/PIVOT] Ekspor data PIVOT 5 tahun ke Excel.
 */
export const exportTabel3a3 = async (req, res) => {
  try {
    // 1. Ambil data summary
    const { selectSql: selectSqlSummary, params: pivotParamsSummary } = getPivotClauses(req.query);
    const { where: whereSummary, params: whereParamsSummary } = await buildWhere(req, 'tabel_3a3_dtpr_tahunan', 't');

    const tahunListSummary = pivotParamsSummary.slice(0, 5);
    const whereClausesSummary = [...whereSummary];
    whereClausesSummary.push(`t.id_tahun IN (?, ?, ?, ?, ?)`);

    // [PERBAIKAN]: Mengganti ORDER BY t.id (error) dengan MAX(t.id) agar lolos GROUP BY
    const sqlSummary = `
          SELECT 
            uk.nama_unit AS nama_unit_prodi
            ${selectSqlSummary}
          FROM tabel_3a3_dtpr_tahunan t
          LEFT JOIN unit_kerja uk ON t.id_unit = uk.id_unit
          ${whereClausesSummary.length ? `WHERE ${whereClausesSummary.join(' AND ')}` : ''}
          GROUP BY t.id_unit, uk.nama_unit
          ORDER BY MAX(t.id) DESC
          LIMIT 1
        `;

    const allParamsSummary = [...pivotParamsSummary, ...whereParamsSummary, ...tahunListSummary];
    const [summaryRows] = await pool.query(sqlSummary, allParamsSummary);
    const summaryData = summaryRows[0] || {};

    // 2. Ambil data detail
    const { selectSql: selectSqlDetail, params: pivotParamsDetail } = getPivotClausesDetail(req.query);
    const { where: whereDetail, params: whereParamsDetail } = await buildWhere(req, 'tabel_3a3_pengembangan', 'p');

    const tahunListDetail = pivotParamsDetail.slice(0, 5);
    const whereClausesDetail = [...whereDetail];
    whereClausesDetail.push(`p.id_tahun IN (?, ?, ?, ?, ?)`);

    // [PERBAIKAN]: Mengganti GROUP BY p.id_pengembangan (bug) dengan GROUP BY yang konsisten
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
          GROUP BY p.id_unit, uk.nama_unit, p.id_dosen, pg.nama_lengkap, p.jenis_pengembangan
          ORDER BY pg.nama_lengkap ASC
        `;

    const allParamsDetail = [...pivotParamsDetail, ...whereParamsDetail, ...tahunListDetail];
    const [detailRows] = await pool.query(sqlDetail, allParamsDetail);

    // 3. Buat Workbook Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 3.A.3');

    // 4. Header Summary
    sheet.mergeCells('A1:G1');
    sheet.getCell('A1').value = 'Tabel 3.A.3 Pengembangan DTPR di Bidang Penelitian';
    sheet.getCell('A1').font = { bold: true, size: 14 };
    sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

    // 5. Header Tabel (Summary)
    sheet.mergeCells('A2:A3');
    sheet.getCell('A2').value = 'Tahun Akademik';
    sheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    sheet.mergeCells('B2:F2');
    sheet.getCell('B2').value = 'Jumlah Dosen DTPR';
    sheet.getCell('B2').alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.getCell('B3').value = 'TS-4';
    sheet.getCell('C3').value = 'TS-3';
    sheet.getCell('D3').value = 'TS-2';
    sheet.getCell('E3').value = 'TS-1';
    sheet.getCell('F3').value = 'TS';
    sheet.getCell('G2').value = 'Link Bukti';
    sheet.mergeCells('G2:G3');
    sheet.getCell('G2').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    // 6. Data Summary
    sheet.getCell('B4').value = summaryData.jumlah_ts_4 || 0;
    sheet.getCell('C4').value = summaryData.jumlah_ts_3 || 0;
    sheet.getCell('D4').value = summaryData.jumlah_ts_2 || 0;
    sheet.getCell('E4').value = summaryData.jumlah_ts_1 || 0;
    sheet.getCell('F4').value = summaryData.jumlah_ts || 0;
    sheet.getCell('G4').value = summaryData.link_bukti_ts || summaryData.link_bukti_ts_1 || summaryData.link_bukti_ts_2 || summaryData.link_bukti_ts_3 || summaryData.link_bukti_ts_4 || '';

    // 7. Header Detail
    sheet.getCell('A5').value = 'Jenis Pengembangan DTPR';
    sheet.getCell('B5').value = 'Nama DTPR';
    sheet.mergeCells('C5:G5');
    sheet.getCell('C5').value = 'Jumlah';
    sheet.getCell('C5').alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('H5').value = 'Link Bukti';

    sheet.getCell('C6').value = 'TS-4';
    sheet.getCell('D6').value = 'TS-3';
    sheet.getCell('E6').value = 'TS-2';
    sheet.getCell('F6').value = 'TS-1';
    sheet.getCell('G6').value = 'TS';

    // 8. Data Detail
    let rowIndex = 7;
    detailRows.forEach(row => {
      sheet.getCell(`A${rowIndex}`).value = row.jenis_pengembangan || '';
      sheet.getCell(`B${rowIndex}`).value = row.nama_dtpr || '';
      sheet.getCell(`C${rowIndex}`).value = row.jumlah_ts_4 || 0;
      sheet.getCell(`D${rowIndex}`).value = row.jumlah_ts_3 || 0;
      sheet.getCell(`E${rowIndex}`).value = row.jumlah_ts_2 || 0;
      sheet.getCell(`F${rowIndex}`).value = row.jumlah_ts_1 || 0;
      sheet.getCell(`G${rowIndex}`).value = row.jumlah_ts || 0;
      sheet.getCell(`H${rowIndex}`).value = row.link_bukti_display || '';
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
      { header: 'TS-4', key: 'jumlah_ts_4', width: 15 },
      { header: 'TS-3', key: 'jumlah_ts_3', width: 15 },
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