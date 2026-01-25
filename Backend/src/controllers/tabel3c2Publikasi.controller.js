/*
============================================================
 FILE: tabel3c2Publikasi.controller.js
 
 [VERSI FINAL - 5 TAHUN SESUAI STANDAR]
 Arsitektur:
 - Menggunakan `ts_id` dinamis dari query parameter (sama seperti 3.C.1).
 - Laporan (list/export) mengambil 5 TAHUN (TS-4 s/d TS).
 - Menggunakan PIVOT untuk checkmark '√' tahun terbit.
 - JOIN ke tabel dosen & pegawai for nama_dtpr.
============================================================
*/

import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

// ==========================================================
// HELPER: getTahunAkademik (Standar 5 Tahun)
// (Di-copy dari tabel3c1Kerjasama.controller.js untuk konsistensi)
// ==========================================================
const getTahunAkademik = async (ts_id_terpilih, connection) => {

  // 1. Validasi dan konversi ts_id yang dipilih
  const ts = parseInt(ts_id_terpilih, 10);
  if (isNaN(ts)) {
    console.error(`DEBUG: ts_id '${ts_id_terpilih}' tidak valid.`);
    throw new Error('ts_id tidak valid atau tidak disediakan.');
  }

  // 2. Hitung 5 ID tahun secara dinamis
  const id_ts = ts;
  const id_ts1 = ts - 1;
  const id_ts2 = ts - 2;
  const id_ts3 = ts - 3;
  const id_ts4 = ts - 4;

  const tahunIdsList = [id_ts4, id_ts3, id_ts2, id_ts1, id_ts];

  // 3. Ambil nama tahun dari DB untuk 5 ID yang dihitung
  const [rows] = await (connection || pool).query(
    `SELECT id_tahun, tahun 
       FROM tahun_akademik 
       WHERE id_tahun IN (?)
       ORDER BY id_tahun ASC`,
    [tahunIdsList]
  );

  // 4. Buat Map untuk pencarian nama tahun (lebih efisien)
  const tahunMap = new Map(rows.map(row => [row.id_tahun, row.tahun]));

  // 5. Kembalikan objek 5 tahun yang lengkap
  return {
    id_ts4: id_ts4,
    id_ts3: id_ts3,
    id_ts2: id_ts2,
    id_ts1: id_ts1,
    id_ts: id_ts,
    nama_ts4: tahunMap.get(id_ts4) || `${id_ts4}`,
    nama_ts3: tahunMap.get(id_ts3) || `${id_ts3}`,
    nama_ts2: tahunMap.get(id_ts2) || `${id_ts2}`,
    nama_ts1: tahunMap.get(id_ts1) || `${id_ts1}`,
    nama_ts: tahunMap.get(id_ts) || `${id_ts}`,
  };
};

// ==========================================================
// HELPER PIVOT SUM (Untuk List/Laporan versi Grouping - JIKA DIPERLUKAN)
// ==========================================================
const pivotPublikasiSQL = (tahunIds, aliasTabel = 'p') => `
  SUM(CASE 
    WHEN ${aliasTabel}.id_tahun_terbit = ${tahunIds.id_ts4} THEN 1
    ELSE 0 
  END) AS jumlah_ts4,
  SUM(CASE 
    WHEN ${aliasTabel}.id_tahun_terbit = ${tahunIds.id_ts3} THEN 1
    ELSE 0 
  END) AS jumlah_ts3,
  SUM(CASE 
    WHEN ${aliasTabel}.id_tahun_terbit = ${tahunIds.id_ts2} THEN 1
    ELSE 0 
  END) AS jumlah_ts2,
  SUM(CASE 
    WHEN ${aliasTabel}.id_tahun_terbit = ${tahunIds.id_ts1} THEN 1
    ELSE 0 
  END) AS jumlah_ts1,
  SUM(CASE 
    WHEN ${aliasTabel}.id_tahun_terbit = ${tahunIds.id_ts} THEN 1
    ELSE 0 
  END) AS jumlah_ts
`;

