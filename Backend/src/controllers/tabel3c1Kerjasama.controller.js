/*
============================================================
 FILE: tabel3c1Kerjasama.controller.js
 (VERSI REVISI 13: Perbaikan newline di helper pivotPendanaanSQL)
 
 [PERBAIKAN GEMINI]: Semua indentasi aneh (non-breaking space) 
 di dalam template literal SQL ( `` ) telah dihapus 
 dan diganti dengan spasi standar untuk memperbaiki ER_PARSE_ERROR.
============================================================
*/

import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

// ==========================================================
// REVISI 13: Menghapus newline di awal string helper
// [PERBAIKAN GEMINI]: Indentasi diketik ulang
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
`; // <-- String helper selesai di sini


// Helper getTahunAkademik (dari Revisi 10, sudah benar)
// [PERBAIKAN GEMINI]: Indentasi SQL diketik ulang
const getTahunAkademik = async (connection) => {
    const [rows] = await (connection || pool).query(
      `(SELECT id_tahun, tahun 
        FROM tahun_akademik 
        WHERE id_tahun < 2050
        ORDER BY id_tahun DESC 
        LIMIT 5)
        ORDER BY id_tahun ASC`
    );

    if (rows.length < 5) {
        console.error("DEBUG: Data tahun akademik (valid) di database kurang dari 5 baris.");
        return {}; 
    }

    return {
        id_ts4: rows[0]?.id_tahun, // Tahun terlama (TS-4)
        id_ts3: rows[1]?.id_tahun,
        id_ts2: rows[2]?.id_tahun,
        id_ts1: rows[3]?.id_tahun,
        id_ts:  rows[4]?.id_tahun, // Tahun terbaru (TS)
        nama_ts4: rows[0]?.tahun,
        nama_ts3: rows[1]?.tahun,
        nama_ts2: rows[2]?.tahun,
        nama_ts1: rows[3]?.tahun,
        nama_ts:  rows[4]?.tahun,
    };
};


/*
================================
 GET ALL (LIST)
================================
*/
// [PERBAIKAN GEMINI]: Indentasi SQL diketik ulang
export const listTabel3c1Kerjasama = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tabel_3c1_kerjasama_penelitian', 'k');
    const customOrder = req.query?.order_by;
    const orderBy = customOrder 
      ? buildOrderBy(customOrder, 'id', 'k')
      : 'k.id ASC';

    const tahunIds = await getTahunAkademik();

    if (!tahunIds.id_ts) { 
        return res.status(500).json({ error: 'Gagal mengambil data tahun akademik. Pastikan tabel tahun_akademik terisi (minimal 5 tahun valid).' });
    }

    const sql = `SELECT
        k.id, k.id_unit, uk.nama_unit,
        k.judul_kerjasama, k.mitra_kerja_sama, k.sumber, k.durasi_tahun, k.link_bukti,
        k.deleted_at,
        ${pivotPendanaanSQL(tahunIds, 'p', 't')}
      FROM tabel_3c1_kerjasama_penelitian k
      LEFT JOIN unit_kerja uk ON k.id_unit = uk.id_unit
      LEFT JOIN tabel_3c1_pendanaan_kerjasama p ON k.id = p.id_kerjasama
      LEFT JOIN tahun_akademik t ON p.id_tahun = t.id_tahun
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY 
        k.id, k.id_unit, uk.nama_unit, k.judul_kerjasama, 
        k.mitra_kerja_sama, k.sumber, k.durasi_tahun, k.link_bukti, k.deleted_at
      ORDER BY ${orderBy}`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);

  } catch (err) {
    console.error("Error listTabel3c1Kerjasama:", err);
    res.status(500).json({ error: 'Gagal mengambil daftar kerjasama penelitian', details: err.sqlMessage || err.message });
  }
};

/*
================================
 GET BY ID
================================
*/
// [PERBAIKAN GEMINI]: Indentasi SQL diketik ulang
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
 CREATE
================================
*/
// [PERBAIKAN GEMINI]: Indentasi SQL diketik ulang
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

    const id_unit = req.user?.id_unit;
    if (!id_unit) { 
      return res.status(400).json({ error: 'Unit kerja (LPPM/Kerjasama) tidak ditemukan dari data user.' }); 
    }

    const dataParent = {
      id_unit: id_unit, 
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
        if (item.id_tahun && item.jumlah_dana > 0) { 
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
 UPDATE
================================
*/
// [PERBAIKAN GEMINI]: Indentasi SQL diketik ulang
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

    const id_unit = req.user?.id_unit;
    if (!id_unit) { 
      return res.status(400).json({ error: 'Unit kerja (LPPM/Kerjasama) tidak ditemukan dari data user.' }); 
    }

    const dataParent = {
      id_unit: id_unit, 
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

    await connection.query('DELETE FROM tabel_3c1_pendanaan_kerjasama WHERE id_kerjasama = ?', [id]);

    for (const item of pendanaan) {
        if (item.id_tahun && item.jumlah_dana > 0) { 
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
// [PERBAIKAN GEMINI]: Indentasi SQL diketik ulang
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
 HARD DELETE
================================
*/
// [PERBAIKAN GEMINI]: Indentasi SQL diketik ulang
export const hardDeleteTabel3c1Kerjasama = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tabel_3c1_kerjasama_penelitian WHERE id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    console.error("Error hardDeleteTabel3c1Kerjasama:", err);
    res.status(500).json({ error: 'Gagal menghapus data secara permanen.' });
  }
};

/*
================================
 EXPORT EXCEL
================================
*/
// [PERBAIKAN GEMINI]: Indentasi SQL diketik ulang
export const exportTabel3c1Kerjasama = async (req, res) => {
    try {
        const { where, params } = await buildWhere(req, 'tabel_3c1_kerjasama_penelitian', 'k');
        const orderBy = 'k.id ASC';

        const tahunIds = await getTahunAkademik();
        if (!tahunIds.id_ts) {
            return res.status(500).json({ error: 'Gagal mengambil data tahun akademik. Pastikan tabel tahun_akademik terisi (minimal 5 tahun valid).' });
        }

        const sql = `SELECT 
            k.judul_kerjasama, k.mitra_kerja_sama, k.sumber, k.durasi_tahun,
            ${pivotPendanaanSQL(tahunIds, 'p', 't')},
            k.link_bukti
          FROM tabel_3c1_kerjasama_penelitian k
          LEFT JOIN unit_kerja uk ON k.id_unit = uk.id_unit
          LEFT JOIN tabel_3c1_pendanaan_kerjasama p ON k.id = p.id_kerjasama
          LEFT JOIN tahun_akademik t ON p.id_tahun = t.id_tahun
          ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
          GROUP BY 
            k.id, k.id_unit, uk.nama_unit, k.judul_kerjasama, 
            k.mitra_kerja_sama, k.sumber, k.durasi_tahun, k.link_bukti, k.deleted_at
          ORDER BY ${orderBy}`;
        
        const [rows] = await pool.query(sql, params);
        
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
                    cell.numFmt = '#,##0.00'; 
                });
            }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Tabel_3C1_Kerjasama_Penelitian_5Tahun.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Error exportTabel3c1Kerjasama:", err);
        res.status(500).json({ error: 'Gagal mengekspor data kerjasama' });
    }
};