import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// === LIST SEMUA BENTUK PEMBELAJARAN ===
export const listBentukPembelajaran = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'bentuk_pembelajaran_master', 'bpm');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_bentuk', 'bpm');

    const sql = `
      SELECT 
        bpm.id_bentuk,
        bpm.nama_bentuk,
        bpm.deleted_at
      FROM bentuk_pembelajaran_master bpm
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listBentukPembelajaran:", err);
    res.status(500).json({ error: 'Gagal mengambil daftar bentuk pembelajaran' });
  }
};

// === CREATE BENTUK PEMBELAJARAN BARU ===
export const createBentukPembelajaran = async (req, res) => {
  try {
    const { nama_bentuk } = req.body;

    if (!nama_bentuk) {
      return res.status(400).json({ error: 'Nama bentuk pembelajaran wajib diisi.' });
    }

    const data = { nama_bentuk };
    // Tambahkan created_by jika kolomnya ada dan user login
    if (await hasColumn('bentuk_pembelajaran_master', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [result] = await pool.query('INSERT INTO bentuk_pembelajaran_master SET ?', [data]);
    res.status(201).json({
      message: 'Bentuk pembelajaran baru berhasil dibuat',
      id: result.insertId,
    });
  } catch (err) {
    console.error("Error createBentukPembelajaran:", err);
    res.status(500).json({ error: 'Gagal membuat bentuk pembelajaran baru', details: err.sqlMessage || err.message });
  }
};

// === UPDATE BENTUK PEMBELAJARAN ===
export const updateBentukPembelajaran = async (req, res) => {
  try {
    const { nama_bentuk } = req.body;
    if (!nama_bentuk) {
      return res.status(400).json({ error: 'Nama bentuk pembelajaran wajib diisi.' });
    }

    const data = { nama_bentuk };
     // Tambahkan updated_by jika kolomnya ada dan user login
    if (await hasColumn('bentuk_pembelajaran_master', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    const [result] = await pool.query('UPDATE bentuk_pembelajaran_master SET ? WHERE id_bentuk = ?', [data, req.params.id]);
    
    // Cek apakah ada baris yang terpengaruh
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }
    
    res.json({ message: 'Bentuk pembelajaran berhasil diperbarui' });
  } catch (err) {
    console.error("Error updateBentukPembelajaran:", err);
    res.status(500).json({ error: 'Gagal memperbarui bentuk pembelajaran', details: err.sqlMessage || err.message });
  }
};

// === HARD DELETE BENTUK PEMBELAJARAN ===
export const hardDeleteBentukPembelajaran = async (req, res) => {
  try {
    // PENTING: Periksa dulu apakah bentuk pembelajaran ini sedang digunakan
    // di tabel fleksibilitas_pembelajaran_detail. Jika iya, jangan dihapus permanen.
    const [usage] = await pool.query(
        'SELECT COUNT(*) as count FROM fleksibilitas_pembelajaran_detail WHERE id_bentuk = ?',
        [req.params.id]
    );

    if (usage[0].count > 0) {
        return res.status(400).json({ 
            error: 'Gagal menghapus: Bentuk pembelajaran ini sedang digunakan dalam data fleksibilitas. Hapus data fleksibilitas yang terkait terlebih dahulu.' 
        });
    }

    // Jika tidak digunakan, lanjutkan hard delete
    const [result] = await pool.query('DELETE FROM bentuk_pembelajaran_master WHERE id_bentuk = ?', [req.params.id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }

    res.json({ message: 'Bentuk pembelajaran berhasil dihapus secara permanen.' });
  } catch (err) {
    console.error("Error hardDeleteBentukPembelajaran:", err);
    // Tangani error foreign key jika ada (meskipun sudah dicek di atas)
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
         return res.status(400).json({ 
            error: 'Gagal menghapus: Bentuk pembelajaran ini sedang digunakan (constraint error).' 
        });
    }
    res.status(500).json({ error: 'Gagal menghapus bentuk pembelajaran secara permanen.', details: err.sqlMessage || err.message });
  }
};

// Fungsi softDeleteBentukPembelajaran (sudah tidak dipakai di rute, bisa dihapus)
/*
export const softDeleteBentukPembelajaran = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('bentuk_pembelajaran_master', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query('UPDATE bentuk_pembelajaran_master SET ? WHERE id_bentuk = ?', [payload, req.params.id]);
    res.json({ message: 'Bentuk pembelajaran berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteBentukPembelajaran:", err);
    res.status(500).json({ error: 'Gagal menghapus bentuk pembelajaran' });
  }
};
*/

