import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

/*
================================
GET ALL (LIST)
================================
*/
export const listTabel5a1SistemTataKelola = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tabel_5_1_sistem_tata_kelola', 't51');
    const customOrder = req.query?.order_by;
    const orderBy = customOrder 
      ? buildOrderBy(customOrder, 'id', 't51')
      : 't51.id ASC';

    const sql = `
      SELECT 
        t51.id,
        t51.jenis_tata_kelola,
        t51.nama_sistem_informasi,
        t51.akses,
        t51.id_unit_pengelola,
        uk.nama_unit AS nama_unit_pengelola,
        t51.link_bukti,
        t51.created_at,
        t51.updated_at,
        t51.deleted_at
      FROM tabel_5_1_sistem_tata_kelola t51
      LEFT JOIN unit_kerja uk ON t51.id_unit_pengelola = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listTabel5a1SistemTataKelola:", err);
    res.status(500).json({ error: 'Gagal mengambil daftar Sistem Tata Kelola', details: err.sqlMessage || err.message });
  }
};

/*
================================
GET BY ID
================================
*/
export const getTabel5a1SistemTataKelolaById = async (req, res) => {
  try {
    const sql = `
      SELECT 
        t51.*,
        uk.nama_unit AS nama_unit_pengelola
      FROM tabel_5_1_sistem_tata_kelola t51
      LEFT JOIN unit_kerja uk ON t51.id_unit_pengelola = uk.id_unit
      WHERE t51.id = ?
    `;
    const [rows] = await pool.query(sql, [req.params.id]);

    if (!rows[0]) return res.status(404).json({ error: 'Data Sistem Tata Kelola tidak ditemukan' });
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getTabel5a1SistemTataKelolaById:", err);
    res.status(500).json({ error: 'Gagal mengambil detail data Sistem Tata Kelola', details: err.message });
  }
};

/*
================================
CREATE
================================
*/
export const createTabel5a1SistemTataKelola = async (req, res) => {
  try {
    const { 
      jenis_tata_kelola,
      nama_sistem_informasi,
      akses,
      id_unit_pengelola,
      link_bukti
    } = req.body;

    // Validasi Input
    if (!jenis_tata_kelola) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (jenis_tata_kelola) wajib diisi.' 
      });
    }
    
    if (!nama_sistem_informasi) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (nama_sistem_informasi) wajib diisi.' 
      });
    }

    if (!id_unit_pengelola) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (id_unit_pengelola) wajib diisi.' 
      });
    }

    // Siapkan data
    const dataToInsert = {
      jenis_tata_kelola,
      nama_sistem_informasi,
      akses, // ENUM('Lokal','Internet')
      id_unit_pengelola, // WAJIB diisi
      link_bukti
    };

    // Tambah audit columns
    if (await hasColumn('tabel_5_1_sistem_tata_kelola', 'created_by') && req.user?.id_user) { 
      dataToInsert.created_by = req.user.id_user; 
    }

    // Eksekusi Query
    const [result] = await pool.query(
      'INSERT INTO tabel_5_1_sistem_tata_kelola SET ?', 
      [dataToInsert]
    );
    const newId = result.insertId;
    
    // Ambil data baru untuk dikembalikan
    const [rows] = await pool.query(
      `SELECT 
        t51.*,
        uk.nama_unit AS nama_unit_pengelola
      FROM tabel_5_1_sistem_tata_kelola t51
      LEFT JOIN unit_kerja uk ON t51.id_unit_pengelola = uk.id_unit
      WHERE t51.id = ?`,
      [newId]
    );

    res.status(201).json({ 
      message: 'Data Sistem Tata Kelola berhasil dibuat', 
      id: newId,
      data: rows[0]
    });
  } catch (err) {
    console.error("Error createTabel5a1SistemTataKelola:", err);
    res.status(500).json({ error: 'Gagal membuat data Sistem Tata Kelola', details: err.sqlMessage || err.message });
  }
};

/*
================================
UPDATE
================================
*/
export const updateTabel5a1SistemTataKelola = async (req, res) => {
  const { id } = req.params;

  try {
    const { 
      jenis_tata_kelola,
      nama_sistem_informasi,
      akses,
      id_unit_pengelola,
      link_bukti
    } = req.body;

    // Validasi Input
    if (!jenis_tata_kelola) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (jenis_tata_kelola) wajib diisi.' 
      });
    }
    
    if (!nama_sistem_informasi) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (nama_sistem_informasi) wajib diisi.' 
      });
    }

    if (!id_unit_pengelola) {
      return res.status(400).json({ 
        error: 'Input tidak lengkap. (id_unit_pengelola) wajib diisi.' 
      });
    }

    // Siapkan data
    const dataToUpdate = {
      jenis_tata_kelola,
      nama_sistem_informasi,
      akses,
      id_unit_pengelola,
      link_bukti
    };

    // Tambah audit columns
    if (await hasColumn('tabel_5_1_sistem_tata_kelola', 'updated_by') && req.user?.id_user) { 
      dataToUpdate.updated_by = req.user.id_user; 
    }

    // Eksekusi Query
    const [result] = await pool.query(
      'UPDATE tabel_5_1_sistem_tata_kelola SET ? WHERE id = ?', 
      [dataToUpdate, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data Sistem Tata Kelola tidak ditemukan.' });
    }

    // Ambil data yang sudah diupdate
    const [rows] = await pool.query(
      `SELECT 
        t51.*,
        uk.nama_unit AS nama_unit_pengelola
      FROM tabel_5_1_sistem_tata_kelola t51
      LEFT JOIN unit_kerja uk ON t51.id_unit_pengelola = uk.id_unit
      WHERE t51.id = ?`,
      [id]
    );

    res.json({ 
      message: 'Data Sistem Tata Kelola berhasil diperbarui',
      data: rows[0]
    });
  } catch (err) {
    console.error("Error updateTabel5a1SistemTataKelola:", err);
    res.status(500).json({ error: 'Gagal memperbarui data Sistem Tata Kelola', details: err.sqlMessage || err.message });
  }
};

/*
================================
SOFT DELETE
================================
*/
export const softDeleteTabel5a1SistemTataKelola = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_5_1_sistem_tata_kelola', 'deleted_by')) { 
      payload.deleted_by = req.user?.id_user || null; 
    }
    
    const [result] = await pool.query(
      'UPDATE tabel_5_1_sistem_tata_kelola SET ? WHERE id = ?', 
      [payload, req.params.id]
    );
    
    if (result.affectedRows === 0) { 
      return res.status(404).json({ error: 'Data Sistem Tata Kelola tidak ditemukan.' }); 
    }
    
    res.json({ message: 'Data berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteTabel5a1SistemTataKelola:", err);
    res.status(500).json({ error: 'Gagal menghapus data', details: err.message });
  }
};

/*
================================
RESTORE
================================
*/
export const restoreTabel5a1SistemTataKelola = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validasi ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }
    
    // Cek apakah kolom deleted_at ada
    const hasDeletedAt = await hasColumn('tabel_5_1_sistem_tata_kelola', 'deleted_at');
    if (!hasDeletedAt) {
      return res.status(400).json({ error: 'Restore tidak didukung. Tabel tidak memiliki kolom deleted_at.' });
    }
    
    // Cek apakah kolom deleted_by ada
    const hasDeletedBy = await hasColumn('tabel_5_1_sistem_tata_kelola', 'deleted_by');
    
    // Restore data
    if (hasDeletedBy) {
      const [result] = await pool.query(
        'UPDATE tabel_5_1_sistem_tata_kelola SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }
      
      res.json({ ok: true, restored: true, message: 'Data Sistem Tata Kelola berhasil dipulihkan' });
    } else {
      const [result] = await pool.query(
        'UPDATE tabel_5_1_sistem_tata_kelola SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }
      
      res.json({ ok: true, restored: true, message: 'Data Sistem Tata Kelola berhasil dipulihkan' });
    }
  } catch (err) {
    console.error("Error restoreTabel5a1SistemTataKelola:", err);
    res.status(500).json({ error: 'Gagal memulihkan data', message: err.message });
  }
};

/*
================================
HARD DELETE
================================
*/
export const hardDeleteTabel5a1SistemTataKelola = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tabel_5_1_sistem_tata_kelola WHERE id = ?', 
      [req.params.id]
    );
    
    if (result.affectedRows === 0) { 
      return res.status(404).json({ error: 'Data Sistem Tata Kelola tidak ditemukan.' }); 
    }
    
    res.json({ message: 'Data berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    console.error("Error hardDeleteTabel5a1SistemTataKelola:", err);
    res.status(500).json({ error: 'Gagal menghapus data secara permanen.', details: err.message });
  }
};

/*
================================
EXPORT EXCEL
================================
*/
export const exportTabel5a1SistemTataKelola = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tabel_5_1_sistem_tata_kelola', 't51');
    const customOrder = req.query?.order_by;
    const orderBy = customOrder 
      ? buildOrderBy(customOrder, 'id', 't51')
      : 't51.id ASC';

    const sql = `
      SELECT 
        t51.jenis_tata_kelola,
        t51.nama_sistem_informasi,
        t51.akses,
        COALESCE(uk.nama_unit, '-') AS pengelola,
        t51.link_bukti
      FROM tabel_5_1_sistem_tata_kelola t51
      LEFT JOIN unit_kerja uk ON t51.id_unit_pengelola = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;
    
    const [rows] = await pool.query(sql, params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 5.1 Sistem Tata Kelola');

    // Definisikan header sesuai format tabel LKPS
    const headers = [
      { header: 'No', key: 'no', width: 8 },
      { header: 'Jenis Tata Kelola', key: 'jenis_tata_kelola', width: 30 },
      { header: 'Nama Sistem Informasi', key: 'nama_sistem_informasi', width: 40 },
      { header: 'Akses (Lokal/Internet)', key: 'akses', width: 20 },
      { header: 'Unit Kerja/SDM Pengelola', key: 'pengelola', width: 35 },
      { header: 'Link Bukti', key: 'link_bukti', width: 40 }
    ];
    sheet.columns = headers;

    // Tambahkan data ke sheet dengan nomor urut
    rows.forEach((row, index) => {
      sheet.addRow({
        no: index + 1,
        jenis_tata_kelola: row.jenis_tata_kelola,
        nama_sistem_informasi: row.nama_sistem_informasi,
        akses: row.akses || '-',
        pengelola: row.pengelola,
        link_bukti: row.link_bukti || '-'
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
        row.getCell('akses').alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });

    // Set header respons untuk file Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Tabel_5_1_Sistem_Tata_Kelola.xlsx');

    // Tulis workbook ke respons
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error exportTabel5a1SistemTataKelola:", err);
    res.status(500).json({ error: 'Gagal mengekspor data Sistem Tata Kelola', details: err.message });
  }
};

