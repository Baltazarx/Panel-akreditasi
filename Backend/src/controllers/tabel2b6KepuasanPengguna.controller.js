import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// === HELPER FUNCTION UNTUK STATISTIK ===
const getStatistikData = async (id_unit_prodi, id_tahun) => {
  try {
    // 1. Jumlah alumni/lulusan dalam 3 tahun terakhir
    const [alumniData] = await pool.query(
      `SELECT SUM(jml_lulus) as total_alumni_3_tahun
       FROM tabel_2a3_kondisi_mahasiswa 
       WHERE id_unit_prodi = ? 
       AND id_tahun >= ? - 2 
       AND id_tahun <= ?
       AND deleted_at IS NULL`,
      [id_unit_prodi, id_tahun, id_tahun]
    );

    // 2. Jumlah mahasiswa aktif pada tahun TS
    const [mahasiswaAktifData] = await pool.query(
      `SELECT SUM(jumlah_total) as total_mahasiswa_aktif
       FROM tabel_2a1_mahasiswa_baru_aktif 
       WHERE id_unit_prodi = ? 
       AND id_tahun = ?
       AND jenis = 'aktif'
       AND deleted_at IS NULL`,
      [id_unit_prodi, id_tahun]
    );

    // 3. Jumlah responden
    const [respondenData] = await pool.query(
      `SELECT COUNT(DISTINCT jenis_kemampuan) as jumlah_responden
       FROM tabel_2b6_kepuasan_pengguna 
       WHERE id_unit_prodi = ? 
       AND id_tahun = ?
       AND deleted_at IS NULL`,
      [id_unit_prodi, id_tahun]
    );

    return {
      jumlah_alumni_3_tahun: alumniData[0]?.total_alumni_3_tahun || 0,
      jumlah_mahasiswa_aktif_ts: mahasiswaAktifData[0]?.total_mahasiswa_aktif || 0,
      jumlah_responden: respondenData[0]?.jumlah_responden || 0,
      tahun_akademik: id_tahun,
      unit_prodi: id_unit_prodi
    };
  } catch (err) {
    console.error("Error getStatistikData:", err);
    return null;
  }
};