// ==========================================================
// [FIX] HELPER PIVOT CHECKMARK (Standar 5 Tahun)
// (Dipindah ke global scope agar bisa dipakai 'list' dan 'export')
// ==========================================================
const pivotPublikasiCheckmarkSQL = (tahunIds, aliasTabel = 'p') => `
    (CASE WHEN ${aliasTabel}.id_tahun_terbit = ${tahunIds.id_ts4} THEN '√' ELSE '' END) AS tahun_ts4,
    (CASE WHEN ${aliasTabel}.id_tahun_terbit = ${tahunIds.id_ts3} THEN '√' ELSE '' END) AS tahun_ts3,
    (CASE WHEN ${aliasTabel}.id_tahun_terbit = ${tahunIds.id_ts2} THEN '√' ELSE '' END) AS tahun_ts2,
    (CASE WHEN ${aliasTabel}.id_tahun_terbit = ${tahunIds.id_ts1} THEN '√' ELSE '' END) AS tahun_ts1,
    (CASE WHEN ${aliasTabel}.id_tahun_terbit = ${tahunIds.id_ts} THEN '√' ELSE '' END) AS tahun_ts
`;


/*
================================
 GET ALL (LIST) - [DINAMIS 5 TAHUN]
 
 [FIXED: 09-NOV-2025]
 - Logika diubah dari GROUP BY (SUM) menjadi list per baris.
 - Menampilkan `judul_publikasi` di setiap baris.
 - Menggunakan PIVOT checkmark '√', bukan PIVOT SUM.
================================
*/
export const listTabel3c2Publikasi = async (req, res) => {
  try {
    // Special handling: Role LPPM bisa melihat semua data tanpa filter unit
    const userRole = req.user?.role?.toLowerCase();
    const isLppm = userRole === 'lppm';
    const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm', 'ketua'].includes(userRole);

    // Alias 'p' untuk tabel_3c2_publikasi_penelitian
    const { where, params } = await buildWhere(req, 'tabel_3c2_publikasi_penelitian', 'p');

    // Hapus filter id_unit untuk role LPPM (bisa lihat semua data)
    if (isLppm && !isSuperAdmin) {
      const unitFilterPattern = /p\.id_unit\s*=\s*\?/i;
      let unitFilterIndex = -1;
      for (let i = 0; i < where.length; i++) {
        if (unitFilterPattern.test(where[i])) {
          unitFilterIndex = i;
          break;
        }
      }

      if (unitFilterIndex !== -1) {
        where.splice(unitFilterIndex, 1);
        let paramIndex = 0;
        for (let i = 0; i < unitFilterIndex; i++) {
          const matches = where[i].match(/\?/g);
          if (matches) paramIndex += matches.length;
        }
        if (paramIndex < params.length) {
          params.splice(paramIndex, 1);
        }
      }
    }


    const customOrder = req.query?.order_by;
    const orderBy = customOrder
      ? buildOrderBy(customOrder, 'nama_dtpr', 'pg')
      : 'pg.nama_lengkap ASC, p.id_tahun_terbit DESC'; // Kembali ke order by nama (A-Z), lalu tahun terbaru

    // 1. Ambil ts_id dari query parameter
    const { ts_id } = req.query;
    if (!ts_id) {
      return res.status(400).json({
        error: 'Query parameter ?ts_id=TAHUN (contoh: ?ts_id=2024) wajib diisi untuk melihat laporan.'
      });
    }

    // 2. Panggil helper (5 tahun)
    const tahunIds = await getTahunAkademik(ts_id);

    // 3. Tambahkan filter HANYA untuk 5 tahun laporan
    const tahunFilters = [tahunIds.id_ts4, tahunIds.id_ts3, tahunIds.id_ts2, tahunIds.id_ts1, tahunIds.id_ts];
    where.push(`p.id_tahun_terbit IN (?)`);
    params.push(tahunFilters);

    // 4. Buat SQL [DIROMBAK]
    const sql = `
      SELECT 
        p.id, -- [TAMBAH] Kirim ID barisnya
        p.id_dosen, 
        pg.nama_lengkap AS nama_dtpr,
        p.judul_publikasi, -- [FIX] Menambahkan judul_publikasi
        p.jenis_publikasi,
        p.id_unit,
        uk.nama_unit,
        p.id_tahun_terbit, -- [FIX] Tambah id_tahun_terbit untuk modal edit
        p.deleted_at, -- [FIX] Tambah deleted_at agar frontend bisa filter tab 'Data Terhapus'
        p.link_bukti,
        
        -- [FIX] Panggil helper PIVOT Checkmark (5 tahun)
        ${pivotPublikasiCheckmarkSQL(tahunIds, 'p')}
        
      FROM tabel_3c2_publikasi_penelitian p
      
      -- JOIN untuk ambil nama dosen
      LEFT JOIN dosen d ON p.id_dosen = d.id_dosen
      LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
      
      -- JOIN untuk ambil nama unit
      LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      
      -- WHERE (sudah otomatis soft delete + filter 5 tahun + filter unit)
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      
      -- [FIX] GROUP BY dihapus, kita mau list lengkap
      
      -- ORDER
      ORDER BY ${orderBy}`;

    const [rows] = await pool.query(sql, params);

    // Kirim juga info tahunnya ke frontend
    res.json({
      tahun_laporan: tahunIds,
      data: rows
    });

  } catch (err) {
    console.error("Error listTabel3c2Publikasi:", err);
    if (err.message.includes('ts_id tidak valid')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal mengambil daftar publikasi', details: err.sqlMessage || err.message });
  }
};

/*
================================
 GET BY ID (Simple)
 (TIDAK BERUBAH)
================================
*/
export const getTabel3c2PublikasiById = async (req, res) => {
  try {
    const sql = `
            SELECT 
              p.*, 
              pg.nama_lengkap AS nama_dtpr,
              uk.nama_unit,
              t.tahun AS nama_tahun_terbit
            FROM tabel_3c2_publikasi_penelitian p
            LEFT JOIN dosen d ON p.id_dosen = d.id_dosen
            LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
            LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
            LEFT JOIN tahun_akademik t ON p.id_tahun_terbit = t.id_tahun
            WHERE p.id = ? AND p.deleted_at IS NULL
        `;
    const [rows] = await pool.query(sql, [req.params.id]);

    if (!rows[0]) return res.status(404).json({ error: 'Data publikasi tidak ditemukan' });

    res.json(rows[0]);

  } catch (err) {
    console.error("Error getTabel3c2PublikasiById:", err);
    res.status(500).json({ error: 'Gagal mengambil detail data', details: err.message });
  }
};

/*
================================
 CREATE (Simple)
 (TIDAK BERUBAH)
================================
*/
export const createTabel3c2Publikasi = async (req, res) => {
  try {
    const {
      id_dosen,
      judul_publikasi,
      jenis_publikasi,
      id_tahun_terbit,
      link_bukti
    } = req.body;

    if (!id_dosen || !judul_publikasi || !jenis_publikasi || !id_tahun_terbit) {
      return res.status(400).json({
        error: 'Input tidak lengkap. (id_dosen, judul_publikasi, jenis_publikasi, id_tahun_terbit) wajib diisi.'
      });
    }

    // Debug: Log req.user untuk melihat strukturnya
    console.log("createTabel3c2Publikasi - req.user:", req.user);
    console.log("createTabel3c2Publikasi - req.user?.id_unit:", req.user?.id_unit);
    console.log("createTabel3c2Publikasi - req.user?.id_unit_prodi:", req.user?.id_unit_prodi);

    // Auto-fill id_unit dari user yang login (konsisten dengan 3a1)
    // Fallback: jika id_unit tidak ada, coba gunakan id_unit_prodi
    let final_id_unit = req.user?.id_unit || req.user?.id_unit_prodi;

    if (!final_id_unit) {
      console.error("createTabel3c2Publikasi - req.user tidak memiliki id_unit atau id_unit_prodi:", req.user);
      return res.status(400).json({
        error: 'Unit kerja (Prodi/LPPM) tidak ditemukan dari data user. Pastikan user sudah memiliki unit. Silakan logout dan login ulang untuk mendapatkan token baru.'
      });
    }

    const id_user = req.user?.id_user;
    const dataToInsert = {
      id_dosen,
      judul_publikasi,
      jenis_publikasi,
      id_tahun_terbit,
      link_bukti,
      id_unit: final_id_unit // Otomatis dari user yang login
    };

    if (await hasColumn('tabel_3c2_publikasi_penelitian', 'created_by') && id_user) {
      dataToInsert.created_by = id_user;
    }

    const [result] = await pool.query(
      'INSERT INTO tabel_3c2_publikasi_penelitian SET ?',
      [dataToInsert]
    );
    const newId = result.insertId;

    const [rows] = await pool.query(
      `SELECT * FROM tabel_3c2_publikasi_penelitian WHERE id = ?`,
      [newId]
    );

    res.status(201).json({
      message: 'Data publikasi berhasil dibuat',
      id: newId,
      data: rows[0]
    });

  } catch (err) {
    console.error("Error createTabel3c2Publikasi:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Data duplikat terdeteksi.', details: err.sqlMessage });
    }
    if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      return res.status(400).json({ error: `Nilai 'jenis_publikasi' tidak valid. Gunakan: IB, I, S1, S2, S3, S4, atau T.` });
    }
    res.status(500).json({ error: 'Gagal membuat data publikasi', details: err.sqlMessage || err.message });
  }
};

