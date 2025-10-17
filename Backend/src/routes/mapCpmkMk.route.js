import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';

export const mapCpmkMkRouter = Router();

const crud = crudFactory({
  table: 'map_cpmk_mk',
  idCol: 'id_cpmk',
  allowedCols: ['id_cpmk', 'id_mk'],
  resourceKey: 'map_cpmk_mk',
  softDelete: false,
  withRestore: false,
});

// Custom logic for compound keys
mapCpmkMkRouter.get('/:id_cpmk/:id_mk', requireAuth, permit('map_cpmk_mk'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM map_cpmk_mk WHERE id_cpmk = ? AND id_mk = ?`,
      [req.params.id_cpmk, req.params.id_mk]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Get by composite ID failed' });
  }
});

mapCpmkMkRouter.put('/:id_cpmk/:id_mk', requireAuth, permit('map_cpmk_mk'), (req, res) => crud.updateComposite(req, res, ['id_cpmk', 'id_mk']));
mapCpmkMkRouter.delete('/:id_cpmk/:id_mk', requireAuth, permit('map_cpmk_mk'), async (req, res) => {
  try {
    const [r] = await pool.query(
      `DELETE FROM map_cpmk_mk WHERE id_cpmk = ? AND id_mk = ?`,
      [req.params.id_cpmk, req.params.id_mk]
    );
    res.json({ ok: r.affectedRows > 0, hardDeleted: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Delete by composite ID failed' });
  }
});

// ---- CRUD (Standard, for list and create) ----
mapCpmkMkRouter.get('/', requireAuth, permit('map_cpmk_mk'), async (req, res) => {
  const { id_cpmk, id_mk } = req.query; // Dapatkan parameter dari query
  let sql = `SELECT * FROM map_cpmk_mk`;
  const params = [];

  if (id_cpmk) {
    sql += ` WHERE id_cpmk = ?`;
    params.push(id_cpmk);
  }

  if (id_mk) {
    if (params.length > 0) {
      sql += ` AND id_mk = ?`;
    } else {
      sql += ` WHERE id_mk = ?`;
    }
    params.push(id_mk);
  }

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch map_cpmk_mk' });
  }
});

mapCpmkMkRouter.post('/', requireAuth, permit('map_cpmk_mk'), crud.create);

export default mapCpmkMkRouter;
