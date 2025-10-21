import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== LIST =====
export const listRefJabatanFungsional = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'ref_jabatan_fungsional', 'rjf');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_jafung', 'rjf');

    const sql = `
      SELECT rjf.*
      FROM ref_jabatan_fungsional rjf
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listRefJabatanFungsional:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// ===== GET BY ID =====
export const getRefJabatanFungsionalById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM ref_jabatan_fungsional WHERE id_jafung=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Get failed' });
  }
};

// ===== CREATE =====
export const createRefJabatanFungsional = async (req, res) => {
  try {
    const data = { nama_jafung: req.body.nama_jafung };
    if (await hasColumn('ref_jabatan_fungsional', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO ref_jabatan_fungsional SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM ref_jabatan_fungsional WHERE id_jafung=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch {
    res.status(500).json({ error: 'Create failed' });
  }
};

// ===== UPDATE =====
export const updateRefJabatanFungsional = async (req, res) => {
  try {
    const data = { nama_jafung: req.body.nama_jafung };
    if (await hasColumn('ref_jabatan_fungsional', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE ref_jabatan_fungsional SET ? WHERE id_jafung=?`,
      [data, req.params.id]
    );
    const [row] = await pool.query(
      `SELECT * FROM ref_jabatan_fungsional WHERE id_jafung=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
};

// ===== DELETE (soft/hard) =====
export const softDeleteRefJabatanFungsional = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('ref_jabatan_fungsional', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE ref_jabatan_fungsional SET ? WHERE id_jafung=?`,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
};

export const restoreRefJabatanFungsional = async (req, res) => {
  try {
    await pool.query(
      `UPDATE ref_jabatan_fungsional SET deleted_at=NULL, deleted_by=NULL WHERE id_jafung=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch {
    res.status(500).json({ error: 'Restore failed' });
  }
};

export const hardDeleteRefJabatanFungsional = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM ref_jabatan_fungsional WHERE id_jafung=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch {
    res.status(500).json({ error: 'Hard delete failed' });
  }
};
