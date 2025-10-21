import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== CRUD =====
export const listSumberPendanaan = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'sumber_pendanaan', 'sp');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_sumber', 'sp');

    let selectCols = ['sp.*'];
    let joinSql = '';

    if (req.query?.relasi === '1' && await hasColumn('sumber_pendanaan', 'id_tahun')) {
      joinSql = ` LEFT JOIN tahun_akademik ta ON ta.id_tahun = sp.id_tahun`;
      selectCols.push('ta.tahun AS tahun_text');
    }

    const sql = `
      SELECT ${selectCols.join(', ')}
      FROM sumber_pendanaan sp
      ${joinSql}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listSumberPendanaan:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

export const getSumberPendanaanById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM sumber_pendanaan WHERE id_sumber=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Get failed' });
  }
};

export const createSumberPendanaan = async (req, res) => {
  try {
    const data = {
      id_tahun: req.body.id_tahun,
      sumber_dana: req.body.sumber_dana,
      jumlah_dana: req.body.jumlah_dana,
      link_bukti: req.body.link_bukti
    };
    if (await hasColumn('sumber_pendanaan', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }
    const [r] = await pool.query(`INSERT INTO sumber_pendanaan SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM sumber_pendanaan WHERE id_sumber=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    res.status(500).json({ error: 'Create failed' });
  }
};

export const updateSumberPendanaan = async (req, res) => {
  try {
    const data = {
      id_tahun: req.body.id_tahun,
      sumber_dana: req.body.sumber_dana,
      jumlah_dana: req.body.jumlah_dana,
      link_bukti: req.body.link_bukti
    };
    if (await hasColumn('sumber_pendanaan', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }
    await pool.query(
      `UPDATE sumber_pendanaan SET ? WHERE id_sumber=?`,
      [data, req.params.id]
    );
    const [row] = await pool.query(
      `SELECT * FROM sumber_pendanaan WHERE id_sumber=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

export const softDeleteSumberPendanaan = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('sumber_pendanaan', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE sumber_pendanaan SET ? WHERE id_sumber=?`,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

export const restoreSumberPendanaan = async (req, res) => {
  try {
    await pool.query(
      `UPDATE sumber_pendanaan SET deleted_at=NULL, deleted_by=NULL WHERE id_sumber=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    res.status(500).json({ error: 'Restore failed' });
  }
};

export const hardDeleteSumberPendanaan = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM sumber_pendanaan WHERE id_sumber=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Hard delete failed' });
  }
};

export const restoreMultipleSumberPendanaan = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty array of IDs' });
    }
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(
      `UPDATE sumber_pendanaan SET deleted_at=NULL, deleted_by=NULL WHERE id_sumber IN (${placeholders})`,
      ids
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Restore multiple failed' });
  }
};

// ===== CUSTOM SUMMARY =====
export const summarySumberPendanaan = async (req, res) => {
  try {
    // cari TS terbaru
    const [tahunRows] = await pool.query(
      `SELECT id_tahun FROM sumber_pendanaan ORDER BY id_tahun DESC LIMIT 1`
    );
    if (!tahunRows.length) return res.json([]);

    const ts = tahunRows[0].id_tahun;
    const years = [ts, ts - 1, ts - 2, ts - 3, ts - 4];

    const [summaryRows] = await pool.query(
      `SELECT
        sumber_dana,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts1,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts2,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts3,
        SUM(CASE WHEN id_tahun = ? THEN jumlah_dana ELSE 0 END) AS ts4,
        MAX(link_bukti) AS link_bukti
      FROM sumber_pendanaan
      WHERE id_tahun IN (?, ?, ?, ?, ?)
      GROUP BY sumber_dana
      ORDER BY sumber_dana`,
      [...years, ...years]
    );

    res.json(summaryRows);
  } catch (err) {
    console.error("Error fetching summary data:", err);
    res.status(500).json({ error: 'Gagal memuat data ringkasan' });
  }
};
