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
  } catch (err) { // <-- [FIXED] Added (err)
    console.error("Error listTahun:", err);
    res.status(500).json({ error: 'List failed', details: err.message });
  }
};

// ===== LIST DROPDOWN =====
export const listTahunDropdown = async (req, res) => {
  try {
    const sql = `
      SELECT id_tahun, tahun
      FROM tahun_akademik
      WHERE deleted_at IS NULL
      ORDER BY id_tahun DESC
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) { // <-- [FIXED] Added (err)
    console.error("Error listTahunDropdown:", err);
    res.status(500).json({ error: 'Gagal mengambil daftar tahun untuk dropdown', details: err.message });
  }
};


// ===== GET BY ID =====
export const getTahunById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM tahun_akademik WHERE id_tahun=?`,
      [req.params.id]
    );
    // [FIXED] Typo 4404 diubah menjadi 404
    if (!rows[0]) return res.status(404).json({ error: 'Not found' }); 
    res.json(rows[0]);
  } catch (err) { // <-- [FIXED] Added (err)
    console.error("Error getTahunById:", err);
    res.status(500).json({ error: 'Get failed', details: err.message });
  }
};

// ===== CREATE =====
export const createTahun = async (req, res) => {
  try {
    const { id_tahun, tahun } = req.body;
    if (!id_tahun || !tahun) {
        return res.status(400).json({ error: 'id_tahun (cth: 2024) dan tahun (cth: 2024/2025) wajib diisi.'});
    }

    const data = { id_tahun, tahun };
    
    if (await hasColumn('tahun_akademik', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    await pool.query(`INSERT INTO tahun_akademik SET ?`, [data]);
    
    const [row] = await pool.query(
      `SELECT * FROM tahun_akademik WHERE id_tahun=?`,
      [id_tahun] 
    );
    res.status(201).json(row[0]);
  } catch (err) { // <-- [FIXED] Added (err)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: `id_tahun '${req.body.id_tahun}' sudah ada di database.` });
    }
    console.error("Error createTahun:", err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
};

// ===== UPDATE =====
export const updateTahun = async (req, res) => {
  try {
    const data = { tahun: req.body.tahun };
    if (await hasColumn('tahun_akademik', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    const [result] = await pool.query( // <-- [FIXED] Added [result]
      `UPDATE tahun_akademik SET ? WHERE id_tahun=?`,
      [data, req.params.id]
    );

    // [FIXED] Cek affectedRows sebelum query SELECT
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    const [row] = await pool.query(
      `SELECT * FROM tahun_akademik WHERE id_tahun=?`,
      [req.params.id]
    );
    res.json(row[0]);
  } catch (err) { // <-- [FIXED] Added (err)
    console.error("Error updateTahun:", err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

// ===== DELETE =====
export const deleteTahun = async (req, res) => {
  try {
    let result; // <-- [FIXED] Deklarasi result
    if (await hasColumn('tahun_akademik', 'deleted_at')) {
      const payload = { deleted_at: new Date() };
      if (await hasColumn('tahun_akademik', 'deleted_by')) {
        payload.deleted_by = req.user?.id_user || null;
      }
      [result] = await pool.query( // <-- [FIXED] Assign result
        `UPDATE tahun_akademik SET ? WHERE id_tahun=?`,
        [payload, req.params.id]
      );

      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
      return res.json({ ok: true, softDeleted: true });
    }

    [result] = await pool.query( // <-- [FIXED] Assign result
      `DELETE FROM tahun_akademik WHERE id_tahun=?`,
      [req.params.id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, hardDeleted: true });
  } catch (err) { // <-- [FIXED] Added (err)
    console.error("Error deleteTahun:", err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
};