/*
================================
 UPDATE (Simple)
 (TIDAK BERUBAH)
================================
*/
export const updateTabel3c2Publikasi = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      id_dosen,
      judul_publikasi,
      jenis_publikasi,
      id_tahun_terbit,
      link_bukti
    } = req.body;

    if (!id_dosen || !judul_publikasi || !jenis_publikasi || !id_tahun_terbit) {
      return res.status(400).json({
        error: 'Input tidak lengkap. (id_dosen, judul_publikasi, jenis_publikasi, id_tahun_terbit) wajib diisi.'
      });
    }

    // Auto-fill id_unit dari user yang login (konsisten dengan 3a1)
    // Fallback: jika id_unit tidak ada, coba gunakan id_unit_prodi
    let final_id_unit = req.user?.id_unit || req.user?.id_unit_prodi;
    if (!final_id_unit) {
      return res.status(400).json({ error: 'Unit kerja (Prodi/LPPM) tidak ditemukan dari data user.' });
    }

    const id_user = req.user?.id_user;
    const dataToUpdate = {
      id_dosen,
      judul_publikasi,
      jenis_publikasi,
      id_tahun_terbit,
      link_bukti,
      id_unit: final_id_unit // Update dengan unit dari user yang login
    };

    if (await hasColumn('tabel_3c2_publikasi_penelitian', 'updated_by') && id_user) {
      dataToUpdate.updated_by = id_user;
    }

    const [result] = await pool.query(
      'UPDATE tabel_3c2_publikasi_penelitian SET ? WHERE id = ?',
      [dataToUpdate, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data publikasi tidak ditemukan atau tidak ada perubahan.' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM tabel_3c2_publikasi_penelitian WHERE id = ?`,
      [id]
    );

    res.json({
      message: 'Data publikasi berhasil diperbarui',
      data: rows[0]
    });

  } catch (err) {
    console.error("Error updateTabel3c2Publikasi:", err);
    if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      return res.status(400).json({ error: `Nilai 'jenis_publikasi' tidak valid. Gunakan: IB, I, S1, S2, S3, S4, atau T.` });
    }
    res.status(500).json({ error: 'Gagal memperbarui data publikasi', details: err.sqlMessage || err.message });
  }
};

