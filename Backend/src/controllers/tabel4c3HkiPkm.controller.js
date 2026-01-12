import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

// ==========================================================
// HELPER: getTahunAkademik (Standar 5 Tahun)
// (Di-copy dari controller sebelumnya untuk konsistensi)
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
// HELPER PIVOT CHECKMARK (Standar 5 Tahun)
// Membuat kolom checkmark '√' untuk 5 tahun
// ==========================================================
const pivotHkiPkmCheckmarkSQL = (tahunIds, aliasTabel = 'h') => `
    (CASE WHEN ${aliasTabel}.id_tahun_perolehan = ${tahunIds.id_ts4} THEN '√' ELSE '' END) AS tahun_ts4,
    (CASE WHEN ${aliasTabel}.id_tahun_perolehan = ${tahunIds.id_ts3} THEN '√' ELSE '' END) AS tahun_ts3,
    (CASE WHEN ${aliasTabel}.id_tahun_perolehan = ${tahunIds.id_ts2} THEN '√' ELSE '' END) AS tahun_ts2,
    (CASE WHEN ${aliasTabel}.id_tahun_perolehan = ${tahunIds.id_ts1} THEN '√' ELSE '' END) AS tahun_ts1,
    (CASE WHEN ${aliasTabel}.id_tahun_perolehan = ${tahunIds.id_ts} THEN '√' ELSE '' END) AS tahun_ts
`;


