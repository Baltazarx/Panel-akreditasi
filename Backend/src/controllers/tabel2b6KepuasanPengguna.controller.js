import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// === HELPER FUNCTION UNTUK STATISTIK (UNIFIED) ===
const getStatistikData = async (id_tahun) => {
  try {
    const hasDeletedAt2a3 = await hasColumn('tabel_2a3_kondisi_mahasiswa', 'deleted_at');
    const hasDeletedAt2a1 = await hasColumn('tabel_2a1_mahasiswa_baru_aktif', 'deleted_at');
    const hasDeletedAt2b6 = await hasColumn('tabel_2b6_kepuasan_pengguna', 'deleted_at');

    // 1. Jumlah alumni/lulusan dalam 3 tahun terakhir (UNIFIED)
    let sqlAlumni = `SELECT SUM(jml_lulus) as total_alumni_3_tahun
       FROM tabel_2a3_kondisi_mahasiswa 
       WHERE id_tahun >= ? - 2 
       AND id_tahun <= ?`;
    if (hasDeletedAt2a3) sqlAlumni += ` AND deleted_at IS NULL`;
    const [alumniData] = await pool.query(sqlAlumni, [id_tahun, id_tahun]);

    // 2. Jumlah mahasiswa aktif pada tahun TS (UNIFIED)
    let sqlMahasiswa = `SELECT SUM(jumlah_total) as total_mahasiswa_aktif
       FROM tabel_2a1_mahasiswa_baru_aktif 
       WHERE id_tahun = ?
       AND jenis = 'aktif'`;
    if (hasDeletedAt2a1) sqlMahasiswa += ` AND deleted_at IS NULL`;
    const [mahasiswaAktifData] = await pool.query(sqlMahasiswa, [id_tahun]);

    // 3. Jumlah responden (UNIFIED)
    // Responden dihitung dari jumlah jenis kemampuan yang unik diisi? 
    // Sebenarnya di 2B.6 responden biasanya dicatat manual atau dihitung dari data?
    // Di schema ini, satu row adalah satu jenis kemampuan. 
    // Mungkin kita butuh kolom jumlah_responden per row (tidak ada di schema ini).
    // Untuk sementara, kita hitung jumlah data unik jenis_kemampuan per tahun secara agregat.
    let sqlResponden = `SELECT COUNT(DISTINCT jenis_kemampuan) as jumlah_responden
       FROM tabel_2b6_kepuasan_pengguna 
       WHERE id_tahun = ?`;
    if (hasDeletedAt2b6) sqlResponden += ` AND deleted_at IS NULL`;
    const [respondenData] = await pool.query(sqlResponden, [id_tahun]);

    return {
      jumlah_alumni_3_tahun: alumniData[0]?.total_alumni_3_tahun || 0,
      jumlah_mahasiswa_aktif_ts: mahasiswaAktifData[0]?.total_mahasiswa_aktif || 0,
      jumlah_responden: respondenData[0]?.jumlah_responden || 0,
      tahun_akademik: id_tahun,
      unit_prodi: 1 // Unified
    };
  } catch (err) {
    console.error("Error getStatistikData:", err);
    return null;
  }
};