/*
================================
 SOFT DELETE
================================
*/
export const softDeleteTabel3c2Publikasi = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_3c2_publikasi_penelitian', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    const [result] = await pool.query(
      'UPDATE tabel_3c2_publikasi_penelitian SET ? WHERE id = ?',
      [payload, req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteTabel3c2Publikasi:", err);
    res.status(500).json({ error: 'Gagal menghapus data', details: err.message });
  }
};

/*
================================
 RESTORE (konsisten dengan 3a1)
================================
*/
export const restoreTabel3c2Publikasi = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }

    // Cek apakah kolom deleted_at ada
    const hasDeletedAt = await hasColumn('tabel_3c2_publikasi_penelitian', 'deleted_at');
    if (!hasDeletedAt) {
      return res.status(400).json({ error: 'Restore tidak didukung. Tabel tidak memiliki kolom deleted_at.' });
    }

    // Cek apakah kolom deleted_by ada
    const hasDeletedBy = await hasColumn('tabel_3c2_publikasi_penelitian', 'deleted_by');

    // Restore data
    if (hasDeletedBy) {
      const [result] = await pool.query(
        'UPDATE tabel_3c2_publikasi_penelitian SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }

      res.json({ ok: true, restored: true, message: 'Data publikasi penelitian berhasil dipulihkan' });
    } else {
      const [result] = await pool.query(
        'UPDATE tabel_3c2_publikasi_penelitian SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }

      res.json({ ok: true, restored: true, message: 'Data publikasi penelitian berhasil dipulihkan' });
    }
  } catch (err) {
    console.error("Error restoreTabel3c2Publikasi:", err);
    res.status(500).json({ error: 'Gagal memulihkan data', message: err.message });
  }
};

/*
================================
 HARD DELETE
 (TIDAK BERUBAH)
================================
*/
export const hardDeleteTabel3c2Publikasi = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tabel_3c2_publikasi_penelitian WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    console.error("Error hardDeleteTabel3c2Publikasi:", err);
    res.status(500).json({ error: 'Gagal menghapus data secara permanen.', details: err.message });
  }
};