/*
================================
 GET ALL (LIST) - [DINAMIS 5 TAHUN]
 
 Tampilkan list per baris (tidak di-grouping)
================================
*/
export const listTabel4c3HkiPkm = async (req, res) => {
  try {
    // Special handling: Role LPPM bisa melihat semua data tanpa filter unit
    const userRole = req.user?.role?.toLowerCase();
    const isLppm = userRole === 'lppm';
    const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm', 'ketua'].includes(userRole);

    // Alias 'h' untuk tabel_4c3_hki_pkm
    const { where, params } = await buildWhere(req, 'tabel_4c3_hki_pkm', 'h');

    // Hapus filter id_unit untuk role LPPM (bisa lihat semua data)
    if (isLppm && !isSuperAdmin) {
      const unitFilterPattern = /h\.id_unit\s*=\s*\?/i;
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
      : 'pg.nama_lengkap ASC, h.id_tahun_perolehan DESC'; // Order by nama, lalu tahun terbaru

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
    where.push(`h.id_tahun_perolehan IN (?)`);
    params.push(tahunFilters);

    // 4. Buat SQL
    const sql = `
      SELECT 
        h.id,
        h.id_dosen, 
        pg.nama_lengkap AS nama_dtpr,
        h.judul_hki,
        h.jenis_hki,
        h.id_unit,
        uk.nama_unit,
        h.link_bukti,
        h.deleted_at, -- [FIX] Tambahkan deleted_at untuk frontend filtering
        
        -- Panggil helper PIVOT Checkmark (5 tahun)
        ${pivotHkiPkmCheckmarkSQL(tahunIds, 'h')}
        
      FROM tabel_4c3_hki_pkm h
      
      -- JOIN untuk ambil nama dosen
      LEFT JOIN dosen dsn ON h.id_dosen = dsn.id_dosen
      LEFT JOIN pegawai pg ON dsn.id_pegawai = pg.id_pegawai
      
      -- JOIN untuk ambil nama unit
      LEFT JOIN unit_kerja uk ON h.id_unit = uk.id_unit
      
      -- WHERE (sudah otomatis soft delete + filter 5 tahun + filter unit)
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      
      -- ORDER
      ORDER BY ${orderBy}`;

    const [rows] = await pool.query(sql, params);

    // Kirim juga info tahunnya ke frontend
    res.json({
      tahun_laporan: tahunIds,
      data: rows
    });

  } catch (err) {
    console.error("Error listTabel4c3HkiPkm:", err);
    if (err.message.includes('ts_id tidak valid')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal mengambil daftar HKI PkM', details: err.sqlMessage || err.message });
  }
};

/*
================================
 GET BY ID (Simple)
================================
*/
export const getTabel4c3HkiPkmById = async (req, res) => {
  try {
    const sql = `
            SELECT 
              h.*, 
              pg.nama_lengkap AS nama_dtpr,
              uk.nama_unit,
              t.tahun AS nama_tahun_perolehan
            FROM tabel_4c3_hki_pkm h
            LEFT JOIN dosen dsn ON h.id_dosen = dsn.id_dosen
            LEFT JOIN pegawai pg ON dsn.id_pegawai = pg.id_pegawai
            LEFT JOIN unit_kerja uk ON h.id_unit = uk.id_unit
            LEFT JOIN tahun_akademik t ON h.id_tahun_perolehan = t.id_tahun
            WHERE h.id = ? AND h.deleted_at IS NULL
        `;
    const [rows] = await pool.query(sql, [req.params.id]);

    if (!rows[0]) return res.status(404).json({ error: 'Data HKI PkM tidak ditemukan' });

    res.json(rows[0]);

  } catch (err) {
    console.error("Error getTabel4c3HkiPkmById:", err);
    res.status(500).json({ error: 'Gagal mengambil detail data HKI PkM', details: err.message });
  }
};

/*
================================
 CREATE (Simple)
================================
*/
export const createTabel4c3HkiPkm = async (req, res) => {
  try {
    const {
      id_dosen,
      judul_hki,
      jenis_hki,
      id_tahun_perolehan,
      link_bukti
    } = req.body;

    // 1. Validasi Input
    if (!id_dosen || !judul_hki || !jenis_hki || !id_tahun_perolehan) {
      return res.status(400).json({
        error: 'Input tidak lengkap. (id_dosen, judul_hki, jenis_hki, id_tahun_perolehan) wajib diisi.'
      });
    }

    // 2. Auto-fill id_unit dari user yang login (konsisten dengan 3a1)
    // Fallback: jika id_unit tidak ada, coba gunakan id_unit_prodi
    let final_id_unit = req.user?.id_unit || req.user?.id_unit_prodi;
    if (!final_id_unit) {
      return res.status(400).json({ error: 'Unit kerja (Prodi/LPPM) tidak ditemukan dari data user.' });
    }

    const id_user = req.user?.id_user;
    // 3. Siapkan data
    const dataToInsert = {
      id_dosen,
      judul_hki,
      jenis_hki,
      id_tahun_perolehan,
      link_bukti,
      id_unit: final_id_unit // Otomatis dari user yang login
    };

    // 4. Tambah audit columns
    if (await hasColumn('tabel_4c3_hki_pkm', 'created_by') && id_user) {
      dataToInsert.created_by = id_user;
    }

    // 5. Eksekusi Query
    const [result] = await pool.query(
      'INSERT INTO tabel_4c3_hki_pkm SET ?',
      [dataToInsert]
    );
    const newId = result.insertId;

    // 6. Ambil data baru untuk dikembalikan
    const [rows] = await pool.query(
      `SELECT * FROM tabel_4c3_hki_pkm WHERE id = ?`,
      [newId]
    );

    res.status(201).json({
      message: 'Data HKI PkM berhasil dibuat',
      id: newId,
      data: rows[0]
    });

  } catch (err) {
    console.error("Error createTabel4c3HkiPkm:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Data duplikat terdeteksi.', details: err.sqlMessage });
    }
    res.status(500).json({ error: 'Gagal membuat data HKI PkM', details: err.sqlMessage || err.message });
  }
};

/*
================================
 UPDATE (Simple)
================================
*/
export const updateTabel4c3HkiPkm = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      id_dosen,
      judul_hki,
      jenis_hki,
      id_tahun_perolehan,
      link_bukti
    } = req.body;

    // 1. Validasi Input
    if (!id_dosen || !judul_hki || !jenis_hki || !id_tahun_perolehan) {
      return res.status(400).json({
        error: 'Input tidak lengkap. (id_dosen, judul_hki, jenis_hki, id_tahun_perolehan) wajib diisi.'
      });
    }

    // 2. Auto-fill id_unit dari user yang login (konsisten dengan 3a1)
    // Fallback: jika id_unit tidak ada, coba gunakan id_unit_prodi
    let final_id_unit = req.user?.id_unit || req.user?.id_unit_prodi;
    if (!final_id_unit) {
      return res.status(400).json({ error: 'Unit kerja (Prodi/LPPM) tidak ditemukan dari data user.' });
    }

    const id_user = req.user?.id_user;
    // 3. Siapkan data
    const dataToUpdate = {
      id_dosen,
      judul_hki,
      jenis_hki,
      id_tahun_perolehan,
      link_bukti,
      id_unit: final_id_unit // Update dengan unit dari user yang login
    };

    // 4. Tambah audit columns
    if (await hasColumn('tabel_4c3_hki_pkm', 'updated_by') && id_user) {
      dataToUpdate.updated_by = id_user;
    }

    // 5. Eksekusi Query
    const [result] = await pool.query(
      'UPDATE tabel_4c3_hki_pkm SET ? WHERE id = ?',
      [dataToUpdate, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data HKI PkM tidak ditemukan atau tidak ada perubahan.' });
    }

    // 6. Ambil data baru untuk dikembalikan
    const [rows] = await pool.query(
      `SELECT * FROM tabel_4c3_hki_pkm WHERE id = ?`,
      [id]
    );

    res.json({
      message: 'Data HKI PkM berhasil diperbarui',
      data: rows[0]
    });

  } catch (err) {
    console.error("Error updateTabel4c3HkiPkm:", err);
    res.status(500).json({ error: 'Gagal memperbarui data HKI PkM', details: err.sqlMessage || err.message });
  }
};

