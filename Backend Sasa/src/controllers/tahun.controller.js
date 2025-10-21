import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== LIST =====
export const listTahun = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tahun_akademik', 't');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_tahun', 't');

    const sql = `
      SELECT t.*
      FROM tahun_akademik t
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listTahun:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// ===== GET BY ID =====
export const getTahunById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM tahun_akademik WHERE id_tahun=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Get failed' });
  }
};

// ===== CREATE =====
export const createTahun = async (req, res) => {
  try {
    const data = { tahun: req.body.tahun };
    if (await hasColumn('tahun_akademik', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO tahun_akademik SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM tahun_akademik WHERE id_tahun=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch {
    res.status(500).json({ error: 'Create failed' });
  }
};

// ===== UPDATE =====
export const updateTahun = async (req, res) => {
  try {
    const data = { tahun: req.body.tahun };
    if (await hasColumn('tahun_akademik', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE tahun_akademik SET ? WHERE id_tahun=?`,
      [data, req.params.id]
    );
    const [row] = await pool.query(
      `SELECT * FROM tahun_akademik WHERE id_tahun=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
};

// ===== DELETE =====
export const deleteTahun = async (req, res) => {
  try {
    if (await hasColumn('tahun_akademik', 'deleted_at')) {
      const payload = { deleted_at: new Date() };
      if (await hasColumn('tahun_akademik', 'deleted_by')) {
        payload.deleted_by = req.user?.id_user || null;
      }
      await pool.query(
        `UPDATE tahun_akademik SET ? WHERE id_tahun=?`,
        [payload, req.params.id]
      );
      return res.json({ ok: true, softDeleted: true });
    }

    await pool.query(
      `DELETE FROM tahun_akademik WHERE id_tahun=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
};
