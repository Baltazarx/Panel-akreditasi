import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';

export const dosenRouter = Router();

// ✨ Sesuaikan allowedCols agar match schema DB
const dosenCrud = crudFactory({
  table: 'dosen',
  idCol: 'id_dosen',
  allowedCols: ['id_pegawai', 'nidn', 'nuptk', 'homebase', 'id_jafung', 'beban_sks', 'pt'], // Update allowedCols
  resourceKey: 'dosen',
});

// List dengan scope unit untuk non-super
async function listScoped(req, res) {
  const { role, id_unit } = req.user;
  const superRoles = new Set(['waket-1', 'waket-2', 'tpm', 'ketuastikom']); // ketuastikom boleh lihat semua (R)

  if (superRoles.has(role)) {
    try {
      const [rows] = await pool.query(
        `
        SELECT
          d.id_dosen, d.nidn, d.nuptk, d.beban_sks, d.homebase, d.pt,
          p.nama_lengkap, d.id_pegawai,
          rjf.nama_jafung AS jabatan_fungsional, d.id_jafung
        FROM dosen d
        JOIN pegawai p ON d.id_pegawai = p.id_pegawai
        LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
        ORDER BY d.id_dosen ASC
        `
      );
      return res.json(rows);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Gagal memuat data dosen' });
    }
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT
        d.id_dosen, d.nidn, d.nuptk, d.beban_sks, d.homebase,
        p.nama_lengkap, d.id_pegawai,
        rjf.nama_jafung AS jabatan_fungsional, d.id_jafung
      FROM dosen d
      JOIN pegawai p ON d.id_pegawai = p.id_pegawai
      LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
      WHERE p.id_unit = ?
      ORDER BY d.id_dosen ASC
      `,
      [id_unit]
    );
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Gagal memuat data dosen' });
  }
}

dosenRouter.get('/',      requireAuth, permit('dosen'), listScoped);
dosenRouter.get('/:id',   requireAuth, permit('dosen'), dosenCrud.getById);
dosenRouter.post('/',     requireAuth, permit('dosen'), dosenCrud.create);
dosenRouter.put('/:id',   requireAuth, permit('dosen'), dosenCrud.update);
dosenRouter.delete('/:id', requireAuth, permit('dosen'), dosenCrud.remove);
