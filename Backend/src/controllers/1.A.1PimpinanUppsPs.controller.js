/*
============================================================
 FILE: pimpinanUppsPs.controller.js
 
 LOGIKA FINAL (FIXED):
 1. INPUT: HANYA 'id_pegawai', Periode, Tupoksi.
 2. CREATE: Backend otomatis mencari 'id_unit' milik pegawai tersebut,
    lalu menyimpannya ke tabel pimpinan (karena DB mewajibkan id_unit).
 3. OUTPUT: Auto-detect Jabatan Fungsional & Unit Kerja.
============================================================
*/

import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

// ===== LIST =====
export const listPimpinanUppsPs = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'pimpinan_upps_ps', 'p');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_pimpinan', 'p');

    const sql = `
      SELECT 
        p.id_pimpinan,
        p.id_pegawai,
        pg.nama_lengkap AS nama_ketua,
        DATE_FORMAT(p.periode_mulai, "%Y-%m-%d") AS periode_mulai,
        DATE_FORMAT(p.periode_selesai, "%Y-%m-%d") AS periode_selesai,
        pg.pendidikan_terakhir,
        
        -- [AUTO 1] Unit Kerja (Milik Pegawai)
        pg.id_unit,
        uk.nama_unit AS unit_kerja,

        -- [AUTO 2] Jabatan Struktural (Milik Pegawai)
        pg.id_jabatan,
        rjs.nama_jabatan AS jabatan_struktural,
        
        -- [AUTO 3] Jabatan Fungsional (Milik Dosen)
        rjf.nama_jafung AS jabatan_fungsional,
        
        p.tupoksi,
        p.deleted_at
      FROM pimpinan_upps_ps p
      
      -- 1. JOIN KE INDUK (PEGAWAI)
      LEFT JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
      
      -- 2. JOIN KE UNIT (via Pegawai)
      LEFT JOIN unit_kerja uk ON pg.id_unit = uk.id_unit
      
      -- 3. JOIN KE STRUKTURAL (via Pegawai)
      LEFT JOIN ref_jabatan_struktural rjs ON pg.id_jabatan = rjs.id_jabatan
      
      -- 4. JOIN KE FUNGSIONAL (via Pegawai -> Dosen)
      LEFT JOIN dosen d ON pg.id_pegawai = d.id_pegawai
      LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
      
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listPimpinanUppsPs:", err);
    res.status(500).json({ error: 'List failed', details: err.message });
  }
};

// ===== GET BY ID =====
export const getPimpinanUppsPsById = async (req, res) => {
  try {
    const sql = `
        SELECT 
            p.*,
            pg.nama_lengkap AS nama_ketua,
            
            -- Info tambahan untuk tampilan detail (Read Only)
            uk.nama_unit AS unit_kerja_display,
            rjs.nama_jabatan AS jabatan_struktural_display,
            rjf.nama_jafung AS jabatan_fungsional_display
            
        FROM pimpinan_upps_ps p
        LEFT JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
        
        -- Relasi via Pegawai
        LEFT JOIN unit_kerja uk ON pg.id_unit = uk.id_unit
        LEFT JOIN ref_jabatan_struktural rjs ON pg.id_jabatan = rjs.id_jabatan
        
        -- Relasi via Dosen
        LEFT JOIN dosen d ON pg.id_pegawai = d.id_pegawai
        LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
        
        WHERE p.id_pimpinan=?
    `;
    
    const [rows] = await pool.query(sql, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getPimpinanUppsPsById:", err);
    res.status(500).json({ error: 'Get failed', details: err.message });
  }
};

// ===== CREATE (FIXED) =====
export const createPimpinanUppsPs = async (req, res) => {
  try {
    const { id_pegawai, periode_mulai, periode_selesai, tupoksi } = req.body;

    // 1. Validasi
    if (!id_pegawai) return res.status(400).json({ error: 'Pegawai wajib dipilih.' });

    // 2. [FIX] Ambil id_unit dari tabel Pegawai dulu!
    //    Karena tabel pimpinan_upps_ps mewajibkan kolom id_unit terisi.
    const [pegawaiRows] = await pool.query(
      `SELECT id_unit FROM pegawai WHERE id_pegawai = ?`, 
      [id_pegawai]
    );

    if (!pegawaiRows.length) return res.status(404).json({ error: 'Pegawai tidak ditemukan.' });
    
    const idUnitPegawai = pegawaiRows[0].id_unit;

    // Validasi: Pastikan Pegawai sudah punya Unit Kerja
    if (!idUnitPegawai) {
        return res.status(400).json({ 
            error: 'Pegawai ini belum memiliki Unit Kerja. Silakan atur Unit Kerja di menu "Data Pegawai" terlebih dahulu.' 
        });
    }

    // 3. Siapkan Data Insert
    const data = {
      id_unit: idUnitPegawai, // <-- Ini kuncinya! Kita masukkan unit yang didapat dari pegawai.
      id_pegawai: id_pegawai,
      periode_mulai: periode_mulai,
      periode_selesai: periode_selesai,
      tupoksi: tupoksi
    };

    if (await hasColumn('pimpinan_upps_ps', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }
    
    // 4. Eksekusi Insert
    const [r] = await pool.query(`INSERT INTO pimpinan_upps_ps SET ?`, [data]);
    
    // 5. Return Data Lengkap
    const [row] = await pool.query(
      `SELECT 
         p.*, 
         uk.nama_unit AS unit_kerja, 
         rjs.nama_jabatan AS jabatan_struktural, 
         rjf.nama_jafung AS jabatan_fungsional 
       FROM pimpinan_upps_ps p
       LEFT JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
       LEFT JOIN unit_kerja uk ON pg.id_unit = uk.id_unit
       LEFT JOIN ref_jabatan_struktural rjs ON pg.id_jabatan = rjs.id_jabatan
       LEFT JOIN dosen d ON pg.id_pegawai = d.id_pegawai
       LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
       WHERE p.id_pimpinan=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createPimpinanUppsPs:", err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
};

