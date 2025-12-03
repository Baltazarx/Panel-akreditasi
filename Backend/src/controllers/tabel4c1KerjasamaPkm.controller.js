import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

// ==========================================================
// HELPER: pivotPendanaanSQL (Standar 5 Tahun)
// (Di-copy dari controller 3C1)
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
// HELPER: getTahunAkademik (Standar 5 Tahun)
// (Di-copy dari controller 3C1)
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
        id_ts:  id_ts,
        nama_ts4: tahunMap.get(id_ts4) || `${id_ts4}`,
        nama_ts3: tahunMap.get(id_ts3) || `${id_ts3}`,
        nama_ts2: tahunMap.get(id_ts2) || `${id_ts2}`,
        nama_ts1: tahunMap.get(id_ts1) || `${id_ts1}`,
        nama_ts:  tahunMap.get(id_ts)  || `${id_ts}`,
    };
};


/*
================================
 GET ALL (LIST) - [DINAMIS 5 TAHUN]
================================
*/
export const listTabel4c1KerjasamaPkm = async (req, res) => {
  try {
    // Special handling: Role LPPM bisa melihat semua data tanpa filter unit
    const userRole = req.user?.role?.toLowerCase();
    const isLppm = userRole === 'lppm';
    const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole);
    
    // Alias 'k' untuk tabel_4c1_kerjasama_pkm
    const { where, params } = await buildWhere(req, 'tabel_4c1_kerjasama_pkm', 'k');
    
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

    // 1. Ambil ts_id dari query parameter
    const { ts_id } = req.query;
    if (!ts_id) {
        return res.status(400).json({ 
            error: 'Query parameter ?ts_id=TAHUN (contoh: ?ts_id=2024) wajib diisi untuk melihat laporan.' 
        });
    }

    // 2. Panggil helper (5 tahun)
    const tahunIds = await getTahunAkademik(ts_id);
    
    if (!tahunIds.id_ts) { 
        return res.status(500).json({ error: `Gagal mengambil data 5 tahun akademik untuk TS=${ts_id}.` });
    }

    // 3. Buat SQL
    const sql = `SELECT
        k.id, k.id_unit, uk.nama_unit,
        k.judul_kerjasama, k.mitra_kerja_sama, k.sumber, k.durasi_tahun, k.link_bukti,
        k.deleted_at,
        ${pivotPendanaanSQL(tahunIds, 'p', 't')}
      FROM tabel_4c1_kerjasama_pkm k
      LEFT JOIN unit_kerja uk ON k.id_unit = uk.id_unit
      LEFT JOIN tabel_4c1_pendanaan_pkm p ON k.id = p.id_kerjasama_pkm
      LEFT JOIN tahun_akademik t ON p.id_tahun = t.id_tahun
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY 
        k.id, k.id_unit, uk.nama_unit, k.judul_kerjasama, 
        k.mitra_kerja_sama, k.sumber, k.durasi_tahun, k.link_bukti, k.deleted_at
      ORDER BY ${orderBy}`;

    const [rows] = await pool.query(sql, params);
    
    // Kirim juga info tahunnya ke frontend
    res.json({
        tahun_laporan: tahunIds,
        data: rows
    });

  } catch (err) {
    console.error("Error listTabel4c1KerjasamaPkm:", err);
    if (err.message.includes('ts_id tidak valid')) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal mengambil daftar kerjasama PkM', details: err.sqlMessage || err.message });
  }
};

/*
================================
 GET BY ID (Master-Detail)
================================
*/
export const getTabel4c1KerjasamaPkmById = async (req, res) => {
    try {
        // 1. Ambil data Induk (Kerjasama PkM)
        const [parentRows] = await pool.query(
            `SELECT k.*, uk.nama_unit
             FROM tabel_4c1_kerjasama_pkm k 
             LEFT JOIN unit_kerja uk ON k.id_unit = uk.id_unit 
             WHERE k.id = ? AND k.deleted_at IS NULL`, 
            [req.params.id]
        );

        if (!parentRows[0]) return res.status(404).json({ error: 'Data kerjasama PkM tidak ditemukan' });

        // 2. Ambil data Anak (Pendanaan)
        const [childRows] = await pool.query(
            `SELECT id_tahun, jumlah_dana 
             FROM tabel_4c1_pendanaan_pkm 
             WHERE id_kerjasama_pkm = ?`,
            [req.params.id]
        );

        // 3. Gabungkan
        const result = {
            ...parentRows[0],
            pendanaan: childRows
        };
        
        res.json(result);
    } catch (err) {
        console.error("Error getTabel4c1KerjasamaPkmById:", err);
        res.status(500).json({ error: 'Gagal mengambil detail data kerjasama PkM' });
    }
};

