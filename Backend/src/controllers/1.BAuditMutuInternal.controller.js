import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';

// ===== LIST =====
export const listAuditMutuInternal = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'audit_mutu_internal', 'ami');
    const orderBy = buildOrderBy(req.query?.order_by, 'id_ami', 'ami');

    let sql = `
      SELECT 
        ami.*,
        uk.nama_unit
      FROM audit_mutu_internal ami
      LEFT JOIN unit_kerja uk ON ami.id_unit = uk.id_unit
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error listAuditMutuInternal:", err);
    res.status(500).json({ error: 'List failed' });
  }
};

// ===== GET BY ID =====
export const getAuditMutuInternalById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM audit_mutu_internal WHERE id_ami=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Get failed' });
  }
};

// ===== CREATE =====
export const createAuditMutuInternal = async (req, res) => {
  try {
    const data = {
      id_unit: req.body.id_unit,
      id_tahun: req.body.id_tahun,
      frekuensi_audit: req.body.frekuensi_audit,
      dokumen_spmi: req.body.dokumen_spmi,
      laporan_audit_url: req.body.laporan_audit_url,
      jumlah_auditor_certified: req.body.jumlah_auditor_certified,
      jumlah_auditor_noncertified: req.body.jumlah_auditor_noncertified,
      bukti_certified_url: req.body.bukti_certified_url,
    };
    if (await hasColumn('audit_mutu_internal', 'created_by') && req.user?.id_user) {
      data.created_by = req.user.id_user;
    }

    const [r] = await pool.query(`INSERT INTO audit_mutu_internal SET ?`, [data]);
    const [row] = await pool.query(
      `SELECT * FROM audit_mutu_internal WHERE id_ami=?`,
      [r.insertId]
    );
    res.status(201).json(row[0]);
  } catch (err) {
    res.status(500).json({ error: 'Create failed' });
  }
};

// ===== UPDATE =====
export const updateAuditMutuInternal = async (req, res) => {
  try {
    const data = {
      id_unit: req.body.id_unit,
      id_tahun: req.body.id_tahun,
      frekuensi_audit: req.body.frekuensi_audit,
      dokumen_spmi: req.body.dokumen_spmi,
      laporan_audit_url: req.body.laporan_audit_url,
      jumlah_auditor_certified: req.body.jumlah_auditor_certified,
      jumlah_auditor_noncertified: req.body.jumlah_auditor_noncertified,
      bukti_certified_url: req.body.bukti_certified_url,
    };
    if (await hasColumn('audit_mutu_internal', 'updated_by') && req.user?.id_user) {
      data.updated_by = req.user.id_user;
    }

    await pool.query(
      `UPDATE audit_mutu_internal SET ? WHERE id_ami=?`,
      [data, req.params.id]
    );
    const [row] = await pool.query(
      `SELECT * FROM audit_mutu_internal WHERE id_ami=?`,
      [req.params.id]
    );
    if (!row[0]) return res.status(404).json({ error: 'Not found' });
    res.json(row[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// ===== DELETE (soft/hard) =====
export const softDeleteAuditMutuInternal = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('audit_mutu_internal', 'deleted_by')) {
      payload.deleted_by = req.user?.id_user || null;
    }
    await pool.query(
      `UPDATE audit_mutu_internal SET ? WHERE id_ami=?`,
      [payload, req.params.id]
    );
    res.json({ ok: true, softDeleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

export const restoreAuditMutuInternal = async (req, res) => {
  try {
    await pool.query(
      `UPDATE audit_mutu_internal SET deleted_at=NULL, deleted_by=NULL WHERE id_ami=?`,
      [req.params.id]
    );
    res.json({ ok: true, restored: true });
  } catch (err) {
    res.status(500).json({ error: 'Restore failed' });
  }
};

export const hardDeleteAuditMutuInternal = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM audit_mutu_internal WHERE id_ami=?`,
      [req.params.id]
    );
    res.json({ ok: true, hardDeleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Hard delete failed' });
  }
};