/*
================================
 EXPORT EXCEL - [DINAMIS 5 TAHUN]
================================
*/
export const exportTabel3c2Publikasi = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tabel_3c2_publikasi_penelitian', 'p');
    const orderBy = 'pg.nama_lengkap ASC, p.jenis_publikasi ASC';

    // 1. Ambil ts_id
    const { ts_id } = req.query;
    if (!ts_id) {
      return res.status(400).json({
        error: 'Query parameter ?ts_id=TAHUN (contoh: ?ts_id=2024) wajib diisi untuk export.'
      });
    }

    // 2. Panggil helper 5 tahun
    const tahunIds = await getTahunAkademik(ts_id);

    // 3. Tambahkan filter HANYA untuk 5 tahun laporan
    const tahunFilters = [tahunIds.id_ts4, tahunIds.id_ts3, tahunIds.id_ts2, tahunIds.id_ts1, tahunIds.id_ts];
    where.push(`p.id_tahun_terbit IN (?)`);
    params.push(tahunFilters);

    // 4. Buat SQL (Mirip list, tapi kita pakai PIVOT checkmark)

    // [FIX] Helper pivotCheckmarkSQL sudah dipindah ke global scope
    // const pivotCheckmarkSQL = (tahunIds, aliasTabel = 'p') => ...

    const sql = `
            SELECT 
              pg.nama_lengkap AS nama_dtpr,
              p.judul_publikasi,
              p.jenis_publikasi,
              p.link_bukti,
              
              -- Panggil helper PIVOT Checkmark (5 tahun)
              ${pivotPublikasiCheckmarkSQL(tahunIds, 'p')}
              
            FROM tabel_3c2_publikasi_penelitian p
            
            LEFT JOIN dosen d ON p.id_dosen = d.id_dosen
            LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
            LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
            
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            
            -- Export TIDAK di-grouping, kita tampilkan semua baris
            
            ORDER BY ${orderBy}`;

    const [rows] = await pool.query(sql, params);

    // 5. Buat Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 3.C.2');

    // Header Gabungan (Merge) - [DIUBAH KE 5 KOLOM]
    sheet.mergeCells('E1:I1'); // -> E, F, G, H, I
    sheet.getCell('E1').value = `Tahun Terbit (TS = ${tahunIds.nama_ts})`;
    sheet.getCell('E1').font = { bold: true };
    sheet.getCell('E1').alignment = { horizontal: 'center' };

    // Header Kolom - [DIUBAH KE 5 TAHUN]
    const headers = [
      { header: 'Nama DTPR', key: 'nama_dtpr', width: 30 },
      { header: 'Judul Publikasi', key: 'judul_publikasi', width: 40 },
      { header: 'Jenis Publikasi (IB/I/S1/S2/S3/S4/T)', key: 'jenis_publikasi', width: 25 },
      { header: 'Link Bukti', key: 'link_bukti', width: 30 },
      // Header 5 Tahun
      { header: `TS-4 (${tahunIds.nama_ts4})`, key: 'tahun_ts4', width: 15 },
      { header: `TS-3 (${tahunIds.nama_ts3})`, key: 'tahun_ts3', width: 15 },
      { header: `TS-2 (${tahunIds.nama_ts2})`, key: 'tahun_ts2', width: 15 },
      { header: `TS-1 (${tahunIds.nama_ts1})`, key: 'tahun_ts1', width: 15 },
      { header: `TS (${tahunIds.nama_ts})`, key: 'tahun_ts', width: 15 },
    ];

    // Susun ulang kolom agar Link Bukti ada di akhir
    const linkBuktiHeader = headers.splice(3, 1)[0];
    headers.push(linkBuktiHeader);

    sheet.getRow(2).columns = headers;
    sheet.getRow(2).font = { bold: true };
    sheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    // 6. Tambah Data
    sheet.addRows(rows);

    // 7. Styling Data - [DIUBAH KE 5 TAHUN]
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 2) {
        row.alignment = { vertical: 'middle', wrapText: true };
        // Center-align kolom tertentu
        ['jenis_publikasi', 'tahun_ts4', 'tahun_ts3', 'tahun_ts2', 'tahun_ts1', 'tahun_ts'].forEach(key => {
          row.getCell(key).alignment = { vertical: 'middle', horizontal: 'center' };
        });
      }
    });

    // 8. Kirim file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Tabel_3C2_Publikasi_Penelitian.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error exportTabel3c2Publikasi:", err);
    if (err.message.includes('ts_id tidak valid')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal mengekspor data publikasi', details: err.message });
  }
};