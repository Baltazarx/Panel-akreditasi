import { pool } from '../db.js';

// Cek apakah tabel punya kolom tertentu
export const hasColumn = async (table, col) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [table, col]
  );
  return rows.length > 0;
};

// Build filter (id_tahun, id_unit_prodi, soft delete, dll.)
export const buildWhere = async (req, table, alias = 'm') => {
  const where = [];
  const params = [];

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

  // ===== Filter Unit/Prodi Otomatis =====
  if (await hasColumn(table, 'id_unit_prodi')) {
    // Cek role user — kalau bukan superadmin, hanya boleh lihat datanya sendiri
    const isSuperAdmin =
      ['superadmin', 'waket1', 'waket2', 'tpm'].includes(req.user?.role?.toLowerCase());
    if (!isSuperAdmin) {
      where.push(`${alias}.id_unit_prodi = ?`);
      // === PERBAIKAN: Baca 'id_unit_prodi' dari token, bukan 'id_unit' ===
      params.push(req.user?.id_unit_prodi || 0);
    } else if (req.query?.id_unit_prodi) {
      // superadmin bisa filter manual via ?id_unit_prodi=2 (opsional)
      where.push(`${alias}.id_unit_prodi = ?`);
      params.push(req.query.id_unit_prodi);
    }
  }

  // ===== Soft Delete Handling =====
  if (await hasColumn(table, 'deleted_at')) {
    const includeDeleted = req.query?.include_deleted;
    if (String(includeDeleted) !== '1') {
      where.push(`${alias}.deleted_at IS NULL`);
    }
  }

  return { where, params };
};

// Build order_by
export const buildOrderBy = (raw, idCol, alias = 'm') => {
  const def = `${alias}.${idCol} DESC`;
  if (!raw) return def;
  const ok = /^[a-zA-Z0-9_,\s\.]+(ASC|DESC)?(\s*,\s*[a-zA-Z0-9_\.\s]+(ASC|DESC)?)*$/.test(raw);
  if (!ok) return def;
  return raw
    .split(',')
    .map(s => s.trim())
    .map(part => (part.includes('.') ? part : `${alias}.${part}`))
    .join(', ');
};
