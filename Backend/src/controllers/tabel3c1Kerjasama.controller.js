/*
============================================================
 FILE: tabel3c1Kerjasama.controller.js
 (VERSI ROMBAKAN TOTAL: Mendukung TS Dinamis dari Frontend)
 
 [PERUBAHAN BESAR]:
 - `getTahunAkademik` dirombak total untuk menerima `ts_id` dinamis.
 - `listTabel3c1Kerjasama` dan `exportTabel3c1Kerjasama` 
   sekarang WAJIB menerima query parameter `?ts_id=TAHUN`.
============================================================
*/

import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

// =l========================================================
// HELPER pivotPendanaanSQL (TIDAK BERUBAH)
// Helper ini generik dan tidak perlu diubah.
// ==========================================================
const pivotPendanaanSQL = (tahunIds, aliasPendanaan = 'p', aliasTahun = 't') => `SUM(CASE 
    WHEN ${aliasTahun}.id_tahun = ${tahunIds.id_ts4} THEN ${aliasPendanaan}.jumlah_dana
    ELSE 0 
  END) AS pendanaan_ts4,
  SUM(CASE 
    WHEN ${aliasTahun}.id_tahun = ${tahunIds.id_ts3} THEN ${aliasPendanaan}.jumlah_dana
    ELSE 0 
  END) AS pendanaan_ts3,
  SUM(CASE 
    WHEN ${aliasTahun}.id_tahun = ${tahunIds.id_ts2} THEN ${aliasPendanaan}.jumlah_dana
    ELSE 0 
  END) AS pendanaan_ts2,
  SUM(CASE 
    WHEN ${aliasTahun}.id_tahun = ${tahunIds.id_ts1} THEN ${aliasPendanaan}.jumlah_dana
    ELSE 0 
  END) AS pendanaan_ts1,
  SUM(CASE 
    WHEN ${aliasTahun}.id_tahun = ${tahunIds.id_ts} THEN ${aliasPendanaan}.jumlah_dana
    ELSE 0 
  END) AS pendanaan_ts
`;


// ==========================================================
// [ROMBAKAN BESAR] HELPER getTahunAkademik
// Fungsi ini sekarang menerima `ts_id` dari query frontend
// dan menghitung 5 tahun (TS s/d TS-4) secara dinamis.
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
    [tahunIdsList] // mysql2/promise akan mengubah [1,2,3] menjadi "1,2,3"
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
    // Ambil nama dari Map. Jika tidak ada di DB, tampilkan ID-nya sbg fallback.
    nama_ts4: tahunMap.get(id_ts4) || `${id_ts4}`,
    nama_ts3: tahunMap.get(id_ts3) || `${id_ts3}`,
    nama_ts2: tahunMap.get(id_ts2) || `${id_ts2}`,
    nama_ts1: tahunMap.get(id_ts1) || `${id_ts1}`,
    nama_ts: tahunMap.get(id_ts) || `${id_ts}`,
  };
};


