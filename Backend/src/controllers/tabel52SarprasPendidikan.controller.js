import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

/*
================================
GET ALL (LIST)
================================
*/
export const listTabel52SarprasPendidikan = async (req, res) => {
  try {
    // Alias 's' untuk sarpras
    const { where, params } = await buildWhere(req, 'tabel_5_2_sarpras_pendidikan', 's');
    const customOrder = req.query?.order_by;
    const orderBy = customOrder 
      ? buildOrderBy(customOrder, 'id', 's')
      : 's.nama_sarpras ASC';

    const sql = `
      SELECT 
        s.*,
        uk.nama_unit
      FROM tabel_5_2_sarpras_pendidikan s
      LEFT JOIN unit_kerja uk ON s.id_unit = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);

  } catch (err) {
    console.error("Error listTabel52SarprasPendidikan:", err);
    res.status(500).json({ error: 'Gagal mengambil daftar Sarpras Pendidikan', details: err.sqlMessage || err.message });
  }
};

/*
================================
GET BY ID
================================
*/
export const getTabel52SarprasPendidikanById = async (req, res) => {
    try {
        const sql = `
            SELECT 
              s.*, 
              uk.nama_unit
            FROM tabel_5_2_sarpras_pendidikan s
            LEFT JOIN unit_kerja uk ON s.id_unit = uk.id_unit
            WHERE s.id = ? AND s.deleted_at IS NULL
        `;
        const [rows] = await pool.query(sql, [req.params.id]);

        if (!rows[0]) return res.status(404).json({ error: 'Data Sarpras Pendidikan tidak ditemukan' });
        
        res.json(rows[0]);

    } catch (err) {
        console.error("Error getTabel52SarprasPendidikanById:", err);
        res.status(500).json({ error: 'Gagal mengambil detail data Sarpras Pendidikan', details: err.message });
    }
};

/*
================================
CREATE
================================
*/
export const createTabel52SarprasPendidikan = async (req, res) => {
  try {
    const { 
      nama_sarpras,
      daya_tampung,
      luas_ruang_m2,
      kepemilikan,
      lisensi,
      perangkat_detail,
      link_bukti
    } = req.body;

    // 1. Validasi Input
    if (!nama_sarpras) {
        return res.status(400).json({ 
            error: 'Input tidak lengkap. (nama_sarpras) wajib diisi.' 
        });
    }
    
    // 2. Ambil data User (id_unit & id_user)
    const id_unit = req.user?.id_unit; 
    const id_user = req.user?.id_user;
    if (!id_unit) { 
      return res.status(400).json({ error: 'Unit kerja (Sarpras) tidak ditemukan dari data user.' }); 
    }

    // 3. Siapkan data
    const dataToInsert = {
      id_unit: id_unit,
      nama_sarpras,
      daya_tampung,
      luas_ruang_m2,
      kepemilikan, // ENUM('M','W')
      lisensi,     // ENUM('L','P','T')
      perangkat_detail,
      link_bukti
    };

    // 4. Tambah audit columns
    if (await hasColumn('tabel_5_2_sarpras_pendidikan', 'created_by') && id_user) { 
      dataToInsert.created_by = id_user; 
    }

    // 5. Eksekusi Query
    const [result] = await pool.query(
        'INSERT INTO tabel_5_2_sarpras_pendidikan SET ?', 
        [dataToInsert]
    );
    const newId = result.insertId;
    
    // 6. Ambil data baru untuk dikembalikan
    const [rows] = await pool.query(
        `SELECT * FROM tabel_5_2_sarpras_pendidikan WHERE id = ?`,
        [newId]
    );

    res.status(201).json({ 
        message: 'Data Sarpras Pendidikan berhasil dibuat', 
        id: newId,
        data: rows[0]
    });

  } catch (err) {
    console.error("Error createTabel52SarprasPendidikan:", err);
    res.status(500).json({ error: 'Gagal membuat data Sarpras Pendidikan', details: err.sqlMessage || err.message });
  }
};

/*
================================
UPDATE
================================
*/
export const updateTabel52SarprasPendidikan = async (req, res) => {
  const { id } = req.params;

  try {
    const { 
      nama_sarpras,
      daya_tampung,
      luas_ruang_m2,
      kepemilikan,
      lisensi,
      perangkat_detail,
      link_bukti,
      deleted_at
    } = req.body;

    // 1. Validasi Input
    if (!nama_sarpras) {
        return res.status(400).json({ 
            error: 'Input tidak lengkap. (nama_sarpras) wajib diisi.' 
        });
    }
    
    // 2. Ambil data User (id_unit & id_user)
    const id_unit = req.user?.id_unit;
    const id_user = req.user?.id_user;
    if (!id_unit) { 
      return res.status(400).json({ error: 'Unit kerja (Sarpras) tidak ditemukan dari data user.' }); 
    }

    // 3. Siapkan data
    const dataToUpdate = {
      id_unit: id_unit,
      nama_sarpras,
      daya_tampung,
      luas_ruang_m2,
      kepemilikan,
      lisensi,
      perangkat_detail,
      link_bukti
    };

    // 4. Handle restore (deleted_at = null)
    if (deleted_at === null && await hasColumn('tabel_5_2_sarpras_pendidikan', 'deleted_at')) {
      dataToUpdate.deleted_at = null;
      // Jika ada kolom deleted_by, set ke null juga
      if (await hasColumn('tabel_5_2_sarpras_pendidikan', 'deleted_by')) {
        dataToUpdate.deleted_by = null;
      }
    }

    // 5. Tambah audit columns
    if (await hasColumn('tabel_5_2_sarpras_pendidikan', 'updated_by') && id_user) { 
      dataToUpdate.updated_by = id_user; 
    }

    // 6. Eksekusi Query
    const [result] = await pool.query(
        'UPDATE tabel_5_2_sarpras_pendidikan SET ? WHERE id = ?', 
        [dataToUpdate, id]
    );
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Data Sarpras Pendidikan tidak ditemukan atau tidak ada perubahan.' });
    }
    
    // 7. Ambil data baru untuk dikembalikan
    const [rows] = await pool.query(
        `SELECT * FROM tabel_5_2_sarpras_pendidikan WHERE id = ?`,
        [id]
    );

    const message = deleted_at === null 
      ? 'Data Sarpras Pendidikan berhasil dipulihkan'
      : 'Data Sarpras Pendidikan berhasil diperbarui';

    res.json({ 
        message: message,
        data: rows[0]
    });

  } catch (err) {
    console.error("Error updateTabel52SarprasPendidikan:", err);
    res.status(500).json({ error: 'Gagal memperbarui data Sarpras Pendidikan', details: err.sqlMessage || err.message });
  }
};

/*
================================
SOFT DELETE
================================
*/
export const softDeleteTabel52SarprasPendidikan = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_5_2_sarpras_pendidikan', 'deleted_by')) { 
      payload.deleted_by = req.user?.id_user || null; 
    }
    const [result] = await pool.query(
      'UPDATE tabel_5_2_sarpras_pendidikan SET ? WHERE id = ?', 
      [payload, req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data Sarpras Pendidikan berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteTabel52SarprasPendidikan:", err);
    res.status(500).json({ error: 'Gagal menghapus data', details: err.message });
  }
};

/*
================================
RESTORE
================================
*/
export const restoreTabel52SarprasPendidikan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validasi ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }
    
    // Cek apakah kolom deleted_at ada
    const hasDeletedAt = await hasColumn('tabel_5_2_sarpras_pendidikan', 'deleted_at');
    if (!hasDeletedAt) {
      return res.status(400).json({ error: 'Restore tidak didukung. Tabel tidak memiliki kolom deleted_at.' });
    }
    
    // Cek apakah kolom deleted_by ada
    const hasDeletedBy = await hasColumn('tabel_5_2_sarpras_pendidikan', 'deleted_by');
    
    // Restore data
    if (hasDeletedBy) {
      const [result] = await pool.query(
        'UPDATE tabel_5_2_sarpras_pendidikan SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }
      
      res.json({ ok: true, restored: true, message: 'Data Sarpras Pendidikan berhasil dipulihkan' });
    } else {
      const [result] = await pool.query(
        'UPDATE tabel_5_2_sarpras_pendidikan SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }
      
      res.json({ ok: true, restored: true, message: 'Data Sarpras Pendidikan berhasil dipulihkan' });
    }
  } catch (err) {
    console.error("Error restoreTabel52SarprasPendidikan:", err);
    res.status(500).json({ error: 'Gagal memulihkan data', message: err.message });
  }
};

/*
================================
HARD DELETE
================================
*/
export const hardDeleteTabel52SarprasPendidikan = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tabel_5_2_sarpras_pendidikan WHERE id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data Sarpras Pendidikan berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    console.error("Error hardDeleteTabel52SarprasPendidikan:", err);
    res.status(500).json({ error: 'Gagal menghapus data Sarpras Pendidikan secara permanen.', details: err.message });
  }
};

/*
================================
EXPORT EXCEL
================================
*/
export const exportTabel52SarprasPendidikan = async (req, res) => {
    try {
        // Alias 's'
        const { where, params } = await buildWhere(req, 'tabel_5_2_sarpras_pendidikan', 's');
        const orderBy = 's.nama_sarpras ASC';
        
        // Buat SQL
        const sql = `
            SELECT 
              s.nama_sarpras,
              s.daya_tampung,
              s.luas_ruang_m2,
              s.kepemilikan,
              s.lisensi,
              s.perangkat_detail,
              s.link_bukti
            FROM tabel_5_2_sarpras_pendidikan s
            LEFT JOIN unit_kerja uk ON s.id_unit = uk.id_unit
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            ORDER BY ${orderBy}`;
            
        const [rows] = await pool.query(sql, params);
        
        // Buat Excel
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Tabel 5.2');
        
        // Header Kolom
        const headers = [
            { header: 'Nama Prasarana', key: 'nama_sarpras', width: 40 },
            { header: 'Daya Tampung', key: 'daya_tampung', width: 20 },
            { header: 'Luas Ruang (m²)', key: 'luas_ruang_m2', width: 20 },
            { header: 'Milik Sendiri (M)/ Sewa (W)', key: 'kepemilikan', width: 25 },
            { header: 'Berlisensi (L)/ Public Domain (P)/Tdk Berlisensi (T)', key: 'lisensi', width: 35 },
            { header: 'Perangkat', key: 'perangkat_detail', width: 40 },
            { header: 'Link Bukti', key: 'link_bukti', width: 30 },
        ];
        
        sheet.getRow(1).columns = headers;
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }
        };

        // Tambah Data
        sheet.addRows(rows);

        // Styling Data
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) { 
                row.alignment = { vertical: 'middle', wrapText: true };
                // Center-align kolom ENUM
                ['daya_tampung', 'luas_ruang_m2', 'kepemilikan', 'lisensi'].forEach(key => {
                    row.getCell(key).alignment = { vertical: 'middle', horizontal: 'center' };
                });
            }
        });

        // Kirim file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Tabel_5_2_Sarpras_Pendidikan.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Error exportTabel52SarprasPendidikan:", err);
        res.status(500).json({ error: 'Gagal mengekspor data Sarpras Pendidikan', details: err.message });
    }
};

