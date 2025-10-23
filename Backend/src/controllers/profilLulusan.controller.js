import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// LIST
export const listProfilLulusan = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'profil_lulusan', 'pl');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_pl', 'pl');

    const sql = `
      SELECT
        pl.id_pl,
        pl.id_unit_prodi,
        uk.nama_unit AS nama_unit_prodi,
        pl.kode_pl,
        pl.deskripsi_pl,
        pl.deleted_at
      FROM profil_lulusan pl
      LEFT JOIN unit_kerja uk ON pl.id_unit_prodi = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error listProfilLulusan:', err);
    res.status(500).json({ error: 'List failed' });
  }
};

// DETAIL
export const getProfilLulusanById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        pl.*, 
        uk.nama_unit AS nama_unit_prodi 
      FROM profil_lulusan pl 
      LEFT JOIN unit_kerja uk ON pl.id_unit_prodi = uk.id_unit 
      WHERE id_pl = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getProfilLulusanById:', err);
    res.status(500).json({ error: 'Get failed' });
  }
};

// CREATE
export const createProfilLulusan = async (req, res) => {
  try {
    // === PERBAIKAN DI SINI ===
    // Baca 'deskripsi' dari body, bukan 'deskripsi_pl'
    const { id_unit_prodi, kode_pl, deskripsi } = req.body;
    
    if (!kode_pl || !deskripsi) {
      return res.status(400).json({ error: 'Field `kode_pl` dan `deskripsi` wajib diisi.'});
    }

    const data = {
      id_unit_prodi: id_unit_prodi,
      kode_pl: kode_pl,
      // Petakan 'deskripsi' dari body ke kolom 'deskripsi_pl'
      deskripsi_pl: deskripsi, 
    };

    // ===== PATCH: auto isi id_unit_prodi kalau role prodi =====
    if (!data.id_unit_prodi && req.user?.role === 'prodi') {
      data.id_unit_prodi = req.user.id_unit_prodi;
    }
    
    if (!data.id_unit_prodi) {
        return res.status(400).json({ error: 'Field `id_unit_prodi` wajib diisi.'});
    }

    if (await hasColumn('profil_lulusan', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO profil_lulusan SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT 
        pl.*, 
        uk.nama_unit AS nama_unit_prodi 
      FROM profil_lulusan pl 
      LEFT JOIN unit_kerja uk ON pl.id_unit_prodi = uk.id_unit 
      WHERE id_pl = ?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    console.error('Error createProfilLulusan:', err);
    res.status(500).json({ error: 'Create failed' });
  }
};

// UPDATE
export const updateProfilLulusan = async (req, res) => {
  try {
    // === PERBAIKAN DI SINI JUGA ===
    // Baca 'deskripsi' dari body, bukan 'deskripsi_pl'
    const { id_unit_prodi, kode_pl, deskripsi } = req.body;
    
    const data = {
      id_unit_prodi: id_unit_prodi,
      kode_pl: kode_pl,
      // Petakan 'deskripsi' dari body ke kolom 'deskripsi_pl'
      deskripsi_pl: deskripsi,
    };
    
    // Hapus properti yang tidak didefinisikan agar tidak menimpa data yang ada dengan NULL
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'Tidak ada data untuk diupdate.'});
    }

    if (await hasColumn('profil_lulusan', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(`UPDATE profil_lulusan SET ? WHERE id_pl = ?`, [data, req.params.id]);
    const [row] = await pool.query(
      `SELECT 
        pl.*, 
        uk.nama_unit AS nama_unit_prodi 
      FROM profil_lulusan pl 
      LEFT JOIN unit_kerja uk ON pl.id_unit_prodi = uk.id_unit 
      WHERE id_pl = ?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    console.error('Error updateProfilLulusan:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// SOFT DELETE
export const softDeleteProfilLulusan = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('profil_lulusan', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(`UPDATE profil_lulusan SET ? WHERE id_pl = ?`, [payload, req.params.id]);
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error('Error softDeleteProfilLulusan:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

// RESTORE
export const restoreProfilLulusan = async (req, res) => {
  try {
    await pool.query(
      `UPDATE profil_lulusan 
       SET deleted_at = NULL, deleted_by = NULL 
       WHERE id_pl = ?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error('Error restoreProfilLulusan:', err);
    res.status(500).json({ error: 'Restore failed' });
  }
};

// HARD DELETE
export const hardDeleteProfilLulusan = async (req, res) => {
  try {
    await pool.query(`DELETE FROM profil_lulusan WHERE id_pl = ?`, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error('Error hardDeleteProfilLulusan:', err);
    res.status(500).json({ error: 'Hard delete failed' });
  }
};
