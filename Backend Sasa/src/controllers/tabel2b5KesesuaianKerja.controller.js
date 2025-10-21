import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// === LIST TABEL 2B5 KESESUAIAN KERJA ===
export const listTabel2b5KesesuaianKerja = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tabel_2b5_kesesuaian_kerja', 't2b5');
    const orderBy = buildOrderBy(req.query?.order_by, 'id', 't2b5');

    const sql = `
      SELECT 
        t2b5.id,
        t2b5.id_unit_prodi,
        uk.nama_unit AS nama_unit_prodi,
        t2b5.id_tahun_lulus,
        ta.tahun AS tahun_lulus,
        t2b5.jml_infokom,
        t2b5.jml_non_infokom,
        t2b5.jml_internasional,
        t2b5.jml_nasional,
        t2b5.jml_wirausaha,
        t2b5.deleted_at,
        -- Data dari tabel 2B4 (Masa Tunggu)
        t2b4.jumlah_lulusan,
        t2b4.jumlah_terlacak,
        t2b4.rata_rata_waktu_tunggu_bulan
      FROM tabel_2b5_kesesuaian_kerja t2b5
      LEFT JOIN unit_kerja uk ON t2b5.id_unit_prodi = uk.id_unit
      LEFT JOIN tahun_akademik ta ON t2b5.id_tahun_lulus = ta.id_tahun
      LEFT JOIN tabel_2b4_masa_tunggu t2b4 ON t2b5.id_unit_prodi = t2b4.id_unit_prodi 
        AND t2b5.id_tahun_lulus = t2b4.id_tahun_lulus 
        AND t2b4.deleted_at IS NULL
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
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
       LEFT JOIN tabel_2b4_masa_tunggu t2b4 ON t2b5.id_unit_prodi = t2b4.id_unit_prodi 
         AND t2b5.id_tahun_lulus = t2b4.id_tahun_lulus 
         AND t2b4.deleted_at IS NULL
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

    if (!id_unit_prodi || !id_tahun_lulus) {
      return res.status(400).json({ error: 'Field `id_unit_prodi` dan `id_tahun_lulus` wajib diisi.' });
    }

    // Validasi jumlah tidak boleh lebih dari jumlah terlacak di tabel 2.B.4
    const [tabel2b4Data] = await pool.query(
      `SELECT jumlah_terlacak FROM tabel_2b4_masa_tunggu 
       WHERE id_unit_prodi = ? AND id_tahun_lulus = ? AND deleted_at IS NULL`,
      [id_unit_prodi, id_tahun_lulus]
    );

    if (tabel2b4Data.length > 0) {
      const jumlahTerlacak = tabel2b4Data[0].jumlah_terlacak;
      const totalInput = (jml_infokom || 0) + (jml_non_infokom || 0) + (jml_internasional || 0) + (jml_nasional || 0) + (jml_wirausaha || 0);
      
      if (totalInput > jumlahTerlacak) {
        return res.status(400).json({ 
          error: `Total jumlah (${totalInput}) tidak boleh lebih dari jumlah terlacak di tabel 2.B.4 (${jumlahTerlacak}).` 
        });
      }
    }

    const data = {
      id_unit_prodi: id_unit_prodi,
      id_tahun_lulus: id_tahun_lulus,
      jml_infokom: jml_infokom || 0,
      jml_non_infokom: jml_non_infokom || 0,
      jml_internasional: jml_internasional || 0,
      jml_nasional: jml_nasional || 0,
      jml_wirausaha: jml_wirausaha || 0,
    };

    // multi-prodi aware - khusus untuk role kemahasiswaan
    if (!data.id_unit_prodi && req.user?.role === 'kemahasiswaan') {
      data.id_unit_prodi = req.user.id_unit_prodi;
    }

    if (!data.id_unit_prodi) {
      return res.status(400).json({ error: 'Field `id_unit_prodi` wajib diisi.' });
    }

    if (await hasColumn('tabel_2b5_kesesuaian_kerja', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO tabel_2b5_kesesuaian_kerja SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT t2b5.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_lulus,
              t2b4.jumlah_lulusan, t2b4.jumlah_terlacak, t2b4.rata_rata_waktu_tunggu_bulan
       FROM tabel_2b5_kesesuaian_kerja t2b5
       LEFT JOIN unit_kerja uk ON t2b5.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b5.id_tahun_lulus = ta.id_tahun
       LEFT JOIN tabel_2b4_masa_tunggu t2b4 ON t2b5.id_unit_prodi = t2b4.id_unit_prodi 
         AND t2b5.id_tahun_lulus = t2b4.id_tahun_lulus 
         AND t2b4.deleted_at IS NULL
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

    // Validasi jumlah tidak boleh lebih dari jumlah terlacak di tabel 2.B.4
    if (id_unit_prodi && id_tahun_lulus) {
      const [tabel2b4Data] = await pool.query(
        `SELECT jumlah_terlacak FROM tabel_2b4_masa_tunggu 
         WHERE id_unit_prodi = ? AND id_tahun_lulus = ? AND deleted_at IS NULL`,
        [id_unit_prodi, id_tahun_lulus]
      );

      if (tabel2b4Data.length > 0) {
        const jumlahTerlacak = tabel2b4Data[0].jumlah_terlacak;
        const totalInput = (jml_infokom || 0) + (jml_non_infokom || 0) + (jml_internasional || 0) + (jml_nasional || 0) + (jml_wirausaha || 0);
        
        if (totalInput > jumlahTerlacak) {
          return res.status(400).json({ 
            error: `Total jumlah (${totalInput}) tidak boleh lebih dari jumlah terlacak di tabel 2.B.4 (${jumlahTerlacak}).` 
          });
        }
      }
    }

    const data = {
      id_unit_prodi: id_unit_prodi,
      id_tahun_lulus: id_tahun_lulus,
      jml_infokom: jml_infokom,
      jml_non_infokom: jml_non_infokom,
      jml_internasional: jml_internasional,
      jml_nasional: jml_nasional,
      jml_wirausaha: jml_wirausaha,
    };

    // Hapus properti yang tidak didefinisikan agar tidak menimpa data yang ada dengan NULL
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Tidak ada data untuk diupdate.' });
    }

    if (await hasColumn('tabel_2b5_kesesuaian_kerja', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(`UPDATE tabel_2b5_kesesuaian_kerja SET ? WHERE id = ?`, [data, req.params.id]);
    const [row] = await pool.query(
      `SELECT t2b5.*, uk.nama_unit AS nama_unit_prodi, ta.tahun AS tahun_lulus,
              t2b4.jumlah_lulusan, t2b4.jumlah_terlacak, t2b4.rata_rata_waktu_tunggu_bulan
       FROM tabel_2b5_kesesuaian_kerja t2b5
       LEFT JOIN unit_kerja uk ON t2b5.id_unit_prodi = uk.id_unit
       LEFT JOIN tahun_akademik ta ON t2b5.id_tahun_lulus = ta.id_tahun
       LEFT JOIN tabel_2b4_masa_tunggu t2b4 ON t2b5.id_unit_prodi = t2b4.id_unit_prodi 
         AND t2b5.id_tahun_lulus = t2b4.id_tahun_lulus 
         AND t2b4.deleted_at IS NULL
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

