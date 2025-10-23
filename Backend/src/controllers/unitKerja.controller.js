import { pool } from '../db.js';
import { buildWhere, buildOrderBy } from '../utils/queryHelper.js';

// ===== LIST ONLY =====
export const listUnitKerja = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'unit_kerja', 'u');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_unit', 'u');

    const sql = `
      SELECT u.*
      FROM unit_kerja u
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listUnitKerja:", err);
    res.status(500).json({ error: 'Failed to get unit_kerja' });
  }
};
