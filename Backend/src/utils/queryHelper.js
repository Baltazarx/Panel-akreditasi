// src/utils/queryHelper.js
import { pool } from "../db.js";

/**
 * Cek apakah tabel punya kolom tertentu
 */
export async function hasColumn(table, col) {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [table, col]
  );
  return rows.length > 0;
}

/**
 * Bangun WHERE clause dari query string
 * Support:
 *  - ?id_tahun=2025
 *  - ?id_tahun_in=1,2,3
 *  - ?tahun=2025 (legacy)
 *  - ?id_unit_prodi=XX / ?id_unit=XX
 *  - soft delete (skip deleted_at kecuali ?include_deleted=1)
 */
export async function buildWhere(req, table, alias = "m", softDelete = true) {
  const where = [];
  const params = [];
  const q = req.query || {};
  const prefix = alias ? alias + "." : "";

  // Tahun akademik
  if (await hasColumn(table, "id_tahun")) {
    const qSingle = q.id_tahun ?? q.tahun;
    const qMulti = q.id_tahun_in;
    if (qSingle) {
      where.push(`${prefix}id_tahun = ?`);
      params.push(qSingle);
    } else if (qMulti) {
      const arr = String(qMulti).split(",").map(s => s.trim()).filter(Boolean);
      if (arr.length) {
        where.push(`${prefix}id_tahun IN (${arr.map(() => "?").join(",")})`);
        params.push(...arr);
      }
    }
  }

  // Unit / Prodi
  if (await hasColumn(table, "id_unit_prodi") && (q.id_unit_prodi || q.id_unit)) {
    where.push(`${prefix}id_unit_prodi = ?`);
    params.push(q.id_unit_prodi || q.id_unit);
  }

  // Soft delete
  if (softDelete && await hasColumn(table, "deleted_at")) {
    const includeDeleted = q.include_deleted;
    if (String(includeDeleted) !== "1") {
      where.push(`${prefix}deleted_at IS NULL`);
    }
  }

  return {
    where: where.length ? "AND " + where.join(" AND ") : "",
    params,
  };
}

/**
 * Bangun ORDER BY clause
 */
export function buildOrderBy(orderByParam, defaultCol, alias = "m") {
  if (!orderByParam) return `${alias}.${defaultCol} DESC`;
  return orderByParam
    .split(",")
    .map(s => s.trim())
    .map(part => (part.includes(".") ? part : `${alias}.${part}`))
    .join(", ");
}