/*
================================
 GET ALL (LIST) - [DIROMBAK]
================================
*/
export const listTabel3c1Kerjasama = async (req, res) => {
  try {
    // Special handling: Role LPPM bisa melihat semua data tanpa filter unit
    const userRole = req.user?.role?.toLowerCase();
    const isLppm = userRole === 'lppm';
    const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm', 'ketua'].includes(userRole);

    const { where, params } = await buildWhere(req, 'tabel_3c1_kerjasama_penelitian', 'k');

    // Hapus filter id_unit untuk role LPPM (bisa lihat semua data)
    if (isLppm && !isSuperAdmin) {
      const unitFilterPattern = /k\.id_unit\s*=\s*\?/i;
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
      ? buildOrderBy(customOrder, 'id', 'k')
      : 'k.id ASC';

    // ==========================================================
    // [ROMBAKAN BESAR] Ambil ts_id dari query parameter
    // ==========================================================
    const { ts_id } = req.query;
    if (!ts_id) {
      return res.status(400).json({
        error: 'Query parameter ?ts_id=TAHUN (contoh: ?ts_id=2024) wajib diisi untuk melihat laporan.'
      });
    }

    // Panggil helper BARU dengan ts_id yang dipilih
    const tahunIds = await getTahunAkademik(ts_id);
    // ==========================================================

    if (!tahunIds.id_ts) {
      return res.status(500).json({ error: `Gagal mengambil data 5 tahun akademik untuk TS=${ts_id}.` });
    }

    // Ambil tahun-tahun untuk parameter subquery filter
    const tahunIdsList = [
      tahunIds.id_ts4,
      tahunIds.id_ts3,
      tahunIds.id_ts2,
      tahunIds.id_ts1,
      tahunIds.id_ts
    ];

    // Gabungkan params: original (unit/deleted) + tahunIdsList (5)
    const finalParams = [...params, ...tahunIdsList];

    const sql = `SELECT
        k.id, k.id_unit, uk.nama_unit,
        k.judul_kerjasama, k.mitra_kerja_sama, k.sumber, k.durasi_tahun, k.link_bukti,
        k.deleted_at,
        ${pivotPendanaanSQL(tahunIds, 'p', 't')}
      FROM tabel_3c1_kerjasama_penelitian k
      LEFT JOIN unit_kerja uk ON k.id_unit = uk.id_unit
      LEFT JOIN tabel_3c1_pendanaan_kerjasama p ON k.id = p.id_kerjasama
      LEFT JOIN tahun_akademik t ON p.id_tahun = t.id_tahun
      WHERE ${where.length ? `${where.join(' AND ')} AND ` : ''} 
      k.id IN (SELECT id_kerjasama FROM tabel_3c1_pendanaan_kerjasama WHERE id_tahun IN (?, ?, ?, ?, ?))
      GROUP BY 
        k.id, k.id_unit, uk.nama_unit, k.judul_kerjasama, 
        k.mitra_kerja_sama, k.sumber, k.durasi_tahun, k.link_bukti, k.deleted_at
      ORDER BY ${orderBy}`;

    const [rows] = await pool.query(sql, finalParams);
    res.json(rows);

  } catch (err) {
    console.error("Error listTabel3c1Kerjasama:", err);
    // Tangkap error spesifik dari helper baru
    if (err.message.includes('ts_id tidak valid')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal mengambil daftar kerjasama penelitian', details: err.sqlMessage || err.message });
  }
};

/*
================================
 GET BY ID (TIDAK BERUBAH)
 Fungsi ini hanya mengambil data mentah, tidak perlu
 logika laporan 5 tahun.
================================
*/
export const getTabel3c1KerjasamaById = async (req, res) => {
  try {
    const [parentRows] = await pool.query(
      `SELECT k.*, uk.nama_unit
             FROM tabel_3c1_kerjasama_penelitian k 
             LEFT JOIN unit_kerja uk ON k.id_unit = uk.id_unit 
             WHERE k.id = ?`,
      [req.params.id]
    );

    if (!parentRows[0]) return res.status(404).json({ error: 'Data kerjasama tidak ditemukan' });

    const [childRows] = await pool.query(
      `SELECT id_tahun, jumlah_dana 
             FROM tabel_3c1_pendanaan_kerjasama 
             WHERE id_kerjasama = ?`,
      [req.params.id]
    );

    const result = {
      ...parentRows[0],
      pendanaan: childRows
    };

    res.json(result);
  } catch (err) {
    console.error("Error getTabel3c1KerjasamaById:", err);
    res.status(500).json({ error: 'Gagal mengambil detail data' });
  }
};

/*
================================
 CREATE (TIDAK BERUBAH)
 Fungsi ini hanya menyimpan data mentah, tidak perlu
 logika laporan 5 tahun.
================================
*/
export const createTabel3c1Kerjasama = async (req, res) => {
  let connection;
  try {
    const {
      judul_kerjasama, mitra_kerja_sama, sumber, durasi_tahun, link_bukti,
      pendanaan
    } = req.body;

    if (!judul_kerjasama) { return res.status(400).json({ error: 'Judul Kerjasama wajib diisi.' }); }
    if (!mitra_kerja_sama) { return res.status(400).json({ error: 'Mitra Kerja Sama wajib diisi.' }); }
    if (!sumber) { return res.status(400).json({ error: 'Sumber (L/N/I) wajib diisi.' }); }
    if (!Array.isArray(pendanaan) || pendanaan.length === 0) {
      return res.status(400).json({ error: 'Data pendanaan (TS-4 s/d TS) wajib diisi.' });
    }

    // Debug: Log req.user untuk melihat strukturnya
    console.log("createTabel3c1Kerjasama - req.user:", req.user);
    console.log("createTabel3c1Kerjasama - req.user?.id_unit:", req.user?.id_unit);
    console.log("createTabel3c1Kerjasama - req.user?.id_unit_prodi:", req.user?.id_unit_prodi);

    // Auto-fill id_unit dari user yang login (konsisten dengan 3a1)
    // Fallback: jika id_unit tidak ada, coba gunakan id_unit_prodi
    let final_id_unit = req.user?.id_unit || req.user?.id_unit_prodi;

    if (!final_id_unit) {
      console.error("createTabel3c1Kerjasama - req.user tidak memiliki id_unit atau id_unit_prodi:", req.user);
      return res.status(400).json({
        error: 'Unit kerja (LPPM/Kerjasama) tidak ditemukan dari data user. Pastikan user sudah memiliki unit. Silakan logout dan login ulang untuk mendapatkan token baru.'
      });
    }

    const dataParent = {
      id_unit: final_id_unit, // Otomatis dari user yang login
      judul_kerjasama, mitra_kerja_sama, sumber, durasi_tahun, link_bukti
    };
    if (await hasColumn('tabel_3c1_kerjasama_penelitian', 'created_by') && req.user?.id_user) {
      dataParent.created_by = req.user.id_user;
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [resultParent] = await connection.query(
      'INSERT INTO tabel_3c1_kerjasama_penelitian SET ?',
      [dataParent]
    );
    const newKerjasamaId = resultParent.insertId;

    for (const item of pendanaan) {
      // Simpan hanya jika ada dana (atau > 0)
      if (item.id_tahun && item.jumlah_dana && item.jumlah_dana > 0) {
        await connection.query(
          'INSERT INTO tabel_3c1_pendanaan_kerjasama (id_kerjasama, id_tahun, jumlah_dana) VALUES (?, ?, ?)',
          [newKerjasamaId, item.id_tahun, item.jumlah_dana]
        );
      }
    }

    await connection.commit();

    res.status(201).json({ message: 'Data kerjasama penelitian berhasil dibuat', id: newKerjasamaId });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error createTabel3c1Kerjasama:", err);
    res.status(500).json({ error: 'Gagal membuat data kerjasama', details: err.sqlMessage || err.message });
  } finally {
    if (connection) connection.release();
  }
};

/*
================================
 UPDATE (TIDAK BERUBAH)
 Fungsi ini hanya menyimpan data mentah, tidak perlu
 logika laporan 5 tahun.
================================
*/
export const updateTabel3c1Kerjasama = async (req, res) => {
  let connection;
  const { id } = req.params;

  try {
    const {
      judul_kerjasama, mitra_kerja_sama, sumber, durasi_tahun, link_bukti,
      pendanaan
    } = req.body;

    if (!judul_kerjasama) { return res.status(400).json({ error: 'Judul Kerjasama wajib diisi.' }); }
    if (!mitra_kerja_sama) { return res.status(400).json({ error: 'Mitra Kerja Sama wajib diisi.' }); }
    if (!sumber) { return res.status(400).json({ error: 'Sumber (L/N/I) wajib diisi.' }); }
    if (!Array.isArray(pendanaan) || pendanaan.length === 0) {
      return res.status(400).json({ error: 'Data pendanaan (TS-4 s/d TS) wajib diisi.' });
    }

    // Auto-fill id_unit dari user yang login (konsisten dengan 3a1)
    // Fallback: jika id_unit tidak ada, coba gunakan id_unit_prodi
    let final_id_unit = req.user?.id_unit || req.user?.id_unit_prodi;
    if (!final_id_unit) {
      return res.status(400).json({ error: 'Unit kerja (LPPM/Kerjasama) tidak ditemukan dari data user.' });
    }

    const dataParent = {
      id_unit: final_id_unit, // Update dengan unit dari user yang login
      judul_kerjasama, mitra_kerja_sama, sumber, durasi_tahun, link_bukti
    };
    if (await hasColumn('tabel_3c1_kerjasama_penelitian', 'updated_by') && req.user?.id_user) {
      dataParent.updated_by = req.user.id_user;
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [resultParent] = await connection.query(
      'UPDATE tabel_3c1_kerjasama_penelitian SET ? WHERE id = ?',
      [dataParent, id]
    );
    if (resultParent.affectedRows === 0) {
      throw new Error('Data kerjasama tidak ditemukan atau tidak ada perubahan.');
    }

    // Hapus data pendanaan lama
    await connection.query('DELETE FROM tabel_3c1_pendanaan_kerjasama WHERE id_kerjasama = ?', [id]);

    // Masukkan data pendanaan baru
    for (const item of pendanaan) {
      if (item.id_tahun && item.jumlah_dana && item.jumlah_dana > 0) {
        await connection.query(
          'INSERT INTO tabel_3c1_pendanaan_kerjasama (id_kerjasama, id_tahun, jumlah_dana) VALUES (?, ?, ?)',
          [id, item.id_tahun, item.jumlah_dana]
        );
      }
    }

    await connection.commit();

    res.json({ message: 'Data kerjasama penelitian berhasil diperbarui' });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error updateTabel3c1Kerjasama:", err);
    if (err.message.includes('tidak ditemukan')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal memperbarui data kerjasama', details: err.sqlMessage || err.message });
  } finally {
    if (connection) connection.release();
  }
};

/*
================================
 SOFT DELETE
================================
*/
export const softDeleteTabel3c1Kerjasama = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_3c1_kerjasama_penelitian', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    const [result] = await pool.query(
      'UPDATE tabel_3c1_kerjasama_penelitian SET ? WHERE id = ?',
      [payload, req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteTabel3c1Kerjasama:", err);
    res.status(500).json({ error: 'Gagal menghapus data' });
  }
};

/*
================================
 RESTORE (konsisten dengan 3a1)
================================
*/
export const restoreTabel3c1Kerjasama = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }

    // Cek apakah kolom deleted_at ada
    const hasDeletedAt = await hasColumn('tabel_3c1_kerjasama_penelitian', 'deleted_at');
    if (!hasDeletedAt) {
      return res.status(400).json({ error: 'Restore tidak didukung. Tabel tidak memiliki kolom deleted_at.' });
    }

    // Cek apakah kolom deleted_by ada
    const hasDeletedBy = await hasColumn('tabel_3c1_kerjasama_penelitian', 'deleted_by');

    // Restore data
    if (hasDeletedBy) {
      const [result] = await pool.query(
        'UPDATE tabel_3c1_kerjasama_penelitian SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }

      res.json({ ok: true, restored: true, message: 'Data kerjasama penelitian berhasil dipulihkan' });
    } else {
      const [result] = await pool.query(
        'UPDATE tabel_3c1_kerjasama_penelitian SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }

      res.json({ ok: true, restored: true, message: 'Data kerjasama penelitian berhasil dipulihkan' });
    }
  } catch (err) {
    console.error("Error restoreTabel3c1Kerjasama:", err);
    res.status(500).json({ error: 'Gagal memulihkan data', message: err.message });
  }
};

/*
================================
 HARD DELETE (konsisten dengan 3a2 - transactional)
================================
*/
export const hardDeleteTabel3c1Kerjasama = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Hapus data Child (pendanaan)
    await connection.query('DELETE FROM tabel_3c1_pendanaan_kerjasama WHERE id_kerjasama = ?', [id]);

    // 2. Hapus data Parent
    const [parentResult] = await connection.query('DELETE FROM tabel_3c1_kerjasama_penelitian WHERE id = ?', [id]);
    if (parentResult.affectedRows === 0) {
      throw new Error('Data tidak ditemukan.');
    }

    await connection.commit();
    res.json({ message: 'Data berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error hardDeleteTabel3c1Kerjasama:", err);
    if (err.message.includes('tidak ditemukan')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal menghapus data secara permanen.', details: err.sqlMessage || err.message });
  } finally {
    if (connection) connection.release();
  }
};

/*
================================
 EXPORT EXCEL - [DIROMBAK]
================================
*/
export const exportTabel3c1Kerjasama = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tabel_3c1_kerjasama_penelitian', 'k');
    const orderBy = 'k.id ASC';

    // ==========================================================
    // [ROMBAKAN BESAR] Ambil ts_id dari query parameter
    // ==========================================================
    const { ts_id } = req.query;
    if (!ts_id) {
      return res.status(400).json({
        error: 'Query parameter ?ts_id=TAHUN (contoh: ?ts_id=2024) wajib diisi untuk export.'
      });
    }

    // Panggil helper BARU dengan ts_id yang dipilih
    const tahunIds = await getTahunAkademik(ts_id);
    // ==========================================================

    if (!tahunIds.id_ts) {
      return res.status(500).json({ error: `Gagal mengambil data 5 tahun akademik untuk TS=${ts_id}.` });
    }

    const sql = `SELECT 
            k.judul_kerjasama, k.mitra_kerja_sama, k.sumber, k.durasi_tahun,
            ${pivotPendanaanSQL(tahunIds, 'p', 't')},
            k.link_bukti
          FROM tabel_3c1_kerjasama_penelitian k
          LEFT JOIN unit_kerja uk ON k.id_unit = uk.id_unit
          LEFT JOIN tabel_3c1_pendanaan_kerjasama p ON k.id = p.id_kerjasama
          LEFT JOIN tahun_akademik t ON p.id_tahun = t.id_tahun
          WHERE ${where.length ? `${where.join(' AND ')} AND ` : ''} 
          k.id IN (SELECT id_kerjasama FROM tabel_3c1_pendanaan_kerjasama WHERE id_tahun IN (?, ?, ?, ?, ?))
          GROUP BY 
            k.id, k.id_unit, uk.nama_unit, k.judul_kerjasama, 
            k.mitra_kerja_sama, k.sumber, k.durasi_tahun, k.link_bukti, k.deleted_at
          ORDER BY ${orderBy}`;

    const finalParams = [...params, ...tahunIdsList];
    const [rows] = await pool.query(sql, finalParams);

    const tahun = tahunIds;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 3.C.1');

    sheet.mergeCells('F1:J1');
    sheet.getCell('F1').value = 'Pendanaan (Rp Juta)';
    sheet.getCell('F1').font = { bold: true };
    sheet.getCell('F1').alignment = { horizontal: 'center' };

    const headers = [
      { header: 'Judul Kerjasama', key: 'judul_kerjasama', width: 40 },
      { header: 'Mitra Kerja Sama', key: 'mitra_kerja_sama', width: 30 },
      { header: 'Sumber (L/N/I)', key: 'sumber', width: 15 },
      { header: 'Durasi (Tahun)', key: 'durasi_tahun', width: 15 },
      { header: 'Link Bukti', key: 'link_bukti', width: 30 },
      { header: `TS-4 (${tahun.nama_ts4 || 'N/A'})`, key: 'pendanaan_ts4', width: 20 },
      { header: `TS-3 (${tahun.nama_ts3 || 'N/A'})`, key: 'pendanaan_ts3', width: 20 },
      { header: `TS-2 (${tahun.nama_ts2 || 'N/A'})`, key: 'pendanaan_ts2', width: 20 },
      { header: `TS-1 (${tahun.nama_ts1 || 'N/A'})`, key: 'pendanaan_ts1', width: 20 },
      { header: `TS (${tahun.nama_ts || 'N/A'})`, key: 'pendanaan_ts', width: 20 },
    ];

    const linkBuktiHeader = headers.splice(4, 1)[0];
    headers.push(linkBuktiHeader);
    sheet.getRow(2).columns = headers;
    sheet.getRow(2).font = { bold: true };
    sheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    const dataRows = rows.map(row => ({
      ...row,
      pendanaan_ts4: row.pendanaan_ts4 / 1000000,
      pendanaan_ts3: row.pendanaan_ts3 / 1000000,
      pendanaan_ts2: row.pendanaan_ts2 / 1000000,
      pendanaan_ts1: row.pendanaan_ts1 / 1000000,
      pendanaan_ts: row.pendanaan_ts / 1000000,
    }));

    sheet.addRows(dataRows);

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 2) {
        row.alignment = { vertical: 'middle', wrapText: true };
        row.getCell('sumber').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('durasi_tahun').alignment = { vertical: 'middle', horizontal: 'center' };

        const pendanaanKeys = ['pendanaan_ts4', 'pendanaan_ts3', 'pendanaan_ts2', 'pendanaan_ts1', 'pendanaan_ts'];
        pendanaanKeys.forEach(key => {
          const cell = row.getCell(key);
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0';
        });
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Tabel_3C1_Kerjasama_Penelitian_5Tahun.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error exportTabel3c1Kerjasama:", err);
    // Tangkap error spesifik dari helper baru
    if (err.message.includes('ts_id tidak valid')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal mengekspor data kerjasama' });
  }
};