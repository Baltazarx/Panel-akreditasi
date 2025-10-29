import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== LIST =====
export const listTendik = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tenaga_kependidikan', 'tk');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_tendik', 'tk');

    const sql = `
      SELECT 
        tk.*,
        p.nama_lengkap,
        p.pendidikan_terakhir,
        p.id_unit
      FROM tenaga_kependidikan tk
      JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listTendik:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// ===== GET BY ID =====
export const getTendikById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM tenaga_kependidikan WHERE id_tendik=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Get failed' });
  }
};

// ===== CREATE =====
export const createTendik = async (req, res) => {
  try {
    const data = {
      id_pegawai: req.body.id_pegawai,
      nikp: req.body.nikp,
    };
    if (await hasColumn('tenaga_kependidikan', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO tenaga_kependidikan SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM tenaga_kependidikan WHERE id_tendik=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch {
    res.status(500).json({ error: 'Create failed' });
  }
};

// ===== UPDATE =====
export const updateTendik = async (req, res) => {
  try {
    const data = {
      id_pegawai: req.body.id_pegawai,
      nikp: req.body.nikp,
    };
    if (await hasColumn('tenaga_kependidikan', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE tenaga_kependidikan SET ? WHERE id_tendik=?`,
      [data, req.params.id]
    );
    const [row] = await pool.query(
      `SELECT * FROM tenaga_kependidikan WHERE id_tendik=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
};

// ===== DELETE (soft/hard) =====
export const softDeleteTendik = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tenaga_kependidikan', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE tenaga_kependidikan SET ? WHERE id_tendik=?`,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
};

export const restoreTendik = async (req, res) => {
  try {
    await pool.query(
      `UPDATE tenaga_kependidikan SET deleted_at=NULL, deleted_by=NULL WHERE id_tendik=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch {
    res.status(500).json({ error: 'Restore failed' });
  }
};

export const hardDeleteTendik = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM tenaga_kependidikan WHERE id_tendik=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch {
    res.status(500).json({ error: 'Hard delete failed' });
  }
};