/*
================================
 CREATE (Master-Detail)
================================
*/
export const createTabel4c1KerjasamaPkm = async (req, res) => {
  let connection;
  try {
    // 1. Ambil data dari body
    const { 
      judul_kerjasama, mitra_kerja_sama, sumber, durasi_tahun, link_bukti,
      pendanaan // Ini harusnya array: [{id_tahun: 2024, jumlah_dana: 10000}, ...]
    } = req.body;

    // 2. Validasi Induk
    if (!judul_kerjasama || !mitra_kerja_sama || !sumber) { 
        return res.status(400).json({ error: 'Input tidak lengkap (judul_kerjasama, mitra_kerja_sama, sumber) wajib diisi.' }); 
    }
    // Validasi Anak
    if (!Array.isArray(pendanaan)) {
        return res.status(400).json({ error: 'Data pendanaan harus berupa array.' });
    }

    // 3. Auto-fill id_unit dari user yang login (konsisten dengan 3a1)
    // Fallback: jika id_unit tidak ada, coba gunakan id_unit_prodi
    let final_id_unit = req.user?.id_unit || req.user?.id_unit_prodi;
    if (!final_id_unit) { 
      return res.status(400).json({ error: 'Unit kerja (LPPM) tidak ditemukan dari data user.' }); 
    }

    // 4. Siapkan data Induk
    const dataParent = {
      id_unit: final_id_unit, // Otomatis dari user yang login
      judul_kerjasama, mitra_kerja_sama, sumber, durasi_tahun, link_bukti
    };
    if (await hasColumn('tabel_4c1_kerjasama_pkm', 'created_by') && req.user?.id_user) { 
      dataParent.created_by = req.user.id_user; 
    }

    // 5. Mulai Transaksi
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 6. Insert Induk
    const [resultParent] = await connection.query(
        'INSERT INTO tabel_4c1_kerjasama_pkm SET ?', 
        [dataParent]
    );
    const newKerjasamaPkmId = resultParent.insertId;

    // 7. Insert Anak (jika ada)
    for (const item of pendanaan) {
        if (item.id_tahun && item.jumlah_dana && item.jumlah_dana > 0) { 
            await connection.query(
                'INSERT INTO tabel_4c1_pendanaan_pkm (id_kerjasama_pkm, id_tahun, jumlah_dana) VALUES (?, ?, ?)',
                [newKerjasamaPkmId, item.id_tahun, item.jumlah_dana]
            );
        }
    }

    // 8. Commit Transaksi
    await connection.commit();
    
    res.status(201).json({ message: 'Data kerjasama PkM berhasil dibuat', id: newKerjasamaPkmId });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error createTabel4c1KerjasamaPkm:", err);
    res.status(500).json({ error: 'Gagal membuat data kerjasama PkM', details: err.sqlMessage || err.message });
  } finally {
    if (connection) connection.release();
  }
};

