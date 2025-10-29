import { pool } from '../db.js';
import { hasColumn } from '../utils/queryHelper.js';

// ===== LIST dengan scope unit =====
export const listDosen = async (req, res) => {
  try {
    const { role, id_unit } = req.user || {};
    // === PERBAIKAN 1: Sesuaikan nama role di Set ===
    const superRoles = new Set(['waket1', 'waket2', 'tpm', 'ketuastikom']); // Hapus tanda hubung

    let sql = `
      SELECT
        d.id_dosen,
        d.nidn,
        d.nuptk,
        d.beban_sks,
        d.homebase,
        d.pt,
        p.nama_lengkap,
        d.id_pegawai,
        rjf.nama_jafung AS jabatan_fungsional,
        d.id_jafung,
        u.id_unit,
        uk.nama_unit,
        rjs.nama_jabatan AS jabatan_struktural,
        rjs.sks_beban AS sks_manajemen_auto
      FROM dosen d
      JOIN pegawai p ON d.id_pegawai = p.id_pegawai
      LEFT JOIN users u ON u.id_pegawai = p.id_pegawai
      LEFT JOIN unit_kerja uk ON u.id_unit = uk.id_unit
      LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
      LEFT JOIN pimpinan_upps_ps pup ON pup.id_pegawai = p.id_pegawai
        AND pup.deleted_at IS NULL
        AND (pup.periode_selesai IS NULL OR pup.periode_selesai >= CURDATE())
      LEFT JOIN ref_jabatan_struktural rjs ON pup.id_jabatan = rjs.id_jabatan
      WHERE d.deleted_at IS NULL  -- Filter wajib untuk data aktif
    `; // Hapus WHERE kedua dari sini

    const params = [];

    // === PERBAIKAN 2: Gunakan AND untuk filter tambahan ===
    // Cek role case-insensitive
    if (role && !superRoles.has(role.toLowerCase())) {
      // Jika BUKAN superadmin DAN punya id_unit, filter berdasarkan unit
      if (id_unit) {
         sql += ` AND u.id_unit = ?`; // Gunakan AND
         params.push(id_unit);
      } else {
         // Handle kasus jika role bukan superadmin TAPI tidak punya id_unit?
         // Mungkin return error atau data kosong?
         console.warn(`Role ${role} is not superadmin but has no id_unit.`);
         // Untuk sementara, kita return array kosong agar tidak error SQL
         return res.json([]);
      }
    }
    // Jika superadmin, tidak perlu filter unit tambahan

    sql += ` ORDER BY d.id_dosen ASC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listDosen:", err);
    res.status(500).json({ error: 'List failed', message: err.message }); // Sertakan pesan error
  }
};

// ===== GET BY ID =====
export const getDosenById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, p.nama_lengkap, rjf.nama_jafung AS jabatan_fungsional,
              u.id_unit, uk.nama_unit
       FROM dosen d
       JOIN pegawai p ON d.id_pegawai = p.id_pegawai
       LEFT JOIN users u ON u.id_pegawai = p.id_pegawai
       LEFT JOIN unit_kerja uk ON u.id_unit = uk.id_unit
       LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
       WHERE d.id_dosen=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getDosenById:", err);
    res.status(500).json({ error: 'Get failed' });
  }
};

// ===== CREATE =====
export const createDosen = async (req, res) => {
  try {
    const data = {
      id_pegawai: req.body.id_pegawai,
      nidn: req.body.nidn,
      nuptk: req.body.nuptk,
      homebase: req.body.homebase,
      id_jafung: req.body.id_jafung,
      beban_sks: req.body.beban_sks,
      pt: req.body.pt,
    };
    if (await hasColumn('dosen', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO dosen SET ?`, [data]);

    const [row] = await pool.query(
      `SELECT d.*, p.nama_lengkap, rjf.nama_jafung AS jabatan_fungsional,
              u.id_unit, uk.nama_unit
       FROM dosen d
       JOIN pegawai p ON d.id_pegawai = p.id_pegawai
       LEFT JOIN users u ON u.id_pegawai = p.id_pegawai
       LEFT JOIN unit_kerja uk ON u.id_unit = uk.id_unit
       LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
       WHERE d.id_dosen=?`,
      [r.insertId]
    );

    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createDosen:", err);
    res.status(500).json({ error: 'Create failed' });
  }
};

// ===== UPDATE =====
export const updateDosen = async (req, res) => {
  try {
    const data = {
      id_pegawai: req.body.id_pegawai,
      nidn: req.body.nidn,
      nuptk: req.body.nuptk,
      homebase: req.body.homebase,
      id_jafung: req.body.id_jafung,
      beban_sks: req.body.beban_sks,
      pt: req.body.pt,
    };
    if (await hasColumn('dosen', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    // Hapus properti undefined agar tidak menimpa dengan NULL
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'Tidak ada data untuk diupdate.'});
    }

    await pool.query(
      `UPDATE dosen SET ? WHERE id_dosen=?`,
      [data, req.params.id]
    );

    const [row] = await pool.query(
      `SELECT d.*, p.nama_lengkap, rjf.nama_jafung AS jabatan_fungsional,
              u.id_unit, uk.nama_unit
       FROM dosen d
       JOIN pegawai p ON d.id_pegawai = p.id_pegawai
       LEFT JOIN users u ON u.id_pegawai = p.id_pegawai
       LEFT JOIN unit_kerja uk ON u.id_unit = uk.id_unit
       LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
       WHERE d.id_dosen=?`,
      [req.params.id]
    );

    if (!row[0]) return res.status(404).json({ error: 'Not found after update' }); // Sedikit modifikasi pesan error
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateDosen:", err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// ===== DELETE (soft/hard) =====
export const softDeleteDosen = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('dosen', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE dosen SET ? WHERE id_dosen=?`,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("Error softDeleteDosen:", err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

export const restoreDosen = async (req, res) => {
  try {
    await pool.query(
      `UPDATE dosen SET deleted_at=NULL, deleted_by=NULL WHERE id_dosen=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreDosen:", err);
    res.status(500).json({ error: 'Restore failed' });
  }
};

export const hardDeleteDosen = async (req, res) => {
  try {
    // Tambahkan logika transaksi jika perlu menghapus data terkait di tabel lain
    await pool.query(
      `DELETE FROM dosen WHERE id_dosen=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error("Error hardDeleteDosen:", err);
    res.status(500).json({ error: 'Hard delete failed' });
  }
};