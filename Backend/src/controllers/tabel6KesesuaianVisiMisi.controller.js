import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

/*
================================
GET ALL (LIST)
================================
*/
export const listTabel6KesesuaianVisiMisi = async (req, res) => {
  try {
    // Alias 't6' untuk tabel_6
    const { where, params } = await buildWhere(req, 'tabel_6_kesesuaian_visi_misi', 't6');
    const customOrder = req.query?.order_by;
    const orderBy = customOrder 
      ? buildOrderBy(customOrder, 'id', 't6')
      : 't6.id ASC';

    const sql = `
      SELECT 
        t6.*,
        uk.nama_unit AS nama_prodi
      FROM tabel_6_kesesuaian_visi_misi t6
      LEFT JOIN unit_kerja uk ON t6.id_unit_prodi = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);

  } catch (err) {
    console.error("Error listTabel6KesesuaianVisiMisi:", err);
    res.status(500).json({ error: 'Gagal mengambil daftar Kesesuaian Visi Misi', details: err.sqlMessage || err.message });
  }
};

/*
================================
GET BY ID
================================
*/
export const getTabel6KesesuaianVisiMisiById = async (req, res) => {
    try {
        const sql = `
            SELECT 
              t6.*, 
              uk.nama_unit AS nama_prodi
            FROM tabel_6_kesesuaian_visi_misi t6
            LEFT JOIN unit_kerja uk ON t6.id_unit_prodi = uk.id_unit
            WHERE t6.id = ? AND t6.deleted_at IS NULL
        `;
        const [rows] = await pool.query(sql, [req.params.id]);

        if (!rows[0]) return res.status(404).json({ error: 'Data Kesesuaian Visi Misi tidak ditemukan' });
        
        res.json(rows[0]);

    } catch (err) {
        console.error("Error getTabel6KesesuaianVisiMisiById:", err);
        res.status(500).json({ error: 'Gagal mengambil detail data Kesesuaian Visi Misi', details: err.message });
    }
};

/*
================================
GET BY PRODI
================================
*/
export const getTabel6KesesuaianVisiMisiByProdi = async (req, res) => {
    try {
        const { id_unit_prodi } = req.params;
        const sql = `
            SELECT 
              t6.*, 
              uk.nama_unit AS nama_prodi
            FROM tabel_6_kesesuaian_visi_misi t6
            LEFT JOIN unit_kerja uk ON t6.id_unit_prodi = uk.id_unit
            WHERE t6.id_unit_prodi = ? AND t6.deleted_at IS NULL
        `;
        const [rows] = await pool.query(sql, [id_unit_prodi]);

        if (!rows[0]) return res.status(404).json({ error: 'Data Kesesuaian Visi Misi untuk prodi ini tidak ditemukan' });
        
        res.json(rows[0]);

    } catch (err) {
        console.error("Error getTabel6KesesuaianVisiMisiByProdi:", err);
        res.status(500).json({ error: 'Gagal mengambil data Kesesuaian Visi Misi', details: err.message });
    }
};

/*
================================
CREATE
================================
*/
export const createTabel6KesesuaianVisiMisi = async (req, res) => {
  try {
    const { 
      id_unit_prodi,
      visi_pt,
      visi_upps,
      visi_keilmuan_ps,
      misi_pt,
      misi_upps,
      link_bukti
    } = req.body;

    // 1. Validasi Input
    if (!id_unit_prodi) {
        return res.status(400).json({ 
            error: 'Input tidak lengkap. (id_unit_prodi) wajib diisi.' 
        });
    }

    // 2. Cek apakah sudah ada data untuk prodi ini
    const [existing] = await pool.query(
      'SELECT id FROM tabel_6_kesesuaian_visi_misi WHERE id_unit_prodi = ? AND deleted_at IS NULL',
      [id_unit_prodi]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        error: 'Data Kesesuaian Visi Misi untuk prodi ini sudah ada. Gunakan UPDATE untuk memperbarui data.' 
      });
    }
    
    // 3. Ambil data User
    const id_user = req.user?.id_user;

    // 4. Siapkan data
    const dataToInsert = {
      id_unit_prodi,
      visi_pt,
      visi_upps,
      visi_keilmuan_ps,
      misi_pt,
      misi_upps,
      link_bukti
    };

    // 5. Tambah audit columns
    if (await hasColumn('tabel_6_kesesuaian_visi_misi', 'created_by') && id_user) { 
      dataToInsert.created_by = id_user; 
    }

    // 6. Eksekusi Query
    const [result] = await pool.query(
        'INSERT INTO tabel_6_kesesuaian_visi_misi SET ?', 
        [dataToInsert]
    );
    const newId = result.insertId;
    
    // 7. Ambil data baru untuk dikembalikan
    const [rows] = await pool.query(
        `SELECT 
          t6.*,
          uk.nama_unit AS nama_prodi
        FROM tabel_6_kesesuaian_visi_misi t6
        LEFT JOIN unit_kerja uk ON t6.id_unit_prodi = uk.id_unit
        WHERE t6.id = ?`,
        [newId]
    );

    res.status(201).json({ 
        message: 'Data Kesesuaian Visi Misi berhasil dibuat', 
        id: newId,
        data: rows[0]
    });

  } catch (err) {
    console.error("Error createTabel6KesesuaianVisiMisi:", err);
    
    // Handle duplicate entry error
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        error: 'Data Kesesuaian Visi Misi untuk prodi ini sudah ada. Gunakan UPDATE untuk memperbarui data.' 
      });
    }
    
    res.status(500).json({ error: 'Gagal membuat data Kesesuaian Visi Misi', details: err.sqlMessage || err.message });
  }
};

/*
================================
UPDATE
================================
*/
export const updateTabel6KesesuaianVisiMisi = async (req, res) => {
  const { id } = req.params;

  try {
    const { 
      id_unit_prodi,
      visi_pt,
      visi_upps,
      visi_keilmuan_ps,
      misi_pt,
      misi_upps,
      link_bukti,
      deleted_at
    } = req.body;

    // 1. Validasi Input
    if (id_unit_prodi) {
      // Jika id_unit_prodi diubah, cek apakah prodi lain sudah punya data
      const [existing] = await pool.query(
        'SELECT id FROM tabel_6_kesesuaian_visi_misi WHERE id_unit_prodi = ? AND id != ? AND deleted_at IS NULL',
        [id_unit_prodi, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ 
          error: 'Data Kesesuaian Visi Misi untuk prodi ini sudah ada.' 
        });
      }
    }
    
    // 2. Ambil data User
    const id_user = req.user?.id_user;

    // 3. Siapkan data
    const dataToUpdate = {};
    
    if (id_unit_prodi !== undefined) dataToUpdate.id_unit_prodi = id_unit_prodi;
    if (visi_pt !== undefined) dataToUpdate.visi_pt = visi_pt;
    if (visi_upps !== undefined) dataToUpdate.visi_upps = visi_upps;
    if (visi_keilmuan_ps !== undefined) dataToUpdate.visi_keilmuan_ps = visi_keilmuan_ps;
    if (misi_pt !== undefined) dataToUpdate.misi_pt = misi_pt;
    if (misi_upps !== undefined) dataToUpdate.misi_upps = misi_upps;
    if (link_bukti !== undefined) dataToUpdate.link_bukti = link_bukti;

    // 4. Handle restore (deleted_at = null)
    if (deleted_at === null && await hasColumn('tabel_6_kesesuaian_visi_misi', 'deleted_at')) {
      dataToUpdate.deleted_at = null;
      if (await hasColumn('tabel_6_kesesuaian_visi_misi', 'deleted_by')) {
        dataToUpdate.deleted_by = null;
      }
    }

    // 5. Tambah audit columns
    if (await hasColumn('tabel_6_kesesuaian_visi_misi', 'updated_by') && id_user) { 
      dataToUpdate.updated_by = id_user; 
    }

    // 6. Eksekusi Query
    const [result] = await pool.query(
        'UPDATE tabel_6_kesesuaian_visi_misi SET ? WHERE id = ?', 
        [dataToUpdate, id]
    );
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Data Kesesuaian Visi Misi tidak ditemukan atau tidak ada perubahan.' });
    }
    
    // 7. Ambil data baru untuk dikembalikan
    const [rows] = await pool.query(
        `SELECT 
          t6.*,
          uk.nama_unit AS nama_prodi
        FROM tabel_6_kesesuaian_visi_misi t6
        LEFT JOIN unit_kerja uk ON t6.id_unit_prodi = uk.id_unit
        WHERE t6.id = ?`,
        [id]
    );

    const message = deleted_at === null 
      ? 'Data Kesesuaian Visi Misi berhasil dipulihkan'
      : 'Data Kesesuaian Visi Misi berhasil diperbarui';

    res.json({ 
        message: message,
        data: rows[0]
    });

  } catch (err) {
    console.error("Error updateTabel6KesesuaianVisiMisi:", err);
    
    // Handle duplicate entry error
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        error: 'Data Kesesuaian Visi Misi untuk prodi ini sudah ada.' 
      });
    }
    
    res.status(500).json({ error: 'Gagal memperbarui data Kesesuaian Visi Misi', details: err.sqlMessage || err.message });
  }
};

/*
================================
SOFT DELETE
================================
*/
export const softDeleteTabel6KesesuaianVisiMisi = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_6_kesesuaian_visi_misi', 'deleted_by')) { 
      payload.deleted_by = req.user?.id_user || null; 
    }
    const [result] = await pool.query(
      'UPDATE tabel_6_kesesuaian_visi_misi SET ? WHERE id = ?', 
      [payload, req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data Kesesuaian Visi Misi berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteTabel6KesesuaianVisiMisi:", err);
    res.status(500).json({ error: 'Gagal menghapus data', details: err.message });
  }
};

/*
================================
RESTORE
================================
*/
export const restoreTabel6KesesuaianVisiMisi = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }
    
    const hasDeletedAt = await hasColumn('tabel_6_kesesuaian_visi_misi', 'deleted_at');
    if (!hasDeletedAt) {
      return res.status(400).json({ error: 'Restore tidak didukung. Tabel tidak memiliki kolom deleted_at.' });
    }
    
    const hasDeletedBy = await hasColumn('tabel_6_kesesuaian_visi_misi', 'deleted_by');
    
    if (hasDeletedBy) {
      const [result] = await pool.query(
        'UPDATE tabel_6_kesesuaian_visi_misi SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }
      
      res.json({ ok: true, restored: true, message: 'Data Kesesuaian Visi Misi berhasil dipulihkan' });
    } else {
      const [result] = await pool.query(
        'UPDATE tabel_6_kesesuaian_visi_misi SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }
      
      res.json({ ok: true, restored: true, message: 'Data Kesesuaian Visi Misi berhasil dipulihkan' });
    }
  } catch (err) {
    console.error("Error restoreTabel6KesesuaianVisiMisi:", err);
    res.status(500).json({ error: 'Gagal memulihkan data', message: err.message });
  }
};

/*
================================
HARD DELETE
================================
*/
export const hardDeleteTabel6KesesuaianVisiMisi = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tabel_6_kesesuaian_visi_misi WHERE id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data Kesesuaian Visi Misi berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    console.error("Error hardDeleteTabel6KesesuaianVisiMisi:", err);
    res.status(500).json({ error: 'Gagal menghapus data Kesesuaian Visi Misi secara permanen.', details: err.message });
  }
};

/*
================================
EXPORT EXCEL
================================
*/
export const exportTabel6KesesuaianVisiMisi = async (req, res) => {
    try {
        const { where, params } = await buildWhere(req, 'tabel_6_kesesuaian_visi_misi', 't6');
        const orderBy = 't6.id ASC';
        
        const sql = `
            SELECT 
              uk.nama_unit AS prodi,
              t6.visi_pt,
              t6.visi_upps,
              t6.visi_keilmuan_ps,
              t6.misi_pt,
              t6.misi_upps,
              t6.link_bukti
            FROM tabel_6_kesesuaian_visi_misi t6
            LEFT JOIN unit_kerja uk ON t6.id_unit_prodi = uk.id_unit
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            ORDER BY ${orderBy}`;
            
        const [rows] = await pool.query(sql, params);
        
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Tabel 6');
        
        // Header Kolom
        const headers = [
            { header: 'Program Studi', key: 'prodi', width: 30 },
            { header: 'Visi PT', key: 'visi_pt', width: 50 },
            { header: 'Visi UPPS', key: 'visi_upps', width: 50 },
            { header: 'Visi Keilmuan PS', key: 'visi_keilmuan_ps', width: 50 },
            { header: 'Misi PT', key: 'misi_pt', width: 50 },
            { header: 'Misi UPPS', key: 'misi_upps', width: 50 },
            { header: 'Link Bukti', key: 'link_bukti', width: 40 },
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
            }
        });

        // Kirim file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Tabel_6_Kesesuaian_Visi_Misi.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Error exportTabel6KesesuaianVisiMisi:", err);
        res.status(500).json({ error: 'Gagal mengekspor data Kesesuaian Visi Misi', details: err.message });
    }
};

