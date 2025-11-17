import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

// ===== CRUD =====
export const listPimpinanUppsPs = async (req, res) => {
  try {
    // alias di sini pakai "p"
    const { where, params } = await buildWhere(req, 'pimpinan_upps_ps', 'p');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_pimpinan', 'p');

    // [LOGIKA JOIN CERDAS]
    // Kita join ke pegawai -> lalu join ke dosen (LEFT JOIN)
    // Jika dia dosen, data jafung akan muncul. Jika bukan, NULL.
    const sql = `
      SELECT 
        p.id_pimpinan,
        p.id_unit,
        uk.nama_unit AS unit_kerja,
        p.id_pegawai,
        pg.nama_lengkap AS nama_ketua,
        DATE_FORMAT(p.periode_mulai, "%Y-%m-%d") AS periode_mulai,
        DATE_FORMAT(p.periode_selesai, "%Y-%m-%d") AS periode_selesai,
        pg.pendidikan_terakhir,
        
        -- [INFO STRUKTURAL] Tetap diambil karena tersimpan di tabel ini
        p.id_jabatan,
        rjs.nama_jabatan AS jabatan_struktural,
        
        -- [INFO FUNGSIONAL - AUTO DETECT]
        -- Diambil otomatis dari relasi: Pegawai -> Dosen -> Ref Jafung
        rjf.nama_jafung AS jabatan_fungsional,
        
        p.tupoksi,
        p.deleted_at
      FROM pimpinan_upps_ps p
      LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      
      -- 1. Ambil Data Pegawai
      LEFT JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
      
      -- 2. Ambil Data Jabatan Struktural (Yang diinput user)
      LEFT JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
      
      -- 3. JOIN CERDAS: Cek apakah pegawai ini Dosen?
      LEFT JOIN dosen d ON pg.id_pegawai = d.id_pegawai
      
      -- 4. Jika Dosen, ambil nama Jabatan Fungsional-nya
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

export const getPimpinanUppsPsById = async (req, res) => {
  try {
    // Kita perlu join juga di sini agar saat Edit, frontend tau jabatannya (read-only)
    const sql = `
        SELECT 
            p.*,
            pg.nama_lengkap AS nama_ketua,
            rjf.nama_jafung AS jabatan_fungsional_display
        FROM pimpinan_upps_ps p
        LEFT JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
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

export const createPimpinanUppsPs = async (req, res) => {
  try {
    // [FIX] Kita HANYA simpan id_pegawai & id_jabatan (Struktural). 
    // Jafung tidak disimpan disini karena itu milik tabel dosen.
    const data = {
      id_unit: req.body.id_unit,
      id_pegawai: req.body.id_pegawai,
      id_jabatan: req.body.id_jabatan, // Struktural
      periode_mulai: req.body.periode_mulai,
      periode_selesai: req.body.periode_selesai,
      tupoksi: req.body.tupoksi
    };

    if (await hasColumn('pimpinan_upps_ps', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }
    
    const [r] = await pool.query(`INSERT INTO pimpinan_upps_ps SET ?`, [data]);
    
    // Kembalikan data lengkap (termasuk jafung otomatis) untuk frontend
    const [row] = await pool.query(
      `SELECT p.*, rjf.nama_jafung AS jabatan_fungsional 
       FROM pimpinan_upps_ps p
       LEFT JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
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

export const updatePimpinanUppsPs = async (req, res) => {
  try {
    const data = {
      id_unit: req.body.id_unit,
      id_pegawai: req.body.id_pegawai,
      id_jabatan: req.body.id_jabatan, // Update Struktural
      periode_mulai: req.body.periode_mulai,
      periode_selesai: req.body.periode_selesai,
      tupoksi: req.body.tupoksi
    };

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

export const softDeletePimpinanUppsPs = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('pimpinan_upps_ps', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE pimpinan_upps_ps SET ? WHERE id_pimpinan=?`,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("Error softDeletePimpinanUppsPs:", err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
};

export const restorePimpinanUppsPs = async (req, res) => {
  try {
    await pool.query(
      `UPDATE pimpinan_upps_ps SET deleted_at=NULL, deleted_by=NULL WHERE id_pimpinan=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restorePimpinanUppsPs:", err);
    res.status(500).json({ error: 'Restore failed', details: err.message });
  }
};

export const hardDeletePimpinanUppsPs = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM pimpinan_upps_ps WHERE id_pimpinan=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error("Error hardDeletePimpinanUppsPs:", err);
    res.status(500).json({ error: 'Hard delete failed', details: err.message });
  }
};

// ==========================================================
// EXPORT EXCEL
// ==========================================================
export const exportPimpinanUppsPs = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'pimpinan_upps_ps', 'p');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_pimpinan', 'p');

    // SQL Export yang sama dengan List (Auto-Detect Jafung)
    const sql = `
      SELECT 
        uk.nama_unit AS unit_kerja,
        pg.nama_lengkap AS nama_ketua,
        DATE_FORMAT(p.periode_mulai, "%Y-%m-%d") AS periode_mulai,
        DATE_FORMAT(p.periode_selesai, "%Y-%m-%d") AS periode_selesai,
        pg.pendidikan_terakhir,
        
        -- [AUTO DETECT] Ambil Nama Jabatan Fungsional 
        -- dari relasi Pegawai -> Dosen -> Jafung
        rjf.nama_jafung AS jabatan_fungsional,
        
        p.tupoksi
      FROM pimpinan_upps_ps p
      LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      LEFT JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
      
      -- JOIN BERLAPIS UNTUK MENDAPATKAN JAFUNG OTOMATIS
      LEFT JOIN dosen d ON pg.id_pegawai = d.id_pegawai
      LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
      
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;
    
    const [rows] = await pool.query(sql, params);
        
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 1.A.1 Pimpinan');
    
    // Header sesuai Borang 1.A.1
    const headers = [
        { header: 'Unit Kerja', key: 'unit_kerja', width: 30 },
        { header: 'Nama Ketua', key: 'nama_ketua', width: 35 },
        { header: 'Periode Jabatan (Mulai)', key: 'periode_mulai', width: 20 },
        { header: 'Periode Jabatan (Selesai)', key: 'periode_selesai', width: 20 },
        { header: 'Pendidikan Terakhir', key: 'pendidikan_terakhir', width: 20 },
        
        // Kolom ini akan otomatis terisi jika dia dosen, dan kosong jika bukan
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