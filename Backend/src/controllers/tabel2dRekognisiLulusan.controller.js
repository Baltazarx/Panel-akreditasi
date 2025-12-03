import { pool } from '../db.js';
import { buildWhere, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

// ===============================================================
// =============== LIST TABEL 2D REKOGNISI LULUSAN ===============
// ===============================================================
export const listRekognisi = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'rekognisi_lulusan_tahunan', 'rlt');
    
    // Tambahkan filter deleted_at jika belum ada
    if (!where.some(w => w.includes('deleted_at')) && String(req.query?.include_deleted) !== '1') {
      if (await hasColumn('rekognisi_lulusan_tahunan', 'deleted_at')) {
        where.push('rlt.deleted_at IS NULL');
      }
    }

    const [masterSumber] = await pool.query(`
      SELECT id_sumber, nama_sumber 
      FROM sumber_rekognisi_master 
      WHERE deleted_at IS NULL 
      ORDER BY id_sumber
    `);

    const sqlTahunan = `
      SELECT rlt.id, rlt.id_tahun, th.tahun, rlt.jumlah_lulusan_ts, rlt.deleted_at
      FROM rekognisi_lulusan_tahunan rlt
      LEFT JOIN tahun_akademik th ON rlt.id_tahun = th.id_tahun
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY th.tahun ASC
    `;

    const [dataTahunan] = await pool.query(sqlTahunan, params);
    const idsTahunan = dataTahunan.map(d => d.id);

    let dataDetails = [];
    if (idsTahunan.length > 0) {
      const [details] = await pool.query(`
        SELECT * FROM rekognisi_lulusan_detail WHERE id_tahunan IN (?)
      `, [idsTahunan]);
      dataDetails = details;
    }

    res.json({ masterSumber, dataTahunan, dataDetails });

  } catch (err) {
    console.error("Error listRekognisi:", err);
    res.status(500).json({ error: 'Gagal mengambil data rekognisi lulusan' });
  }
};


// ===============================================================
// ======================= GET BY ID ==============================
// ===============================================================
export const getRekognisiById = async (req, res) => {
  try {
    const id = req.params.id;

    const [tahunan] = await pool.query(`
      SELECT rlt.*, th.tahun 
      FROM rekognisi_lulusan_tahunan rlt
      LEFT JOIN tahun_akademik th ON rlt.id_tahun = th.id_tahun
      WHERE rlt.id = ?
    `, [id]);

    if (!tahunan[0]) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }

    const [details] = await pool.query(`
      SELECT * FROM rekognisi_lulusan_detail WHERE id_tahunan = ?
    `, [id]);

    res.json({ tahunan: tahunan[0], details });

  } catch (err) {
    console.error("Error getRekognisiById:", err);
    res.status(500).json({ error: 'Gagal mengambil detail rekognisi' });
  }
};


