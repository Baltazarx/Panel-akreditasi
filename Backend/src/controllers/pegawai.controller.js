import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== LIST =====
export const listPegawai = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'pegawai', 'p');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_pegawai', 'p');

    const sql = `
      SELECT 
        p.*,
        uk.nama_unit,
        rjs.nama_jabatan AS jabatan_struktural,
        
        -- [LOGIC BARU: POIN 2] 
        -- Menggabungkan "Ketua/Staff" dengan "Nama Unit" untuk tampilan.
        -- Contoh Output: "Ketua Prodi TI", "Staff Keuangan", "Ketua LPPM"
        TRIM(CONCAT(COALESCE(rjs.nama_jabatan, ''), ' ', COALESCE(uk.nama_unit, ''))) AS jabatan_display
        
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
    const [rows] = await pool.query(
      `SELECT 
         p.*, 
         uk.nama_unit, 
         rjs.nama_jabatan AS jabatan_struktural,
         TRIM(CONCAT(COALESCE(rjs.nama_jabatan, ''), ' ', COALESCE(uk.nama_unit, ''))) AS jabatan_display
       FROM pegawai p
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       LEFT JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
       WHERE p.id_pegawai=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Get failed', details: err.message });
  }
};

// ===== CREATE =====
export const createPegawai = async (req, res) => {
  try {
    // [LOGIC BARU: POIN 3] Input NIKP sekarang ada di sini
    const data = {
      nama_lengkap: req.body.nama_lengkap,
      nikp: req.body.nikp || null, // Field baru
      pendidikan_terakhir: req.body.pendidikan_terakhir,
      id_unit: req.body.id_unit || null,
      id_jabatan: req.body.id_jabatan || null, // Hanya akan berisi 1 (Ketua) atau 2 (Staff)
    };

    if (await hasColumn('pegawai', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO pegawai SET ?`, [data]);
    
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
    // [LOGIC BARU: POIN 3] Update NIKP juga
    const data = {
      nama_lengkap: req.body.nama_lengkap,
      nikp: req.body.nikp || null,
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

// ... (Fungsi Delete/Restore/HardDelete tetap sama, gunakan kode lama untuk bagian ini)
export const deletePegawai = async (req, res) => {
    // Gunakan kode delete yang sudah ada sebelumnya
    try {
        if (await hasColumn('pegawai', 'deleted_at')) {
            const payload = { deleted_at: new Date() };
            if (await hasColumn('pegawai', 'deleted_by')) payload.deleted_by = req.user?.id_user || null;
            await pool.query(`UPDATE pegawai SET ? WHERE id_pegawai=?`, [payload, req.params.id]);
            return res.json({ ok: true, softDeleted: true });
        }
        await pool.query(`DELETE FROM pegawai WHERE id_pegawai=?`, [req.params.id]);
        res.json({ ok: true, hardDeleted: true });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
};

export const restorePegawai = async (req, res) => {
    try {
        await pool.query(`UPDATE pegawai SET deleted_at=NULL WHERE id_pegawai=?`, [req.params.id]);
        res.json({ ok: true, restored: true });
    } catch (err) { res.status(500).json({ error: 'Restore failed' }); }
};

export const hardDeletePegawai = async (req, res) => {
    try {
        await pool.query(`DELETE FROM pegawai WHERE id_pegawai=?`, [req.params.id]);
        res.json({ ok: true, hardDeleted: true });
    } catch (err) { res.status(500).json({ error: 'Hard delete failed' }); }
};