// === LIST TABEL 2B6 KEPUASAN PENGGUNA ===
export const listTabel2b6KepuasanPengguna = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tabel_2b6_kepuasan_pengguna', 't2b6');
    const orderBy = buildOrderBy(req.query?.order_by, 'id', 't2b6');

    const sql = `
      SELECT 
        t2b6.id,
        t2b6.id_unit_prodi,
        uk.nama_unit AS nama_unit_prodi,
        t2b6.id_tahun,
        ta.tahun AS tahun_akademik,
        t2b6.jenis_kemampuan,
        t2b6.persen_sangat_baik,
        t2b6.persen_baik,
        t2b6.persen_cukup,
        t2b6.persen_kurang,
        t2b6.deleted_at
      FROM tabel_2b6_kepuasan_pengguna t2b6
      LEFT JOIN unit_kerja uk ON t2b6.id_unit_prodi = uk.id_unit
      LEFT JOIN tahun_akademik ta ON t2b6.id_tahun = ta.id_tahun
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);

    // Ambil data statistik
    const { id_unit_prodi, id_tahun } = req.query;
    let statistik = null;
    
    if (id_unit_prodi && id_tahun) {
      // Jika ada filter spesifik, ambil statistik untuk filter tersebut
      statistik = await getStatistikData(id_unit_prodi, id_tahun);
    } else if (rows.length > 0) {
      // Jika tidak ada filter, ambil statistik untuk semua kombinasi yang ada
      const uniqueCombinations = [...new Set(rows.map(row => `${row.id_unit_prodi}-${row.id_tahun}`))];
      const statistikPromises = uniqueCombinations.map(combo => {
        const [unitProdi, tahun] = combo.split('-');
        return getStatistikData(parseInt(unitProdi), parseInt(tahun));
      });
      
      const statistikResults = await Promise.all(statistikPromises);
      statistik = statistikResults.filter(s => s !== null);
    }

    const response = {
      data: rows,
      statistik: statistik
    };

    res.json(response);
  } catch (err) {
    console.error("Error listTabel2b6KepuasanPengguna:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// === DETAIL TABEL 2B6 KEPUASAN PENGGUNA ===
export const getTabel2b6KepuasanPenggunaById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t2b6.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_akademik
       FROM tabel_2b6_kepuasan_pengguna t2b6
       LEFT JOIN unit_kerja uk ON t2b6.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b6.id_tahun = ta.id_tahun
       WHERE t2b6.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });

    // Ambil data statistik untuk unit prodi dan tahun yang sama
    const statistik = await getStatistikData(rows[0].id_unit_prodi, rows[0].id_tahun);

    const response = {
      ...rows[0],
      statistik: statistik
    };

    res.json(response);
  } catch (err) {
    console.error("Error getTabel2b6KepuasanPenggunaById:", err);
    res.status(500).json({ error: 'Get failed' });
  }
};

// === CREATE TABEL 2B6 KEPUASAN PENGGUNA ===
export const createTabel2b6KepuasanPengguna = async (req, res) => {
  try {
    const { 
      id_unit_prodi, 
      id_tahun, 
      jenis_kemampuan, 
      persen_sangat_baik, 
      persen_baik, 
      persen_cukup, 
      persen_kurang 
    } = req.body;

    if (!id_unit_prodi || !id_tahun || !jenis_kemampuan) {
      return res.status(400).json({ error: 'Field `id_unit_prodi`, `id_tahun`, dan `jenis_kemampuan` wajib diisi.' });
    }

    // Validasi total persentase tidak boleh lebih dari 100%
    const totalPersen = parseFloat(((persen_sangat_baik || 0) + (persen_baik || 0) + (persen_cukup || 0) + (persen_kurang || 0)).toFixed(2));
    if (totalPersen > 100) {
      return res.status(400).json({ 
        error: `Total persentase (${totalPersen}%) tidak boleh lebih dari 100%.` 
      });
    }

    const data = {
      id_unit_prodi: id_unit_prodi,
      id_tahun: id_tahun,
      jenis_kemampuan: jenis_kemampuan,
      persen_sangat_baik: persen_sangat_baik || 0,
      persen_baik: persen_baik || 0,
      persen_cukup: persen_cukup || 0,
      persen_kurang: persen_kurang || 0,
    };

    // multi-prodi aware - khusus untuk role kemahasiswaan
    if (!data.id_unit_prodi && req.user?.role === 'kemahasiswaan') {
      data.id_unit_prodi = req.user.id_unit_prodi;
    }

    if (!data.id_unit_prodi) {
      return res.status(400).json({ error: 'Field `id_unit_prodi` wajib diisi.' });
    }

    if (await hasColumn('tabel_2b6_kepuasan_pengguna', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO tabel_2b6_kepuasan_pengguna SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT t2b6.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_akademik
       FROM tabel_2b6_kepuasan_pengguna t2b6
       LEFT JOIN unit_kerja uk ON t2b6.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b6.id_tahun = ta.id_tahun
       WHERE t2b6.id = ?`,
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
    const { 
      id_unit_prodi, 
      id_tahun, 
      jenis_kemampuan, 
      persen_sangat_baik, 
      persen_baik, 
      persen_cukup, 
      persen_kurang 
    } = req.body;

    // Validasi total persentase tidak boleh lebih dari 100%
    if (persen_sangat_baik !== undefined || persen_baik !== undefined || 
        persen_cukup !== undefined || persen_kurang !== undefined) {
      const totalPersen = parseFloat(((persen_sangat_baik || 0) + (persen_baik || 0) + 
                         (persen_cukup || 0) + (persen_kurang || 0)).toFixed(2));
      if (totalPersen > 100) {
        return res.status(400).json({ 
          error: `Total persentase (${totalPersen}%) tidak boleh lebih dari 100%.` 
        });
      }
    }

    const data = {
      id_unit_prodi: id_unit_prodi,
      id_tahun: id_tahun,
      jenis_kemampuan: jenis_kemampuan,
      persen_sangat_baik: persen_sangat_baik,
      persen_baik: persen_baik,
      persen_cukup: persen_cukup,
      persen_kurang: persen_kurang,
    };

    // Hapus properti yang tidak didefinisikan agar tidak menimpa data yang ada dengan NULL
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Tidak ada data untuk diupdate.' });
    }

    if (await hasColumn('tabel_2b6_kepuasan_pengguna', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(`UPDATE tabel_2b6_kepuasan_pengguna SET ? WHERE id = ?`, [data, req.params.id]);
    const [row] = await pool.query(
      `SELECT t2b6.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_akademik
       FROM tabel_2b6_kepuasan_pengguna t2b6
       LEFT JOIN unit_kerja uk ON t2b6.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b6.id_tahun = ta.id_tahun
       WHERE t2b6.id = ?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateTabel2b6KepuasanPengguna:", err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// === SOFT DELETE ===
export const softDeleteTabel2b6KepuasanPengguna = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_2b6_kepuasan_pengguna', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
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
    await pool.query(`UPDATE tabel_2b6_kepuasan_pengguna SET deleted_at=NULL, deleted_by=NULL WHERE id=?`, [req.params.id]);
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

// === SUMMARY DATA ===
export const summaryTabel2b6KepuasanPengguna = async (req, res) => {
  try {
    const { id_unit_prodi, id_tahun } = req.query;
    
    let sql = `
      SELECT 
        uk.nama_unit AS nama_unit_prodi,
        ta.tahun AS tahun_akademik,
        AVG(t2b6.persen_sangat_baik) AS rata_sangat_baik,
        AVG(t2b6.persen_baik) AS rata_baik,
        AVG(t2b6.persen_cukup) AS rata_cukup,
        AVG(t2b6.persen_kurang) AS rata_kurang,
        COUNT(t2b6.id) AS jumlah_kemampuan
      FROM tabel_2b6_kepuasan_pengguna t2b6
      LEFT JOIN unit_kerja uk ON t2b6.id_unit_prodi = uk.id_unit
      LEFT JOIN tahun_akademik ta ON t2b6.id_tahun = ta.id_tahun
      WHERE t2b6.deleted_at IS NULL
    `;
    
    const params = [];
    
    if (id_unit_prodi) {
      sql += ` AND t2b6.id_unit_prodi = ?`;
      params.push(id_unit_prodi);
    }
    
    if (id_tahun) {
      sql += ` AND t2b6.id_tahun = ?`;
      params.push(id_tahun);
    }
    
    sql += ` GROUP BY t2b6.id_unit_prodi, t2b6.id_tahun ORDER BY ta.tahun DESC`;

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
      'Kerjasama Tim',
      'Keahlian di Bidang Prodi',
      'Kemampuan Berbahasa Asing (Inggris)',
      'Kemampuan Berkomunikasi',
      'Pengembangan Diri',
      'Kepemimpinan',
      'Etos Kerja'
    ];
    
    res.json(jenisKemampuan);
  } catch (err) {
    console.error("Error getJenisKemampuanTersedia:", err);
    res.status(500).json({ error: 'Get jenis kemampuan failed' });
  }
};

// === GET DATA STATISTIK TAMBAHAN ===
export const getDataStatistikTabel2b6 = async (req, res) => {
  try {
    const { id_unit_prodi, id_tahun } = req.query;
    
    if (!id_unit_prodi || !id_tahun) {
      return res.status(400).json({ error: 'Field `id_unit_prodi` dan `id_tahun` wajib diisi.' });
    }

    const statistik = await getStatistikData(id_unit_prodi, id_tahun);
    
    if (!statistik) {
      return res.status(500).json({ error: 'Failed to get statistik data' });
    }

    res.json(statistik);
  } catch (err) {
    console.error("Error getDataStatistikTabel2b6:", err);
    res.status(500).json({ error: 'Get data statistik failed' });
  }
};
