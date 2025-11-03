import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import bcrypt from 'bcryptjs';

// ===== LIST USERS =====
export const listUsers = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'users', 'u');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_user', 'u');

    // Abaikan filter soft-delete dari buildWhere: hapus kondisi terkait deleted_at jika ada
    let whereNoDeleted = (where || []).filter(w => !/deleted_at/i.test(w));

    // Filter berdasarkan status (active/inactive/all)
    const statusFilter = req.query?.status;
    if (statusFilter === 'active') {
      // Akun Aktif: is_active = 1 DAN deleted_at IS NULL
      whereNoDeleted.push('u.is_active = 1');
      whereNoDeleted.push('u.deleted_at IS NULL');
    } else if (statusFilter === 'inactive') {
      // Akun Nonaktif: is_active = 0 ATAU deleted_at IS NOT NULL
      whereNoDeleted.push('(u.is_active = 0 OR u.deleted_at IS NOT NULL)');
    }
    // Jika status = 'all' atau tidak ada, tampilkan semua (tidak perlu filter tambahan)

    const sql = `
      SELECT u.id_user, u.username, u.role, u.is_active, u.deleted_at,
             u.id_unit, uk.nama_unit AS unit_name,
             u.id_pegawai, p.nama_lengkap AS pegawai_name
      FROM users u
      LEFT JOIN unit_kerja uk ON uk.id_unit = u.id_unit
      LEFT JOIN pegawai p ON p.id_pegawai = u.id_pegawai
      ${whereNoDeleted.length ? `WHERE ${whereNoDeleted.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listUsers:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// ===== GET BY ID =====
export const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE id_user=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getUserById:", err);
    res.status(500).json({ error: 'Get failed' });
  }
};

// ===== CREATE =====
export const createUser = async (req, res) => {
  try {
    const data = {
      username: req.body.username,
      password: req.body.password ? await bcrypt.hash(req.body.password, 10) : null,
      id_unit: req.body.id_unit,
      id_pegawai: req.body.id_pegawai,
      role: req.body.role,
      is_active: req.body.is_active ?? 1,
    };
    if (await hasColumn('users', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO users SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM users WHERE id_user=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createUser:", err);
    res.status(500).json({ error: 'Create failed' });
  }
};

// ===== UPDATE =====
export const updateUser = async (req, res) => {
  try {
    const data = {
      username: req.body.username,
      id_unit: req.body.id_unit,
      id_pegawai: req.body.id_pegawai,
      role: req.body.role,
      // kalau undefined/null → default 1 (aktif)
      is_active: req.body.is_active !== undefined ? req.body.is_active : 1,
    };

    if (req.body.password) {
      data.password = await bcrypt.hash(req.body.password, 10);
    }
    if (await hasColumn('users', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE users SET ? WHERE id_user=?`,
      [data, req.params.id]
    );

    const [row] = await pool.query(
      `SELECT * FROM users WHERE id_user=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateUser:", err);
    res.status(500).json({ error: 'Update failed' });
  }
};


// ===== SOFT DELETE (NONAKTIFKAN) =====
export const softDeleteUser = async (req, res) => {
  try {
    // Nonaktifkan = set is_active = 0 dan deleted_at (mencegah login)
    const payload = { 
      deleted_at: new Date(),
      is_active: 0  // Nonaktifkan untuk mencegah login
    };
    if (await hasColumn('users', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE users SET ? WHERE id_user=?`,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("Error softDeleteUser:", err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

// ===== RESTORE (AKTIFKAN KEMBALI) =====
export const restoreUser = async (req, res) => {
  try {
    // Aktifkan kembali = set is_active = 1 dan hapus deleted_at (izin login)
    await pool.query(
      `UPDATE users 
       SET deleted_at=NULL, deleted_by=NULL, is_active=1 
       WHERE id_user=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreUser:", err);
    res.status(500).json({ error: 'Restore failed' });
  }
};

// ===== HARD DELETE =====
export const hardDeleteUser = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM users WHERE id_user=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error("Error hardDeleteUser:", err);
    res.status(500).json({ error: 'Hard delete failed' });
  }
};

// ===== EXTRA: LIST UNIT =====
export const listUnits = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_unit, nama_unit 
       FROM unit_kerja 
       WHERE deleted_at IS NULL 
       ORDER BY nama_unit ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error listUnits:", err);
    res.status(500).json({ error: 'List units failed' });
  }
};

// ===== EXTRA: SEARCH PEGAWAI =====
export const searchPegawai = async (req, res) => {
  try {
    const q = req.query.search || "";
    const [rows] = await pool.query(
      `SELECT id_pegawai, nama_lengkap 
       FROM pegawai 
       WHERE deleted_at IS NULL 
         AND nama_lengkap LIKE ? 
       ORDER BY nama_lengkap ASC 
       LIMIT 20`,
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error searchPegawai:", err);
    res.status(500).json({ error: 'Search pegawai failed' });
  }
};