// ===== UPDATE (FIXED) =====
export const updatePimpinanUppsPs = async (req, res) => {
  try {
    const { id_pegawai, periode_mulai, periode_selesai, tupoksi } = req.body;

    // [FIX] Ambil id_unit terbaru dari Pegawai (jika id_pegawai berubah)
    // Agar data di tabel pimpinan tetap sinkron
    let idUnitPegawai = null;
    if (id_pegawai) {
        const [pegawaiRows] = await pool.query(
            `SELECT id_unit FROM pegawai WHERE id_pegawai = ?`, 
            [id_pegawai]
        );
        if (pegawaiRows.length) {
            idUnitPegawai = pegawaiRows[0].id_unit;
        }
    }

    const data = {
      id_pegawai,
      periode_mulai,
      periode_selesai,
      tupoksi
    };
    
    // Jika unit ditemukan, update juga unitnya di tabel pimpinan
    if (idUnitPegawai) {
        data.id_unit = idUnitPegawai;
    }

    if (await hasColumn('pimpinan_upps_ps', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }
    
    await pool.query(
      `UPDATE pimpinan_upps_ps SET ? WHERE id_pimpinan=?`,
      [data, req.params.id]
    );
    
    const [row] = await pool.query(
      `SELECT * FROM pimpinan_upps_ps WHERE id_pimpinan=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updatePimpinanUppsPs:", err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

// ... (Fungsi SoftDelete, Restore, HardDelete tetap sama)
export const softDeletePimpinanUppsPs = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('pimpinan_upps_ps', 'deleted_by')) payload.deleted_by = req.user?.id_user || null;
    await pool.query(`UPDATE pimpinan_upps_ps SET ? WHERE id_pimpinan=?`, [payload, req.params.id]);
    res.json({ ok: true, softDeleted: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Delete failed' }); }
};

export const restorePimpinanUppsPs = async (req, res) => {
  try {
    await pool.query(`UPDATE pimpinan_upps_ps SET deleted_at=NULL, deleted_by=NULL WHERE id_pimpinan=?`, [req.params.id]);
    res.json({ ok: true, restored: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Restore failed' }); }
};

export const hardDeletePimpinanUppsPs = async (req, res) => {
  try {
    await pool.query(`DELETE FROM pimpinan_upps_ps WHERE id_pimpinan=?`, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Hard delete failed' }); }
};

// ==========================================================
// EXPORT EXCEL (Tetap Sama - Sudah Benar)
// ==========================================================
export const exportPimpinanUppsPs = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'pimpinan_upps_ps', 'p');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_pimpinan', 'p');

    const sql = `
      SELECT 
        -- [AUTO] Unit dari Pegawai
        uk.nama_unit AS unit_kerja,
        
        pg.nama_lengkap AS nama_ketua,
        DATE_FORMAT(p.periode_mulai, "%Y-%m-%d") AS periode_mulai,
        DATE_FORMAT(p.periode_selesai, "%Y-%m-%d") AS periode_selesai,
        pg.pendidikan_terakhir,
        
        -- [AUTO] Fungsional dari Dosen
        rjf.nama_jafung AS jabatan_fungsional,
        
        p.tupoksi
      FROM pimpinan_upps_ps p
      LEFT JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
      
      -- Join Relasi via Pegawai
      LEFT JOIN unit_kerja uk ON pg.id_unit = uk.id_unit
      
      -- Join Relasi via Dosen
      LEFT JOIN dosen d ON pg.id_pegawai = d.id_pegawai
      LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
      
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;
    
    const [rows] = await pool.query(sql, params);
        
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 1.A.1 Pimpinan');
    
    const headers = [
        { header: 'Unit Kerja', key: 'unit_kerja', width: 30 },
        { header: 'Nama Ketua', key: 'nama_ketua', width: 35 },
        { header: 'Periode Jabatan (Mulai)', key: 'periode_mulai', width: 20 },
        { header: 'Periode Jabatan (Selesai)', key: 'periode_selesai', width: 20 },
        { header: 'Pendidikan Terakhir', key: 'pendidikan_terakhir', width: 20 },
        { header: 'Jabatan Fungsional', key: 'jabatan_fungsional', width: 25 }, 
        { header: 'Tugas Pokok dan Fungsi', key: 'tupoksi', width: 40 },
    ];
    
    sheet.getRow(1).columns = headers;
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    sheet.addRows(rows);

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) { 
            row.alignment = { vertical: 'middle', wrapText: true };
        }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Tabel_1A1_Pimpinan_UPPS_PS.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error exportPimpinanUppsPs:", err);
    res.status(500).json({ error: 'Gagal mengekspor data Pimpinan', details: err.message });
  }
};