// === LIST TABEL 2B6 KEPUASAN PENGGUNA (UNIFIED) ===
export const listTabel2b6KepuasanPengguna = async (req, res) => {
  try {
    const hasDeletedAt = await hasColumn('tabel_2b6_kepuasan_pengguna', 'deleted_at');
    const hasRencanaTindakLanjut = await hasColumn('tabel_2b6_kepuasan_pengguna', 'rencana_tindak_lanjut');

    let { where, params } = await buildWhere(req, 'tabel_2b6_kepuasan_pengguna', 't2b6');

    // Ignore id_unit_prodi filter for unification
    const filteredWhere = where.filter(c => !/id_unit_prodi/i.test(c));
    if (!hasDeletedAt) {
      // where logic...
    }

    const sql = `
      SELECT 
        MIN(t2b6.id) as id,
        t2b6.id_tahun,
        ta.tahun AS tahun_akademik,
        t2b6.jenis_kemampuan,
        AVG(t2b6.persen_sangat_baik) AS persen_sangat_baik,
        AVG(t2b6.persen_baik) AS persen_baik,
        AVG(t2b6.persen_cukup) AS persen_cukup,
        AVG(t2b6.persen_kurang) AS persen_kurang,
        MIN(t2b6.rencana_tindak_lanjut) AS rencana_tindak_lanjut,
        MAX(t2b6.deleted_at) AS deleted_at
      FROM tabel_2b6_kepuasan_pengguna t2b6
      LEFT JOIN tahun_akademik ta ON t2b6.id_tahun = ta.id_tahun
      ${filteredWhere.length ? `WHERE ${filteredWhere.join(' AND ')}` : ''}
      GROUP BY t2b6.id_tahun, t2b6.jenis_kemampuan
      ORDER BY ta.tahun DESC, t2b6.jenis_kemampuan ASC
    `;

    const [rows] = await pool.query(sql, params);

    // Ambil data statistik UNIFIED
    const { id_tahun } = req.query;
    let statistik = null;

    if (id_tahun) {
      statistik = await getStatistikData(parseInt(id_tahun));
    } else if (rows.length > 0) {
      const uniqueYears = [...new Set(rows.map(row => row.id_tahun))];
      const statistikPromises = uniqueYears.map(tahun => getStatistikData(parseInt(tahun)));
      const statistikResults = await Promise.all(statistikPromises);
      statistik = statistikResults.filter(s => s !== null);
    }

    res.json({
      data: rows,
      statistik: statistik
    });
  } catch (err) {
    console.error("Error listTabel2b6KepuasanPengguna:", err);
    res.status(500).json({ error: 'List failed', message: err.message });
  }
};