/*
================================
 UPDATE (Master-Detail)
================================
*/
export const updateTabel4c1KerjasamaPkm = async (req, res) => {
  let connection;
  const { id } = req.params;

  try {
    // 1. Ambil data dari body
    const { 
      judul_kerjasama, mitra_kerja_sama, sumber, durasi_tahun, link_bukti,
      pendanaan 
    } = req.body;

    // 2. Validasi Induk
    if (!judul_kerjasama || !mitra_kerja_sama || !sumber) { 
        return res.status(400).json({ error: 'Input tidak lengkap (judul_kerjasama, mitra_kerja_sama, sumber) wajib diisi.' }); 
    }
    // Validasi Anak
    if (!Array.isArray(pendanaan)) {
        return res.status(400).json({ error: 'Data pendanaan harus berupa array.' });
    }

    // 3. Auto-fill id_unit dari user yang login (konsisten dengan 3a1)
    // Fallback: jika id_unit tidak ada, coba gunakan id_unit_prodi
    let final_id_unit = req.user?.id_unit || req.user?.id_unit_prodi;
    if (!final_id_unit) { 
      return res.status(400).json({ error: 'Unit kerja (LPPM) tidak ditemukan dari data user.' }); 
    }

    // 4. Siapkan data Induk
    const dataParent = {
      id_unit: final_id_unit, // Update dengan unit dari user yang login
      judul_kerjasama, mitra_kerja_sama, sumber, durasi_tahun, link_bukti
    };
    if (await hasColumn('tabel_4c1_kerjasama_pkm', 'updated_by') && req.user?.id_user) { 
      dataParent.updated_by = req.user.id_user; 
    }

    // 5. Mulai Transaksi
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 6. Update Induk
    const [resultParent] = await connection.query(
        'UPDATE tabel_4c1_kerjasama_pkm SET ? WHERE id = ?', 
        [dataParent, id]
    );
    if (resultParent.affectedRows === 0) {
        throw new Error('Data kerjasama PkM tidak ditemukan atau tidak ada perubahan.');
    }

    // 7. Hapus data Anak (Pendanaan) lama
    await connection.query('DELETE FROM tabel_4c1_pendanaan_pkm WHERE id_kerjasama_pkm = ?', [id]);

    // 8. Masukkan data Anak (Pendanaan) baru
    for (const item of pendanaan) {
        if (item.id_tahun && item.jumlah_dana && item.jumlah_dana > 0) { 
            await connection.query(
                'INSERT INTO tabel_4c1_pendanaan_pkm (id_kerjasama_pkm, id_tahun, jumlah_dana) VALUES (?, ?, ?)',
                [id, item.id_tahun, item.jumlah_dana]
            );
        }
    }

    // 9. Commit Transaksi
    await connection.commit();
    
    res.json({ message: 'Data kerjasama PkM berhasil diperbarui' });

  } catch (err) {
    if (connection) await connection.rollback(); 
    console.error("Error updateTabel4c1KerjasamaPkm:", err);
    if (err.message.includes('tidak ditemukan')) {
        return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal memperbarui data kerjasama PkM', details: err.sqlMessage || err.message });
  } finally {
    if (connection) connection.release();
  }
};

/*
================================
 SOFT DELETE
================================
*/
export const softDeleteTabel4c1KerjasamaPkm = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_4c1_kerjasama_pkm', 'deleted_by')) { 
      payload.deleted_by = req.user?.id_user || null; 
    }
    const [result] = await pool.query(
      'UPDATE tabel_4c1_kerjasama_pkm SET ? WHERE id = ?', 
      [payload, req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data kerjasama PkM berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteTabel4c1KerjasamaPkm:", err);
    res.status(500).json({ error: 'Gagal menghapus data kerjasama PkM' });
  }
};

/*
================================
 RESTORE (konsisten dengan 3a1)
================================
*/
export const restoreTabel4c1KerjasamaPkm = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validasi ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }
    
    // Cek apakah kolom deleted_at ada
    const hasDeletedAt = await hasColumn('tabel_4c1_kerjasama_pkm', 'deleted_at');
    if (!hasDeletedAt) {
      return res.status(400).json({ error: 'Restore tidak didukung. Tabel tidak memiliki kolom deleted_at.' });
    }
    
    // Cek apakah kolom deleted_by ada
    const hasDeletedBy = await hasColumn('tabel_4c1_kerjasama_pkm', 'deleted_by');
    
    // Restore data
    if (hasDeletedBy) {
      const [result] = await pool.query(
        'UPDATE tabel_4c1_kerjasama_pkm SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }
      
      res.json({ ok: true, restored: true, message: 'Data kerjasama PkM berhasil dipulihkan' });
    } else {
      const [result] = await pool.query(
        'UPDATE tabel_4c1_kerjasama_pkm SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }
      
      res.json({ ok: true, restored: true, message: 'Data kerjasama PkM berhasil dipulihkan' });
    }
  } catch (err) {
    console.error("Error restoreTabel4c1KerjasamaPkm:", err);
    res.status(500).json({ error: 'Gagal memulihkan data', message: err.message });
  }
};

/*
================================
 HARD DELETE (Transactional - konsisten dengan 3a2)
================================
*/
export const hardDeleteTabel4c1KerjasamaPkm = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    
    // Mulai transaksi
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Hapus data anak (pendanaan) dulu
    await connection.query('DELETE FROM tabel_4c1_pendanaan_pkm WHERE id_kerjasama_pkm = ?', [id]);
    
    // Hapus data induk
    const [result] = await connection.query(
      'DELETE FROM tabel_4c1_kerjasama_pkm WHERE id = ?', 
      [id]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Data kerjasama PkM tidak ditemukan.' });
    }
    
    // Commit transaksi
    await connection.commit();
    res.json({ message: 'Data kerjasama PkM berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error hardDeleteTabel4c1KerjasamaPkm:", err);
    res.status(500).json({ error: 'Gagal menghapus data kerjasama PkM secara permanen.', details: err.message });
  } finally {
    if (connection) connection.release();
  }
};

