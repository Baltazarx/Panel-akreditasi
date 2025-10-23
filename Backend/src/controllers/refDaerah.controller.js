// src/controllers/refDaerah.controller.js
import { pool } from "../db.js";

export const searchDaerah = async (req, res) => {
  try {
    const q = (req.query.search || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
    if (!q) return res.json([]);

    const like = `%${q.replace(/\s+/g, "%")}%`;

    // gabung provinsi + kab/kota, format unified
    const sql = `
      SELECT id_provinsi AS id, nama_provinsi AS nama, 'provinsi' AS tipe, NULL AS parent
      FROM ref_provinsi
      WHERE nama_provinsi LIKE ?
      UNION ALL
      SELECT k.id_kabupaten_kota AS id, k.nama_kabupaten_kota AS nama, 'kabupaten_kota' AS tipe, p.nama_provinsi AS parent
      FROM ref_kabupaten_kota k
      JOIN ref_provinsi p ON p.id_provinsi = k.id_provinsi
      WHERE k.nama_kabupaten_kota LIKE ?
      ORDER BY nama ASC
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [like, like, limit]);
    res.json(rows);
  } catch (e) {
    console.error("searchDaerah error:", e);
    res.status(500).json({ error: "Search failed" });
  }
};
