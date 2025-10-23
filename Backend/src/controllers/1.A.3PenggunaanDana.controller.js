import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== CRUD =====
export const listPenggunaanDana = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'penggunaan_dana', 'pd');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_penggunaan_dana', 'pd');

    const sql = `
      SELECT pd.*
      FROM penggunaan_dana pd
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listPenggunaanDana:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

export const getPenggunaanDanaById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM penggunaan_dana WHERE id_penggunaan_dana=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Get failed' });
  }
};

export const createPenggunaanDana = async (req, res) => {
  try {
    const data = {
      id_tahun: req.body.id_tahun,
      jenis_penggunaan: req.body.jenis_penggunaan,
      jumlah_dana: req.body.jumlah_dana,
      link_bukti: req.body.link_bukti,
    };
    if (await hasColumn('penggunaan_dana', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO penggunaan_dana SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM penggunaan_dana WHERE id_penggunaan_dana=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch {
    res.status(500).json({ error: 'Create failed' });
  }
};

export const updatePenggunaanDana = async (req, res) => {
  try {
    const data = {
      id_tahun: req.body.id_tahun,
      jenis_penggunaan: req.body.jenis_penggunaan,
      jumlah_dana: req.body.jumlah_dana,
      link_bukti: req.body.link_bukti,
    };
    if (await hasColumn('penggunaan_dana', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE penggunaan_dana SET ? WHERE id_penggunaan_dana=?`,
      [data, req.params.id]
    );
    const [row] = await pool.query(
      `SELECT * FROM penggunaan_dana WHERE id_penggunaan_dana=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
};

export const softDeletePenggunaanDana = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('penggunaan_dana', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE penggunaan_dana SET ? WHERE id_penggunaan_dana=?`,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
};

export const restorePenggunaanDana = async (req, res) => {
  try {
    await pool.query(
      `UPDATE penggunaan_dana SET deleted_at=NULL, deleted_by=NULL WHERE id_penggunaan_dana=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch {
    res.status(500).json({ error: 'Restore failed' });
  }
};

export const hardDeletePenggunaanDana = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM penggunaan_dana WHERE id_penggunaan_dana=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch {
    res.status(500).json({ error: 'Hard delete failed' });
  }
};

export const restoreMultiplePenggunaanDana = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty array of IDs' });
    }
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(
      `UPDATE penggunaan_dana SET deleted_at=NULL, deleted_by=NULL WHERE id_penggunaan_dana IN (${placeholders})`,
      ids
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Restore multiple failed' });
  }
};

// ===== CUSTOM =====
export const refJenisPenggunaan = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT jenis_penggunaan FROM penggunaan_dana ORDER BY jenis_penggunaan`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Gagal memuat jenis penggunaan dana' });
  }
};

// ====================================================================
// ===== FUNGSI YANG DIPERBAIKI ADA DI BAWAH INI =====
// ====================================================================
export const summaryPenggunaanDana = async (_req, res) => {
  try {
    const [tahunRows] = await pool.query(
      `SELECT id_tahun FROM penggunaan_dana WHERE deleted_at IS NULL ORDER BY id_tahun DESC LIMIT 1`
    );
    if (!tahunRows.length) return res.json([]);

    const ts = tahunRows[0].id_tahun;
    const years = [ts, ts - 1, ts - 2, ts - 3, ts - 4];

    const [rows] = await pool.query(
      `SELECT
        pd.jenis_penggunaan,
        SUM(CASE WHEN pd.id_tahun = ? THEN pd.jumlah_dana ELSE 0 END) AS ts,
        SUM(CASE WHEN pd.id_tahun = ? THEN pd.jumlah_dana ELSE 0 END) AS ts_minus_1,
        SUM(CASE WHEN pd.id_tahun = ? THEN pd.jumlah_dana ELSE 0 END) AS ts_minus_2,
        SUM(CASE WHEN pd.id_tahun = ? THEN pd.jumlah_dana ELSE 0 END) AS ts_minus_3,
        SUM(CASE WHEN pd.id_tahun = ? THEN pd.jumlah_dana ELSE 0 END) AS ts_minus_4,
        GROUP_CONCAT(DISTINCT pd.link_bukti SEPARATOR ', ') AS link_bukti
      FROM penggunaan_dana pd
      WHERE pd.id_tahun IN (?, ?, ?, ?, ?) AND pd.deleted_at IS NULL
      GROUP BY pd.jenis_penggunaan
      ORDER BY pd.jenis_penggunaan`,
      [...years, ...years]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching summary data:", err);
    res.status(500).json({ error: 'Gagal memuat data ringkasan' });
  }
};