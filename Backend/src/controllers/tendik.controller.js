/*
============================================================
 FILE: tendik.controller.js
 
 FUNGSI: CRUD Master Data Tenaga Kependidikan.
 TABEL: tenaga_kependidikan.
 
 LOGIKA:
 - Menghubungkan 'id_pegawai' dengan 'jenis_tendik'.
 - Data pendidikan & unit diambil otomatis dari tabel 'pegawai' via JOIN.
============================================================
*/

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
        uk.nama_unit
      FROM tenaga_kependidikan tk
      LEFT JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
      LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listTendik:", err);
    res.status(500).json({ error: 'List failed', details: err.message });
  }
};

// ===== GET BY ID =====
export const getTendikById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tk.*, p.nama_lengkap 
       FROM tenaga_kependidikan tk
       LEFT JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
       WHERE tk.id_tendik=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getTendikById:", err);
    res.status(500).json({ error: 'Get failed', details: err.message });
  }
};

// ===== CREATE =====
export const createTendik = async (req, res) => {
  try {
    const { id_pegawai, jenis_tendik, nikp } = req.body;

    if (!id_pegawai || !jenis_tendik) {
        return res.status(400).json({ error: 'Pegawai dan Jenis Tendik wajib diisi.' });
    }

    // Cek duplikasi
    const [existing] = await pool.query(
        `SELECT id_tendik FROM tenaga_kependidikan WHERE id_pegawai = ? AND deleted_at IS NULL`, 
        [id_pegawai]
    );
    if (existing.length > 0) {
        return res.status(409).json({ error: 'Pegawai ini sudah terdaftar sebagai Tenaga Kependidikan.' });
    }

    const data = { id_pegawai, jenis_tendik, nikp };

    if (await hasColumn('tenaga_kependidikan', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO tenaga_kependidikan SET ?`, [data]);
    
    const [row] = await pool.query(
      `SELECT tk.*, p.nama_lengkap 
       FROM tenaga_kependidikan tk
       LEFT JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
       WHERE tk.id_tendik=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);

  } catch (err) {
    console.error("Error createTendik:", err);
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Data duplikat (NIKP sudah ada).', details: err.sqlMessage });
    }
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
};

// ===== UPDATE =====
export const updateTendik = async (req, res) => {
  try {
    const { id_pegawai, jenis_tendik, nikp } = req.body;
    
    const data = { id_pegawai, jenis_tendik, nikp };

    if (await hasColumn('tenaga_kependidikan', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE tenaga_kependidikan SET ? WHERE id_tendik=?`,
      [data, req.params.id]
    );

    const [row] = await pool.query(
      `SELECT tk.*, p.nama_lengkap 
       FROM tenaga_kependidikan tk
       LEFT JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
       WHERE tk.id_tendik=?`,
      [req.params.id]
    );
    
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateTendik:", err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

// ===== DELETE (Soft) =====
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
  } catch (err) {
    console.error("Error softDeleteTendik:", err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
};

// ===== RESTORE =====
export const restoreTendik = async (req, res) => {
  try {
    await pool.query(
      `UPDATE tenaga_kependidikan SET deleted_at=NULL, deleted_by=NULL WHERE id_tendik=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreTendik:", err);
    res.status(500).json({ error: 'Restore failed', details: err.message });
  }
};

// ===== HARD DELETE =====
export const hardDeleteTendik = async (req, res) => {
  try {
    const idTendik = req.params.id;
    
    // Cek apakah data ada
    const [checkRows] = await pool.query(
      `SELECT id_tendik FROM tenaga_kependidikan WHERE id_tendik=?`,
      [idTendik]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }
    
    // Hapus data terkait di kualifikasi_tendik terlebih dahulu (jika ada)
    // Cek apakah tabel kualifikasi_tendik ada dan punya relasi
    try {
      const [kualifikasiRows] = await pool.query(
        `SELECT id_kualifikasi FROM kualifikasi_tendik WHERE id_tendik=?`,
        [idTendik]
      );
      
      if (kualifikasiRows.length > 0) {
        // Hapus data kualifikasi terlebih dahulu
        await pool.query(
          `DELETE FROM kualifikasi_tendik WHERE id_tendik=?`,
          [idTendik]
        );
      }
    } catch (kualifikasiErr) {
      // Jika tabel tidak ada atau error, lanjutkan saja (mungkin tabel belum dibuat)
      console.log("Info: Tabel kualifikasi_tendik tidak ditemukan atau error:", kualifikasiErr.message);
    }
    
    // Hapus data utama
    const [result] = await pool.query(
      `DELETE FROM tenaga_kependidikan WHERE id_tendik=?`,
      [idTendik]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }
    
    res.json({ ok: true, hardDeleted: true, message: 'Data berhasil dihapus secara permanen.' });
  } catch (err) {
    console.error("Error hardDeleteTendik:", err);
    
    // Handle foreign key constraint error
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ 
        error: 'Data tidak dapat dihapus karena masih digunakan di tabel lain. Hapus data terkait terlebih dahulu.',
        details: err.message 
      });
    }
    
    res.status(500).json({ error: 'Hard delete failed', details: err.message });
  }
};