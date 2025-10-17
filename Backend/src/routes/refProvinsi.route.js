import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';

export const refProvinsiRouter = Router();

const listRefProvinsi = async (req, res) => {
  const q = req.query || {};
  const searchParam = q.search ?? null;

  let sql = `SELECT * FROM ref_provinsi`;
  const where = [];
  const params = [];

  if (searchParam) {
    where.push('nama_provinsi LIKE ?');
    params.push(`%${searchParam}%`);
  }

  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY nama_provinsi ASC`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal memuat data provinsi' });
  }
};

const crud = crudFactory({
  table: 'ref_provinsi',
  idCol: 'id_provinsi',
  allowedCols: [
    'nama_provinsi',
  ],
  resourceKey: 'ref_provinsi',
  list: listRefProvinsi,
});

// ---- CRUD ----
refProvinsiRouter.get('/', requireAuth, permit('ref_provinsi'), crud.list);
refProvinsiRouter.get('/:id(\d+)', requireAuth, permit('ref_provinsi'), crud.getById);
refProvinsiRouter.post('/', requireAuth, permit('ref_provinsi'), crud.create);
refProvinsiRouter.put('/:id(\d+)', requireAuth, permit('ref_provinsi'), crud.update);
refProvinsiRouter.delete('/:id', requireAuth, permit('ref_provinsi'), crud.remove);
refProvinsiRouter.post('/:id/restore', requireAuth, permit('ref_provinsi'), crud.restore);
refProvinsiRouter.delete('/:id/hard-delete', requireAuth, permit('ref_provinsi'), crud.hardRemove);

export default refProvinsiRouter;
