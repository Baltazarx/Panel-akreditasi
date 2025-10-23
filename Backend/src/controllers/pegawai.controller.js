import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== LIST =====
export const listPegawai = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'pegawai', 'p');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_pegawai', 'p');

    const sql = `
      SELECT p.*
      FROM pegawai p
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listPegawai:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// ===== GET BY ID =====
export const getPegawaiById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM pegawai WHERE id_pegawai=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Get failed' });
  }
};

// ===== CREATE =====
export const createPegawai = async (req, res) => {
  try {
    const data = {
      nama_lengkap: req.body.nama_lengkap,
      pendidikan_terakhir: req.body.pendidikan_terakhir,
    };
    if (await hasColumn('pegawai', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO pegawai SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM pegawai WHERE id_pegawai=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    res.status(500).json({ error: 'Create failed' });
  }
};

// ===== UPDATE =====
export const updatePegawai = async (req, res) => {
  try {
    const data = {
      nama_lengkap: req.body.nama_lengkap,
      pendidikan_terakhir: req.body.pendidikan_terakhir,
    };
    if (await hasColumn('pegawai', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE pegawai SET ? WHERE id_pegawai=?`,
      [data, req.params.id]
    );
    const [row] = await pool.query(
      `SELECT * FROM pegawai WHERE id_pegawai=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// ===== DELETE (soft kalau ada kolom deleted_at) =====
export const deletePegawai = async (req, res) => {
  try {
    if (await hasColumn('pegawai', 'deleted_at')) {
      const payload = { deleted_at: new Date() };
      if (await hasColumn('pegawai', 'deleted_by')) {
        payload.deleted_by = req.user?.id_user || null;
      }
      await pool.query(
        `UPDATE pegawai SET ? WHERE id_pegawai=?`,
        [payload, req.params.id]
      );
      return res.json({ ok: true, softDeleted: true });
    }

    // fallback hard delete
    await pool.query(
      `DELETE FROM pegawai WHERE id_pegawai=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