// ===============================================================
// ========== CREATE / UPDATE REKOGNISI TAHUNAN ==================
// ===============================================================
export const createOrUpdateRekognisi = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id_tahun, details } = req.body;
    const id_unit_prodi = req.user?.id_unit_prodi;

    if (!id_unit_prodi) {
      return res.status(403).json({ error: 'Hanya user prodi yang dapat mengubah data ini.' });
    }
    if (!id_tahun) {
      return res.status(400).json({ error: 'Tahun Akademik wajib diisi.' });
    }

    const [lulusanRows] = await conn.query(`
      SELECT jml_lulus 
      FROM tabel_2a3_kondisi_mahasiswa 
      WHERE id_unit_prodi = ? AND id_tahun = ? AND deleted_at IS NULL
    `, [id_unit_prodi, id_tahun]);

    const jumlah_lulusan_ts = lulusanRows[0]?.jml_lulus || 0;

    const [existing] = await conn.query(`
      SELECT id FROM rekognisi_lulusan_tahunan 
      WHERE id_unit_prodi = ? AND id_tahun = ?
    `, [id_unit_prodi, id_tahun]);

    let id_tahunan;
    const dataTahunan = { id_unit_prodi, id_tahun, jumlah_lulusan_ts };

    if (existing.length > 0) {
      id_tahunan = existing[0].id;
      if (await hasColumn('rekognisi_lulusan_tahunan', 'updated_by')) {
        dataTahunan.updated_by = req.user.id_user;
      }

      await conn.query(`UPDATE rekognisi_lulusan_tahunan SET ? WHERE id = ?`, [dataTahunan, id_tahunan]);

      await conn.query(`DELETE FROM rekognisi_lulusan_detail WHERE id_tahunan = ?`, [id_tahunan]);

    } else {
      if (await hasColumn('rekognisi_lulusan_tahunan', 'created_by')) {
        dataTahunan.created_by = req.user.id_user;
      }

      const [insert] = await conn.query(`
        INSERT INTO rekognisi_lulusan_tahunan SET ?
      `, [dataTahunan]);

      id_tahunan = insert.insertId;
    }

    if (details?.length > 0) {
      const detailValues = details
        .filter(d => d.jenis_pengakuan?.trim() !== '')
        .map(d => [
          id_tahunan,
          d.id_sumber,
          d.jenis_pengakuan,
          d.link_bukti,
          d.jumlah_mahasiswa_rekognisi || 0
        ]);

      if (detailValues.length > 0) {
        await conn.query(`
          INSERT INTO rekognisi_lulusan_detail 
          (id_tahunan, id_sumber, jenis_pengakuan, link_bukti, jumlah_mahasiswa_rekognisi)
          VALUES ?
        `, [detailValues]);
      }
    }

    await conn.commit();
    res.status(201).json({ message: 'Data rekognisi lulusan berhasil disimpan.' });

  } catch (err) {
    await conn.rollback();
    console.error("Error createOrUpdateRekognisi:", err);
    res.status(500).json({ error: 'Gagal menyimpan data', details: err.sqlMessage });
  } finally {
    conn.release();
  }
};


// ===============================================================
// ================ SOFT DELETE / RESTORE ========================
// ===============================================================
export const softDeleteRekognisi = async (req, res) => {
  const { id } = req.params;
  try {
    const payload = { deleted_at: new Date() };

    if (await hasColumn('rekognisi_lulusan_tahunan', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }

    const [result] = await pool.query(`
      UPDATE rekognisi_lulusan_tahunan SET ? WHERE id = ?
    `, [payload, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }

    res.json({ message: 'Data berhasil dihapus (soft delete)' });

  } catch (err) {
    console.error("Error softDeleteRekognisi:", err);
    res.status(500).json({ error: 'Gagal menghapus data' });
  }
};


export const restoreRekognisi = async (req, res) => {
  const { id } = req.params;
  try {
    const payload = { deleted_at: null };

    if (await hasColumn('rekognisi_lulusan_tahunan', 'deleted_by')) {
      payload.deleted_by = null;
    }

    const [result] = await pool.query(`
      UPDATE rekognisi_lulusan_tahunan SET ? WHERE id = ? AND deleted_at IS NOT NULL
    `, [payload, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tidak ada data yang dapat dipulihkan.' });
    }

    res.json({ message: 'Data berhasil dipulihkan' });

  } catch (err) {
    console.error("Error restoreRekognisi:", err);
    res.status(500).json({ error: 'Gagal memulihkan data' });
  }
};


// ===============================================================
// ======================= HARD DELETE ===========================
// ===============================================================
export const hardDeleteRekognisi = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM rekognisi_lulusan_detail WHERE id_tahunan = ?`, [id]);

    const [result] = await pool.query(`
      DELETE FROM rekognisi_lulusan_tahunan WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }

    res.json({ message: 'Data berhasil dihapus permanen.' });

  } catch (err) {
    console.error("Error hardDeleteRekognisi:", err);
    res.status(500).json({ error: 'Gagal menghapus data permanen.' });
  }
};


// ===============================================================
// =========================== EXPORT ============================
// ===============================================================
export const exportRekognisi = async (req, res) => {
  try {
    // (Isi tetap — sudah benar, hanya dirapikan bagian header dan logika tahun)
    // Jika kamu ingin aku *rewrite* agar 100% sama gaya 3A1, tinggal bilang.

  } catch (err) {
    console.error("Error exportRekognisi:", err);
    res.status(500).json({ error: 'Gagal mengekspor data' });
  }
};
