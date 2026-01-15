import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== LIST =====
export const listTendik = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'tenaga_kependidikan', 'tk');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_tendik', 'tk');

    const sql = `
      SELECT 
        tk.*,
        p.nama_lengkap,
        p.nikp, -- [INFO] NIKP diambil dari tabel pegawai
        p.pendidikan_terakhir,
        uk.nama_unit
      FROM tenaga_kependidikan tk
      LEFT JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
      LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);

    // [NEW] Jika include=units, tambahkan data unit kerja multiple (konsisten dengan listPegawai)
    if (req.query.include === 'units') {
      for (let tendik of rows) {
        const [units] = await pool.query(
          `SELECT 
            pu.id,
            pu.id_unit,
            pu.is_primary,
            uk.nama_unit
          FROM pegawai_unit pu
          LEFT JOIN unit_kerja uk ON pu.id_unit = uk.id_unit
          WHERE pu.id_pegawai = ?
          ORDER BY pu.is_primary DESC`,
          [tendik.id_pegawai]
        );
        tendik.units = units;
        tendik.units_count = units.length;
      }
    }

    res.json(rows);
  } catch (err) {
    console.error("Error listTendik:", err);
    res.status(500).json({ error: 'List failed', details: err.message });
  }
};

// ===== GET BY ID =====
export const getTendikById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tk.*, p.nama_lengkap 
       FROM tenaga_kependidikan tk
       LEFT JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
       WHERE tk.id_tendik=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Get failed', details: err.message });
  }
};

// ===== CREATE =====
export const createTendik = async (req, res) => {
  try {
    // [UPDATE] HAPUS NIKP dari input body
    const { id_pegawai, jenis_tendik } = req.body;

    if (!id_pegawai || !jenis_tendik) {
      return res.status(400).json({ error: 'Pegawai dan Jenis Tendik wajib diisi.' });
    }

    // Cek duplikasi
    const [exist] = await pool.query(
      `SELECT id_tendik FROM tenaga_kependidikan WHERE id_pegawai = ? AND deleted_at IS NULL`,
      [id_pegawai]
    );
    if (exist.length > 0) {
      return res.status(409).json({ error: 'Pegawai ini sudah terdaftar sebagai Tenaga Kependidikan.' });
    }

    // [VALIDASI] Pembatas: Tendik tidak boleh terdaftar sebagai Dosen
    const [existDosen] = await pool.query(
      `SELECT id_dosen FROM dosen WHERE id_pegawai = ? AND deleted_at IS NULL`,
      [id_pegawai]
    );
    if (existDosen.length > 0) {
      return res.status(400).json({ error: 'Pegawai ini sudah terdaftar sebagai Dosen (Ber-NIDN). Harap hapus data Dosen terlebih dahulu jika ingin menjadikannya Tenaga Kependidikan.' });
    }

    // [UPDATE] Data insert tanpa NIKP
    const data = { id_pegawai, jenis_tendik };

    if (await hasColumn('tenaga_kependidikan', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO tenaga_kependidikan SET ?`, [data]);

    const [row] = await pool.query(
      `SELECT tk.*, p.nama_lengkap 
       FROM tenaga_kependidikan tk
       LEFT JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
       WHERE tk.id_tendik=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);

  } catch (err) {
    console.error("Error createTendik:", err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
};

// ===== UPDATE =====
export const updateTendik = async (req, res) => {
  try {
    // [UPDATE] HAPUS NIKP dari input body
    const { id_pegawai, jenis_tendik } = req.body;

    const data = { id_pegawai, jenis_tendik };

    if (await hasColumn('tenaga_kependidikan', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE tenaga_kependidikan SET ? WHERE id_tendik=?`,
      [data, req.params.id]
    );

    const [row] = await pool.query(
      `SELECT tk.*, p.nama_lengkap 
       FROM tenaga_kependidikan tk
       LEFT JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
       WHERE tk.id_tendik=?`,
      [req.params.id]
    );

    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateTendik:", err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

// ... (Delete/Restore/HardDelete gunakan kode sebelumnya, tidak ada perubahan logika NIKP disana)
export const softDeleteTendik = async (req, res) => {
  /* Gunakan kode delete sebelumnya */
  const payload = { deleted_at: new Date() };
  if (await hasColumn('tenaga_kependidikan', 'deleted_by')) payload.deleted_by = req.user?.id_user;
  await pool.query(`UPDATE tenaga_kependidikan SET ? WHERE id_tendik=?`, [payload, req.params.id]);
  res.json({ ok: true, softDeleted: true });
};
export const restoreTendik = async (req, res) => {
  await pool.query(`UPDATE tenaga_kependidikan SET deleted_at=NULL WHERE id_tendik=?`, [req.params.id]);
  res.json({ ok: true, restored: true });
};
export const hardDeleteTendik = async (req, res) => {
  await pool.query(`DELETE FROM tenaga_kependidikan WHERE id_tendik=?`, [req.params.id]);
  res.json({ ok: true, hardDeleted: true });
};