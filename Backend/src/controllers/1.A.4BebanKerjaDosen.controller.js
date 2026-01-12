import { pool } from "../db.js";
import { hasColumn } from "../utils/queryHelper.js";

// ===== LIST (agregasi rata-rata per dosen) =====
export async function listBebanKerjaDosen(req, res) {
  try {
    const { id_tahun, include_deleted } = req.query;

    let where = "1=1";
    if (id_tahun) {
      where += ` AND bkd.id_tahun = ${pool.escape(id_tahun)}`;
    }
    if (!include_deleted) {
      where += " AND bkd.deleted_at IS NULL";
    }

    const sql = `
      SELECT 
        bkd.id_beban_kerja,
        bkd.id_dosen,
        p.nama_lengkap,
        bkd.id_tahun,
        -- [UPDATED] Use separate columns and calculate total on the fly
        (bkd.sks_pengajaran_ps_sendiri + bkd.sks_pengajaran_ps_lain_pt_sendiri + bkd.sks_pengajaran_pt_lain) AS sks_pengajaran,
        bkd.sks_pengajaran_ps_sendiri,
        bkd.sks_pengajaran_ps_lain_pt_sendiri,
        bkd.sks_pengajaran_pt_lain,
        bkd.sks_penelitian,
        bkd.sks_pkm,
        (bkd.sks_manajemen_pt_sendiri + bkd.sks_manajemen_pt_lain) AS sks_manajemen,
        bkd.sks_manajemen_pt_sendiri,
        bkd.sks_manajemen_pt_lain,
        (
          bkd.sks_pengajaran_ps_sendiri + bkd.sks_pengajaran_ps_lain_pt_sendiri + bkd.sks_pengajaran_pt_lain + 
          bkd.sks_penelitian + 
          bkd.sks_pkm + 
          bkd.sks_manajemen_pt_sendiri + bkd.sks_manajemen_pt_lain
        ) AS total_sks,
        bkd.deleted_at,
        bkd.deleted_by,
        bkd.created_at,
        bkd.updated_at
      FROM beban_kerja_dosen bkd
      JOIN dosen d ON d.id_dosen = bkd.id_dosen
      JOIN pegawai p ON p.id_pegawai = d.id_pegawai   -- ✅ fix relasi
      WHERE ${where}
      ORDER BY p.nama_lengkap ASC
    `;

    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Error listBebanKerjaDosen:", err);
    res.status(500).json({ error: "List Beban Kerja Dosen gagal" });
  }
}


