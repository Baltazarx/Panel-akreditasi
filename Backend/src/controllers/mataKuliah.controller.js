import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// === LIST MK ===
export const listMataKuliah = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'mata_kuliah', 'm');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_mk', 'm');

    const sql = `
      SELECT 
        m.id_mk,
        m.id_unit_prodi,
        uk.nama_unit AS nama_unit_prodi,
        m.kode_mk,
        m.nama_mk,
        m.sks,
        m.semester,
        m.deleted_at
      FROM mata_kuliah m
      LEFT JOIN unit_kerja uk ON m.id_unit_prodi = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listMataKuliah:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// === DETAIL MK (dengan CPMK-nya) ===
export const getMataKuliahById = async (req, res) => {
  try {
    const [mkRows] = await pool.query(
      `SELECT mk.*, uk.nama_unit AS nama_unit_prodi 
       FROM mata_kuliah mk 
       LEFT JOIN unit_kerja uk ON mk.id_unit_prodi = uk.id_unit 
       WHERE mk.id_mk=?`,
      [req.params.id]
    );
    if (!mkRows[0]) return res.status(404).json({ error: 'Not found' });

    const [cpmkRows] = await pool.query(
      `SELECT c.* FROM cpmk c
       JOIN map_cpmk_mk map ON c.id_cpmk = map.id_cpmk
       WHERE map.id_mk=?`,
      [req.params.id]
    );

    res.json({
      ...mkRows[0],
      cpmk_list: cpmkRows,
    });
  } catch (err) {
    console.error("Error getMataKuliahById:", err);
    res.status(500).json({ error: 'Get failed' });
  }
};

// === CREATE MK + CPMK SEKALIGUS ===
export const createMataKuliah = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const dataMK = {
      id_unit_prodi: req.body.id_unit_prodi,
      kode_mk: req.body.kode_mk,
      nama_mk: req.body.nama_mk,
      sks: req.body.sks,
      semester: req.body.semester,
    };

    // --- Multi-prodi aware ---
    if (!dataMK.id_unit_prodi && req.user?.role === 'prodi') {
      dataMK.id_unit_prodi = req.user.id_unit_prodi;
    }

    if (!dataMK.id_unit_prodi || !dataMK.kode_mk || !dataMK.nama_mk) {
      await conn.rollback();
      return res.status(400).json({ error: 'Field `id_unit_prodi`, `kode_mk`, dan `nama_mk` wajib diisi.'});
    }

    if (await hasColumn('mata_kuliah', 'created_by') && req.user?.id_user) {
      dataMK.created_by = req.user.id_user;
    }

    const [mkResult] = await conn.query(`INSERT INTO mata_kuliah SET ?`, [dataMK]);
    const mkId = mkResult.insertId;

    // === PERBAIKAN 1: Baca 'cpmk' dari body, bukan 'cpmk_list' ===
    const cpmkList = req.body.cpmk || [];

    for (const cpmk of cpmkList) {
      const dataCpmk = {
        id_unit_prodi: dataMK.id_unit_prodi, // Memastikan id_unit_prodi diteruskan
        kode_cpmk: cpmk.kode_cpmk,
        // === PERBAIKAN 2: Petakan 'deskripsi' dari body ke 'deskripsi_cpmk' ===
        deskripsi_cpmk: cpmk.deskripsi, 
      };

      if (!dataCpmk.kode_cpmk || !dataCpmk.deskripsi_cpmk) {
        await conn.rollback();
        return res.status(400).json({ error: `CPMK dalam list harus punya 'kode_cpmk' dan 'deskripsi'.`});
      }

      if (await hasColumn('cpmk', 'created_by') && req.user?.id_user) {
        dataCpmk.created_by = req.user.id_user;
      }

      const [cpmkRes] = await conn.query(`INSERT INTO cpmk SET ?`, [dataCpmk]);
      const cpmkId = cpmkRes.insertId;

      // Hubungkan CPMK yang baru dibuat dengan MK-nya
      await conn.query(
        `INSERT INTO map_cpmk_mk (id_cpmk, id_mk) VALUES (?, ?)`,
        [cpmkId, mkId]
      );
    }

    await conn.commit();

    // Ambil data lengkap yang baru dibuat untuk dikirim sebagai respons
    const [mkRow] = await pool.query(
      `SELECT mk.*, uk.nama_unit AS nama_unit_prodi 
       FROM mata_kuliah mk LEFT JOIN unit_kerja uk ON mk.id_unit_prodi = uk.id_unit 
       WHERE mk.id_mk=?`,
      [mkId]
    );
     const [cpmkRows] = await pool.query(
      `SELECT c.* FROM cpmk c JOIN map_cpmk_mk map ON c.id_cpmk = map.id_cpmk WHERE map.id_mk=?`,
      [mkId]
    );

    res.status(201).json({
      ...mkRow[0],
      cpmk_list: cpmkRows
    });
  } catch (err) {
    await conn.rollback();
    console.error("Error createMataKuliah:", err);
    res.status(500).json({ error: 'Create failed', details: err.sqlMessage || err.message });
  } finally {
    conn.release();
  }
};

// === UPDATE MK (CATATAN: Fungsi ini hanya mengupdate data MK, bukan CPMK-nya) ===
export const updateMataKuliah = async (req, res) => {
  try {
    const data = {
      id_unit_prodi: req.body.id_unit_prodi,
      kode_mk: req.body.kode_mk,
      nama_mk: req.body.nama_mk,
      sks: req.body.sks,
      semester: req.body.semester,
    };
    
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (await hasColumn('mata_kuliah', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(`UPDATE mata_kuliah SET ? WHERE id_mk=?`, [data, req.params.id]);

    const [row] = await pool.query(
      `SELECT mk.*, uk.nama_unit AS nama_unit_prodi 
       FROM mata_kuliah mk LEFT JOIN unit_kerja uk ON mk.id_unit_prodi = uk.id_unit 
       WHERE mk.id_mk=?`,
      [req.params.id]
    );
    res.json(row[0]);
  } catch (err) {
    console.error("Error updateMataKuliah:", err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// === SOFT DELETE MK ===
export const softDeleteMataKuliah = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('mata_kuliah', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(`UPDATE mata_kuliah SET ? WHERE id_mk=?`, [payload, req.params.id]);
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    console.error("Error softDeleteMataKuliah:", err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

// === RESTORE MK ===
export const restoreMataKuliah = async (req, res) => {
  try {
    await pool.query(`UPDATE mata_kuliah SET deleted_at=NULL, deleted_by=NULL WHERE id_mk=?`, [req.params.id]);
    res.json({ ok: true, restored: true });
  } catch (err) {
    console.error("Error restoreMataKuliah:", err);
    res.status(500).json({ error: 'Restore failed' });
  }
};

// === HARD DELETE MK (hapus juga map relasi) ===
export const hardDeleteMataKuliah = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM map_cpmk_mk WHERE id_mk=?`, [req.params.id]);
    // Sebaiknya hapus juga CPMK-nya jika mereka eksklusif milik MK ini
    // Untuk sekarang, kita asumsikan CPMK bisa dipakai ulang, jadi hanya map-nya yang dihapus
    await conn.query(`DELETE FROM mata_kuliah WHERE id_mk=?`, [req.params.id]);
    await conn.commit();
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    await conn.rollback();
    console.error("Error hardDeleteMataKuliah:", err);
    res.status(500).json({ error: 'Hard delete failed' });
  } finally {
    conn.release();
  }
};
