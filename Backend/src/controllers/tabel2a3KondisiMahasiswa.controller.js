import { pool } from '../db.js';

/**
 * ==========================
 * LIST KONDISI MAHASISWA
 * ==========================
 * Menampilkan semua data kondisi mahasiswa, otomatis join
 * ke tabel_2a1_mahasiswa_baru_aktif untuk ambil data baru & aktif.
 */
export const listKondisiMahasiswa = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        km.id,
        combos.id_unit_prodi,
        combos.id_tahun,
        COALESCE(agg.total_baru, 0) AS jml_baru,
        COALESCE(agg.total_aktif, 0) AS jml_aktif,
        COALESCE(km.jml_lulus, 0) AS jml_lulus,
        COALESCE(km.jml_do, 0) AS jml_do,
        km.deleted_at,
        km.deleted_by
      FROM (
        SELECT id_unit_prodi, id_tahun FROM tabel_2a3_kondisi_mahasiswa WHERE deleted_at IS NULL
        UNION
        SELECT id_unit_prodi, id_tahun FROM tabel_2a1_mahasiswa_baru_aktif WHERE deleted_at IS NULL
      ) combos
      LEFT JOIN (
        SELECT
          id_unit_prodi,
          id_tahun,
          SUM(CASE WHEN jenis = 'baru' THEN (jumlah_total + COALESCE(jumlah_afirmasi,0) + COALESCE(jumlah_kebutuhan_khusus,0)) ELSE 0 END) AS total_baru,
          SUM(CASE WHEN jenis = 'aktif' THEN (jumlah_total + COALESCE(jumlah_afirmasi,0) + COALESCE(jumlah_kebutuhan_khusus,0)) ELSE 0 END) AS total_aktif
        FROM tabel_2a1_mahasiswa_baru_aktif
        WHERE deleted_at IS NULL
        GROUP BY id_unit_prodi, id_tahun
      ) agg ON agg.id_unit_prodi = combos.id_unit_prodi AND agg.id_tahun = combos.id_tahun
      LEFT JOIN tabel_2a3_kondisi_mahasiswa km
        ON km.id_unit_prodi = combos.id_unit_prodi 
       AND km.id_tahun = combos.id_tahun
       AND km.deleted_at IS NULL
      ORDER BY combos.id_tahun DESC, combos.id_unit_prodi ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error listKondisiMahasiswa:', err);
    res.status(500).json({ error: 'List failed' });
  }
};

/**
 * ==========================
 * DETAIL BY ID
 * ==========================
 */
export const getKondisiMahasiswaById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        km.*,
        COALESCE(mb.total_baru, 0) AS jml_baru,
        COALESCE(ma.total_aktif, 0) AS jml_aktif
      FROM tabel_2a3_kondisi_mahasiswa km
      LEFT JOIN (
        SELECT 
          id_unit_prodi,
          id_tahun,
          SUM(jumlah_total + COALESCE(jumlah_afirmasi,0) + COALESCE(jumlah_kebutuhan_khusus,0)) AS total_baru
        FROM tabel_2a1_mahasiswa_baru_aktif
        WHERE jenis = 'baru' AND deleted_at IS NULL
        GROUP BY id_unit_prodi, id_tahun
      ) mb ON mb.id_unit_prodi = km.id_unit_prodi AND mb.id_tahun = km.id_tahun
      LEFT JOIN (
        SELECT 
          id_unit_prodi,
          id_tahun,
          SUM(jumlah_total + COALESCE(jumlah_afirmasi,0) + COALESCE(jumlah_kebutuhan_khusus,0)) AS total_aktif
        FROM tabel_2a1_mahasiswa_baru_aktif
        WHERE jenis = 'aktif' AND deleted_at IS NULL
        GROUP BY id_unit_prodi, id_tahun
      ) ma ON ma.id_unit_prodi = km.id_unit_prodi AND ma.id_tahun = km.id_tahun
      WHERE km.id = ?
    `, [req.params.id]);

    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getKondisiMahasiswaById:', err);
    res.status(500).json({ error: 'Get failed' });
  }
};

/**
 * ==========================
 * CREATE — auto sync dari 2A1
 * ==========================
 */
export const createKondisiMahasiswa = async (req, res) => {
  const { id_unit_prodi, id_tahun, jml_lulus, jml_do } = req.body;

  try {
    // Ambil mahasiswa baru dan aktif dari tabel 2A1
    const [rows] = await pool.query(`
      SELECT 
        SUM(CASE WHEN jenis = 'baru' THEN (jumlah_total + COALESCE(jumlah_afirmasi,0) + COALESCE(jumlah_kebutuhan_khusus,0)) ELSE 0 END) AS jml_baru,
        SUM(CASE WHEN jenis = 'aktif' THEN (jumlah_total + COALESCE(jumlah_afirmasi,0) + COALESCE(jumlah_kebutuhan_khusus,0)) ELSE 0 END) AS jml_aktif
      FROM tabel_2a1_mahasiswa_baru_aktif
      WHERE id_unit_prodi = ? AND id_tahun = ? AND deleted_at IS NULL
    `, [id_unit_prodi, id_tahun]);

    const jml_baru = rows[0]?.jml_baru || 0;
    const jml_aktif = rows[0]?.jml_aktif || 0;

    // Insert ke tabel 2A3
    const [result] = await pool.query(`
      INSERT INTO tabel_2a3_kondisi_mahasiswa 
      (id_unit_prodi, id_tahun, jml_baru, jml_aktif, jml_lulus, jml_do)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id_unit_prodi, id_tahun, jml_baru, jml_aktif, jml_lulus || 0, jml_do || 0]);

    res.status(201).json({
      message: 'Data kondisi mahasiswa berhasil ditambahkan',
      id: result.insertId,
      jml_baru,
      jml_aktif
    });
  } catch (err) {
    console.error('Error createKondisiMahasiswa:', err);
    res.status(500).json({ error: 'Gagal menambahkan data kondisi mahasiswa' });
  }
};