/*
================================
 SOFT DELETE
================================
*/
export const softDeleteTabel4c3HkiPkm = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_4c3_hki_pkm', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    const [result] = await pool.query(
      'UPDATE tabel_4c3_hki_pkm SET ? WHERE id = ?',
      [payload, req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data HKI PkM berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteTabel4c3HkiPkm:", err);
    res.status(500).json({ error: 'Gagal menghapus data', details: err.message });
  }
};

/*
================================
 RESTORE (konsisten dengan 3a1)
================================
*/
export const restoreTabel4c3HkiPkm = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }

    // Cek apakah kolom deleted_at ada
    const hasDeletedAt = await hasColumn('tabel_4c3_hki_pkm', 'deleted_at');
    if (!hasDeletedAt) {
      return res.status(400).json({ error: 'Restore tidak didukung. Tabel tidak memiliki kolom deleted_at.' });
    }

    // Cek apakah kolom deleted_by ada
    const hasDeletedBy = await hasColumn('tabel_4c3_hki_pkm', 'deleted_by');

    // Restore data
    if (hasDeletedBy) {
      const [result] = await pool.query(
        'UPDATE tabel_4c3_hki_pkm SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }

      res.json({ ok: true, restored: true, message: 'Data HKI PkM berhasil dipulihkan' });
    } else {
      const [result] = await pool.query(
        'UPDATE tabel_4c3_hki_pkm SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }

      res.json({ ok: true, restored: true, message: 'Data HKI PkM berhasil dipulihkan' });
    }
  } catch (err) {
    console.error("Error restoreTabel4c3HkiPkm:", err);
    res.status(500).json({ error: 'Gagal memulihkan data', message: err.message });
  }
};

/*
================================
 HARD DELETE
================================
*/
export const hardDeleteTabel4c3HkiPkm = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tabel_4c3_hki_pkm WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data HKI PkM berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    console.error("Error hardDeleteTabel4c3HkiPkm:", err);
    res.status(500).json({ error: 'Gagal menghapus data HKI PkM secara permanen.', details: err.message });
  }
};

/*
================================
 EXPORT EXCEL - [DINAMIS 5 TAHUN]
================================
*/
export const exportTabel4c3HkiPkm = async (req, res) => {
  try {
    // Alias 'h'
    const { where, params } = await buildWhere(req, 'tabel_4c3_hki_pkm', 'h');
    const orderBy = 'pg.nama_lengkap ASC, h.id_tahun_perolehan DESC';

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
    where.push(`h.id_tahun_perolehan IN (?)`);
    params.push(tahunFilters);

    // 4. Buat SQL
    const sql = `
            SELECT 
              pg.nama_lengkap AS nama_dtpr,
              h.judul_hki,
              h.jenis_hki,
              h.link_bukti,
              
              -- Panggil helper PIVOT Checkmark (5 tahun)
              ${pivotHkiPkmCheckmarkSQL(tahunIds, 'h')}
              
            FROM tabel_4c3_hki_pkm h
            
            LEFT JOIN dosen dsn ON h.id_dosen = dsn.id_dosen
            LEFT JOIN pegawai pg ON dsn.id_pegawai = pg.id_pegawai
            LEFT JOIN unit_kerja uk ON h.id_unit = uk.id_unit
            
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            
            ORDER BY ${orderBy}`;

    const [rows] = await pool.query(sql, params);

    // 5. Buat Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 4.C.3');

    // Header Gabungan (Merge) - [5 KOLOM]
    sheet.mergeCells('E1:I1'); // -> E, F, G, H, I
    sheet.getCell('E1').value = `Tahun Perolehan (TS = ${tahunIds.nama_ts})`;
    sheet.getCell('E1').font = { bold: true };
    sheet.getCell('E1').alignment = { horizontal: 'center' };

    // Header Kolom - [5 TAHUN]
    const headers = [
      { header: 'Nama DTPR', key: 'nama_dtpr', width: 30 },
      { header: 'Judul HKI', key: 'judul_hki', width: 40 },
      { header: 'Jenis HKI', key: 'jenis_hki', width: 30 },
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

    // 7. Styling Data - [5 TAHUN]
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 2) {
        row.alignment = { vertical: 'middle', wrapText: true };
        // Center-align kolom tertentu
        ['tahun_ts4', 'tahun_ts3', 'tahun_ts2', 'tahun_ts1', 'tahun_ts'].forEach(key => {
          row.getCell(key).alignment = { vertical: 'middle', horizontal: 'center' };
        });
      }
    });

    // 8. Kirim file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Tabel_4C3_HKI_PkM.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error exportTabel4c3HkiPkm:", err);
    if (err.message.includes('ts_id tidak valid')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal mengekspor data HKI PkM', details: err.message });
  }
};