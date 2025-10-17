// src/routes/pimpinan.route.js  (1.A.1)
import { Router } from 'express';
import { permit } from '../rbac/permit.middleware.js';
import { crudFactory } from '../utils/crudFactory.js';
import { requireOwnerOrWaket } from '../utils/owner.middleware.js';
import { pool } from '../db.js';

const factory = crudFactory({
  table: 'pimpinan_upps_ps',
  idCol: 'id_pimpinan',
  resourceKey: 'tabel_1a1',
  allowedCols: ['id_unit','id_pegawai','periode_mulai','periode_selesai','tupoksi']
});

// Custom list function untuk join dengan tabel pegawai, dosen, dan jabatan fungsional
const listWithJoin = async (req, res) => {
  const query = `
    SELECT 
      p.id_pimpinan,
      p.id_unit,
      p.id_pegawai,
      p.periode_mulai,
      p.periode_selesai,
      p.tupoksi,
      uk.nama_unit,
      pg.nama_lengkap,
      pg.pendidikan_terakhir,
      pg.nikp,
      pg.jenjang_pendidikan,
      rjf.nama_jafung as jabatan_fungsional,
      p.periode_mulai as tahun_mulai,
      p.periode_selesai as tahun_selesai
    FROM pimpinan_upps_ps p
    LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
    LEFT JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
    LEFT JOIN dosen d ON pg.id_pegawai = d.id_pegawai
    LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
    ORDER BY p.id_pimpinan DESC
  `;
  
  const [rows] = await pool.query(query);
  res.json(rows);
};

// Custom getById function untuk join dengan tabel pegawai, dosen, dan jabatan fungsional
const getByIdWithJoin = async (req, res) => {
  const query = `
    SELECT 
      p.id_pimpinan,
      p.id_unit,
      p.id_pegawai,
      p.periode_mulai,
      p.periode_selesai,
      p.tupoksi,
      uk.nama_unit,
      pg.nama_lengkap,
      pg.pendidikan_terakhir,
      pg.nikp,
      pg.jenjang_pendidikan,
      rjf.nama_jafung as jabatan_fungsional,
      p.periode_mulai as tahun_mulai,
      p.periode_selesai as tahun_selesai
    FROM pimpinan_upps_ps p
    LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
    LEFT JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
    LEFT JOIN dosen d ON pg.id_pegawai = d.id_pegawai
    LEFT JOIN ref_jabatan_fungsional rjf ON d.id_jafung = rjf.id_jafung
    WHERE p.id_pimpinan = ?
  `;
  
  const [rows] = await pool.query(query, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
};

export const pimpinanRouter = Router();
pimpinanRouter.use(permit('pimpinan'));
pimpinanRouter.get('/', listWithJoin);
pimpinanRouter.get('/:id', getByIdWithJoin);
pimpinanRouter.post('/', factory.create);
pimpinanRouter.put('/:id', factory.update);
pimpinanRouter.delete('/:id', requireOwnerOrWaket(factory.fetchRowById), factory.remove);
