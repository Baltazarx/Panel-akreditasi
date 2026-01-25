import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// === LIST TABEL 2B5 KESESUAIAN KERJA (UNIFIED) ===
export const listTabel2b5KesesuaianKerja = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tabel_2b5_kesesuaian_kerja', 't2b5');

    // Ignore id_unit_prodi filter for unification
    const filteredWhere = where.filter(c => !/id_unit_prodi/i.test(c));

    const sql = `
      SELECT 
        MIN(t2b5.id) as id,
        t2b5.id_tahun_lulus,
        ta.tahun AS tahun_lulus,
        SUM(t2b5.jml_infokom) AS jml_infokom,
        SUM(t2b5.jml_non_infokom) AS jml_non_infokom,
        SUM(t2b5.jml_internasional) AS jml_internasional,
        SUM(t2b5.jml_nasional) AS jml_nasional,
        SUM(t2b5.jml_wirausaha) AS jml_wirausaha,
        MAX(t2b5.deleted_at) as deleted_at,
        -- Data dari tabel 2B4 (Aggregated)
        SUM(t2b4.jumlah_lulusan) AS jumlah_lulusan,
        SUM(t2b4.jumlah_terlacak) AS jumlah_terlacak,
        AVG(t2b4.rata_rata_waktu_tunggu_bulan) AS rata_rata_waktu_tunggu_bulan
      FROM tabel_2b5_kesesuaian_kerja t2b5
      LEFT JOIN tahun_akademik ta ON t2b5.id_tahun_lulus = ta.id_tahun
      LEFT JOIN (
        SELECT id_tahun_lulus, 
               SUM(jumlah_lulusan) as jumlah_lulusan, 
               SUM(jumlah_terlacak) as jumlah_terlacak,
               AVG(rata_rata_waktu_tunggu_bulan) as rata_rata_waktu_tunggu_bulan
        FROM tabel_2b4_masa_tunggu 
        WHERE deleted_at IS NULL
        GROUP BY id_tahun_lulus
      ) t2b4 ON t2b5.id_tahun_lulus = t2b4.id_tahun_lulus
      ${filteredWhere.length ? `WHERE ${filteredWhere.join(' AND ')}` : ''}
      GROUP BY t2b5.id_tahun_lulus
      ORDER BY ta.tahun DESC
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listTabel2b5KesesuaianKerja:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// === DETAIL TABEL 2B5 KESESUAIAN KERJA ===
export const getTabel2b5KesesuaianKerjaById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t2b5.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_lulus,
              t2b4.jumlah_lulusan, t2b4.jumlah_terlacak, t2b4.rata_rata_waktu_tunggu_bulan
       FROM tabel_2b5_kesesuaian_kerja t2b5
       LEFT JOIN unit_kerja uk ON t2b5.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b5.id_tahun_lulus = ta.id_tahun
       LEFT JOIN (
         SELECT id_tahun_lulus, SUM(jumlah_lulusan) as jumlah_lulusan, SUM(jumlah_terlacak) as jumlah_terlacak, AVG(rata_rata_waktu_tunggu_bulan) as rata_rata_waktu_tunggu_bulan
         FROM tabel_2b4_masa_tunggu WHERE deleted_at IS NULL GROUP BY id_tahun_lulus
       ) t2b4 ON t2b5.id_tahun_lulus = t2b4.id_tahun_lulus
       WHERE t2b5.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getTabel2b5KesesuaianKerjaById:", err);
    res.status(500).json({ error: 'Get failed' });
  }
};

// === CREATE TABEL 2B5 KESESUAIAN KERJA ===
export const createTabel2b5KesesuaianKerja = async (req, res) => {
  try {
    const {
      id_unit_prodi,
      id_tahun_lulus,
      jml_infokom,
      jml_non_infokom,
      jml_internasional,
      jml_nasional,
      jml_wirausaha
    } = req.body;

    if (!id_tahun_lulus) {
      return res.status(400).json({ error: 'Field `id_tahun_lulus` wajib diisi.' });
    }

    // Validasi jumlah secara UNIFIED (terhadap total 2B.4 di tahun tersebut)
    const [tabel2b4Data] = await pool.query(
      `SELECT SUM(jumlah_terlacak) as jumlah_terlacak FROM tabel_2b4_masa_tunggu 
       WHERE id_tahun_lulus = ? AND deleted_at IS NULL`,
      [id_tahun_lulus]
    );

    if (tabel2b4Data.length > 0) {
      const jumlahTerlacak = tabel2b4Data[0].jumlah_terlacak || 0;

      const totalProfesi = (jml_infokom || 0) + (jml_non_infokom || 0);
      const totalLingkup = (jml_internasional || 0) + (jml_nasional || 0) + (jml_wirausaha || 0);

      if (totalProfesi > jumlahTerlacak) {
        return res.status(400).json({
          error: `Total Profesi (${totalProfesi}) tidak boleh lebih dari jumlah lulusan terlacak (${jumlahTerlacak}).`
        });
      }

      if (totalLingkup > jumlahTerlacak) {
        return res.status(400).json({
          error: `Total Lingkup Kerja (${totalLingkup}) tidak boleh lebih dari jumlah lulusan terlacak (${jumlahTerlacak}).`
        });
      }
    }

    const data = {
      // [FIX] Menggunakan req.user.id_unit sesuai payload JWT
      id_unit_prodi: req.user?.id_unit || id_unit_prodi || 1,
      id_tahun_lulus: id_tahun_lulus,
      jml_infokom: jml_infokom || 0,
      jml_non_infokom: jml_non_infokom || 0,
      jml_internasional: jml_internasional || 0,
      jml_nasional: jml_nasional || 0,
      jml_wirausaha: jml_wirausaha || 0,
    };

    if (await hasColumn('tabel_2b5_kesesuaian_kerja', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO tabel_2b5_kesesuaian_kerja SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT t2b5.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_lulus
       FROM tabel_2b5_kesesuaian_kerja t2b5
       LEFT JOIN unit_kerja uk ON t2b5.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b5.id_tahun_lulus = ta.id_tahun
       WHERE t2b5.id = ?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createTabel2b5KesesuaianKerja:", err);
    res.status(500).json({ error: 'Create failed' });
  }
};

// === UPDATE TABEL 2B5 KESESUAIAN KERJA ===
export const updateTabel2b5KesesuaianKerja = async (req, res) => {
  try {
    const {
      id_unit_prodi,
      id_tahun_lulus,
      jml_infokom,
      jml_non_infokom,
      jml_internasional,
      jml_nasional,
      jml_wirausaha
    } = req.body;

    // Validasi jumlah UNIFIED
    if (id_tahun_lulus) {
      const [tabel2b4Data] = await pool.query(
        `SELECT SUM(jumlah_terlacak) as jumlah_terlacak FROM tabel_2b4_masa_tunggu 
         WHERE id_tahun_lulus = ? AND deleted_at IS NULL`,
        [id_tahun_lulus]
      );

      if (tabel2b4Data.length > 0) {
        const jumlahTerlacak = tabel2b4Data[0].jumlah_terlacak || 0;

        const totalProfesi = (jml_infokom || 0) + (jml_non_infokom || 0);
        const totalLingkup = (jml_internasional || 0) + (jml_nasional || 0) + (jml_wirausaha || 0);

        if (totalProfesi > jumlahTerlacak) {
          return res.status(400).json({
            error: `Total Profesi (${totalProfesi}) tidak boleh lebih dari jumlah lulusan terlacak (${jumlahTerlacak}).`
          });
        }

        if (totalLingkup > jumlahTerlacak) {
          return res.status(400).json({
            error: `Total Lingkup Kerja (${totalLingkup}) tidak boleh lebih dari jumlah lulusan terlacak (${jumlahTerlacak}).`
          });
        }
      }
    }

    const data = {
      id_unit_prodi: req.user?.id_unit || id_unit_prodi,
      id_tahun_lulus: id_tahun_lulus,
      jml_infokom: jml_infokom,
      jml_non_infokom: jml_non_infokom,
      jml_internasional: jml_internasional,
      jml_nasional: jml_nasional,
      jml_wirausaha: jml_wirausaha,
    };

    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Tidak ada data untuk diupdate.' });
    }

    if (await hasColumn('tabel_2b5_kesesuaian_kerja', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(`UPDATE tabel_2b5_kesesuaian_kerja SET ? WHERE id = ?`, [data, req.params.id]);
    const [row] = await pool.query(
      `SELECT t2b5.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_lulus
       FROM tabel_2b5_kesesuaian_kerja t2b5
       LEFT JOIN unit_kerja uk ON t2b5.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b5.id_tahun_lulus = ta.id_tahun
       WHERE t2b5.id = ?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateTabel2b5KesesuaianKerja:", err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// === SOFT DELETE ===
