import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

/*
================================
 GET ALL (LIST)
================================
*/
export const listTabel4a1SarprasPkm = async (req, res) => {
  try {
    // Alias 's' untuk sarpras
    const { where, params } = await buildWhere(req, 'tabel_4a1_sarpras_pkm', 's');
    const customOrder = req.query?.order_by;
    const orderBy = customOrder 
      ? buildOrderBy(customOrder, 'id', 's')
      : 's.nama_sarpras ASC';

    const sql = `
      SELECT 
        s.*,
        uk.nama_unit
      FROM tabel_4a1_sarpras_pkm s
      LEFT JOIN unit_kerja uk ON s.id_unit = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);

  } catch (err) {
    console.error("Error listTabel4a1SarprasPkm:", err);
    res.status(500).json({ error: 'Gagal mengambil daftar Sarpras PkM', details: err.sqlMessage || err.message });
  }
};

/*
================================
 GET BY ID
================================
*/
export const getTabel4a1SarprasPkmById = async (req, res) => {
    try {
        const sql = `
            SELECT 
              s.*, 
              uk.nama_unit
            FROM tabel_4a1_sarpras_pkm s
            LEFT JOIN unit_kerja uk ON s.id_unit = uk.id_unit
            WHERE s.id = ? AND s.deleted_at IS NULL
        `;
        const [rows] = await pool.query(sql, [req.params.id]);

        if (!rows[0]) return res.status(404).json({ error: 'Data Sarpras PkM tidak ditemukan' });
        
        res.json(rows[0]);

    } catch (err) {
        console.error("Error getTabel4a1SarprasPkmById:", err);
        res.status(500).json({ error: 'Gagal mengambil detail data Sarpras PkM', details: err.message });
    }
};

/*
================================
 CREATE
================================
*/
export const createTabel4a1SarprasPkm = async (req, res) => {
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
    // [FIX] Menggunakan id_unit, bukan id_unit_prodi
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
      kepemilikan, // ENUM('M','S','W')
      lisensi,     // ENUM('L','P','T')
      perangkat_detail,
      link_bukti
    };

    // 4. Tambah audit columns
    if (await hasColumn('tabel_4a1_sarpras_pkm', 'created_by') && id_user) { 
      dataToInsert.created_by = id_user; 
    }

    // 5. Eksekusi Query
    const [result] = await pool.query(
        'INSERT INTO tabel_4a1_sarpras_pkm SET ?', 
        [dataToInsert]
    );
    const newId = result.insertId;
    
    // 6. Ambil data baru untuk dikembalikan
    const [rows] = await pool.query(
        `SELECT * FROM tabel_4a1_sarpras_pkm WHERE id = ?`,
        [newId]
    );

    res.status(201).json({ 
        message: 'Data Sarpras PkM berhasil dibuat', 
        id: newId,
        data: rows[0]
    });

  } catch (err) {
    console.error("Error createTabel4a1SarprasPkm:", err);
    res.status(500).json({ error: 'Gagal membuat data Sarpras PkM', details: err.sqlMessage || err.message });
  }
};

/*
================================
 UPDATE
================================
*/
export const updateTabel4a1SarprasPkm = async (req, res) => {
  const { id } = req.params;

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
    // [FIX] Menggunakan id_unit, bukan id_unit_prodi
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

    // 4. Tambah audit columns
    if (await hasColumn('tabel_4a1_sarpras_pkm', 'updated_by') && id_user) { 
      dataToUpdate.updated_by = id_user; 
    }

    // 5. Eksekusi Query
    const [result] = await pool.query(
        'UPDATE tabel_4a1_sarpras_pkm SET ? WHERE id = ?', 
        [dataToUpdate, id]
    );
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Data Sarpras PkM tidak ditemukan atau tidak ada perubahan.' });
    }
    
    // 6. Ambil data baru untuk dikembalikan
    const [rows] = await pool.query(
        `SELECT * FROM tabel_4a1_sarpras_pkm WHERE id = ?`,
        [id]
    );

    res.json({ 
        message: 'Data Sarpras PkM berhasil diperbarui',
        data: rows[0]
    });

  } catch (err) {
    console.error("Error updateTabel4a1SarprasPkm:", err);
    res.status(500).json({ error: 'Gagal memperbarui data Sarpras PkM', details: err.sqlMessage || err.message });
  }
};

/*
================================
 SOFT DELETE
================================
*/
export const softDeleteTabel4a1SarprasPkm = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_4a1_sarpras_pkm', 'deleted_by')) { 
      payload.deleted_by = req.user?.id_user || null; 
    }
    const [result] = await pool.query(
      'UPDATE tabel_4a1_sarpras_pkm SET ? WHERE id = ?', 
      [payload, req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data Sarpras PkM berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteTabel4a1SarprasPkm:", err);
    res.status(500).json({ error: 'Gagal menghapus data', details: err.message });
  }
};

/*
================================
 HARD DELETE
================================
*/
export const hardDeleteTabel4a1SarprasPkm = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tabel_4a1_sarpras_pkm WHERE id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data Sarpras PkM berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    console.error("Error hardDeleteTabel4a1SarprasPkm:", err);
    res.status(500).json({ error: 'Gagal menghapus data Sarpras PkM secara permanen.', details: err.message });
  }
};

/*
================================
 EXPORT EXCEL
================================
*/
export const exportTabel4a1SarprasPkm = async (req, res) => {
    try {
        // Alias 's'
        const { where, params } = await buildWhere(req, 'tabel_4a1_sarpras_pkm', 's');
        const orderBy = 's.nama_sarpras ASC';
        
        // Buat SQL (Simple, tidak ada pivot)
        const sql = `
            SELECT 
              s.nama_sarpras,
              s.daya_tampung,
              s.luas_ruang_m2,
              s.kepemilikan,
              s.lisensi,
              s.perangkat_detail,
              s.link_bukti
            FROM tabel_4a1_sarpras_pkm s
            LEFT JOIN unit_kerja uk ON s.id_unit = uk.id_unit
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            ORDER BY ${orderBy}`;
            
        const [rows] = await pool.query(sql, params);
        
        // 5. Buat Excel
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Tabel 4.A.1');
        
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

        // 6. Tambah Data
        sheet.addRows(rows);

        // 7. Styling Data
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) { 
                row.alignment = { vertical: 'middle', wrapText: true };
                // Center-align kolom ENUM
                ['daya_tampung', 'luas_ruang_m2', 'kepemilikan', 'lisensi'].forEach(key => {
                    row.getCell(key).alignment = { vertical: 'middle', horizontal: 'center' };
                });
            }
        });

        // 8. Kirim file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Tabel_4A1_Sarpras_PkM.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Error exportTabel4a1SarprasPkm:", err);
        res.status(500).json({ error: 'Gagal mengekspor data Sarpras PkM', details: err.message });
    }
};