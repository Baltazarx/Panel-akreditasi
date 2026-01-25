import { pool } from '../db.js';

// Cek apakah tabel punya kolom tertentu
export const hasColumn = async (table, col) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [table, col]
  );
  return rows.length > 0;
};

// Build filter (id_tahun, id_unit_prodi, id_unit, soft delete, dll.)
export const buildWhere = async (req, table, alias = 'm') => {
  const where = [];
  const params = [];

  // (Tidak ada perubahan)
  // ===== Filter Tahun Akademik =====
  if (await hasColumn(table, 'id_tahun')) {
    const q = req.query || {};
    const qSingle = q.id_tahun ?? q.tahun;
    const qMulti = q.id_tahun_in;

    if (qSingle) {
      where.push(`${alias}.id_tahun = ?`);
      params.push(qSingle);
    } else if (qMulti) {
      const arr = String(qMulti).split(',').map(s => s.trim()).filter(Boolean);
      if (arr.length) {
        where.push(`${alias}.id_tahun IN (${arr.map(() => '?').join(',')})`);
        params.push(...arr);
      }
    }
  }

  // ===== MODIFIKASI - Filter Unit/Prodi Otomatis =====
  // Logika ini SEKARANG HANYA berlaku untuk user level PRODI
  if (await hasColumn(table, 'id_unit_prodi')) {
    // Cek role user
    const isSuperAdmin =
      ['superadmin', 'waket1', 'waket2', 'tpm', 'ketua'].includes(req.user?.role?.toLowerCase());

    // Definisikan role level prodi
    // (SESUAIKAN DAFTAR INI dengan role prodi Anda, misal: 'prodi_ti', 'kaprodi_mi', 'dosen_ti', dll.)
    const isProdiLevelUser =
      ['prodi_ti', 'prodi_mi'].includes(req.user?.role?.toLowerCase()); // <-- GANTI INI

    // Jika ada query param id_unit_prodi_in (untuk filter multiple prodi)
    if (req.query?.id_unit_prodi_in) {
      const arr = String(req.query.id_unit_prodi_in)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (arr.length) {
        where.push(`${alias}.id_unit_prodi IN (${arr.map(() => '?').join(',')})`);
        params.push(...arr);
      }
    }
    // Jika ada query param id_unit_prodi (filter single prodi)
    else if (req.query?.id_unit_prodi) {
      where.push(`${alias}.id_unit_prodi = ?`);
      params.push(req.query.id_unit_prodi);
    }
    // Filter default: HANYA jika BUKAN superadmin DAN DIA ADALAH user prodi
    else if (!isSuperAdmin && isProdiLevelUser) {
      where.push(`${alias}.id_unit_prodi = ?`);
      params.push(req.user?.id_unit_prodi || 0);
    }
    // Superadmin / User LPPM yg melihat tabel ini = bisa lihat semua prodi
  }

  // ===== TAMBAHAN BARU - Filter Unit Kerja (LPPM, Kerjasama, dll.) =====
  // Logika ini berlaku untuk tabel yang punya `id_unit`
  if (await hasColumn(table, 'id_unit')) {
    // Cek role user
    const isSuperAdmin =
      ['superadmin', 'waket1', 'waket2', 'tpm', 'ketua'].includes(req.user?.role?.toLowerCase());

    // Definisikan role yang filternya per-unit (bukan prodi)
    // (SESUAIKAN DAFTAR INI dengan role unit Anda)
    const isUnitLevelUser =
      ['lppm', 'kerjasama'].includes(req.user?.role?.toLowerCase()); // <-- Revert: prodi dihapus agar global

    // Jika ada query param id_unit_in (untuk filter multiple unit)
    if (req.query?.id_unit_in) {
      const arr = String(req.query.id_unit_in)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (arr.length) {
        where.push(`${alias}.id_unit IN (${arr.map(() => '?').join(',')})`);
        params.push(...arr);
      }
    }
    // Jika ada query param id_unit (filter single unit)
    else if (req.query?.id_unit) {
      where.push(`${alias}.id_unit = ?`);
      params.push(req.query.id_unit);
    }
    // Filter default: HANYA jika BUKAN superadmin DAN DIA ADALAH user unit
    else if (!isSuperAdmin && isUnitLevelUser) {
      where.push(`${alias}.id_unit = ?`);
      params.push(req.user?.id_unit || 0); // Asumsi user LPPM punya `req.user.id_unit`
    }
    // Superadmin / User Prodi yg melihat tabel ini = bisa lihat semua unit
  }

  // (Tidak ada perubahan)
  // ===== Soft Delete Handling =====
  if (await hasColumn(table, 'deleted_at')) {
    const includeDeleted = req.query?.include_deleted;
    const isDeleted = req.query?.is_deleted;

    if (isDeleted === 'true' || isDeleted === '1') {
      where.push(`${alias}.deleted_at IS NOT NULL`);
    } else if (String(includeDeleted) !== '1') {
      where.push(`${alias}.deleted_at IS NULL`);
    }
  }

  return { where, params };
};

// (Tidak ada perubahan)
// Build order_by
export const buildOrderBy = (raw, idCol, alias = 'm') => {
  const def = `${alias}.${idCol} DESC`;
  if (!raw) return def;
  // Izin sedikit memodifikasi regex agar lebih aman & memperbolehkan alias
  const ok = /^[a-zA-Z0-9_,\s\.]+( (ASC|DESC))?(\s*,\s*[a-zA-Z0-9_\.\s]+( (ASC|DESC))?)*$/.test(raw);
  if (!ok) return def;
  return raw
    .split(',')
    .map(s => s.trim())
    .map(part => (part.includes('.') ? part : `${alias}.${part}`))
    .join(', ');
};