export const softDeleteTabel2b5KesesuaianKerja = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_2b5_kesesuaian_kerja', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(`UPDATE tabel_2b5_kesesuaian_kerja SET ? WHERE id = ?`, [payload, req.params.id]);
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("Error softDeleteTabel2b5KesesuaianKerja:", err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

// === RESTORE ===
export const restoreTabel2b5KesesuaianKerja = async (req, res) => {
  try {
    await pool.query(`UPDATE tabel_2b5_kesesuaian_kerja SET deleted_at=NULL, deleted_by=NULL WHERE id=?`, [req.params.id]);
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreTabel2b5KesesuaianKerja:", err);
    res.status(500).json({ error: 'Restore failed' });
  }
};

// === HARD DELETE ===
export const hardDeleteTabel2b5KesesuaianKerja = async (req, res) => {
  try {
    await pool.query(`DELETE FROM tabel_2b5_kesesuaian_kerja WHERE id=?`, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error("Error hardDeleteTabel2b5KesesuaianKerja:", err);
    res.status(500).json({ error: 'Hard delete failed' });
  }
};

// === VALIDASI JUMLAH (UNIFIED) ===
export const validateJumlahTabel2b5 = async (req, res) => {
  try {
    const { id_tahun_lulus, jml_infokom, jml_non_infokom, jml_internasional, jml_nasional, jml_wirausaha } = req.query;

    if (!id_tahun_lulus) {
      return res.status(400).json({ error: 'Field `id_tahun_lulus` wajib diisi.' });
    }

    // Ambil data UNIFIED dari tabel 2.B.4
    const [tabel2b4Data] = await pool.query(
      `SELECT SUM(jumlah_terlacak) as jumlah_terlacak FROM tabel_2b4_masa_tunggu 
       WHERE id_tahun_lulus = ? AND deleted_at IS NULL`,
      [id_tahun_lulus]
    );

    const jumlahTerlacak = tabel2b4Data[0]?.jumlah_terlacak || 0;
    const totalInput = (parseInt(jml_infokom) || 0) + (parseInt(jml_non_infokom) || 0) +
      (parseInt(jml_internasional) || 0) + (parseInt(jml_nasional) || 0) +
      (parseInt(jml_wirausaha) || 0);

    const valid = totalInput <= jumlahTerlacak;

    res.json({
      jumlah_terlacak: jumlahTerlacak,
      total_input: totalInput,
      valid: valid,
      message: valid ?
        `Valid! Total ${totalInput} tidak melebihi total terlacak ${jumlahTerlacak}` :
        `Tidak valid! Total ${totalInput} melebihi total terlacak ${jumlahTerlacak}`
    });
  } catch (err) {
    console.error("Error validateJumlahTabel2b5:", err);
    res.status(500).json({ error: 'Validation failed' });
  }
};

// === SUMMARY DATA (UNIFIED) ===
export const summaryTabel2b5KesesuaianKerja = async (req, res) => {
  try {
    const { id_tahun_lulus } = req.query;

    let sql = `
      SELECT 
        'Seluruh Program Studi' AS nama_unit_prodi,
        ta.tahun AS tahun_lulus,
        SUM(t2b5.jml_infokom) AS total_infokom,
        SUM(t2b5.jml_non_infokom) AS total_non_infokom,
        SUM(t2b5.jml_internasional) AS total_internasional,
        SUM(t2b5.jml_nasional) AS total_nasional,
        SUM(t2b5.jml_wirausaha) AS total_wirausaha,
        COUNT(t2b5.id) AS jumlah_data,
        -- Data dari tabel 2B4 (Aggregated)
        SUM(t2b4.jumlah_lulusan) AS total_jumlah_lulusan,
        SUM(t2b4.jumlah_terlacak) AS total_jumlah_terlacak,
        AVG(t2b4.rata_rata_waktu_tunggu_bulan) AS rata_rata_tunggu_keseluruhan
      FROM tabel_2b5_kesesuaian_kerja t2b5
      LEFT JOIN tahun_akademik ta ON t2b5.id_tahun_lulus = ta.id_tahun
      LEFT JOIN (
        SELECT id_tahun_lulus, SUM(jumlah_lulusan) as jumlah_lulusan, SUM(jumlah_terlacak) as jumlah_terlacak, AVG(rata_rata_waktu_tunggu_bulan) as rata_rata_waktu_tunggu_bulan
        FROM tabel_2b4_masa_tunggu WHERE deleted_at IS NULL GROUP BY id_tahun_lulus
      ) t2b4 ON t2b5.id_tahun_lulus = t2b4.id_tahun_lulus
      WHERE t2b5.deleted_at IS NULL
    `;

    const params = [];
    if (id_tahun_lulus) {
      sql += ` AND t2b5.id_tahun_lulus = ?`;
      params.push(id_tahun_lulus);
    }

    sql += ` GROUP BY t2b5.id_tahun_lulus ORDER BY ta.tahun DESC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error summaryTabel2b5KesesuaianKerja:", err);
    res.status(500).json({ error: 'Summary failed' });
  }
};
