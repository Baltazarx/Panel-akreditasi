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
    id_ts: id_ts,
    nama_ts4: tahunMap.get(id_ts4) || `${id_ts4}`,
    nama_ts3: tahunMap.get(id_ts3) || `${id_ts3}`,
    nama_ts2: tahunMap.get(id_ts2) || `${id_ts2}`,
    nama_ts1: tahunMap.get(id_ts1) || `${id_ts1}`,
    nama_ts: tahunMap.get(id_ts) || `${id_ts}`,
  };
};


/*
================================
 GET ALL (LIST) - [DINAMIS 5 TAHUN]
================================
*/
export const listTabel4a2Pkm = async (req, res) => {
  try {
    // Special handling: Role LPPM bisa melihat semua data tanpa filter unit
    const userRole = req.user?.role?.toLowerCase();
    const isLppm = userRole === 'lppm';
    const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm', 'ketua'].includes(userRole);

    // Alias 'pkm' untuk tabel_4a2_pkm
    const { where, params } = await buildWhere(req, 'tabel_4a2_pkm', 'pkm');

    // Hapus filter id_unit untuk role LPPM (bisa lihat semua data)
    if (isLppm && !isSuperAdmin) {
      const unitFilterPattern = /pkm\.id_unit\s*=\s*\?/i;
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
      ? buildOrderBy(customOrder, 'id', 'pkm')
      : 'pg.nama_lengkap ASC'; // Order by nama dosen

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

    // 3. Tambahkan Filter Masal: Hanya tampilkan PkM yang memiliki pendanaan dalam rentang TS s.d TS-4
    const tahunFilterIds = [tahunIds.id_ts, tahunIds.id_ts1, tahunIds.id_ts2, tahunIds.id_ts3, tahunIds.id_ts4];
    where.push(`EXISTS (
      SELECT 1 FROM tabel_4a2_pendanaan_pkm p2 
      WHERE p2.id_pkm = pkm.id 
      AND p2.id_tahun IN (?, ?, ?, ?, ?)
    )`);
    params.push(...tahunFilterIds);

    // 4. Buat SQL
    const sql = `
      SELECT
        pkm.id, pkm.id_unit, uk.nama_unit,
        
        -- Kolom Induk 4A2
        pkm.link_roadmap,
        pkm.id_dosen_ketua,
        pg.nama_lengkap AS nama_dtpr,
        pkm.judul_pkm,
        pkm.jml_mhs_terlibat,
        pkm.jenis_hibah_pkm,
        pkm.sumber_dana,
        pkm.durasi_tahun,
        pkm.link_bukti,
        pkm.deleted_at,
        
        -- Kolom Anak 4A2 (Pivot 5 Tahun)
        ${pivotPendanaanSQL(tahunIds, 'p', 't')}
        
      FROM tabel_4a2_pkm pkm
      
      -- JOIN untuk data pendanaan (anak)
      LEFT JOIN tabel_4a2_pendanaan_pkm p ON pkm.id = p.id_pkm
      LEFT JOIN tahun_akademik t ON p.id_tahun = t.id_tahun
      
      -- JOIN untuk data unit & dosen
      LEFT JOIN unit_kerja uk ON pkm.id_unit = uk.id_unit
      LEFT JOIN dosen d ON pkm.id_dosen_ketua = d.id_dosen
      LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
      
      -- WHERE
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      
      -- GROUP BY (Harus lengkap)
      GROUP BY 
        pkm.id, pkm.id_unit, uk.nama_unit,
        pkm.link_roadmap,
        pkm.id_dosen_ketua,
        pg.nama_lengkap,
        pkm.judul_pkm,
        pkm.jml_mhs_terlibat,
        pkm.jenis_hibah_pkm,
        pkm.sumber_dana,
        pkm.durasi_tahun,
        pkm.link_bukti,
        pkm.deleted_at
        
      -- ORDER
      ORDER BY ${orderBy}`;

    const [rows] = await pool.query(sql, params);

    // Kirim juga info tahunnya ke frontend
    res.json({
      tahun_laporan: tahunIds,
      data: rows
    });

  } catch (err) {
    console.error("Error listTabel4a2Pkm:", err);
    if (err.message.includes('ts_id tidak valid')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal mengambil daftar PkM', details: err.sqlMessage || err.message });
  }
};

/*
================================
 GET BY ID (Master-Detail)
================================
*/
export const getTabel4a2PkmById = async (req, res) => {
  try {
    // 1. Ambil data Induk (PkM)
    const [parentRows] = await pool.query(
      `SELECT 
               pkm.*, 
               uk.nama_unit,
               pg.nama_lengkap AS nama_dtpr
             FROM tabel_4a2_pkm pkm
             LEFT JOIN unit_kerja uk ON pkm.id_unit = uk.id_unit 
             LEFT JOIN dosen d ON pkm.id_dosen_ketua = d.id_dosen
             LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
             WHERE pkm.id = ? AND pkm.deleted_at IS NULL`,
      [req.params.id]
    );

    if (!parentRows[0]) return res.status(404).json({ error: 'Data PkM tidak ditemukan' });

    // 2. Ambil data Anak (Pendanaan)
    const [childRows] = await pool.query(
      `SELECT id_tahun, jumlah_dana 
             FROM tabel_4a2_pendanaan_pkm 
             WHERE id_pkm = ?`,
      [req.params.id]
    );

    // 3. Gabungkan
    const result = {
      ...parentRows[0],
      pendanaan: childRows
    };

    res.json(result);
  } catch (err) {
    console.error("Error getTabel4a2PkmById:", err);
    res.status(500).json({ error: 'Gagal mengambil detail data PkM' });
  }
};

/*
================================
 CREATE (Master-Detail)
================================
*/
export const createTabel4a2Pkm = async (req, res) => {
  let connection;
  try {
    // 1. Ambil data dari body
    const {
      // Kolom Induk
      link_roadmap,
      id_dosen_ketua,
      judul_pkm,
      jml_mhs_terlibat,
      jenis_hibah_pkm,
      sumber_dana,
      durasi_tahun,
      link_bukti,

      // Kolom Anak
      pendanaan // Ini harusnya array: [{id_tahun: 2024, jumlah_dana: 10000}, ...]
    } = req.body;

    // 2. Validasi Induk
    if (!id_dosen_ketua || !judul_pkm || !sumber_dana) {
      return res.status(400).json({ error: 'Input tidak lengkap (id_dosen_ketua, judul_pkm, sumber_dana) wajib diisi.' });
    }
    // Validasi Anak
    if (!Array.isArray(pendanaan)) { // Boleh kosong, tapi harus array
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
      link_roadmap,
      id_dosen_ketua,
      judul_pkm,
      jml_mhs_terlibat,
      jenis_hibah_pkm,
      sumber_dana,
      durasi_tahun,
      link_bukti
    };
    if (await hasColumn('tabel_4a2_pkm', 'created_by') && req.user?.id_user) {
      dataParent.created_by = req.user.id_user;
    }

    // 5. Mulai Transaksi
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 6. Insert Induk
    const [resultParent] = await connection.query(
      'INSERT INTO tabel_4a2_pkm SET ?',
      [dataParent]
    );
    const newPkmId = resultParent.insertId;

    // 7. Insert Anak (jika ada)
    for (const item of pendanaan) {
      // Simpan hanya jika ada dana (atau > 0)
      if (item.id_tahun && item.jumlah_dana && item.jumlah_dana > 0) {
        await connection.query(
          'INSERT INTO tabel_4a2_pendanaan_pkm (id_pkm, id_tahun, jumlah_dana) VALUES (?, ?, ?)',
          [newPkmId, item.id_tahun, item.jumlah_dana]
        );
      }
    }

    // 8. Commit Transaksi
    await connection.commit();

    res.status(201).json({ message: 'Data PkM berhasil dibuat', id: newPkmId });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error createTabel4a2Pkm:", err);
    res.status(500).json({ error: 'Gagal membuat data PkM', details: err.sqlMessage || err.message });
  } finally {
    if (connection) connection.release();
  }
};

/*
================================
 UPDATE (Master-Detail)
================================
*/
export const updateTabel4a2Pkm = async (req, res) => {
  let connection;
  const { id } = req.params;

  try {
    // 1. Ambil data dari body
    const {
      // Kolom Induk
      link_roadmap,
      id_dosen_ketua,
      judul_pkm,
      jml_mhs_terlibat,
      jenis_hibah_pkm,
      sumber_dana,
      durasi_tahun,
      link_bukti,

      // Kolom Anak
      pendanaan // Ini harusnya array: [{id_tahun: 2024, jumlah_dana: 10000}, ...]
    } = req.body;

    // 2. Validasi Induk
    if (!id_dosen_ketua || !judul_pkm || !sumber_dana) {
      return res.status(400).json({ error: 'Input tidak lengkap (id_dosen_ketua, judul_pkm, sumber_dana) wajib diisi.' });
    }
    // Validasi Anak
    if (!Array.isArray(pendanaan)) {
      return res.status(400).json({ error: 'Data pendanaan harus berupa array.' });
    }

    // 3. Ambil data User
    const id_unit = req.user?.id_unit;
    if (!id_unit) {
      return res.status(400).json({ error: 'Unit kerja (LPPM) tidak ditemukan dari data user.' });
    }

    // 4. Siapkan data Induk (Eksklusikan link_roadmap karena sudah global)
    const dataParent = {
      id_unit: id_unit,
      id_dosen_ketua,
      judul_pkm,
      jml_mhs_terlibat,
      jenis_hibah_pkm,
      sumber_dana,
      durasi_tahun,
      link_bukti
    };
    if (await hasColumn('tabel_4a2_pkm', 'updated_by') && req.user?.id_user) {
      dataParent.updated_by = req.user.id_user;
    }

    // 5. Mulai Transaksi
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 6. Update Induk
    const [resultParent] = await connection.query(
      'UPDATE tabel_4a2_pkm SET ? WHERE id = ?',
      [dataParent, id]
    );
    if (resultParent.affectedRows === 0) {
      throw new Error('Data PkM tidak ditemukan atau tidak ada perubahan.');
    }

    // 7. Hapus data Anak (Pendanaan) lama
    await connection.query('DELETE FROM tabel_4a2_pendanaan_pkm WHERE id_pkm = ?', [id]);

    // 8. Masukkan data Anak (Pendanaan) baru
    for (const item of pendanaan) {
      if (item.id_tahun && item.jumlah_dana && item.jumlah_dana > 0) {
        await connection.query(
          'INSERT INTO tabel_4a2_pendanaan_pkm (id_pkm, id_tahun, jumlah_dana) VALUES (?, ?, ?)',
          [id, item.id_tahun, item.jumlah_dana]
        );
      }
    }

    // 9. Commit Transaksi
    await connection.commit();

    res.json({ message: 'Data PkM berhasil diperbarui' });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error updateTabel4a2Pkm:", err);
    if (err.message.includes('tidak ditemukan')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal memperbarui data PkM', details: err.sqlMessage || err.message });
  } finally {
    if (connection) connection.release();
  }
};

/*
================================
 UPDATE ROADMAP GLOBAL (Unit-wide)
================================
*/
export const updateRoadmapGlobal = async (req, res) => {
  try {
    const { link_roadmap, ts_id } = req.body;
    const id_unit = req.user?.id_unit || req.user?.id_unit_prodi;

    if (!id_unit) {
      return res.status(400).json({ error: 'Unit kerja tidak ditemukan dari data user.' });
    }

    if (!ts_id) {
      return res.status(400).json({ error: 'ts_id wajib disertakan untuk menentukan periode 5 tahun.' });
    }

    // Hitung range 5 tahun (TS s.d TS-4)
    const ts = parseInt(ts_id, 10);
    const tahunIds = [ts - 4, ts - 3, ts - 2, ts - 1, ts];

    // Update link_roadmap HANYA untuk record PkM milik unit ini
    // yang memiliki data pendanaan dalam rentang 5 tahun tersebut (TS-4 s.d TS)
    const [result] = await pool.query(
      `UPDATE tabel_4a2_pkm pkm
       SET pkm.link_roadmap = ? 
       WHERE pkm.id_unit = ? 
       AND pkm.deleted_at IS NULL
       AND EXISTS (
         SELECT 1 FROM tabel_4a2_pendanaan_pkm p
         WHERE p.id_pkm = pkm.id AND p.id_tahun IN (?)
       )`,
      [link_roadmap, id_unit, tahunIds]
    );

    res.json({
      message: `Roadmap periode ${ts - 4}-${ts} berhasil diperbarui`,
      affectedRows: result.affectedRows
    });

  } catch (err) {
    console.error("Error updateRoadmapGlobal:", err);
    res.status(500).json({ error: 'Gagal memperbarui roadmap global', details: err.message });
  }
};

/*
================================
 SOFT DELETE
================================
*/
export const softDeleteTabel4a2Pkm = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_4a2_pkm', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    const [result] = await pool.query(
      'UPDATE tabel_4a2_pkm SET ? WHERE id = ?',
      [payload, req.params.id]
    );
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
    res.json({ message: 'Data PkM berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteTabel4a2Pkm:", err);
    res.status(500).json({ error: 'Gagal menghapus data PkM' });
  }
};

/*
================================
 RESTORE (konsisten dengan 3a1)
================================
*/
export const restoreTabel4a2Pkm = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID tidak valid.' });
    }

    // Cek apakah kolom deleted_at ada
    const hasDeletedAt = await hasColumn('tabel_4a2_pkm', 'deleted_at');
    if (!hasDeletedAt) {
      return res.status(400).json({ error: 'Restore tidak didukung. Tabel tidak memiliki kolom deleted_at.' });
    }

    // Cek apakah kolom deleted_by ada
    const hasDeletedBy = await hasColumn('tabel_4a2_pkm', 'deleted_by');

    // Restore data
    if (hasDeletedBy) {
      const [result] = await pool.query(
        'UPDATE tabel_4a2_pkm SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }

      res.json({ ok: true, restored: true, message: 'Data PkM berhasil dipulihkan' });
    } else {
      const [result] = await pool.query(
        'UPDATE tabel_4a2_pkm SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus.' });
      }

      res.json({ ok: true, restored: true, message: 'Data PkM berhasil dipulihkan' });
    }
  } catch (err) {
    console.error("Error restoreTabel4a2Pkm:", err);
    res.status(500).json({ error: 'Gagal memulihkan data', message: err.message });
  }
};

