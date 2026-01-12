import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== LIST dengan scope unit =====
export const listDosen = async (req, res) => {
  try {
    const { role, id_unit, id_unit_prodi } = req.user || {};
    const { include_deleted } = req.query;
    const superRoles = new Set(['waket1', 'waket2', 'tpm', 'ketua', 'admin']); // Ditambah admin jaga-jaga

    let sql = `
      SELECT 
        d.id_dosen,
        d.nidn,
        d.nuptk,
        d.beban_sks,
        d.pt,
        d.pt,
        -- [FIX] Gunakan id_unit_homebase dan join untuk dapat namanya
        d.id_unit_homebase,
        uk_hb.nama_unit AS homebase,
        p.nama_lengkap,
        d.id_pegawai,
        
        -- Jabatan Fungsional (Lektor, AA, dll)
        rjf.nama_jafung AS jabatan_fungsional,
        d.id_jafung,
        
        -- [FIX] Unit Kerja diambil dari Pegawai (p.id_unit), BUKAN Users
        p.id_unit,
        uk.nama_unit,
        
        -- [FIX] Jabatan Struktural diambil dari Pegawai
        rjs.nama_jabatan AS jabatan_struktural,
        rjs.sks_beban AS sks_manajemen_auto,
        
        d.deleted_at
      FROM dosen d
      JOIN pegawai p ON d.id_pegawai = p.id_pegawai
      
      -- [FIX] Join Unit via Pegawai
      -- [FIX] Join Unit via Pegawai
      LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit

      -- [FIX] Join Homebase Dosen
      LEFT JOIN unit_kerja uk_hb ON d.id_unit_homebase = uk_hb.id_unit
      
      -- Join Jabatan Fungsional
      LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
      
      -- [FIX] Join Jabatan Struktural via Pegawai
      LEFT JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
      
      -- (Opsional) Join Pimpinan jika logika SKS butuh cek periode aktif
      -- LEFT JOIN pimpinan_upps_ps pup ON pup.id_pegawai = p.id_pegawai 
      --   AND pup.deleted_at IS NULL
      --   AND (pup.periode_selesai IS NULL OR pup.periode_selesai >= CURDATE())
      
      WHERE 1=1
    `;

    const params = [];

    // Filter deleted records
    const shouldIncludeDeleted = include_deleted === '1' || include_deleted === 'true' || include_deleted === true;
    if (!shouldIncludeDeleted) {
      sql += ` AND d.deleted_at IS NULL`;
    }

    // [FIX] Filter by Unit (Logika Hak Akses)
    // Cek p.id_unit bukan u.id_unit
    if (role && !superRoles.has(role.toLowerCase()) && role.toLowerCase() !== 'lppm') {
      const userUnit = id_unit_prodi || id_unit;
      if (userUnit) {
        sql += ` AND p.id_unit = ?`;
        params.push(userUnit);
      }
    }
    // Role lppm melihat semua

    sql += ` ORDER BY d.id_dosen ASC`;

    // Debugging (Bisa dihapus nanti)
    // console.log('Executing SQL:', sql);
    // console.log('With params:', params);

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listDosen:", err);
    res.status(500).json({
      error: 'List failed',
      details: err.sqlMessage || err.message
    });
  }
};

// ===== GET BY ID =====
export const getDosenById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, 
              d.id_unit_homebase,
              uk_hb.nama_unit AS homebase,
              p.nama_lengkap, 
              rjf.nama_jafung AS jabatan_fungsional,
              p.id_unit, 
              uk.nama_unit
       FROM dosen d
       JOIN pegawai p ON d.id_pegawai = p.id_pegawai
       -- [FIX] Join ke Unit via Pegawai
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       -- [FIX] Join Homebase
       LEFT JOIN unit_kerja uk_hb ON d.id_unit_homebase = uk_hb.id_unit
       LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
       WHERE d.id_dosen=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getDosenById:", err);
    res.status(500).json({
      error: 'Get failed',
      details: err.sqlMessage || err.message
    });
  }
};

