import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// === LIST TABEL 2B4 MASA TUNGGU (UNIFIED) ===
export const listTabel2b4MasaTunggu = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tabel_2b4_masa_tunggu', 't2b4');

    // Hapus filter id_unit_prodi dari where if exists, karena kita ingin UNIFIED (semua prodi)
    const filteredWhere = where.filter(c => !/id_unit_prodi/i.test(c));
    // Note: params might need careful filtering if id_unit_prodi was there, 
    // but usually buildWhere for superadmin/kemahasiswaan won't add it unless requested.
    // Given the new requirement, we ignore id_unit_prodi filter for this unified table.

    const sql = `
      SELECT 
        MIN(t2b4.id) as id,
        t2b4.id_tahun_lulus,
        ta.tahun AS tahun_lulus,
        SUM(t2b4.jumlah_lulusan) AS jumlah_lulusan,
        SUM(t2b4.jumlah_terlacak) AS jumlah_terlacak,
        AVG(t2b4.rata_rata_waktu_tunggu_bulan) AS rata_rata_waktu_tunggu_bulan,
        MAX(t2b4.deleted_at) as deleted_at
      FROM tabel_2b4_masa_tunggu t2b4
      LEFT JOIN tahun_akademik ta ON t2b4.id_tahun_lulus = ta.id_tahun
      ${filteredWhere.length ? `WHERE ${filteredWhere.join(' AND ')}` : ''}
      GROUP BY t2b4.id_tahun_lulus
      ORDER BY ta.tahun DESC
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listTabel2b4MasaTunggu:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// === DETAIL TABEL 2B4 MASA TUNGGU ===
export const getTabel2b4MasaTungguById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t2b4.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_lulus
       FROM tabel_2b4_masa_tunggu t2b4
       LEFT JOIN unit_kerja uk ON t2b4.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b4.id_tahun_lulus = ta.id_tahun
       WHERE t2b4.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getTabel2b4MasaTungguById:", err);
    res.status(500).json({ error: 'Get failed' });
  }
};

// === CREATE TABEL 2B4 MASA TUNGGU ===
export const createTabel2b4MasaTunggu = async (req, res) => {
  try {
    const {
      id_unit_prodi,
      id_tahun_lulus,
      jumlah_lulusan,
      jumlah_terlacak,
      rata_rata_waktu_tunggu_bulan
    } = req.body;

    if (!id_tahun_lulus) {
      return res.status(400).json({ error: 'Field `id_tahun_lulus` wajib diisi.' });
    }

    const data = {
      // Prioritaskan unit prodi dari user yang login agar terdeteksi siapa yang mengisi
      // [FIX] Menggunakan req.user.id_unit sesuai payload JWT
      id_unit_prodi: req.user?.id_unit || id_unit_prodi || 1,
      id_tahun_lulus: id_tahun_lulus,
      jumlah_lulusan: jumlah_lulusan || 0,
      jumlah_terlacak: jumlah_terlacak || 0,
      rata_rata_waktu_tunggu_bulan: rata_rata_waktu_tunggu_bulan || 0,
    };

    // Validasi Logika: Terlacak tidak boleh > Lulusan
    if (data.jumlah_terlacak > data.jumlah_lulusan) {
      return res.status(400).json({ error: 'Jumlah lulusan yang terlacak tidak boleh melebihi total lulusan.' });
    }

    if (await hasColumn('tabel_2b4_masa_tunggu', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO tabel_2b4_masa_tunggu SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT t2b4.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_lulus
       FROM tabel_2b4_masa_tunggu t2b4
       LEFT JOIN unit_kerja uk ON t2b4.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b4.id_tahun_lulus = ta.id_tahun
       WHERE t2b4.id = ?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createTabel2b4MasaTunggu:", err);
    res.status(500).json({ error: 'Create failed' });
  }
};

// === UPDATE TABEL 2B4 MASA TUNGGU ===
export const updateTabel2b4MasaTunggu = async (req, res) => {
  try {
    const {
      id_unit_prodi,
      id_tahun_lulus,
      jumlah_lulusan,
      jumlah_terlacak,
      rata_rata_waktu_tunggu_bulan
    } = req.body;

    const data = {
      // [FIX] Menggunakan req.user.id_unit sesuai payload JWT
      id_unit_prodi: req.user?.id_unit || id_unit_prodi,
      id_tahun_lulus: id_tahun_lulus,
      jumlah_lulusan: jumlah_lulusan,
      jumlah_terlacak: jumlah_terlacak,
      rata_rata_waktu_tunggu_bulan: rata_rata_waktu_tunggu_bulan,
    };

    // Hapus properti yang tidak didefinisikan agar tidak menimpa data yang ada dengan NULL
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    // Validasi Logika: Terlacak tidak boleh > Lulusan (hanya jika keduanya ada di update atau salah satu berubah)
    // Note: Kita butuh data existing jika hanya salah satu yang diupdate, 
    // tapi untuk simplisitas di sini kita asumsikan frontend kirim semua atau validasi di frontend.
    // Di backend kita cek data yang dikirim saja jika ada keduanya.
    if (data.jumlah_terlacak !== undefined && data.jumlah_lulusan !== undefined) {
      if (data.jumlah_terlacak > data.jumlah_lulusan) {
        return res.status(400).json({ error: 'Jumlah lulusan yang terlacak tidak boleh melebihi total lulusan.' });
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Tidak ada data untuk diupdate.' });
    }

    if (await hasColumn('tabel_2b4_masa_tunggu', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(`UPDATE tabel_2b4_masa_tunggu SET ? WHERE id = ?`, [data, req.params.id]);
    const [row] = await pool.query(
      `SELECT t2b4.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_lulus
       FROM tabel_2b4_masa_tunggu t2b4
       LEFT JOIN unit_kerja uk ON t2b4.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b4.id_tahun_lulus = ta.id_tahun
       WHERE t2b4.id = ?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateTabel2b4MasaTunggu:", err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// === SOFT DELETE ===
