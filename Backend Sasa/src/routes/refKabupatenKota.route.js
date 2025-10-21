import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';

export const refKabupatenKotaRouter = Router();

const listRefKabupatenKota = async (req, res) => {
  const q = req.query || {};
  const idProvinsiParam = q.id_provinsi ?? null;
  const searchParam = q.search ?? null;

  let sql = `
    SELECT
      rk.*,
      rp.nama_provinsi AS nama_provinsi
    FROM ref_kabupaten_kota rk
    LEFT JOIN ref_provinsi rp ON rk.id_provinsi = rp.id_provinsi
  `;
  const where = [];
  const params = [];

  if (idProvinsiParam) {
    where.push('rk.id_provinsi = ?');
    params.push(idProvinsiParam);
  }

  if (searchParam) {
    where.push('rk.nama_kabupaten_kota LIKE ?');
    params.push(`%${searchParam}%`);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY rk.nama_kabupaten_kota ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Gagal memuat data kabupaten/kota' });
  }
};

const crud = crudFactory({
  table: 'ref_kabupaten_kota',
  idCol: 'id_kabupaten_kota',
  allowedCols: [
    'id_provinsi',
    'nama_kabupaten_kota',
  ],
  resourceKey: 'ref_kabupaten_kota',
  list: listRefKabupatenKota,
});

// ---- CRUD ----
refKabupatenKotaRouter.get('/', requireAuth, permit('ref_kabupaten_kota'), listRefKabupatenKota);
refKabupatenKotaRouter.get('/:id(\d+)', requireAuth, permit('ref_kabupaten_kota'), crud.getById);
refKabupatenKotaRouter.post('/', requireAuth, permit('ref_kabupaten_kota'), crud.create);
refKabupatenKotaRouter.put('/:id(\d+)', requireAuth, permit('ref_kabupaten_kota'), crud.update);
refKabupatenKotaRouter.delete('/:id', requireAuth, permit('ref_kabupaten_kota'), crud.remove);
refKabupatenKotaRouter.post('/:id/restore', requireAuth, permit('ref_kabupaten_kota'), crud.restore);
refKabupatenKotaRouter.delete('/:id/hard-delete', requireAuth, permit('ref_kabupaten_kota'), crud.hardRemove);

export default refKabupatenKotaRouter;
