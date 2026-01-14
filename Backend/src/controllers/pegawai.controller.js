import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== LIST =====
export const listPegawai = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'pegawai', 'p');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_pegawai', 'p');

    const sql = `
      SELECT 
        p.*,
        uk.nama_unit,
        rjs.nama_jabatan AS jabatan_struktural,
        TRIM(CONCAT(COALESCE(rjs.nama_jabatan, ''), ' ', COALESCE(uk.nama_unit, ''))) AS jabatan_display
      FROM pegawai p
      LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      LEFT JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);

    // [NEW] Jika include=units, tambahkan data unit kerja multiple
    if (req.query.include === 'units') {
      for (let pegawai of rows) {
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
          [pegawai.id_pegawai]
        );
        pegawai.units = units;
        pegawai.units_count = units.length;
      }
    }

    res.json(rows);
  } catch (err) {
    console.error("Error listPegawai:", err);
    res.status(500).json({ error: 'List failed', details: err.message });
  }
};

// ===== GET BY ID =====
export const getPegawaiById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         p.*, 
         uk.nama_unit, 
         rjs.nama_jabatan AS jabatan_struktural,
         TRIM(CONCAT(COALESCE(rjs.nama_jabatan, ''), ' ', COALESCE(uk.nama_unit, ''))) AS jabatan_display
       FROM pegawai p
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       LEFT JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
       WHERE p.id_pegawai=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });

    // [NEW] Ambil semua unit kerja pegawai ini
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
      [req.params.id]
    );

    rows[0].units = units;
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Get failed', details: err.message });
  }
};

// ===== CREATE =====
export const createPegawai = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const data = {
      nama_lengkap: req.body.nama_lengkap,
      nikp: req.body.nikp || null,
      pendidikan_terakhir: req.body.pendidikan_terakhir,
      id_unit: req.body.id_unit || null, // Unit utama untuk backward compatibility
      id_jabatan: req.body.id_jabatan || null,
    };

    // Validation: Hanya boleh satu Ketua (id_jabatan = 1) per unit
    if (data.id_jabatan == 1 && data.id_unit) {
      const [existing] = await connection.query(
        `SELECT p.nama_lengkap, uk.nama_unit 
         FROM pegawai p 
         JOIN unit_kerja uk ON p.id_unit = uk.id_unit 
         WHERE p.id_unit = ? AND p.id_jabatan = 1 AND p.deleted_at IS NULL`,
        [data.id_unit]
      );
      if (existing.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          error: `Gagal: Unit ${existing[0].nama_unit} sudah memiliki Ketua (${existing[0].nama_lengkap}).`
        });
      }
    }

    if (await hasColumn('pegawai', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    // Insert pegawai
    const [r] = await connection.query(`INSERT INTO pegawai SET ?`, [data]);
    const id_pegawai = r.insertId;

    // [NEW] Insert ke pegawai_unit jika ada units array
    if (req.body.units && Array.isArray(req.body.units) && req.body.units.length > 0) {
      for (let i = 0; i < req.body.units.length; i++) {
        const unit = req.body.units[i];
        await connection.query(
          `INSERT INTO pegawai_unit (id_pegawai, id_unit, is_primary, tanggal_mulai, keterangan) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            id_pegawai,
            unit.id_unit || unit,
            i === 0 ? 1 : 0, // Unit pertama sebagai primary
            new Date().toISOString().split('T')[0],
            unit.keterangan || null
          ]
        );
      }
    } else if (data.id_unit) {
      // Fallback: Jika tidak ada units array tapi ada id_unit, create single unit
      await connection.query(
        `INSERT INTO pegawai_unit (id_pegawai, id_unit, is_primary, tanggal_mulai) 
         VALUES (?, ?, 1, ?)`,
        [id_pegawai, data.id_unit, new Date().toISOString().split('T')[0]]
      );
    }

    await connection.commit();

    // Return data lengkap dengan units
    const [row] = await pool.query(
      `SELECT p.*, uk.nama_unit, rjs.nama_jabatan AS jabatan_struktural
       FROM pegawai p
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       LEFT JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
       WHERE p.id_pegawai=?`,
      [id_pegawai]
    );

    const [units] = await pool.query(
      `SELECT pu.*, uk.nama_unit 
       FROM pegawai_unit pu 
       LEFT JOIN unit_kerja uk ON pu.id_unit = uk.id_unit
       WHERE pu.id_pegawai = ?`,
      [id_pegawai]
    );

    row[0].units = units;
    res.status(201).json(row[0]);

  } catch (err) {
    await connection.rollback();
    console.error("Error createPegawai:", err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  } finally {
    connection.release();
  }
};

