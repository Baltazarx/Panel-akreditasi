import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// === LIST CPMK ===
export const listCpmk = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'cpmk', 'c');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_cpmk', 'c');

    const sql = `
      SELECT 
        c.id_cpmk,
        c.id_unit_prodi,
        uk.nama_unit AS nama_unit_prodi,
        c.kode_cpmk,
        c.deskripsi_cpmk,
        m.id_mk,
        m.kode_mk,
        m.nama_mk,
        c.deleted_at
      FROM cpmk c
      LEFT JOIN unit_kerja uk ON c.id_unit_prodi = uk.id_unit
      LEFT JOIN map_cpmk_mk map ON c.id_cpmk = map.id_cpmk
      LEFT JOIN mata_kuliah m ON map.id_mk = m.id_mk
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listCpmk:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// === DETAIL CPMK ===
export const getCpmkById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         c.id_cpmk,
         c.id_unit_prodi,
         uk.nama_unit AS nama_unit_prodi,
         c.kode_cpmk,
         c.deskripsi_cpmk,
         m.id_mk,
         m.kode_mk,
         m.nama_mk
       FROM cpmk c
       LEFT JOIN unit_kerja uk ON c.id_unit_prodi = uk.id_unit
       LEFT JOIN map_cpmk_mk map ON c.id_cpmk = map.id_cpmk
       LEFT JOIN mata_kuliah m ON map.id_mk = m.id_mk
       WHERE c.id_cpmk=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getCpmkById:", err);
    res.status(500).json({ error: 'Get failed' });
  }
};

// === CREATE CPMK ===
export const createCpmk = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const dataCpmk = {
      id_unit_prodi: req.body.id_unit_prodi,
      kode_cpmk: req.body.kode_cpmk,
      deskripsi_cpmk: req.body.deskripsi_cpmk,
    };

    // Multi-prodi aware: fallback ke user login
    if (!dataCpmk.id_unit_prodi && req.user?.role === 'prodi') {
      dataCpmk.id_unit_prodi = req.user.id_unit_prodi;
    }

    if (await hasColumn('cpmk', 'created_by') && req.user?.id_user) {
      dataCpmk.created_by = req.user.id_user;
    }

    const [insertRes] = await conn.query(`INSERT INTO cpmk SET ?`, [dataCpmk]);
    const id_cpmk = insertRes.insertId;

    if (req.body.id_mk) {
      await conn.query(
        `INSERT INTO map_cpmk_mk (id_cpmk, id_mk) VALUES (?, ?)`,
        [id_cpmk, req.body.id_mk]
      );
    }

    await conn.commit();

    const [row] = await pool.query(
      `SELECT * FROM cpmk WHERE id_cpmk=?`,
      [id_cpmk]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    await conn.rollback();
    console.error("Error createCpmk:", err);
    res.status(500).json({ error: 'Create failed' });
  } finally {
    conn.release();
  }
};

// === UPDATE CPMK ===
export const updateCpmk = async (req, res) => {
  try {
    const data = {
      id_unit_prodi: req.body.id_unit_prodi,
      kode_cpmk: req.body.kode_cpmk,
      deskripsi_cpmk: req.body.deskripsi_cpmk,
    };

    if (!data.id_unit_prodi && req.user?.role === 'prodi') {
      data.id_unit_prodi = req.user.id_unit;
    }

    if (await hasColumn('cpmk', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(`UPDATE cpmk SET ? WHERE id_cpmk=?`, [data, req.params.id]);

    // Optional update mapping
    if (req.body.id_mk) {
      await pool.query(
        `UPDATE map_cpmk_mk SET id_mk=? WHERE id_cpmk=?`,
        [req.body.id_mk, req.params.id]
      );
    }

    const [row] = await pool.query(
      `SELECT * FROM cpmk WHERE id_cpmk=?`,
      [req.params.id]
    );
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateCpmk:", err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// === SOFT DELETE ===
export const softDeleteCpmk = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('cpmk', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(`UPDATE cpmk SET ? WHERE id_cpmk=?`, [payload, req.params.id]);
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("Error softDeleteCpmk:", err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

// === RESTORE ===
export const restoreCpmk = async (req, res) => {
  try {
    await pool.query(`UPDATE cpmk SET deleted_at=NULL, deleted_by=NULL WHERE id_cpmk=?`, [req.params.id]);
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreCpmk:", err);
    res.status(500).json({ error: 'Restore failed' });
  }
};

// === HARD DELETE ===
export const hardDeleteCpmk = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM map_cpmk_mk WHERE id_cpmk=?`, [req.params.id]);
    await conn.query(`DELETE FROM cpmk WHERE id_cpmk=?`, [req.params.id]);
    await conn.commit();
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    await conn.rollback();
    console.error("Error hardDeleteCpmk:", err);
    res.status(500).json({ error: 'Hard delete failed' });
  } finally {
    conn.release();
  }
};