// ===== GET BY ID (detail semua tahun, dengan total per tahun) =====
export const getBebanKerjaDosenById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          b.id_beban_kerja,
          b.id_dosen,
          b.id_tahun,
          -- [UPDATED] Use separate columns
          (b.sks_pengajaran_ps_sendiri + b.sks_pengajaran_ps_lain_pt_sendiri + b.sks_pengajaran_pt_lain) AS sks_pengajaran,
          b.sks_pengajaran_ps_sendiri,
          b.sks_pengajaran_ps_lain_pt_sendiri,
          b.sks_pengajaran_pt_lain,
          b.sks_penelitian,
          b.sks_pkm,
          (b.sks_manajemen_pt_sendiri + b.sks_manajemen_pt_lain) AS sks_manajemen,
          b.sks_manajemen_pt_sendiri,
          b.sks_manajemen_pt_lain,
          (
            b.sks_pengajaran_ps_sendiri + b.sks_pengajaran_ps_lain_pt_sendiri + b.sks_pengajaran_pt_lain + 
            b.sks_penelitian + 
            b.sks_pkm + 
            b.sks_manajemen_pt_sendiri + b.sks_manajemen_pt_lain
          ) AS total_sks,
          p.nama_lengkap, 
          u.id_unit, 
          uk.nama_unit
       FROM beban_kerja_dosen b
       JOIN dosen d   ON b.id_dosen = d.id_dosen
       JOIN pegawai p ON d.id_pegawai = p.id_pegawai
       LEFT JOIN users u ON u.id_pegawai = p.id_pegawai
       LEFT JOIN unit_kerja uk ON u.id_unit = uk.id_unit
       WHERE b.id_dosen=? AND b.deleted_at IS NULL
       ORDER BY b.id_tahun ASC`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows);
  } catch (err) {
    console.error("Error getBebanKerjaDosenById:", err);
    res.status(500).json({ error: "Get failed" });
  }
};

// ===== GET SUMMARY (rekap rata-rata per tahun semua dosen) =====
export const getBebanKerjaSummary = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          b.id_tahun,
          AVG(b.sks_pengajaran_ps_sendiri + b.sks_pengajaran_ps_lain_pt_sendiri + b.sks_pengajaran_pt_lain) AS avg_pengajaran,
          AVG(b.sks_penelitian) AS avg_penelitian,
          AVG(b.sks_pkm) AS avg_pkm,
          AVG(b.sks_manajemen_pt_sendiri + b.sks_manajemen_pt_lain) AS avg_manajemen,
          (
            AVG(b.sks_pengajaran_ps_sendiri + b.sks_pengajaran_ps_lain_pt_sendiri + b.sks_pengajaran_pt_lain) + 
            AVG(b.sks_penelitian) + 
            AVG(b.sks_pkm) + 
            AVG(b.sks_manajemen_pt_sendiri + b.sks_manajemen_pt_lain)
          ) AS avg_total
       FROM beban_kerja_dosen b
       WHERE b.deleted_at IS NULL
       GROUP BY b.id_tahun
       ORDER BY b.id_tahun ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error getBebanKerjaSummary:", err);
    res.status(500).json({ error: "Summary failed" });
  }
};

// ===== CREATE =====
export const createBebanKerjaDosen = async (req, res) => {
  try {
    const data = {
      id_dosen: req.body.id_dosen,
      id_tahun: req.body.id_tahun,
      // [UPDATED] Using 5 separate columns instead of totals
      sks_pengajaran_ps_sendiri: req.body.sks_pengajaran_ps_sendiri || 0,
      sks_pengajaran_ps_lain_pt_sendiri: req.body.sks_pengajaran_ps_lain_pt_sendiri || 0,
      sks_pengajaran_pt_lain: req.body.sks_pengajaran_pt_lain || 0,
      sks_penelitian: req.body.sks_penelitian || 0,
      sks_pkm: req.body.sks_pkm || 0,
      sks_manajemen_pt_sendiri: req.body.sks_manajemen_pt_sendiri || 0,
      sks_manajemen_pt_lain: req.body.sks_manajemen_pt_lain || 0,
    };

    if (await hasColumn("beban_kerja_dosen", "created_by") && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO beban_kerja_dosen SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM beban_kerja_dosen WHERE id_beban_kerja=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createBebanKerjaDosen:", err);
    res.status(500).json({ error: "Create failed" });
  }
};

// ===== UPDATE =====
export const updateBebanKerjaDosen = async (req, res) => {
  try {
    const data = {
      id_dosen: req.body.id_dosen,
      id_tahun: req.body.id_tahun,
      // [UPDATED] Using 5 separate columns instead of totals
      sks_pengajaran_ps_sendiri: req.body.sks_pengajaran_ps_sendiri || 0,
      sks_pengajaran_ps_lain_pt_sendiri: req.body.sks_pengajaran_ps_lain_pt_sendiri || 0,
      sks_pengajaran_pt_lain: req.body.sks_pengajaran_pt_lain || 0,
      sks_penelitian: req.body.sks_penelitian || 0,
      sks_pkm: req.body.sks_pkm || 0,
      sks_manajemen_pt_sendiri: req.body.sks_manajemen_pt_sendiri || 0,
      sks_manajemen_pt_lain: req.body.sks_manajemen_pt_lain || 0,
    };

    if (await hasColumn("beban_kerja_dosen", "updated_by") && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE beban_kerja_dosen SET ? WHERE id_beban_kerja=?`,
      [data, req.params.id]
    );
    const [row] = await pool.query(
      `SELECT * FROM beban_kerja_dosen WHERE id_beban_kerja=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: "Not found" });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateBebanKerjaDosen:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

// ===== DELETE (soft/hard) =====
export const softDeleteBebanKerjaDosen = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn("beban_kerja_dosen", "deleted_by")) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE beban_kerja_dosen SET ? WHERE id_beban_kerja=?`,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("Error softDeleteBebanKerjaDosen:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

export const restoreBebanKerjaDosen = async (req, res) => {
  try {
    await pool.query(
      `UPDATE beban_kerja_dosen SET deleted_at=NULL, deleted_by=NULL WHERE id_beban_kerja=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreBebanKerjaDosen:", err);
    res.status(500).json({ error: "Restore failed" });
  }
};

export const restoreMultipleBebanKerjaDosen = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or empty array of IDs" });
    }
    const placeholders = ids.map(() => "?").join(",");
    await pool.query(
      `UPDATE beban_kerja_dosen SET deleted_at=NULL, deleted_by=NULL WHERE id_beban_kerja IN (${placeholders})`,
      ids
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("Error restoreMultipleBebanKerjaDosen:", err);
    res.status(500).json({ error: "Restore multiple failed" });
  }
};

export const hardDeleteBebanKerjaDosen = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM beban_kerja_dosen WHERE id_beban_kerja=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error("Error hardDeleteBebanKerjaDosen:", err);
    res.status(500).json({ error: "Hard delete failed" });
  }
};

// ===== REPORT PLACEHOLDER =====
export const reportBebanKerjaDosen = async (_req, res) => {
  res.status(501).json({ error: "Not Implemented (placeholder)" });
};
