import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// === LIST CPL ===
export const listCpl = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'cpl', 'c');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_cpl', 'c');

    const sql = `
      SELECT 
        c.id_cpl,
        c.id_unit_prodi,
        uk.nama_unit AS nama_unit_prodi,
        c.kode_cpl,
        c.deskripsi_cpl,
        c.deleted_at
      FROM cpl c
      LEFT JOIN unit_kerja uk ON c.id_unit_prodi = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listCpl:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// === DETAIL CPL ===
export const getCplById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, uk.nama_unit AS nama_unit_prodi
       FROM cpl c
       LEFT JOIN unit_kerja uk ON c.id_unit_prodi = uk.id_unit
       WHERE id_cpl = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getCplById:", err);
    res.status(500).json({ error: 'Get failed' });
  }
};

// === CREATE CPL ===
export const createCpl = async (req, res) => {
  try {
    // === PERBAIKAN DI SINI ===
    // Baca 'deskripsi' dari body, bukan 'deskripsi_cpl'
    const { id_unit_prodi, kode_cpl, deskripsi } = req.body;

    if (!kode_cpl || !deskripsi) {
      return res.status(400).json({ error: 'Field `kode_cpl` dan `deskripsi` wajib diisi.' });
    }

    const data = {
      id_unit_prodi: id_unit_prodi,
      kode_cpl: kode_cpl,
      // Petakan 'deskripsi' dari body ke kolom 'deskripsi_cpl'
      deskripsi_cpl: deskripsi,
    };

    // multi-prodi aware
    if (!data.id_unit_prodi && req.user?.role === 'prodi') {
      data.id_unit_prodi = req.user.id_unit;
    }

    if (!data.id_unit_prodi) {
      return res.status(400).json({ error: 'Field `id_unit_prodi` wajib diisi.' });
    }

    if (await hasColumn('cpl', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO cpl SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT c.*, uk.nama_unit AS nama_unit_prodi
       FROM cpl c
       LEFT JOIN unit_kerja uk ON c.id_unit_prodi = uk.id_unit
       WHERE id_cpl = ?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createCpl:", err);
    res.status(500).json({ error: 'Create failed' });
  }
};

// === UPDATE CPL ===
export const updateCpl = async (req, res) => {
  try {
    // === PERBAIKAN DI SINI JUGA ===
    // Baca 'deskripsi' dari body, bukan 'deskripsi_cpl'
    const { id_unit_prodi, kode_cpl, deskripsi } = req.body;

    const data = {
      id_unit_prodi: id_unit_prodi,
      kode_cpl: kode_cpl,
      // Petakan 'deskripsi' dari body ke kolom 'deskripsi_cpl'
      deskripsi_cpl: deskripsi,
    };

    // Hapus properti yang tidak didefinisikan agar tidak menimpa data yang ada dengan NULL
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Tidak ada data untuk diupdate.' });
    }

    if (await hasColumn('cpl', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(`UPDATE cpl SET ? WHERE id_cpl = ?`, [data, req.params.id]);
    const [row] = await pool.query(
      `SELECT c.*, uk.nama_unit AS nama_unit_prodi
       FROM cpl c
       LEFT JOIN unit_kerja uk ON c.id_unit_prodi = uk.id_unit
       WHERE id_cpl = ?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateCpl:", err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// === SOFT DELETE ===
export const softDeleteCpl = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('cpl', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(`UPDATE cpl SET ? WHERE id_cpl = ?`, [payload, req.params.id]);
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("Error softDeleteCpl:", err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

// === RESTORE ===
export const restoreCpl = async (req, res) => {
  try {
    await pool.query(`UPDATE cpl SET deleted_at=NULL, deleted_by=NULL WHERE id_cpl=?`, [req.params.id]);
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreCpl:", err);
    res.status(500).json({ error: 'Restore failed' });
  }
};

// === HARD DELETE (hapus juga mapping) ===
export const hardDeleteCpl = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Hapus mapping CPL ke Profil Lulusan (2B.2)
    await conn.query(`DELETE FROM map_cpl_pl WHERE id_cpl=?`, [req.params.id]);

    // 2. Hapus mapping CPMK ke CPL (Pemetaan)
    await conn.query(`DELETE FROM map_cpmk_cpl WHERE id_cpl=?`, [req.params.id]);

    // 3. Hapus CPL
    await conn.query(`DELETE FROM cpl WHERE id_cpl=?`, [req.params.id]);

    await conn.commit();
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    await conn.rollback();
    console.error("Error hardDeleteCpl:", err);
    res.status(500).json({ error: 'Hard delete failed', details: err.sqlMessage || err.message });
  } finally {
    conn.release();
  }
};
