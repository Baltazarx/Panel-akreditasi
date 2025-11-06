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

// List semua kabupaten/kota untuk dropdown
export const listKabupatenKota = async (req, res) => {
  try {
    const q = req.query || {};
    const idProvinsiParam = q.id_provinsi ?? null;
    const searchParam = q.search ?? null;

    let sql = `
      SELECT
        rk.id_kabupaten_kota,
        rk.id_provinsi,
        rk.nama_kabupaten_kota AS nama_kabupaten_kota,
        rp.nama_provinsi AS nama_provinsi
      FROM ref_kabupaten_kota rk
      LEFT JOIN ref_provinsi rp ON rk.id_provinsi = rp.id_provinsi
    `;
    const where = [];
    const params = [];

    if (idProvinsiParam) {
      where.push('rk.id_provinsi = ?');
      params.push(idProvinsiParam);
    }

    if (searchParam) {
      where.push('(rk.nama_kabupaten_kota LIKE ? OR rp.nama_provinsi LIKE ?)');
      params.push(`%${searchParam}%`, `%${searchParam}%`);
    }

    if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
    sql += ` ORDER BY rk.nama_kabupaten_kota ASC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listKabupatenKota:", err);
    res.status(500).json({ error: 'Gagal memuat data kabupaten/kota' });
  }
};