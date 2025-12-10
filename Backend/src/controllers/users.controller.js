import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import bcrypt from 'bcryptjs';

// ===== LIST USERS =====
export const listUsers = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'users', 'u');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_user', 'u');

    // [MODIFIKASI FILTER]
    // Secara default, buildWhere mungkin menyembunyikan soft-deleted records.
    // Jika kita ingin admin bisa melihat user nonaktif/terhapus, kita sesuaikan filter di sini.
    
    // Kita filter manual kondisi deleted_at agar lebih fleksibel
    let finalWhere = where.filter(w => !w.includes('deleted_at')); 
    
    const statusFilter = req.query?.status;
    if (statusFilter === 'active') {
      finalWhere.push('u.is_active = 1 AND u.deleted_at IS NULL');
    } else if (statusFilter === 'inactive') {
      finalWhere.push('(u.is_active = 0 OR u.deleted_at IS NOT NULL)');
    } else {
      // Default: Tampilkan semua yang belum di-hard delete (soft delete tetap muncul di list admin biasanya)
      // Atau jika Anda ingin defaultnya hanya aktif:
      // finalWhere.push('u.deleted_at IS NULL'); 
    }

    // [UPDATE QUERY]
    // 1. Hapus u.role (kolom lama)
    // 2. Ambil uk.kode_role sebagai 'role' sistem
    // 3. Join lengkap ke pegawai & unit
    const sql = `
      SELECT 
        u.id_user, 
        u.username, 
        u.is_active, 
        u.created_at, 
        u.updated_at, 
        u.deleted_at,
        
        -- Info Pegawai
        u.id_pegawai, 
        p.nama_lengkap AS pegawai_name,
        
        -- Info Unit & Role (Dari Pegawai -> Unit)
        p.id_unit, 
        uk.nama_unit AS unit_name,
        uk.kode_role AS role  -- Role diambil dari Unit Kerja
        
      FROM users u
      LEFT JOIN pegawai p ON u.id_pegawai = p.id_pegawai
      LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      
      ${finalWhere.length ? `WHERE ${finalWhere.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listUsers:", err);
    res.status(500).json({ error: 'List failed', details: err.message });
  }
};

