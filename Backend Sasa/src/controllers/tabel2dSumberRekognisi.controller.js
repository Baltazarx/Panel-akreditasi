import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// === LIST SEMUA SUMBER REKOGNISI ===
export const listSumberRekognisi = async (req, res) => {
  try {
    // buildWhere biasanya tidak terlalu relevan untuk tabel master sederhana ini,
    // tapi tetap disertakan untuk konsistensi (misal: filter soft delete)
    const { where, params } = await buildWhere(req, 'sumber_rekognisi_master', 'srm');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_sumber', 'srm');

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

// === CREATE SUMBER REKOGNISI BARU ===
export const createSumberRekognisi = async (req, res) => {
  try {
    const { nama_sumber } = req.body;

    if (!nama_sumber) {
      return res.status(400).json({ error: 'Nama sumber rekognisi wajib diisi.' });
    }

    const data = { nama_sumber };
    if (await hasColumn('sumber_rekognisi_master', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [result] = await pool.query('INSERT INTO sumber_rekognisi_master SET ?', [data]);
    res.status(201).json({
      message: 'Sumber rekognisi baru berhasil dibuat',
      id: result.insertId,
    });
  } catch (err) {
    console.error("Error createSumberRekognisi:", err);
    res.status(500).json({ error: 'Gagal membuat sumber rekognisi baru', details: err.sqlMessage || err.message });
  }
};

// === UPDATE SUMBER REKOGNISI ===
export const updateSumberRekognisi = async (req, res) => {
  try {
    const { nama_sumber } = req.body;
    if (!nama_sumber) {
      return res.status(400).json({ error: 'Nama sumber rekognisi wajib diisi.' });
    }

    const data = { nama_sumber };
    if (await hasColumn('sumber_rekognisi_master', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    const [result] = await pool.query('UPDATE sumber_rekognisi_master SET ? WHERE id_sumber = ?', [data, req.params.id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }
    
    res.json({ message: 'Sumber rekognisi berhasil diperbarui' });
  } catch (err) {
    console.error("Error updateSumberRekognisi:", err);
    res.status(500).json({ error: 'Gagal memperbarui sumber rekognisi', details: err.sqlMessage || err.message });
  }
};

// === HARD DELETE SUMBER REKOGNISI ===
export const hardDeleteSumberRekognisi = async (req, res) => {
  try {
    // Periksa dulu apakah sumber ini sedang digunakan di tabel detail
    const [usage] = await pool.query(
        'SELECT COUNT(*) as count FROM rekognisi_lulusan_detail WHERE id_sumber = ?',
        [req.params.id]
    );

    if (usage[0].count > 0) {
        return res.status(400).json({ 
            error: 'Gagal menghapus: Sumber rekognisi ini sedang digunakan dalam data rekognisi. Hapus data rekognisi yang terkait terlebih dahulu.' 
        });
    }

    // Jika tidak digunakan, lanjutkan hard delete
    const [result] = await pool.query('DELETE FROM sumber_rekognisi_master WHERE id_sumber = ?', [req.params.id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }

    res.json({ message: 'Sumber rekognisi berhasil dihapus secara permanen.' });
  } catch (err) {
    console.error("Error hardDeleteSumberRekognisi:", err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
         return res.status(400).json({ 
            error: 'Gagal menghapus: Sumber rekognisi ini sedang digunakan (constraint error).' 
        });
    }
    res.status(500).json({ error: 'Gagal menghapus sumber rekognisi secara permanen.', details: err.sqlMessage || err.message });
  }
};
