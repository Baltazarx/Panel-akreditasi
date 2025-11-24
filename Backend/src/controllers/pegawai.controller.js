import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== LIST =====
export const listPegawai = async (req, res) => {
  try {
    // Alias 'p' untuk pegawai
    const { where, params } = await buildWhere(req, 'pegawai', 'p');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_pegawai', 'p');

    // [UPDATE] Join ke Unit Kerja DAN Jabatan Struktural
    const sql = `
      SELECT 
        p.*,
        uk.nama_unit,
        rjs.nama_jabatan AS jabatan_struktural
      FROM pegawai p
      LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      LEFT JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listPegawai:", err);
    res.status(500).json({ error: 'List failed', details: err.message });
  }
};

// ===== GET BY ID =====
export const getPegawaiById = async (req, res) => {
  try {
    // [UPDATE] Join ke Unit Kerja DAN Jabatan Struktural
    const [rows] = await pool.query(
      `SELECT p.*, uk.nama_unit, rjs.nama_jabatan AS jabatan_struktural
       FROM pegawai p
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       LEFT JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
       WHERE p.id_pegawai=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getPegawaiById:", err);
    res.status(500).json({ error: 'Get failed', details: err.message });
  }
};

// ===== CREATE =====
export const createPegawai = async (req, res) => {
  try {
    // [UPDATE] Menambahkan id_unit dan id_jabatan ke payload
    const data = {
      nama_lengkap: req.body.nama_lengkap,
      pendidikan_terakhir: req.body.pendidikan_terakhir,
      id_unit: req.body.id_unit || null,         // Unit Kerja
      id_jabatan: req.body.id_jabatan || null,   // Jabatan Struktural
    };

    if (await hasColumn('pegawai', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO pegawai SET ?`, [data]);
    
    // Return data lengkap dengan nama unit dan jabatan
    const [row] = await pool.query(
      `SELECT p.*, uk.nama_unit, rjs.nama_jabatan AS jabatan_struktural
       FROM pegawai p
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       LEFT JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
       WHERE p.id_pegawai=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createPegawai:", err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
};

// ===== UPDATE =====
export const updatePegawai = async (req, res) => {
  try {
    // [UPDATE] Menambahkan id_unit dan id_jabatan ke payload update
    const data = {
      nama_lengkap: req.body.nama_lengkap,
      pendidikan_terakhir: req.body.pendidikan_terakhir,
      id_unit: req.body.id_unit || null,
      id_jabatan: req.body.id_jabatan || null,
    };

    if (await hasColumn('pegawai', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE pegawai SET ? WHERE id_pegawai=?`,
      [data, req.params.id]
    );

    const [row] = await pool.query(
      `SELECT p.*, uk.nama_unit, rjs.nama_jabatan AS jabatan_struktural
       FROM pegawai p
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       LEFT JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
       WHERE p.id_pegawai=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updatePegawai:", err);
    res.status(500).json({ error: 'Update failed', details: err.message });
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
    console.error("Error deletePegawai:", err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
};

// ===== RESTORE =====
export const restorePegawai = async (req, res) => {
  try {
    await pool.query(
      `UPDATE pegawai SET deleted_at=NULL, deleted_by=NULL WHERE id_pegawai=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restorePegawai:", err);
    res.status(500).json({ error: 'Restore failed', details: err.message });
  }
};

// ===== HARD DELETE =====
export const hardDeletePegawai = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM pegawai WHERE id_pegawai=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error("Error hardDeletePegawai:", err);
    // Cek foreign key constraint error (misal pegawai dipakai di tabel lain)
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ error: 'Tidak dapat menghapus pegawai karena data masih digunakan di tabel lain.' });
    }
    res.status(500).json({ error: 'Hard delete failed', details: err.message });
  }
};