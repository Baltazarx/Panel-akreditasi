import { pool } from "../db.js";
import { buildWhere, buildOrderBy, hasColumn } from "../utils/queryHelper.js";

// ===== LIST =====
export const listKeragamanAsal = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, "tabel_2a2_keragaman_asal", "ka");
    const orderBy = buildOrderBy(req.query?.order_by, "id", "ka");

    const sql = `
    SELECT 
        ka.id,
        ka.id_unit_prodi,
        uk.nama_unit AS nama_prodi,
        ka.id_tahun,
        t.tahun AS tahun_akademik,
        ka.nama_daerah_input,
        ka.kategori_geografis,
        ka.is_afirmasi,
        ka.is_kebutuhan_khusus,
        ka.jumlah_mahasiswa,
        ka.link_bukti,
        rp.nama_provinsi,
        rk.nama_kabupaten_kota,
        ka.deleted_at
    FROM tabel_2a2_keragaman_asal ka
    JOIN unit_kerja uk ON uk.id_unit = ka.id_unit_prodi
    JOIN tahun_akademik t ON t.id_tahun = ka.id_tahun
    LEFT JOIN ref_kabupaten_kota rk ON rk.nama_kabupaten_kota = ka.nama_daerah_input
    LEFT JOIN ref_provinsi rp ON rp.id_provinsi = rk.id_provinsi
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY ka.id DESC
    `;


    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listKeragamanAsal:", err);
    res.status(500).json({ error: "List failed" });
  }
};

// ===== GET BY ID =====
export const getKeragamanAsalById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM tabel_2a2_keragaman_asal WHERE id=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Get failed" });
  }
};

// ===== CREATE =====
export const createKeragamanAsal = async (req, res) => {
  try {
    const data = {
      id_unit_prodi: req.body.id_unit_prodi,
      id_tahun: req.body.id_tahun,
      nama_daerah_input: req.body.nama_daerah_input,
      kategori_geografis: req.body.kategori_geografis,
      is_afirmasi: req.body.is_afirmasi || false,
      is_kebutuhan_khusus: req.body.is_kebutuhan_khusus || false,
      jumlah_mahasiswa: req.body.jumlah_mahasiswa || 0,
      link_bukti: req.body.link_bukti || null,
    };

    if (await hasColumn("tabel_2a2_keragaman_asal", "created_by") && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO tabel_2a2_keragaman_asal SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM tabel_2a2_keragaman_asal WHERE id=?`,
      [r.insertId]
    );

    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createKeragamanAsal:", err);
    res.status(500).json({ error: "Create failed" });
  }
};

// ===== UPDATE =====
export const updateKeragamanAsal = async (req, res) => {
  try {
    const data = {
      id_unit_prodi: req.body.id_unit_prodi,
      id_tahun: req.body.id_tahun,
      nama_daerah_input: req.body.nama_daerah_input,
      kategori_geografis: req.body.kategori_geografis,
      is_afirmasi: req.body.is_afirmasi || false,
      is_kebutuhan_khusus: req.body.is_kebutuhan_khusus || false,
      jumlah_mahasiswa: req.body.jumlah_mahasiswa || 0,
      link_bukti: req.body.link_bukti || null,
    };

    if (await hasColumn("tabel_2a2_keragaman_asal", "updated_by") && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(`UPDATE tabel_2a2_keragaman_asal SET ? WHERE id=?`, [
      data,
      req.params.id,
    ]);

    const [row] = await pool.query(
      `SELECT * FROM tabel_2a2_keragaman_asal WHERE id=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: "Not found" });

    res.json(row[0]);
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};

// ===== SOFT DELETE =====
export const softDeleteKeragamanAsal = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn("tabel_2a2_keragaman_asal", "deleted_by")) {
      payload.deleted_by = req.user?.id_user || null;
    }

    await pool.query(`UPDATE tabel_2a2_keragaman_asal SET ? WHERE id=?`, [
      payload,
      req.params.id,
    ]);

    res.json({ ok: true, softDeleted: true });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
};

// ===== RESTORE =====
export const restoreKeragamanAsal = async (req, res) => {
  try {
    await pool.query(
      `UPDATE tabel_2a2_keragaman_asal SET deleted_at=NULL, deleted_by=NULL WHERE id=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch {
    res.status(500).json({ error: "Restore failed" });
  }
};

// ===== HARD DELETE =====
export const hardDeleteKeragamanAsal = async (req, res) => {
  try {
    await pool.query(`DELETE FROM tabel_2a2_keragaman_asal WHERE id=?`, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch {
    res.status(500).json({ error: "Hard delete failed" });
  }
};
