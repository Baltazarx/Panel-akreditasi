import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

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

// === GET BY ID ===
export const getBentukPembelajaranById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM bentuk_pembelajaran_master WHERE id_bentuk = ?', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getBentukPembelajaranById:", err);
    res.status(500).json({ error: 'Gagal mengambil detail bentuk pembelajaran' });
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

// === SOFT DELETE BENTUK PEMBELAJARAN ===
export const softDeleteBentukPembelajaran = async (req, res) => {
  try {
    const idBentuk = req.params.id;
    const payload = { deleted_at: new Date() };
    if (await hasColumn('bentuk_pembelajaran_master', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    const [result] = await pool.query('UPDATE bentuk_pembelajaran_master SET ? WHERE id_bentuk = ?', [payload, idBentuk]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Data tidak ditemukan.' });
    res.json({ message: 'Bentuk pembelajaran berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteBentukPembelajaran:", err);
    res.status(500).json({ error: 'Gagal menghapus bentuk pembelajaran' });
  }
};

// === RESTORE BENTUK PEMBELAJARAN ===
export const restoreBentukPembelajaran = async (req, res) => {
  try {
    const idBentuk = req.params.id;
    // Cek apakah kolom deleted_at ada (jika tidak, restore tidak relevan)
    if (!(await hasColumn('bentuk_pembelajaran_master', 'deleted_at'))) {
      return res.status(400).json({ error: 'Restore tidak didukung. Tabel tidak memiliki kolom deleted_at.' });
    }

    if (await hasColumn('bentuk_pembelajaran_master', 'deleted_by')) {
      const [result] = await pool.query('UPDATE bentuk_pembelajaran_master SET deleted_at = NULL, deleted_by = NULL WHERE id_bentuk = ? AND deleted_at IS NOT NULL', [idBentuk]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan.' });
    } else {
      const [result] = await pool.query('UPDATE bentuk_pembelajaran_master SET deleted_at = NULL WHERE id_bentuk = ? AND deleted_at IS NOT NULL', [idBentuk]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan.' });
    }

    res.json({ message: 'Bentuk pembelajaran berhasil dipulihkan.' });
  } catch (err) {
    console.error("Error restoreBentukPembelajaran:", err);
    res.status(500).json({ error: 'Gagal memulihkan bentuk pembelajaran.' });
  }
};

// === HARD DELETE BENTUK PEMBELAJARAN (sudah ada, sedikit perkuatan) ===
export const hardDeleteBentukPembelajaran = async (req, res) => {
  try {
    const idBentuk = req.params.id;
    
    // PENTING: Periksa dulu apakah bentuk pembelajaran ini sedang digunakan
    // di tabel fleksibilitas_pembelajaran_detail yang terkait dengan data yang belum dihapus.
    const [usage] = await pool.query(
        `SELECT COUNT(*) as count 
         FROM fleksibilitas_pembelajaran_detail fpd
         INNER JOIN fleksibilitas_pembelajaran_tahunan fpt ON fpd.id_tahunan = fpt.id
         WHERE fpd.id_bentuk = ? AND fpt.deleted_at IS NULL`,
        [idBentuk]
    );

    if (usage[0].count > 0) {
        const [details] = await pool.query(
            `SELECT fpt.id, fpt.id_tahun, fpt.id_unit_prodi, th.tahun, uk.nama_unit
             FROM fleksibilitas_pembelajaran_detail fpd
             INNER JOIN fleksibilitas_pembelajaran_tahunan fpt ON fpd.id_tahunan = fpt.id
             LEFT JOIN tahun_akademik th ON fpt.id_tahun = th.id_tahun
             LEFT JOIN unit_kerja uk ON fpt.id_unit_prodi = uk.id_unit
             WHERE fpd.id_bentuk = ? AND fpt.deleted_at IS NULL
             LIMIT 5`,
            [idBentuk]
        );
        
        return res.status(400).json({ 
            error: 'Gagal menghapus: Bentuk pembelajaran ini sedang digunakan dalam data fleksibilitas. Hapus data fleksibilitas yang terkait terlebih dahulu.',
            details: details.map(d => `Tahun ${d.tahun || d.id_tahun}, Prodi: ${d.nama_unit || d.id_unit_prodi}`)
        });
    }

    const [result] = await pool.query('DELETE FROM bentuk_pembelajaran_master WHERE id_bentuk = ?', [idBentuk]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Data tidak ditemukan.' });
    res.json({ message: 'Bentuk pembelajaran berhasil dihapus secara permanen.' });
  } catch (err) {
    console.error("Error hardDeleteBentukPembelajaran:", err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
         return res.status(400).json({ error: 'Gagal menghapus: Bentuk pembelajaran ini sedang digunakan (constraint error).' });
    }
    res.status(500).json({ error: 'Gagal menghapus bentuk pembelajaran secara permanen.', details: err.sqlMessage || err.message });
  }
};

// === EXPORT BENTUK PEMBELAJARAN KE EXCEL ===
export const exportBentukPembelajaran = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'bentuk_pembelajaran_master', 'bpm');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_bentuk', 'bpm');

    const sql = `
      SELECT id_bentuk, nama_bentuk
      FROM bentuk_pembelajaran_master bpm
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;
    const [rows] = await pool.query(sql, params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Bentuk Pembelajaran');
    sheet.columns = [
      { header: 'ID', key: 'id_bentuk', width: 10 },
      { header: 'Nama Bentuk', key: 'nama_bentuk', width: 50 }
    ];
    sheet.addRows(rows);
    sheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Bentuk_Pembelajaran.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exportBentukPembelajaran:", err);
    res.status(500).json({ error: 'Gagal mengekspor data bentuk pembelajaran.' });
  }
};
