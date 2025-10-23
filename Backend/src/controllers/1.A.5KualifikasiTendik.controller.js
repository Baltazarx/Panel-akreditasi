import { pool } from '../db.js';
import { hasColumn } from '../utils/queryHelper.js';

// ===== LIST (Rekap) =====
export const listKualifikasiTendik = async (req, res) => {
  try {
    const sql = `
      SELECT 
        tk.id_tendik,
        tk.jenis_tendik AS jenis_tenaga_kependidikan,
        uk.nama_unit AS unit_kerja,
        SUM(CASE WHEN kt.jenjang_pendidikan = 'S3' THEN 1 ELSE 0 END) AS s3,
        SUM(CASE WHEN kt.jenjang_pendidikan = 'S2' THEN 1 ELSE 0 END) AS s2,
        SUM(CASE WHEN kt.jenjang_pendidikan = 'S1' THEN 1 ELSE 0 END) AS s1,
        SUM(CASE WHEN kt.jenjang_pendidikan = 'D4' THEN 1 ELSE 0 END) AS d4,
        SUM(CASE WHEN kt.jenjang_pendidikan = 'D3' THEN 1 ELSE 0 END) AS d3,
        SUM(CASE WHEN kt.jenjang_pendidikan = 'D2' THEN 1 ELSE 0 END) AS d2,
        SUM(CASE WHEN kt.jenjang_pendidikan = 'D1' THEN 1 ELSE 0 END) AS d1,
        SUM(CASE WHEN kt.jenjang_pendidikan IN ('SMA','SMK','MA','SMA/SMK/MA') THEN 1 ELSE 0 END) AS sma_smk
      FROM tenaga_kependidikan tk
      LEFT JOIN kualifikasi_tendik kt ON tk.id_tendik = kt.id_tendik
      LEFT JOIN unit_kerja uk ON kt.id_unit = uk.id_unit
      WHERE kt.deleted_at IS NULL OR kt.deleted_at IS NULL
      GROUP BY tk.id_tendik, tk.jenis_tendik, uk.nama_unit
      ORDER BY tk.jenis_tendik ASC
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Error listKualifikasiTendik:", err);
    res.status(500).json({ error: "List failed" });
  }
};

// ===== GET BY ID =====
export const getKualifikasiTendikById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM kualifikasi_tendik WHERE id_kualifikasi=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Get failed' });
  }
};

// ===== CREATE =====
export const createKualifikasiTendik = async (req, res) => {
  try {
    const data = {
      id_tendik: req.body.id_tendik,
      jenjang_pendidikan: req.body.jenjang_pendidikan,
      id_unit: req.body.id_unit,
    };
    if (await hasColumn('kualifikasi_tendik', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO kualifikasi_tendik SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM kualifikasi_tendik WHERE id_kualifikasi=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    res.status(500).json({ error: 'Create failed' });
  }
};

// ===== UPDATE =====
export const updateKualifikasiTendik = async (req, res) => {
  try {
    const data = {
      id_tendik: req.body.id_tendik,
      jenjang_pendidikan: req.body.jenjang_pendidikan,
      id_unit: req.body.id_unit,
    };
    if (await hasColumn('kualifikasi_tendik', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE kualifikasi_tendik SET ? WHERE id_kualifikasi=?`,
      [data, req.params.id]
    );
    const [row] = await pool.query(
      `SELECT * FROM kualifikasi_tendik WHERE id_kualifikasi=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// ===== SOFT DELETE =====
export const softDeleteKualifikasiTendik = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('kualifikasi_tendik', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE kualifikasi_tendik SET ? WHERE id_kualifikasi=?`,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

// ===== RESTORE =====
export const restoreKualifikasiTendik = async (req, res) => {
  try {
    await pool.query(
      `UPDATE kualifikasi_tendik SET deleted_at=NULL, deleted_by=NULL WHERE id_kualifikasi=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    res.status(500).json({ error: 'Restore failed' });
  }
};

// ===== HARD DELETE =====
export const hardDeleteKualifikasiTendik = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM kualifikasi_tendik WHERE id_kualifikasi=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Hard delete failed' });
  }
};