// ===== UPDATE =====
export const updatePegawai = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const data = {
      nama_lengkap: req.body.nama_lengkap,
      nikp: req.body.nikp || null,
      pendidikan_terakhir: req.body.pendidikan_terakhir,
      id_unit: req.body.id_unit || null,
      id_jabatan: req.body.id_jabatan || null,
    };

    // Validation: Hanya boleh satu Ketua (id_jabatan = 1) per unit
    if (data.id_jabatan == 1 && data.id_unit) {
      const [existing] = await connection.query(
        `SELECT p.nama_lengkap, uk.nama_unit 
         FROM pegawai p 
         JOIN unit_kerja uk ON p.id_unit = uk.id_unit 
         WHERE p.id_unit = ? AND p.id_jabatan = 1 AND p.id_pegawai != ? AND p.deleted_at IS NULL`,
        [data.id_unit, req.params.id]
      );
      if (existing.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          error: `Gagal: Unit ${existing[0].nama_unit} sudah memiliki Ketua (${existing[0].nama_lengkap}).`
        });
      }
    }

    if (await hasColumn('pegawai', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    // Update pegawai
    await connection.query(
      `UPDATE pegawai SET ? WHERE id_pegawai=?`,
      [data, req.params.id]
    );

    // [NEW] Update pegawai_unit jika ada units array
    if (req.body.units && Array.isArray(req.body.units)) {
      // Ambil unit existing
      const [existingUnits] = await connection.query(
        `SELECT id, id_unit FROM pegawai_unit WHERE id_pegawai = ?`,
        [req.params.id]
      );

      const existingUnitIds = existingUnits.map(u => u.id_unit);
      const newUnitIds = req.body.units.map(u => u.id_unit || u);

      // Cari unit yang dihapus (ada di existing tapi tidak di new)
      const unitsToDelete = existingUnits.filter(u => !newUnitIds.includes(u.id_unit));

      // Hapus unit yang dihapus
      for (const unit of unitsToDelete) {
        await connection.query(
          `DELETE FROM pegawai_unit WHERE id = ?`,
          [unit.id]
        );
      }

      // Insert atau update unit
      for (let i = 0; i < req.body.units.length; i++) {
        const unit = req.body.units[i];
        const id_unit = unit.id_unit || unit;

        // Cek apakah unit ini sudah ada
        const existingUnit = existingUnits.find(u => u.id_unit === id_unit);

        if (existingUnit) {
          // Update yang sudah ada (update is_primary)
          await connection.query(
            `UPDATE pegawai_unit 
             SET is_primary = ?
             WHERE id = ?`,
            [i === 0 ? 1 : 0, existingUnit.id]
          );
        } else {
          // Insert baru
          await connection.query(
            `INSERT INTO pegawai_unit (id_pegawai, id_unit, is_primary) 
             VALUES (?, ?, ?)`,
            [
              req.params.id,
              id_unit,
              i === 0 ? 1 : 0
            ]
          );
        }
      }
    }

    await connection.commit();

    // Return data lengkap
    const [row] = await pool.query(
      `SELECT p.*, uk.nama_unit, rjs.nama_jabatan AS jabatan_struktural
       FROM pegawai p
       LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
       LEFT JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
       WHERE p.id_pegawai=?`,
      [req.params.id]
    );

    if (!row[0]) return res.status(404).json({ error: 'Not found' });

    const [units] = await pool.query(
      `SELECT pu.*, uk.nama_unit 
       FROM pegawai_unit pu 
       LEFT JOIN unit_kerja uk ON pu.id_unit = uk.id_unit
       WHERE pu.id_pegawai = ?
       ORDER BY pu.is_primary DESC`,
      [req.params.id]
    );

    row[0].units = units;
    res.json(row[0]);

  } catch (err) {
    await connection.rollback();
    console.error("Error updatePegawai:", err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  } finally {
    connection.release();
  }
};

// ===== DELETE =====
export const deletePegawai = async (req, res) => {
  try {
    if (await hasColumn('pegawai', 'deleted_at')) {
      const payload = { deleted_at: new Date() };
      if (await hasColumn('pegawai', 'deleted_by')) payload.deleted_by = req.user?.id_user || null;
      await pool.query(`UPDATE pegawai SET ? WHERE id_pegawai=?`, [payload, req.params.id]);

      // [NEW] Soft delete juga pegawai_unit
      await pool.query(
        `UPDATE pegawai_unit SET deleted_at = NOW() WHERE id_pegawai = ?`,
        [req.params.id]
      );

      return res.json({ ok: true, softDeleted: true });
    }
    await pool.query(`DELETE FROM pegawai WHERE id_pegawai=?`, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

export const restorePegawai = async (req, res) => {
  try {
    await pool.query(`UPDATE pegawai SET deleted_at=NULL WHERE id_pegawai=?`, [req.params.id]);

    // [NEW] Restore juga pegawai_unit
    await pool.query(
      `UPDATE pegawai_unit SET deleted_at=NULL WHERE id_pegawai=?`,
      [req.params.id]
    );

    res.json({ ok: true, restored: true });
  } catch (err) { res.status(500).json({ error: 'Restore failed' }); }
};

export const hardDeletePegawai = async (req, res) => {
  try {
    // pegawai_unit akan auto-delete karena foreign key CASCADE
    await pool.query(`DELETE FROM pegawai WHERE id_pegawai=?`, [req.params.id]);
    res.json({ ok: true, hardDeleted: true });
  } catch (err) { res.status(500).json({ error: 'Hard delete failed' }); }
};