// ===== CREATE =====
export const createDosen = async (req, res) => {
  try {
    const data = {
      id_pegawai: req.body.id_pegawai,
      nidn: req.body.nidn,
      nuptk: req.body.nuptk,
      id_jafung: req.body.id_jafung,
      beban_sks: req.body.beban_sks,
      pt: req.body.pt,
      homebase: req.body.homebase,
    };

    // Manual mapping homebase string -> ID (6=TI, 7=MI)
    if (data.homebase) {
      if (data.homebase.includes('Teknik Informatika')) data.id_unit_homebase = 6;
      else if (data.homebase.includes('Manajemen Informatika')) data.id_unit_homebase = 7;
      delete data.homebase;
    }

    if (await hasColumn('dosen', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO dosen SET ?`, [data]);

    const [row] = await pool.query(
      `SELECT d.*, 
              d.id_unit_homebase,
              uk_hb.nama_unit AS homebase,
              p.nama_lengkap, 
              rjf.nama_jafung AS jabatan_fungsional,
              p.id_unit, 
              uk.nama_unit
       FROM dosen d
       JOIN pegawai p ON d.id_pegawai = p.id_pegawai
       -- [FIX] Join Unit via Pegawai
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       -- [FIX] Join Homebase
       LEFT JOIN unit_kerja uk_hb ON d.id_unit_homebase = uk_hb.id_unit
       LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
       WHERE d.id_dosen=?`,
      [r.insertId]
    );

    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createDosen:", err);
    res.status(500).json({
      error: 'Create failed',
      details: err.sqlMessage || err.message
    });
  }
};

// ===== UPDATE =====
export const updateDosen = async (req, res) => {
  try {
    const data = {
      id_pegawai: req.body.id_pegawai,
      nidn: req.body.nidn,
      nuptk: req.body.nuptk,
      id_jafung: req.body.id_jafung,
      beban_sks: req.body.beban_sks,
      pt: req.body.pt,
      homebase: req.body.homebase,
    };

    // Manual mapping homebase string -> ID (6=TI, 7=MI)
    if (data.homebase) {
      if (data.homebase.includes('Teknik Informatika')) data.id_unit_homebase = 6;
      else if (data.homebase.includes('Manajemen Informatika')) data.id_unit_homebase = 7;
      delete data.homebase;
    }

    if (await hasColumn('dosen', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    // Hapus properti undefined
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Tidak ada data untuk diupdate.' });
    }

    await pool.query(
      `UPDATE dosen SET ? WHERE id_dosen=?`,
      [data, req.params.id]
    );

    const [row] = await pool.query(
      `SELECT d.*, 
              d.id_unit_homebase,
              uk_hb.nama_unit AS homebase,
              p.nama_lengkap, 
              rjf.nama_jafung AS jabatan_fungsional,
              p.id_unit, 
              uk.nama_unit
       FROM dosen d
       JOIN pegawai p ON d.id_pegawai = p.id_pegawai
       -- [FIX] Join Unit via Pegawai
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       -- [FIX] Join Homebase
       LEFT JOIN unit_kerja uk_hb ON d.id_unit_homebase = uk_hb.id_unit
       LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
       WHERE d.id_dosen=?`,
      [req.params.id]
    );

    if (!row[0]) return res.status(404).json({ error: 'Not found after update' });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateDosen:", err);
    res.status(500).json({
      error: 'Update failed',
      details: err.sqlMessage || err.message
    });
  }
};

// ===== DELETE (Soft) =====
export const softDeleteDosen = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('dosen', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE dosen SET ? WHERE id_dosen =? `,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("Error softDeleteDosen:", err);
    res.status(500).json({
      error: 'Delete failed',
      details: err.sqlMessage || err.message
    });
  }
};

// ===== RESTORE =====
export const restoreDosen = async (req, res) => {
  try {
    await pool.query(
      `UPDATE dosen SET deleted_at = NULL WHERE id_dosen =? `,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreDosen:", err);
    res.status(500).json({
      error: 'Restore failed',
      details: err.sqlMessage || err.message
    });
  }
};

// ===== HARD DELETE =====
export const hardDeleteDosen = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM dosen WHERE id_dosen =? `,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error("Error hardDeleteDosen:", err);
    res.status(500).json({ error: 'Hard delete failed', details: err.message });
  }
};