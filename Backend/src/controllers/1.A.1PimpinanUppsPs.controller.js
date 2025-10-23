import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== CRUD =====
export const listPimpinanUppsPs = async (req, res) => {
  try {
    // alias di sini pakai "p"
    const { where, params } = await buildWhere(req, 'pimpinan_upps_ps', 'p');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_pimpinan', 'p');

    const sql = `
      SELECT 
        p.id_pimpinan,
        p.id_unit,
        uk.nama_unit AS unit_kerja,
        p.id_pegawai,
        pg.nama_lengkap AS nama_ketua,
        DATE_FORMAT(p.periode_mulai, "%Y-%m-%d") AS periode_mulai,
        DATE_FORMAT(p.periode_selesai, "%Y-%m-%d") AS periode_selesai,
        pg.pendidikan_terakhir,
        p.id_jabatan,
        rjs.nama_jabatan AS jabatan_struktural,
        p.tupoksi,
        p.deleted_at
      FROM pimpinan_upps_ps p
      JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
      JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listPimpinanUppsPs:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

export const getPimpinanUppsPsById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM pimpinan_upps_ps WHERE id_pimpinan=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Get failed' });
  }
};

export const createPimpinanUppsPs = async (req, res) => {
  try {
    const data = {
      id_unit: req.body.id_unit,
      id_pegawai: req.body.id_pegawai,
      id_jabatan: req.body.id_jabatan,
      periode_mulai: req.body.periode_mulai,
      periode_selesai: req.body.periode_selesai,
      tupoksi: req.body.tupoksi
    };
    if (await hasColumn('pimpinan_upps_ps', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }
    const [r] = await pool.query(`INSERT INTO pimpinan_upps_ps SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM pimpinan_upps_ps WHERE id_pimpinan=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    res.status(500).json({ error: 'Create failed' });
  }
};

export const updatePimpinanUppsPs = async (req, res) => {
  try {
    const data = {
      id_unit: req.body.id_unit,
      id_pegawai: req.body.id_pegawai,
      id_jabatan: req.body.id_jabatan,
      periode_mulai: req.body.periode_mulai,
      periode_selesai: req.body.periode_selesai,
      tupoksi: req.body.tupoksi
    };
    if (await hasColumn('pimpinan_upps_ps', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }
    await pool.query(
      `UPDATE pimpinan_upps_ps SET ? WHERE id_pimpinan=?`,
      [data, req.params.id]
    );
    const [row] = await pool.query(
      `SELECT * FROM pimpinan_upps_ps WHERE id_pimpinan=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

export const softDeletePimpinanUppsPs = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('pimpinan_upps_ps', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE pimpinan_upps_ps SET ? WHERE id_pimpinan=?`,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

export const restorePimpinanUppsPs = async (req, res) => {
  try {
    await pool.query(
      `UPDATE pimpinan_upps_ps SET deleted_at=NULL, deleted_by=NULL WHERE id_pimpinan=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    res.status(500).json({ error: 'Restore failed' });
  }
};

export const hardDeletePimpinanUppsPs = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM pimpinan_upps_ps WHERE id_pimpinan=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Hard delete failed' });
  }
};