// === VALIDASI JUMLAH ===
export const validateJumlahTabel2b5 = async (req, res) => {
  try {
    const { id_unit_prodi, id_tahun_lulus, jml_infokom, jml_non_infokom, jml_internasional, jml_nasional, jml_wirausaha } = req.query;
    
    if (!id_unit_prodi || !id_tahun_lulus) {
      return res.status(400).json({ error: 'Field `id_unit_prodi` dan `id_tahun_lulus` wajib diisi.' });
    }

    // Ambil data dari tabel 2.B.4
    const [tabel2b4Data] = await pool.query(
      `SELECT jumlah_terlacak FROM tabel_2b4_masa_tunggu 
       WHERE id_unit_prodi = ? AND id_tahun_lulus = ? AND deleted_at IS NULL`,
      [id_unit_prodi, id_tahun_lulus]
    );

    if (tabel2b4Data.length === 0) {
      return res.status(404).json({ 
        error: 'Data tidak ditemukan di tabel 2.B.4 untuk unit prodi dan tahun lulus tersebut.',
        jumlah_terlacak: 0,
        total_input: 0,
        valid: false
      });
    }

    const jumlahTerlacak = tabel2b4Data[0].jumlah_terlacak;
    const totalInput = (parseInt(jml_infokom) || 0) + (parseInt(jml_non_infokom) || 0) + 
                      (parseInt(jml_internasional) || 0) + (parseInt(jml_nasional) || 0) + 
                      (parseInt(jml_wirausaha) || 0);
    
    const valid = totalInput <= jumlahTerlacak;

    res.json({
      jumlah_terlacak: jumlahTerlacak,
      total_input: totalInput,
      valid: valid,
      message: valid ? 
        `Valid! Total ${totalInput} tidak melebihi jumlah terlacak ${jumlahTerlacak}` : 
        `Tidak valid! Total ${totalInput} melebihi jumlah terlacak ${jumlahTerlacak}`
    });
  } catch (err) {
    console.error("Error validateJumlahTabel2b5:", err);
    res.status(500).json({ error: 'Validation failed' });
  }
};