// ===== GET BY ID =====
export const getUserById = async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.id_user, 
        u.username, 
        u.is_active, 
        u.created_at, 
        u.updated_at, 
        u.deleted_at,
        u.id_pegawai, 
        p.nama_lengkap AS pegawai_name,
        p.id_unit, 
        uk.nama_unit AS unit_name,
        uk.kode_role AS role
      FROM users u
      LEFT JOIN pegawai p ON u.id_pegawai = p.id_pegawai
      LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      WHERE u.id_user = ?
    `;

    const [rows] = await pool.query(sql, [req.params.id]);
    
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error getUserById:", err);
    res.status(500).json({ error: 'Get failed', details: err.message });
  }
};

// ===== CREATE =====
export const createUser = async (req, res) => {
  try {
    // [UPDATE] Input menjadi lebih ringkas
    // Tidak perlu input id_unit atau role manual.
    // Cukup username, password, id_pegawai.
    const { username, password, id_pegawai, is_active } = req.body;

    if (!username || !password || !id_pegawai) {
        return res.status(400).json({ error: 'Username, Password, dan Pegawai wajib diisi.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      username,
      password: hashedPassword,
      id_pegawai,
      is_active: is_active !== undefined ? is_active : 1,
    };

    if (await hasColumn('users', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO users SET ?`, [data]);
    
    // Return data lengkap (termasuk role yang didapat otomatis)
    const [row] = await pool.query(
      `SELECT 
         u.id_user, u.username, u.is_active,
         p.nama_lengkap AS pegawai_name,
         uk.nama_unit AS unit_name,
         uk.kode_role AS role
       FROM users u
       LEFT JOIN pegawai p ON u.id_pegawai = p.id_pegawai
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       WHERE u.id_user=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error createUser:", err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username atau Pegawai sudah terdaftar.' });
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
};

// ===== UPDATE =====
export const updateUser = async (req, res) => {
  try {
    const { username, password, id_pegawai, is_active } = req.body;

    const data = {
      username,
      id_pegawai, // Jika ingin ganti pemilik akun
      is_active
    };

    // Hanya update password jika dikirim (tidak kosong)
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (await hasColumn('users', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    // Filter undefined values agar tidak menimpa data lama dengan NULL/undefined
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    await pool.query(
      `UPDATE users SET ? WHERE id_user=?`,
      [data, req.params.id]
    );

    const [row] = await pool.query(
      `SELECT 
         u.id_user, u.username, u.is_active,
         p.nama_lengkap AS pegawai_name,
         uk.nama_unit AS unit_name,
         uk.kode_role AS role
       FROM users u
       LEFT JOIN pegawai p ON u.id_pegawai = p.id_pegawai
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       WHERE u.id_user=?`,
      [req.params.id]
    );

    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateUser:", err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

// ... (Fungsi SoftDelete, Restore, HardDelete tetap sama, logika ID tidak berubah)
export const softDeleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const [existing] = await pool.query(`SELECT id_user FROM users WHERE id_user = ?`, [userId]);
    if (existing.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const payload = { deleted_at: new Date(), is_active: 0 };
    if (await hasColumn('users', 'deleted_by')) payload.deleted_by = req.user?.id_user || null;
    
    await pool.query(`UPDATE users SET ? WHERE id_user = ?`, [payload, userId]);
    res.json({ ok: true, softDeleted: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error("Error softDeleteUser:", err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
};

export const restoreUser = async (req, res) => {
  try {
    await pool.query(`UPDATE users SET deleted_at=NULL, is_active=1 WHERE id_user=?`, [req.params.id]);
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreUser:", err);
    res.status(500).json({ error: 'Restore failed', details: err.message });
  }
};

export const hardDeleteUser = async (req, res) => {
  try {
    await pool.query(`DELETE FROM users WHERE id_user=?`, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    console.error("Error hardDeleteUser:", err);
    res.status(500).json({ error: 'Hard delete failed', details: err.message });
  }
};

// ===== EXTRA: SEARCH & LIST UNIT =====
// (List unit tetap sama karena ambil dari tabel unit_kerja)
export const listUnits = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_unit, nama_unit, kode_role FROM unit_kerja WHERE deleted_at IS NULL ORDER BY nama_unit ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error listUnits:", err);
    res.status(500).json({ error: 'List units failed' });
  }
};

export const searchPegawai = async (req, res) => {
  try {
    const q = req.query.search || "";
    const [rows] = await pool.query(
      `SELECT id_pegawai, nama_lengkap FROM pegawai WHERE deleted_at IS NULL AND nama_lengkap LIKE ? ORDER BY nama_lengkap ASC LIMIT 20`,
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error searchPegawai:", err);
    res.status(500).json({ error: 'Search pegawai failed' });
  }
};

// ===== VERIFY PASSWORD (Untuk Verifikasi Password User Sendiri) =====
export const verifyPassword = async (req, res) => {
  try {
    // Ambil id_user dari JWT token (user yang sedang login)
    const userId = req.user?.id_user;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
    }

    const { password } = req.body;

    // Validasi input
    if (!password) {
      return res.status(400).json({ error: 'Password wajib diisi.' });
    }

    // Ambil password dari database
    const [userRows] = await pool.query(
      `SELECT password FROM users WHERE id_user = ? AND deleted_at IS NULL`,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const user = userRows[0];

    // Validasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password salah.' });
    }

    // Password benar, return success
    res.json({ 
      ok: true, 
      message: 'Password berhasil diverifikasi.',
      verified: true
    });
  } catch (err) {
    console.error("Error verifyPassword:", err);
    res.status(500).json({ error: 'Gagal memverifikasi password', details: err.message });
  }
};

// ===== CHANGE PASSWORD (Untuk User Sendiri) =====
export const changePassword = async (req, res) => {
  try {
    // Ambil id_user dari JWT token (user yang sedang login)
    const userId = req.user?.id_user;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
    }

    const { currentPassword, newPassword } = req.body;

    // Validasi input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Kata sandi saat ini dan kata sandi baru wajib diisi.' });
    }

    // Validasi panjang password baru
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Kata sandi baru minimal 6 karakter.' });
    }

    // Ambil password saat ini dari database
    const [userRows] = await pool.query(
      `SELECT password FROM users WHERE id_user = ? AND deleted_at IS NULL`,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const user = userRows[0];

    // Validasi password saat ini
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Kata sandi saat ini salah.' });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updateData = { password: hashedPassword };
    
    if (await hasColumn('users', 'updated_by') && req.user?.id_user) {
      updateData.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE users SET ? WHERE id_user = ?`,
      [updateData, userId]
    );

    res.json({ 
      ok: true, 
      message: 'Kata sandi berhasil diubah.' 
    });
  } catch (err) {
    console.error("Error changePassword:", err);
    res.status(500).json({ error: 'Gagal mengubah kata sandi', details: err.message });
  }
};