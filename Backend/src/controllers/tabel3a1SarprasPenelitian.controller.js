import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs'; // <-- Impor ExcelJS

// Nama fungsi disesuaikan
export const listTabel3a1SarprasPenelitian = async (req, res) => {
  try {
    // Special handling: Role sarpras bisa melihat semua data tanpa filter unit/prodi
    const userRole = req.user?.role?.toLowerCase();
    const isSarpras = userRole === 'sarpras';
    const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm', 'ketua'].includes(userRole);

    // Nama tabel dan alias disesuaikan
    const { where, params } = await buildWhere(req, 'tabel_3a1_sarpras_penelitian', 't3a1');

    if (isSarpras && !isSuperAdmin) {
      const unitProdiFilterIndex = where.findIndex(w => w.includes('t3a1.id_unit_prodi') || w.includes('.id_unit_prodi'));
      if (unitProdiFilterIndex !== -1) {
        where.splice(unitProdiFilterIndex, 1);
        params.splice(unitProdiFilterIndex, 1);
      }
    }

    // Urutkan ascending (ASC) agar data baru (ID lebih besar) ada di bawah
    // Jika ada custom order_by dari query, gunakan itu, jika tidak gunakan ASC
    const customOrder = req.query?.order_by;
    const orderBy = customOrder
      ? buildOrderBy(customOrder, 'id', 't3a1')
      : 't3a1.id ASC';

    const sql = `
      SELECT 
        t3a1.id, t3a1.id_unit_prodi, uk.nama_unit AS nama_unit_prodi,
        t3a1.nama_sarpras, t3a1.daya_tampung, t3a1.luas_ruang_m2, t3a1.kepemilikan,
        t3a1.lisensi, t3a1.perangkat_detail, t3a1.link_bukti, t3a1.deleted_at
      FROM tabel_3a1_sarpras_penelitian t3a1
      LEFT JOIN unit_kerja uk ON t3a1.id_unit_prodi = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listTabel3a1SarprasPenelitian:", err);
    res.status(500).json({ error: 'Gagal mengambil daftar sarpras penelitian' });
  }
};

export const getTabel3a1SarprasPenelitianById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t3a1.*, uk.nama_unit AS nama_unit_prodi
             FROM tabel_3a1_sarpras_penelitian t3a1 
             LEFT JOIN unit_kerja uk ON t3a1.id_unit_prodi = uk.id_unit 
             WHERE t3a1.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getTabel3a1SarprasPenelitianById:", err);
    res.status(500).json({ error: 'Gagal mengambil detail data' });
  }
};

export const createTabel3a1SarprasPenelitian = async (req, res) => {
  try {
    // Baca data dari body (tanpa id_unit, karena akan otomatis dari user)
    const {
      nama_sarpras, daya_tampung, luas_ruang_m2, kepemilikan,
      lisensi, perangkat_detail, link_bukti
    } = req.body;

    // Validasi
    if (!nama_sarpras) { return res.status(400).json({ error: 'Nama Prasarana wajib diisi.' }); }

    // Debug: Log req.user untuk melihat strukturnya
    console.log("createTabel3a1SarprasPenelitian - req.user:", req.user);
    console.log("createTabel3a1SarprasPenelitian - req.user?.id_unit_prodi:", req.user?.id_unit_prodi);
    console.log("createTabel3a1SarprasPenelitian - req.user?.id_unit:", req.user?.id_unit);

    // Auto-fill id_unit_prodi dari user yang login
    // Fallback: jika id_unit_prodi tidak ada, coba gunakan id_unit
    let id_unit_prodi = req.user?.id_unit_prodi || req.user?.id_unit;

    if (!id_unit_prodi) {
      console.error("createTabel3a1SarprasPenelitian - req.user tidak memiliki id_unit_prodi atau id_unit:", req.user);
      return res.status(400).json({
        error: 'Unit/Prodi tidak ditemukan dari data user. Pastikan user sudah memiliki unit/prodi. Silakan logout dan login ulang untuk mendapatkan token baru.'
      });
    }

    const data = {
      id_unit_prodi: id_unit_prodi, // Otomatis dari user yang login
      nama_sarpras, daya_tampung, luas_ruang_m2, kepemilikan,
      lisensi, perangkat_detail, link_bukti
    };

    if (await hasColumn('tabel_3a1_sarpras_penelitian', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [result] = await pool.query('INSERT INTO tabel_3a1_sarpras_penelitian SET ?', [data]);
    res.status(201).json({ message: 'Data sarpras penelitian berhasil dibuat', id: result.insertId });
  } catch (err) {
    console.error("Error createTabel3a1SarprasPenelitian:", err);
    res.status(500).json({ error: 'Gagal membuat data sarpras penelitian', details: err.sqlMessage || err.message });
  }
};

export const updateTabel3a1SarprasPenelitian = async (req, res) => {
  try {
    // Baca data dari body (tanpa id_unit, karena akan otomatis dari user)
    const {
      nama_sarpras, daya_tampung, luas_ruang_m2, kepemilikan,
      lisensi, perangkat_detail, link_bukti
    } = req.body;

    // Validasi
    if (!nama_sarpras) { return res.status(400).json({ error: 'Nama Prasarana wajib diisi.' }); }

    // Auto-fill id_unit_prodi dari user yang login
    // Fallback: jika id_unit_prodi tidak ada, coba gunakan id_unit
    let id_unit_prodi = req.user?.id_unit_prodi || req.user?.id_unit;
    if (!id_unit_prodi) {
      return res.status(400).json({ error: 'Unit/Prodi tidak ditemukan dari data user.' });
    }

    const data = {
      id_unit_prodi: id_unit_prodi, // Update dengan unit/prodi dari user yang login
      nama_sarpras, daya_tampung, luas_ruang_m2, kepemilikan,
      lisensi, perangkat_detail, link_bukti
    };
    if (await hasColumn('tabel_3a1_sarpras_penelitian', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    const [result] = await pool.query('UPDATE tabel_3a1_sarpras_penelitian SET ? WHERE id = ?', [data, req.params.id]);
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data sarpras penelitian berhasil diperbarui' });
  } catch (err) {
    console.error("Error updateTabel3a1SarprasPenelitian:", err);
    res.status(500).json({ error: 'Gagal memperbarui data sarpras penelitian', details: err.sqlMessage || err.message });
  }
};

export const softDeleteTabel3a1SarprasPenelitian = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_3a1_sarpras_penelitian', 'deleted_by')) { payload.deleted_by = req.user?.id_user || null; }
    const [result] = await pool.query('UPDATE tabel_3a1_sarpras_penelitian SET ? WHERE id = ?', [payload, req.params.id]);
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteTabel3a1SarprasPenelitian:", err);
    res.status(500).json({ error: 'Gagal menghapus data' });
  }
};

export const restoreTabel3a1SarprasPenelitian = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }

    // Cek apakah kolom deleted_at ada
    const hasDeletedAt = await hasColumn('tabel_3a1_sarpras_penelitian', 'deleted_at');
    if (!hasDeletedAt) {
      return res.status(400).json({ error: 'Restore tidak didukung. Tabel tidak memiliki kolom deleted_at.' });
    }

    // Cek apakah kolom deleted_by ada
    const hasDeletedBy = await hasColumn('tabel_3a1_sarpras_penelitian', 'deleted_by');

    // Restore data
    if (hasDeletedBy) {
      const [result] = await pool.query(
        'UPDATE tabel_3a1_sarpras_penelitian SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }

      res.json({ ok: true, restored: true, message: 'Data sarpras penelitian berhasil dipulihkan' });
    } else {
      const [result] = await pool.query(
        'UPDATE tabel_3a1_sarpras_penelitian SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }

      res.json({ ok: true, restored: true, message: 'Data sarpras penelitian berhasil dipulihkan' });
    }
  } catch (err) {
    console.error("Error restoreTabel3a1SarprasPenelitian:", err);
    res.status(500).json({ error: 'Gagal memulihkan data', message: err.message });
  }
};

export const hardDeleteTabel3a1SarprasPenelitian = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tabel_3a1_sarpras_penelitian WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    console.error("Error hardDeleteTabel3a1SarprasPenelitian:", err);
    res.status(500).json({ error: 'Gagal menghapus data secara permanen.' });
  }
};

// === FUNGSI BARU UNTUK EXPORT ===
export const exportTabel3a1SarprasPenelitian = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tabel_3a1_sarpras_penelitian', 't3a1');
    // Urutkan ascending untuk export juga
    const customOrder = req.query?.order_by;
    const orderBy = customOrder
      ? buildOrderBy(customOrder, 'id', 't3a1')
      : 't3a1.id ASC';
    const sql = `
          SELECT 
            t3a1.nama_sarpras, t3a1.daya_tampung, t3a1.luas_ruang_m2, t3a1.kepemilikan,
            t3a1.lisensi, t3a1.perangkat_detail, t3a1.link_bukti
          FROM tabel_3a1_sarpras_penelitian t3a1
          LEFT JOIN unit_kerja uk ON t3a1.id_unit_prodi = uk.id_unit
          ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
          ORDER BY ${orderBy}
        `;
    const [rows] = await pool.query(sql, params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 3.A.1');

    // Definisikan header sesuai format tabel LKPS
    const headers = [
      { header: 'Nama Prasarana', key: 'nama_sarpras', width: 30 },
      { header: 'Daya Tampung', key: 'daya_tampung', width: 15 },
      { header: 'Luas Ruang (m²)', key: 'luas_ruang_m2', width: 18 },
      { header: 'Milik sendiri (M)/Sewa (W)', key: 'kepemilikan', width: 25 },
      { header: 'Berlisensi (L)/ Public Domain (P)/ Tidak Berlisensi (T)', key: 'lisensi', width: 40 },
      { header: 'Perangkat', key: 'perangkat_detail', width: 50 },
      { header: 'Link Bukti', key: 'link_bukti', width: 30 }
    ];
    sheet.columns = headers;

    // Tambahkan data ke sheet
    sheet.addRows(rows);

    // Styling header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    // Styling data
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) { // Mulai dari baris data
        row.alignment = { vertical: 'middle', wrapText: true };
        // Pusatkan teks untuk kolom tertentu jika perlu
        row.getCell('daya_tampung').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('luas_ruang_m2').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('kepemilikan').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('lisensi').alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });

    // Set header respons untuk file Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Tabel_3A1_Sarpras_Penelitian.xlsx');

    // Tulis workbook ke respons
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error exportTabel3a1SarprasPenelitian:", err);
    res.status(500).json({ error: 'Gagal mengekspor data sarpras penelitian' });
  }
};