/*
================================
 HARD DELETE (Transactional - konsisten dengan 3a2)
================================
*/
export const hardDeleteTabel4a2Pkm = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    // Mulai transaksi
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Hapus data anak (pendanaan) dulu
    await connection.query('DELETE FROM tabel_4a2_pendanaan_pkm WHERE id_pkm = ?', [id]);

    // Hapus data induk
    const [result] = await connection.query(
      'DELETE FROM tabel_4a2_pkm WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Data PkM tidak ditemukan.' });
    }

    // Commit transaksi
    await connection.commit();
    res.json({ message: 'Data PkM berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error hardDeleteTabel4a2Pkm:", err);
    res.status(500).json({ error: 'Gagal menghapus data PkM secara permanen.', details: err.message });
  } finally {
    if (connection) connection.release();
  }
};

/*
================================
 EXPORT EXCEL - [DINAMIS 5 TAHUN]
================================
*/
export const exportTabel4a2Pkm = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tabel_4a2_pkm', 'pkm');
    const orderBy = 'pg.nama_lengkap ASC'; // Order by nama dosen

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

    // 3. Tambahkan Filter Masal: Hanya tampilkan PkM yang memiliki pendanaan dalam rentang TS s.d TS-4
    const tahunFilterIds = [tahunIds.id_ts, tahunIds.id_ts1, tahunIds.id_ts2, tahunIds.id_ts3, tahunIds.id_ts4];
    where.push(`EXISTS (
              SELECT 1 FROM tabel_4a2_pendanaan_pkm p2 
              WHERE p2.id_pkm = pkm.id 
              AND p2.id_tahun IN (?, ?, ?, ?, ?)
            )`);
    params.push(...tahunFilterIds);

    // 4. Buat SQL (Sama persis seperti list)
    const sql = `
            SELECT
              pg.nama_lengkap AS nama_dtpr,
              pkm.judul_pkm,
              pkm.jml_mhs_terlibat,
              pkm.jenis_hibah_pkm,
              pkm.sumber_dana,
              pkm.durasi_tahun,
              pkm.link_bukti,
              
              -- Kolom Anak 4A2 (Pivot 5 Tahun)
              ${pivotPendanaanSQL(tahunIds, 'p', 't')}
              
            FROM tabel_4a2_pkm pkm
            
            LEFT JOIN tabel_4a2_pendanaan_pkm p ON pkm.id = p.id_pkm
            LEFT JOIN tahun_akademik t ON p.id_tahun = t.id_tahun
            LEFT JOIN unit_kerja uk ON pkm.id_unit = uk.id_unit
            LEFT JOIN dosen d ON pkm.id_dosen_ketua = d.id_dosen
            LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
            
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            
            GROUP BY 
              pkm.id, pkm.id_unit, uk.nama_unit,
              pkm.link_roadmap,
              pkm.id_dosen_ketua,
              pg.nama_lengkap,
              pkm.judul_pkm,
              pkm.jml_mhs_terlibat,
              pkm.jenis_hibah_pkm,
              pkm.sumber_dana,
              pkm.durasi_tahun,
              pkm.link_bukti,
              pkm.deleted_at
            
            ORDER BY ${orderBy}`;

    const [rows] = await pool.query(sql, params);

    // 4. Buat Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tabel 4.A.2');

    // Header Gabungan (Merge) - [5 KOLOM]
    sheet.mergeCells('G1:K1'); // G, H, I, J, K
    sheet.getCell('G1').value = `Pendanaan (Rp Juta) (TS = ${tahunIds.nama_ts})`;
    sheet.getCell('G1').font = { bold: true };
    sheet.getCell('G1').alignment = { horizontal: 'center' };

    // Header Kolom - [5 TAHUN]
    const headers = [
      { header: 'Nama DTPR (Ketua PkM)', key: 'nama_dtpr', width: 30 },
      { header: 'Judul PkM', key: 'judul_pkm', width: 40 },
      { header: 'Jumlah Mahasiswa Terlibat', key: 'jml_mhs_terlibat', width: 20 },
      { header: 'Jenis Hibah PkM', key: 'jenis_hibah_pkm', width: 25 },
      { header: 'Sumber Dana (L/N/I)', key: 'sumber_dana', width: 20 },
      { header: 'Durasi (Tahun)', key: 'durasi_tahun', width: 15 },

      // Header 5 Tahun
      { header: `TS-4 (${tahunIds.nama_ts4})`, key: 'pendanaan_ts4', width: 20 },
      { header: `TS-3 (${tahunIds.nama_ts3})`, key: 'pendanaan_ts3', width: 20 },
      { header: `TS-2 (${tahunIds.nama_ts2})`, key: 'pendanaan_ts2', width: 20 },
      { header: `TS-1 (${tahunIds.nama_ts1})`, key: 'pendanaan_ts1', width: 20 },
      { header: `TS (${tahunIds.nama_ts})`, key: 'pendanaan_ts', width: 20 },

      { header: 'Link Bukti', key: 'link_bukti', width: 30 },
    ];

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
        // Center-align kolom tertentu
        ['jml_mhs_terlibat', 'sumber_dana', 'durasi_tahun'].forEach(key => {
          row.getCell(key).alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // Format Rupiah
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
    res.setHeader('Content-Disposition', 'attachment; filename=Tabel_4A2_PkM_DTPR.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error exportTabel4a2Pkm:", err);
    if (err.message.includes('ts_id tidak valid')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Gagal mengekspor data PkM', details: err.message });
  }
};