/**
 * ==========================
 * UPDATE — auto sync juga
 * ==========================
 */
export const updateKondisiMahasiswa = async (req, res) => {
  try {
    const { id_unit_prodi, id_tahun, jml_lulus, jml_do } = req.body;

    const [rows] = await pool.query(`
      SELECT 
        SUM(CASE WHEN jenis = 'baru' THEN (jumlah_total + COALESCE(jumlah_afirmasi,0) + COALESCE(jumlah_kebutuhan_khusus,0)) ELSE 0 END) AS jml_baru,
        SUM(CASE WHEN jenis = 'aktif' THEN (jumlah_total + COALESCE(jumlah_afirmasi,0) + COALESCE(jumlah_kebutuhan_khusus,0)) ELSE 0 END) AS jml_aktif
      FROM tabel_2a1_mahasiswa_baru_aktif
      WHERE id_unit_prodi = ? AND id_tahun = ? AND deleted_at IS NULL
    `, [id_unit_prodi, id_tahun]);

    const jml_baru = rows[0]?.jml_baru || 0;
    const jml_aktif = rows[0]?.jml_aktif || 0;

    await pool.query(`
      UPDATE tabel_2a3_kondisi_mahasiswa
      SET id_unit_prodi=?, id_tahun=?, jml_baru=?, jml_aktif=?, jml_lulus=?, jml_do=?
      WHERE id=?
    `, [id_unit_prodi, id_tahun, jml_baru, jml_aktif, jml_lulus, jml_do, req.params.id]);

    const [updated] = await pool.query(`
      SELECT * FROM tabel_2a3_kondisi_mahasiswa WHERE id=?
    `, [req.params.id]);

    res.json(updated[0]);
  } catch (err) {
    console.error('Error updateKondisiMahasiswa:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

/**
 * ==========================
 * DELETE / RESTORE
 * ==========================
 */
export const softDeleteKondisiMahasiswa = async (req, res) => {
  try {
    const payload = { deleted_at: new Date(), deleted_by: req.user?.id_user || null };
    await pool.query(`UPDATE tabel_2a3_kondisi_mahasiswa SET ? WHERE id=?`, [payload, req.params.id]);
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error('Error softDeleteKondisiMahasiswa:', err);
    res.status(500).json({ error: 'Soft delete failed' });
  }
};

export const restoreKondisiMahasiswa = async (req, res) => {
  try {
    await pool.query(`
      UPDATE tabel_2a3_kondisi_mahasiswa 
      SET deleted_at=NULL, deleted_by=NULL 
      WHERE id=?
    `, [req.params.id]);
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error('Error restoreKondisiMahasiswa:', err);
    res.status(500).json({ error: 'Restore failed' });
  }
};

export const hardDeleteKondisiMahasiswa = async (req, res) => {
  try {
    await pool.query(`
      DELETE FROM tabel_2a3_kondisi_mahasiswa WHERE id=?
    `, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error('Error hardDeleteKondisiMahasiswa:', err);
    res.status(500).json({ error: 'Hard delete failed' });
  }
};
