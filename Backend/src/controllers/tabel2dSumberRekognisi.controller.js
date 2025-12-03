import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===============================================================
// =============== LIST SUMBER REKOGNISI =========================
// ===============================================================
export const listSumberRekognisi = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'sumber_rekognisi_master', 'srm');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_sumber', 'srm');

    // Default filter soft delete
    if (!where.some(w => w.includes('deleted_at')) && String(req.query?.include_deleted) !== '1') {
      if (await hasColumn('sumber_rekognisi_master', 'deleted_at')) {
        where.push('srm.deleted_at IS NULL');
      }
    }

    const sql = `
      SELECT 
        srm.id_sumber,
        srm.nama_sumber,
        srm.deleted_at
      FROM sumber_rekognisi_master srm
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);

  } catch (err) {
    console.error("Error listSumberRekognisi:", err);
    res.status(500).json({ error: 'Gagal mengambil daftar sumber rekognisi' });
  }
};

// ===============================================================
// ==================== GET BY ID ================================
// ===============================================================
export const getSumberRekognisiById = async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query(`
      SELECT * FROM sumber_rekognisi_master 
      WHERE id_sumber = ?
    `, [id]);

    if (!rows[0]) {
      return res.status(404).json({ error: 'Sumber rekognisi tidak ditemukan.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error("Error getSumberRekognisiById:", err);
    res.status(500).json({ error: 'Gagal mengambil detail sumber rekognisi' });
  }
};

// ===============================================================
// ==================== CREATE ==================================
// ===============================================================
export const createSumberRekognisi = async (req, res) => {
  try {
    const { nama_sumber } = req.body;

    if (!nama_sumber?.trim()) {
      return res.status(400).json({ error: 'Nama sumber rekognisi wajib diisi.' });
    }

    const data = { nama_sumber };

    if (await hasColumn('sumber_rekognisi_master', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [result] = await pool.query(`
      INSERT INTO sumber_rekognisi_master SET ?
    `, [data]);

    res.status(201).json({
      message: 'Sumber rekognisi berhasil dibuat',
      id: result.insertId
    });

  } catch (err) {
    console.error("Error createSumberRekognisi:", err);
    res.status(500).json({ error: 'Gagal membuat sumber rekognisi baru', details: err.sqlMessage || err.message });
  }
};

// ===============================================================
// ==================== UPDATE ==================================
// ===============================================================
export const updateSumberRekognisi = async (req, res) => {
  try {
    const { nama_sumber } = req.body;

    if (!nama_sumber?.trim()) {
      return res.status(400).json({ error: 'Nama sumber rekognisi wajib diisi.' });
    }

    const data = { nama_sumber };

    if (await hasColumn('sumber_rekognisi_master', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    const [result] = await pool.query(`
      UPDATE sumber_rekognisi_master 
      SET ? 
      WHERE id_sumber = ?
    `, [data, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }

    res.json({ message: 'Sumber rekognisi berhasil diperbarui' });

  } catch (err) {
    console.error("Error updateSumberRekognisi:", err);
    res.status(500).json({ error: 'Gagal memperbarui sumber rekognisi', details: err.sqlMessage || err.message });
  }
};

// ===============================================================
// ==================== SOFT DELETE ==============================
// ===============================================================
export const softDeleteSumberRekognisi = async (req, res) => {
  try {
    const id_sumber = req.params.id;

    // Cek apakah digunakan
    const [usage] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM rekognisi_lulusan_detail 
      WHERE id_sumber = ?
    `, [id_sumber]);

    if (usage[0].count > 0) {
      return res.status(400).json({
        error: 'Tidak bisa menghapus: Sumber rekognisi sedang digunakan pada data rekognisi.'
      });
    }

    const payload = { deleted_at: new Date() };

    if (await hasColumn('sumber_rekognisi_master', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }

    const [result] = await pool.query(`
      UPDATE sumber_rekognisi_master 
      SET ? 
      WHERE id_sumber = ?
    `, [payload, id_sumber]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }

    res.json({ message: 'Sumber rekognisi berhasil dihapus (soft delete)' });

  } catch (err) {
    console.error("Error softDeleteSumberRekognisi:", err);
    res.status(500).json({ error: 'Gagal melakukan soft delete' });
  }
};

// ===============================================================
// ==================== RESTORE =================================
// ===============================================================
export const restoreSumberRekognisi = async (req, res) => {
  try {
    const id_sumber = req.params.id;

    const payload = { deleted_at: null };

    if (await hasColumn('sumber_rekognisi_master', 'deleted_by')) {
      payload.deleted_by = null;
    }

    const [result] = await pool.query(`
      UPDATE sumber_rekognisi_master 
      SET ? 
      WHERE id_sumber = ? AND deleted_at IS NOT NULL
    `, [payload, id_sumber]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan.' });
    }

    res.json({ message: 'Sumber rekognisi berhasil dipulihkan' });

  } catch (err) {
    console.error("Error restoreSumberRekognisi:", err);
    res.status(500).json({ error: 'Gagal memulihkan data' });
  }
};

// ===============================================================
// ==================== HARD DELETE ==============================
// ===============================================================
export const hardDeleteSumberRekognisi = async (req, res) => {
  try {
    const id_sumber = req.params.id;

    // Cek apakah digunakan → tidak boleh hapus permanen jika masih terpakai
    const [usage] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM rekognisi_lulusan_detail 
      WHERE id_sumber = ?
    `, [id_sumber]);

    if (usage[0].count > 0) {
      return res.status(400).json({
        error: 'Gagal menghapus: Sumber rekognisi sedang digunakan dalam data rekognisi.'
      });
    }

    const [result] = await pool.query(`
      DELETE FROM sumber_rekognisi_master 
      WHERE id_sumber = ?
    `, [id_sumber]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }

    res.json({ message: 'Sumber rekognisi berhasil dihapus permanen.' });

  } catch (err) {
    console.error("Error hardDeleteSumberRekognisi:", err);
    res.status(500).json({
      error: 'Gagal melakukan hard delete',
      details: err.sqlMessage || err.message
    });
  }
};
