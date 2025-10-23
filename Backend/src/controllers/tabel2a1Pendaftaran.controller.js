import { pool } from '../db.js';

// ===== CRUD =====
export const listPendaftaran = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM tabel_2a1_pendaftaran
      WHERE deleted_at IS NULL
      ORDER BY id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("listPendaftaran error:", err);
    res.status(500).json({ error: "List failed" });
  }
};

export const getPendaftaranById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM tabel_2a1_pendaftaran WHERE id = ? AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Get failed" });
  }
};

export const createPendaftaran = async (req, res) => {
  try {
    const data = {
      id_unit_prodi: req.body.id_unit_prodi,
      id_tahun: req.body.id_tahun,
      daya_tampung: req.body.daya_tampung || 0,
      pendaftar: req.body.pendaftar || 0,
      pendaftar_afirmasi: req.body.pendaftar_afirmasi || 0,
      pendaftar_kebutuhan_khusus: req.body.pendaftar_kebutuhan_khusus || 0
    };
    const [r] = await pool.query(`INSERT INTO tabel_2a1_pendaftaran SET ?`, [data]);
    const [row] = await pool.query(`SELECT * FROM tabel_2a1_pendaftaran WHERE id = ?`, [r.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    res.status(500).json({ error: "Create failed" });
  }
};

export const updatePendaftaran = async (req, res) => {
  try {
    const data = {
      daya_tampung: req.body.daya_tampung,
      pendaftar: req.body.pendaftar,
      pendaftar_afirmasi: req.body.pendaftar_afirmasi,
      pendaftar_kebutuhan_khusus: req.body.pendaftar_kebutuhan_khusus
    };
    await pool.query(`UPDATE tabel_2a1_pendaftaran SET ? WHERE id = ?`, [data, req.params.id]);
    const [row] = await pool.query(`SELECT * FROM tabel_2a1_pendaftaran WHERE id = ?`, [req.params.id]);
    if (!row.length) return res.status(404).json({ error: "Not found" });
    res.json(row[0]);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};

export const softDeletePendaftaran = async (req, res) => {
  try {
    await pool.query(
      `UPDATE tabel_2a1_pendaftaran SET deleted_at = NOW(), deleted_by = ? WHERE id = ?`,
      [req.user?.id_user || null, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

export const restorePendaftaran = async (req, res) => {
  try {
    await pool.query(
      `UPDATE tabel_2a1_pendaftaran SET deleted_at=NULL, deleted_by=NULL WHERE id=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    res.status(500).json({ error: "Restore failed" });
  }
};

export const hardDeletePendaftaran = async (req, res) => {
  try {
    await pool.query(`DELETE FROM tabel_2a1_pendaftaran WHERE id=?`, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    res.status(500).json({ error: "Hard delete failed" });
  }
};
