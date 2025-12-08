import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

/*
================================
GET ALL (LIST)
================================
*/
export const listBerita = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'berita', 'b');
    const customOrder = req.query?.order_by;
    const orderBy = customOrder 
      ? buildOrderBy(customOrder, 'id_berita', 'b')
      : 'b.tanggal_publikasi DESC, b.created_at DESC';

    // Filter status jika ada query parameter
    if (req.query?.status) {
      where.push(`b.status = ?`);
      params.push(req.query.status);
    }

    const sql = `
      SELECT 
        b.id_berita,
        b.judul,
        b.ringkasan,
        b.konten,
        b.prioritas,
        b.status,
        b.penulis,
        b.id_user,
        u.username AS nama_user,
        b.tanggal_publikasi,
        b.waktu_baca,
        b.created_at,
        b.updated_at,
        b.deleted_at
      FROM berita b
      LEFT JOIN users u ON b.id_user = u.id_user
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listBerita:", err);
    res.status(500).json({ error: 'Gagal mengambil daftar berita', details: err.sqlMessage || err.message });
  }
};

/*
================================
GET BY ID
================================
*/
export const getBeritaById = async (req, res) => {
  try {
    const sql = `
      SELECT 
        b.*,
        u.username AS nama_user
      FROM berita b
      LEFT JOIN users u ON b.id_user = u.id_user
      WHERE b.id_berita = ?
    `;
    const [rows] = await pool.query(sql, [req.params.id]);

    if (!rows[0]) return res.status(404).json({ error: 'Data berita tidak ditemukan' });
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getBeritaById:", err);
    res.status(500).json({ error: 'Gagal mengambil detail data berita', details: err.message });
  }
};

/*
================================
CREATE
================================
*/
export const createBerita = async (req, res) => {
  try {
    const { 
      judul,
      ringkasan,
      konten,
      prioritas,
      status,
      penulis,
      id_user,
      tanggal_publikasi,
      waktu_baca
    } = req.body;

    // Validasi Input
    if (!judul || !judul.trim()) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (judul) wajib diisi.' 
      });
    }
    
    if (!ringkasan || !ringkasan.trim()) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (ringkasan) wajib diisi.' 
      });
    }

    if (!konten || !konten.trim()) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (konten) wajib diisi.' 
      });
    }

    if (!penulis || !penulis.trim()) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (penulis) wajib diisi.' 
      });
    }

    if (!tanggal_publikasi) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (tanggal_publikasi) wajib diisi.' 
      });
    }

    // Siapkan data
    const dataToInsert = {
      judul: judul.trim(),
      ringkasan: ringkasan.trim(),
      konten: konten.trim(),
      prioritas: prioritas || 'medium',
      status: status || 'published',
      penulis: penulis.trim(),
      id_user: id_user || req.user?.id_user || null,
      tanggal_publikasi,
      waktu_baca: waktu_baca || null
    };

    // Tambah audit columns
    if (await hasColumn('berita', 'created_by') && req.user?.id_user) { 
      dataToInsert.created_by = req.user.id_user; 
    }

    // Eksekusi Query
    const [result] = await pool.query(
      'INSERT INTO berita SET ?', 
      [dataToInsert]
    );
    const newId = result.insertId;
    
    // Ambil data baru untuk dikembalikan
    const [rows] = await pool.query(
      `SELECT 
        b.*,
        u.username AS nama_user
      FROM berita b
      LEFT JOIN users u ON b.id_user = u.id_user
      WHERE b.id_berita = ?`,
      [newId]
    );

    res.status(201).json({ 
      message: 'Data berita berhasil dibuat', 
      id: newId,
      data: rows[0]
    });
  } catch (err) {
    console.error("Error createBerita:", err);
    res.status(500).json({ error: 'Gagal membuat data berita', details: err.sqlMessage || err.message });
  }
};

/*
================================
UPDATE
================================
*/
export const updateBerita = async (req, res) => {
  const { id } = req.params;

  try {
    const { 
      judul,
      ringkasan,
      konten,
      prioritas,
      status,
      penulis,
      id_user,
      tanggal_publikasi,
      waktu_baca
    } = req.body;

    // Validasi Input
    if (!judul || !judul.trim()) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (judul) wajib diisi.' 
      });
    }
    
    if (!ringkasan || !ringkasan.trim()) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (ringkasan) wajib diisi.' 
      });
    }

    if (!konten || !konten.trim()) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (konten) wajib diisi.' 
      });
    }

    if (!penulis || !penulis.trim()) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (penulis) wajib diisi.' 
      });
    }

    if (!tanggal_publikasi) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (tanggal_publikasi) wajib diisi.' 
      });
    }

    // Siapkan data
    const dataToUpdate = {
      judul: judul.trim(),
      ringkasan: ringkasan.trim(),
      konten: konten.trim(),
      prioritas: prioritas || 'medium',
      status: status || 'published',
      penulis: penulis.trim(),
      id_user: id_user || null,
      tanggal_publikasi,
      waktu_baca: waktu_baca || null
    };

    // Tambah audit columns
    if (await hasColumn('berita', 'updated_by') && req.user?.id_user) { 
      dataToUpdate.updated_by = req.user.id_user; 
    }

    // Eksekusi Query
    const [result] = await pool.query(
      'UPDATE berita SET ? WHERE id_berita = ?', 
      [dataToUpdate, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data berita tidak ditemukan.' });
    }

    // Ambil data yang sudah diupdate
    const [rows] = await pool.query(
      `SELECT 
        b.*,
        u.username AS nama_user
      FROM berita b
      LEFT JOIN users u ON b.id_user = u.id_user
      WHERE b.id_berita = ?`,
      [id]
    );

    res.json({ 
      message: 'Data berita berhasil diperbarui',
      data: rows[0]
    });
  } catch (err) {
    console.error("Error updateBerita:", err);
    res.status(500).json({ error: 'Gagal memperbarui data berita', details: err.sqlMessage || err.message });
  }
};

/*
================================
SOFT DELETE
================================
*/
export const softDeleteBerita = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('berita', 'deleted_by')) { 
      payload.deleted_by = req.user?.id_user || null; 
    }
    
    const [result] = await pool.query(
      'UPDATE berita SET ? WHERE id_berita = ?', 
      [payload, req.params.id]
    );
    
    if (result.affectedRows === 0) { 
      return res.status(404).json({ error: 'Data berita tidak ditemukan.' }); 
    }
    
    res.json({ message: 'Data berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteBerita:", err);
    res.status(500).json({ error: 'Gagal menghapus data', details: err.message });
  }
};

/*
================================
RESTORE
================================
*/
export const restoreBerita = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validasi ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }
    
    // Cek apakah kolom deleted_at ada
    const hasDeletedAt = await hasColumn('berita', 'deleted_at');
    if (!hasDeletedAt) {
      return res.status(400).json({ error: 'Restore tidak didukung. Tabel tidak memiliki kolom deleted_at.' });
    }
    
    // Cek apakah kolom deleted_by ada
    const hasDeletedBy = await hasColumn('berita', 'deleted_by');
    
    // Restore data
    if (hasDeletedBy) {
      const [result] = await pool.query(
        'UPDATE berita SET deleted_at = NULL, deleted_by = NULL WHERE id_berita = ? AND deleted_at IS NOT NULL',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }
      
      res.json({ ok: true, restored: true, message: 'Data berita berhasil dipulihkan' });
    } else {
      const [result] = await pool.query(
        'UPDATE berita SET deleted_at = NULL WHERE id_berita = ? AND deleted_at IS NOT NULL',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }
      
      res.json({ ok: true, restored: true, message: 'Data berita berhasil dipulihkan' });
    }
  } catch (err) {
    console.error("Error restoreBerita:", err);
    res.status(500).json({ error: 'Gagal memulihkan data', message: err.message });
  }
};

/*
================================
HARD DELETE
================================
*/
export const hardDeleteBerita = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM berita WHERE id_berita = ?', 
      [req.params.id]
    );
    
    if (result.affectedRows === 0) { 
      return res.status(404).json({ error: 'Data berita tidak ditemukan.' }); 
    }
    
    res.json({ message: 'Data berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    console.error("Error hardDeleteBerita:", err);
    res.status(500).json({ error: 'Gagal menghapus data secara permanen.', details: err.message });
  }
};

/*
================================
EXPORT EXCEL
================================
*/
export const exportBerita = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'berita', 'b');
    const customOrder = req.query?.order_by;
    const orderBy = customOrder 
      ? buildOrderBy(customOrder, 'id_berita', 'b')
      : 'b.tanggal_publikasi DESC, b.created_at DESC';

    const sql = `
      SELECT 
        b.judul,
        b.ringkasan,
        b.prioritas,
        b.status,
        b.penulis,
        COALESCE(u.username, '-') AS nama_user,
        b.tanggal_publikasi,
        b.waktu_baca,
        DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(b.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM berita b
      LEFT JOIN users u ON b.id_user = u.id_user
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;
    
    const [rows] = await pool.query(sql, params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Berita & Pengumuman');

    // Definisikan header
    const headers = [
      { header: 'No', key: 'no', width: 8 },
      { header: 'Judul', key: 'judul', width: 50 },
      { header: 'Ringkasan', key: 'ringkasan', width: 60 },
      { header: 'Prioritas', key: 'prioritas', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Penulis', key: 'penulis', width: 30 },
      { header: 'User', key: 'nama_user', width: 25 },
      { header: 'Tanggal Publikasi', key: 'tanggal_publikasi', width: 20 },
      { header: 'Waktu Baca', key: 'waktu_baca', width: 15 },
      { header: 'Created At', key: 'created_at', width: 20 },
      { header: 'Updated At', key: 'updated_at', width: 20 }
    ];
    sheet.columns = headers;

    // Tambahkan data ke sheet dengan nomor urut
    rows.forEach((row, index) => {
      sheet.addRow({
        no: index + 1,
        judul: row.judul,
        ringkasan: row.ringkasan,
        prioritas: row.prioritas || '-',
        status: row.status || '-',
        penulis: row.penulis,
        nama_user: row.nama_user,
        tanggal_publikasi: row.tanggal_publikasi || '-',
        waktu_baca: row.waktu_baca || '-',
        created_at: row.created_at || '-',
        updated_at: row.updated_at || '-'
      });
    });

    // Styling header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Styling data
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', wrapText: true };
        // Pusatkan teks untuk kolom tertentu
        row.getCell('no').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('prioritas').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('waktu_baca').alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });

    // Set header respons untuk file Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Berita_Pengumuman.xlsx');

    // Tulis workbook ke respons
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error exportBerita:", err);
    res.status(500).json({ error: 'Gagal mengekspor data berita', details: err.message });
  }
};