// === SUMMARY DATA ===
export const summaryTabel2b5KesesuaianKerja = async (req, res) => {
  try {
    const { id_unit_prodi, id_tahun_lulus } = req.query;
    
    let sql = `
      SELECT 
        uk.nama_unit AS nama_unit_prodi,
        ta.tahun AS tahun_lulus,
        SUM(t2b5.jml_infokom) AS total_infokom,
        SUM(t2b5.jml_non_infokom) AS total_non_infokom,
        SUM(t2b5.jml_internasional) AS total_internasional,
        SUM(t2b5.jml_nasional) AS total_nasional,
        SUM(t2b5.jml_wirausaha) AS total_wirausaha,
        COUNT(t2b5.id) AS jumlah_data,
        -- Data dari tabel 2B4
        SUM(t2b4.jumlah_lulusan) AS total_jumlah_lulusan,
        SUM(t2b4.jumlah_terlacak) AS total_jumlah_terlacak,
        AVG(t2b4.rata_rata_waktu_tunggu_bulan) AS rata_rata_tunggu_keseluruhan
      FROM tabel_2b5_kesesuaian_kerja t2b5
      LEFT JOIN unit_kerja uk ON t2b5.id_unit_prodi = uk.id_unit
      LEFT JOIN tahun_akademik ta ON t2b5.id_tahun_lulus = ta.id_tahun
      LEFT JOIN tabel_2b4_masa_tunggu t2b4 ON t2b5.id_unit_prodi = t2b4.id_unit_prodi 
        AND t2b5.id_tahun_lulus = t2b4.id_tahun_lulus 
        AND t2b4.deleted_at IS NULL
      WHERE t2b5.deleted_at IS NULL
    `;
    
    const params = [];
    
    if (id_unit_prodi) {
      sql += ` AND t2b5.id_unit_prodi = ?`;
      params.push(id_unit_prodi);
    }
    
    if (id_tahun_lulus) {
      sql += ` AND t2b5.id_tahun_lulus = ?`;
      params.push(id_tahun_lulus);
    }
    
    sql += ` GROUP BY t2b5.id_unit_prodi, t2b5.id_tahun_lulus ORDER BY ta.tahun DESC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error summaryTabel2b5KesesuaianKerja:", err);
    res.status(500).json({ error: 'Summary failed' });
  }
};