/*
================================
 EXPORT EXCEL - [DINAMIS 5 TAHUN]
================================
*/
export const exportTabel4c1KerjasamaPkm = async (req, res) => {
    try {
        const { where, params } = await buildWhere(req, 'tabel_4c1_kerjasama_pkm', 'k');
        const orderBy = 'k.id ASC';

        // 1. Ambil ts_id
        const { ts_id } = req.query;
        if (!ts_id) {
            return res.status(400).json({ 
                error: 'Query parameter ?ts_id=TAHUN (contoh: ?ts_id=2024) wajib diisi untuk export.' 
            });
        }

        // 2. Panggil helper 5 tahun
        const tahunIds = await getTahunAkademik(ts_id);
        
        if (!tahunIds.id_ts) {
            return res.status(500).json({ error: `Gagal mengambil data 5 tahun akademik untuk TS=${ts_id}.` });
        }

        // 3. Buat SQL (Sama persis seperti list)
        const sql = `SELECT 
            k.judul_kerjasama, k.mitra_kerja_sama, k.sumber, k.durasi_tahun,
            ${pivotPendanaanSQL(tahunIds, 'p', 't')},
            k.link_bukti
          FROM tabel_4c1_kerjasama_pkm k
          LEFT JOIN unit_kerja uk ON k.id_unit = uk.id_unit
          LEFT JOIN tabel_4c1_pendanaan_pkm p ON k.id = p.id_kerjasama_pkm
          LEFT JOIN tahun_akademik t ON p.id_tahun = t.id_tahun
          ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
          GROUP BY 
            k.id, k.id_unit, uk.nama_unit, k.judul_kerjasama, 
            k.mitra_kerja_sama, k.sumber, k.durasi_tahun, k.link_bukti, k.deleted_at
          ORDER BY ${orderBy}`;
        
        const [rows] = await pool.query(sql, params);
        
        const tahun = tahunIds; 
        
        // 4. Buat Excel
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Tabel 4.C.1');

        // Header Gabungan (Merge) - [5 KOLOM]
        sheet.mergeCells('F1:J1'); // F, G, H, I, J
        sheet.getCell('F1').value = `Pendanaan (Rp Juta) (TS = ${tahun.nama_ts})`;
        sheet.getCell('F1').font = { bold: true };
        sheet.getCell('F1').alignment = { horizontal: 'center' };
        
        // Header Kolom - [5 TAHUN]
        const headers = [
            { header: 'Judul Kerjasama', key: 'judul_kerjasama', width: 40 },
            { header: 'Mitra Kerja Sama', key: 'mitra_kerja_sama', width: 30 },
            { header: 'Sumber (L/N/I)', key: 'sumber', width: 15 },
            { header: 'Durasi (Tahun)', key: 'durasi_tahun', width: 15 },
            { header: 'Link Bukti', key: 'link_bukti', width: 30 },
            // Header 5 Tahun
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

        // 5. Tambah Data
        const dataRows = rows.map(row => ({
            ...row,
            // Konversi ke Juta Rupiah
            pendanaan_ts4: row.pendanaan_ts4 / 1000000, 
            pendanaan_ts3: row.pendanaan_ts3 / 1000000, 
            pendanaan_ts2: row.pendanaan_ts2 / 1000000,
            pendanaan_ts1: row.pendanaan_ts1 / 1000000,
            pendanaan_ts: row.pendanaan_ts / 1000000,  
        }));

        sheet.addRows(dataRows);

        // 6. Styling Data - [5 TAHUN]
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 2) { 
                row.alignment = { vertical: 'middle', wrapText: true };
                row.getCell('sumber').alignment = { vertical: 'middle', horizontal: 'center' };
                row.getCell('durasi_tahun').alignment = { vertical: 'middle', horizontal: 'center' };
                
                const pendanaanKeys = ['pendanaan_ts4', 'pendanaan_ts3', 'pendanaan_ts2', 'pendanaan_ts1', 'pendanaan_ts'];
                pendanaanKeys.forEach(key => {
                    const cell = row.getCell(key);
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                    cell.numFmt = '#,##0.00'; 
                });
            }
        });

        // 7. Kirim file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Tabel_4C1_Kerjasama_PkM_5Tahun.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Error exportTabel4c1KerjasamaPkm:", err);
        if (err.message.includes('ts_id tidak valid')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Gagal mengekspor data kerjasama PkM', details: err.message });
    }
};