// === DETAIL TABEL 2B6 KEPUASAN PENGGUNA ===
export const getTabel2b6KepuasanPenggunaById = async (req, res) => {
  try {
    const hasDeletedAt = await hasColumn('tabel_2b6_kepuasan_pengguna', 'deleted_at');
    const hasRencanaTindakLanjut = await hasColumn('tabel_2b6_kepuasan_pengguna', 'rencana_tindak_lanjut');

    const [rows] = await pool.query(
      `SELECT t2b6.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_akademik
       FROM tabel_2b6_kepuasan_pengguna t2b6
       LEFT JOIN unit_kerja uk ON t2b6.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b6.id_tahun = ta.id_tahun
       WHERE t2b6.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });

    const statistik = await getStatistikData(rows[0].id_tahun);
    res.json({ ...rows[0], statistik });
  } catch (err) {
    console.error("Error getTabel2b6KepuasanPenggunaById:", err);
    res.status(500).json({ error: 'Get failed' });
  }
};

// === CREATE TABEL 2B6 KEPUASAN PENGGUNA ===
export const createTabel2b6KepuasanPengguna = async (req, res) => {
  try {
    const hasRencanaTindakLanjut = await hasColumn('tabel_2b6_kepuasan_pengguna', 'rencana_tindak_lanjut');
    const {
      id_unit_prodi,
      id_tahun,
      jenis_kemampuan,
      persen_sangat_baik,
      persen_baik,
      persen_cukup,
      persen_kurang,
      rencana_tindak_lanjut,
    } = req.body;

    if (!id_tahun || !jenis_kemampuan) {
      return res.status(400).json({ error: 'Field `id_tahun` dan `jenis_kemampuan` wajib diisi.' });
    }

    const totalPersen = parseFloat(((persen_sangat_baik || 0) + (persen_baik || 0) + (persen_cukup || 0) + (persen_kurang || 0)).toFixed(2));
    if (totalPersen > 100) {
      return res.status(400).json({ error: `Total persentase (${totalPersen}%) tidak boleh lebih dari 100%.` });
    }

    const data = {
      // [FIX] Menggunakan req.user.id_unit sesuai payload JWT
      id_unit_prodi: req.user?.id_unit || id_unit_prodi || 1,
      id_tahun: id_tahun,
      jenis_kemampuan: jenis_kemampuan,
      persen_sangat_baik: persen_sangat_baik || 0,
      persen_baik: persen_baik || 0,
      persen_cukup: persen_cukup || 0,
      persen_kurang: persen_kurang || 0,
    };

    if (hasRencanaTindakLanjut) data.rencana_tindak_lanjut = rencana_tindak_lanjut || null;
    if (await hasColumn('tabel_2b6_kepuasan_pengguna', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO tabel_2b6_kepuasan_pengguna SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT t2b6.*, ta.tahun AS tahun_akademik FROM tabel_2b6_kepuasan_pengguna t2b6
       LEFT JOIN tahun_akademik ta ON t2b6.id_tahun = ta.id_tahun WHERE t2b6.id = ?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createTabel2b6KepuasanPengguna:", err);
    res.status(500).json({ error: 'Create failed' });
  }
};

// === UPDATE TABEL 2B6 KEPUASAN PENGGUNA ===
export const updateTabel2b6KepuasanPengguna = async (req, res) => {
  try {
    const hasRencanaTindakLanjut = await hasColumn('tabel_2b6_kepuasan_pengguna', 'rencana_tindak_lanjut');
    const {
      id_unit_prodi,
      id_tahun,
      jenis_kemampuan,
      persen_sangat_baik,
      persen_baik,
      persen_cukup,
      persen_kurang,
      rencana_tindak_lanjut,
    } = req.body;

    if (persen_sangat_baik !== undefined || persen_baik !== undefined || persen_cukup !== undefined || persen_kurang !== undefined) {
      const totalPersen = parseFloat(((persen_sangat_baik || 0) + (persen_baik || 0) + (persen_cukup || 0) + (persen_kurang || 0)).toFixed(2));
      if (totalPersen > 100) return res.status(400).json({ error: `Total persentase (${totalPersen}%) tidak boleh lebih dari 100%.` });
    }

    const data = {
      // [FIX] Menggunakan req.user.id_unit sesuai payload JWT
      id_unit_prodi: req.user?.id_unit || id_unit_prodi,
      id_tahun,
      jenis_kemampuan,
      persen_sangat_baik,
      persen_baik,
      persen_cukup,
      persen_kurang,
    };

    if (hasRencanaTindakLanjut && rencana_tindak_lanjut !== undefined) data.rencana_tindak_lanjut = rencana_tindak_lanjut;
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (await hasColumn('tabel_2b6_kepuasan_pengguna', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(`UPDATE tabel_2b6_kepuasan_pengguna SET ? WHERE id = ?`, [data, req.params.id]);
    const [row] = await pool.query(
      `SELECT t2b6.*, ta.tahun AS tahun_akademik FROM tabel_2b6_kepuasan_pengguna t2b6
       LEFT JOIN tahun_akademik ta ON t2b6.id_tahun = ta.id_tahun WHERE t2b6.id = ?`,
      [req.params.id]
    );
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateTabel2b6KepuasanPengguna:", err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// === SOFT DELETE ===
export const softDeleteTabel2b6KepuasanPengguna = async (req, res) => {
  try {
    const hasDeletedAt = await hasColumn('tabel_2b6_kepuasan_pengguna', 'deleted_at');
    if (!hasDeletedAt) {
      await pool.query(`DELETE FROM tabel_2b6_kepuasan_pengguna WHERE id = ?`, [req.params.id]);
      return res.json({ ok: true, hardDeleted: true });
    }
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_2b6_kepuasan_pengguna', 'deleted_by')) payload.deleted_by = req.user?.id_user || null;
    await pool.query(`UPDATE tabel_2b6_kepuasan_pengguna SET ? WHERE id = ?`, [payload, req.params.id]);
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("Error softDeleteTabel2b6KepuasanPengguna:", err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

// === RESTORE ===
export const restoreTabel2b6KepuasanPengguna = async (req, res) => {
  try {
    const hasDeletedBy = await hasColumn('tabel_2b6_kepuasan_pengguna', 'deleted_by');
    if (hasDeletedBy) {
      await pool.query(`UPDATE tabel_2b6_kepuasan_pengguna SET deleted_at=NULL, deleted_by=NULL WHERE id = ?`, [req.params.id]);
    } else {
      await pool.query(`UPDATE tabel_2b6_kepuasan_pengguna SET deleted_at=NULL WHERE id = ?`, [req.params.id]);
    }
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreTabel2b6KepuasanPengguna:", err);
    res.status(500).json({ error: 'Restore failed' });
  }
};

// === HARD DELETE ===
export const hardDeleteTabel2b6KepuasanPengguna = async (req, res) => {
  try {
    await pool.query(`DELETE FROM tabel_2b6_kepuasan_pengguna WHERE id=?`, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error("Error hardDeleteTabel2b6KepuasanPengguna:", err);
    res.status(500).json({ error: 'Hard delete failed' });
  }
};

// === SUMMARY DATA (UNIFIED) ===
export const summaryTabel2b6KepuasanPengguna = async (req, res) => {
  try {
    const hasDeletedAt = await hasColumn('tabel_2b6_kepuasan_pengguna', 'deleted_at');
    const { id_tahun } = req.query;

    let sql = `
      SELECT 
        'Seluruh Program Studi' AS nama_unit_prodi,
        ta.tahun AS tahun_akademik,
        AVG(t2b6.persen_sangat_baik) AS rata_sangat_baik,
        AVG(t2b6.persen_baik) AS rata_baik,
        AVG(t2b6.persen_cukup) AS rata_cukup,
        AVG(t2b6.persen_kurang) AS rata_kurang,
        COUNT(t2b6.id) AS jumlah_kemampuan
      FROM tabel_2b6_kepuasan_pengguna t2b6
      LEFT JOIN tahun_akademik ta ON t2b6.id_tahun = ta.id_tahun
      WHERE 1=1
    `;

    if (hasDeletedAt) sql += ` AND t2b6.deleted_at IS NULL`;
    const params = [];
    if (id_tahun) {
      sql += ` AND t2b6.id_tahun = ?`;
      params.push(id_tahun);
    }

    sql += ` GROUP BY t2b6.id_tahun ORDER BY ta.tahun DESC`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error summaryTabel2b6KepuasanPengguna:", err);
    res.status(500).json({ error: 'Summary failed' });
  }
};

// === GET JENIS KEMAMPUAN YANG TERSEDIA ===
export const getJenisKemampuanTersedia = async (req, res) => {
  try {
    const jenisKemampuan = [
      'Kerjasama Tim', 'Keahlian di Bidang Prodi', 'Kemampuan Berbahasa Asing (Inggris)',
      'Kemampuan Berkomunikasi', 'Pengembangan Diri', 'Kepemimpinan', 'Etos Kerja'
    ];
    res.json(jenisKemampuan);
  } catch (err) { res.status(500).json({ error: 'Get failed' }); }
};

// === GET DATA STATISTIK TAMBAHAN (UNIFIED) ===
export const getDataStatistikTabel2b6 = async (req, res) => {
  try {
    const { id_tahun } = req.query;
    if (!id_tahun) return res.status(400).json({ error: 'Field `id_tahun` wajib diisi.' });
    const statistik = await getStatistikData(parseInt(id_tahun));
    if (!statistik) return res.status(500).json({ error: 'Failed to get statistik data' });
    res.json(statistik);
  } catch (err) { res.status(500).json({ error: 'Get data statistik failed' }); }
};
