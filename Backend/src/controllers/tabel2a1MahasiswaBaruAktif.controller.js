import { pool } from '../db.js';

// ===== CRUD =====
export const listMahasiswaBaruAktif = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM tabel_2a1_mahasiswa_baru_aktif
      WHERE deleted_at IS NULL
      ORDER BY id ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "List failed" });
  }
};

export const getMahasiswaBaruAktifById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM tabel_2a1_mahasiswa_baru_aktif WHERE id=? AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Get failed" });
  }
};

export const createMahasiswaBaruAktif = async (req, res) => {
  try {
    const data = {
      id_unit_prodi: req.body.id_unit_prodi,
      id_tahun: req.body.id_tahun,
      jenis: req.body.jenis, // baru | aktif
      jalur: req.body.jalur, // reguler | rpl
      jumlah_total: req.body.jumlah_total || 0,
      jumlah_afirmasi: req.body.jumlah_afirmasi || 0,
      jumlah_kebutuhan_khusus: req.body.jumlah_kebutuhan_khusus || 0
    };
    const [r] = await pool.query(`INSERT INTO tabel_2a1_mahasiswa_baru_aktif SET ?`, [data]);
    const [row] = await pool.query(`SELECT * FROM tabel_2a1_mahasiswa_baru_aktif WHERE id=?`, [r.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    res.status(500).json({ error: "Create failed" });
  }
};

export const updateMahasiswaBaruAktif = async (req, res) => {
  try {
    const data = {
      jumlah_total: req.body.jumlah_total,
      jumlah_afirmasi: req.body.jumlah_afirmasi,
      jumlah_kebutuhan_khusus: req.body.jumlah_kebutuhan_khusus
    };
    await pool.query(
      `UPDATE tabel_2a1_mahasiswa_baru_aktif SET ? WHERE id=?`,
      [data, req.params.id]
    );
    const [row] = await pool.query(`SELECT * FROM tabel_2a1_mahasiswa_baru_aktif WHERE id=?`, [req.params.id]);
    if (!row.length) return res.status(404).json({ error: "Not found" });
    res.json(row[0]);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};

export const softDeleteMahasiswaBaruAktif = async (req, res) => {
  try {
    await pool.query(
      `UPDATE tabel_2a1_mahasiswa_baru_aktif SET deleted_at=NOW(), deleted_by=? WHERE id=?`,
      [req.user?.id_user || null, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

export const restoreMahasiswaBaruAktif = async (req, res) => {
  try {
    await pool.query(
      `UPDATE tabel_2a1_mahasiswa_baru_aktif SET deleted_at=NULL, deleted_by=NULL WHERE id=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    res.status(500).json({ error: "Restore failed" });
  }
};

export const hardDeleteMahasiswaBaruAktif = async (req, res) => {
  try {
    await pool.query(`DELETE FROM tabel_2a1_mahasiswa_baru_aktif WHERE id=?`, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    res.status(500).json({ error: "Hard delete failed" });
  }
};