export const softDeleteTabel2b4MasaTunggu = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_2b4_masa_tunggu', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(`UPDATE tabel_2b4_masa_tunggu SET ? WHERE id = ?`, [payload, req.params.id]);
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("Error softDeleteTabel2b4MasaTunggu:", err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

// === RESTORE ===
export const restoreTabel2b4MasaTunggu = async (req, res) => {
  try {
    await pool.query(`UPDATE tabel_2b4_masa_tunggu SET deleted_at=NULL, deleted_by=NULL WHERE id=?`, [req.params.id]);
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreTabel2b4MasaTunggu:", err);
    res.status(500).json({ error: 'Restore failed' });
  }
};

// === HARD DELETE ===
export const hardDeleteTabel2b4MasaTunggu = async (req, res) => {
  try {
    await pool.query(`DELETE FROM tabel_2b4_masa_tunggu WHERE id=?`, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error("Error hardDeleteTabel2b4MasaTunggu:", err);
    res.status(500).json({ error: 'Hard delete failed' });
  }
};

// === SUMMARY DATA (UNIFIED) ===
export const summaryTabel2b4MasaTunggu = async (req, res) => {
  try {
    const { id_tahun_lulus } = req.query;

    let sql = `
      SELECT 
        'Seluruh Program Studi' AS nama_unit_prodi,
        ta.tahun AS tahun_lulus,
        SUM(t2b4.jumlah_lulusan) AS total_lulusan,
        SUM(t2b4.jumlah_terlacak) AS total_terlacak,
        AVG(t2b4.rata_rata_waktu_tunggu_bulan) AS rata_rata_tunggu_keseluruhan,
        COUNT(t2b4.id) AS jumlah_data
      FROM tabel_2b4_masa_tunggu t2b4
      LEFT JOIN tahun_akademik ta ON t2b4.id_tahun_lulus = ta.id_tahun
      WHERE t2b4.deleted_at IS NULL
    `;

    const params = [];
    if (id_tahun_lulus) {
      sql += ` AND t2b4.id_tahun_lulus = ?`;
      params.push(id_tahun_lulus);
    }

    sql += ` GROUP BY t2b4.id_tahun_lulus ORDER BY ta.tahun DESC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error summaryTabel2b4MasaTunggu:", err);
    res.status(500).json({ error: 'Summary failed' });
  }
};

// === GET DATA UNTUK TABEL 2B5 (UNIFIED) ===
export const getDataForTabel2b5 = async (req, res) => {
  try {
    const { id_tahun_lulus } = req.query;

    let sql = `
      SELECT 
        1 AS id_unit_prodi,
        'Seluruh Program Studi' AS nama_unit_prodi,
        t2b4.id_tahun_lulus,
        ta.tahun AS tahun_lulus,
        SUM(t2b4.jumlah_lulusan) AS jumlah_lulusan,
        SUM(t2b4.jumlah_terlacak) AS jumlah_terlacak,
        AVG(t2b4.rata_rata_waktu_tunggu_bulan) AS rata_rata_waktu_tunggu_bulan
      FROM tabel_2b4_masa_tunggu t2b4
      LEFT JOIN tahun_akademik ta ON t2b4.id_tahun_lulus = ta.id_tahun
      WHERE t2b4.deleted_at IS NULL
    `;

    const params = [];
    if (id_tahun_lulus) {
      sql += ` AND t2b4.id_tahun_lulus = ?`;
      params.push(id_tahun_lulus);
    }

    sql += ` GROUP BY t2b4.id_tahun_lulus ORDER BY ta.tahun DESC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error getDataForTabel2b5:", err);
    res.status(500).json({ error: 'Get data for tabel 2b5 failed' });
  }
};
