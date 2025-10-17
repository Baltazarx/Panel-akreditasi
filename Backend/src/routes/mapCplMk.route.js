import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';

export const mapCplMkRouter = Router();

const crud = crudFactory({
  table: 'map_cpl_mk',
  idCol: 'id_cpl',
  allowedCols: ['id_cpl', 'id_mk', 'id_unit_prodi', 'id_tahun'],
  resourceKey: 'map_cpl_mk',
  softDelete: false,
  withRestore: false,
});

// Custom logic for compound keys
mapCplMkRouter.get('/:id_cpl/:id_mk', requireAuth, permit('map_cpl_mk'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM map_cpl_mk WHERE id_cpl = ? AND id_mk = ?`,
      [req.params.id_cpl, req.params.id_mk]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Get by composite ID failed' });
  }
});

mapCplMkRouter.put('/:id_cpl/:id_mk', requireAuth, permit('map_cpl_mk'), (req, res) => crud.updateComposite(req, res, ['id_cpl', 'id_mk']));
mapCplMkRouter.delete('/:id_cpl/:id_mk', requireAuth, permit('map_cpl_mk'), async (req, res) => {
  try {
    const [r] = await pool.query(
      `DELETE FROM map_cpl_mk WHERE id_cpl = ? AND id_mk = ?`,
      [req.params.id_cpl, req.params.id_mk]
    );
    res.json({ ok: r.affectedRows > 0, hardDeleted: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Delete by composite ID failed' });
  }
});

// ---- CRUD (Standard, for list and create) ----
mapCplMkRouter.get('/', requireAuth, permit('map_cpl_mk'), async (req, res) => {
  const { id_mk } = req.query; // Dapatkan id_mk dari query parameter
  let sql = `SELECT * FROM map_cpl_mk`;
  const params = [];

  if (id_mk) {
    sql += ` WHERE id_mk = ?`;
    params.push(id_mk);
  }

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch map_cpl_mk' });
  }
});
mapCplMkRouter.post('/', requireAuth, permit('map_cpl_mk'), crud.create);

export default mapCplMkRouter;
