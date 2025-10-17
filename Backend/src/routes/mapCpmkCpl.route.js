import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';

export const mapCpmkCplRouter = Router();

const crud = crudFactory({
  table: 'map_cpmk_cpl',
  idCol: 'id_cpmk',
  allowedCols: ['id_cpmk', 'id_cpl'],
  resourceKey: 'map_cpmk_cpl',
  softDelete: false,
  withRestore: false,
});

// Custom logic for compound keys
mapCpmkCplRouter.get('/:id_cpmk/:id_cpl', requireAuth, permit('map_cpmk_cpl'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM map_cpmk_cpl WHERE id_cpmk = ? AND id_cpl = ?`,
      [req.params.id_cpmk, req.params.id_cpl]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Get by composite ID failed' });
  }
});

mapCpmkCplRouter.put('/:id_cpmk/:id_cpl', requireAuth, permit('map_cpmk_cpl'), (req, res) => crud.updateComposite(req, res, ['id_cpmk', 'id_cpl']));
mapCpmkCplRouter.delete('/:id_cpmk/:id_cpl', requireAuth, permit('map_cpmk_cpl'), async (req, res) => {
  try {
    const [r] = await pool.query(
      `DELETE FROM map_cpmk_cpl WHERE id_cpmk = ? AND id_cpl = ?`,
      [req.params.id_cpmk, req.params.id_cpl]
    );
    res.json({ ok: r.affectedRows > 0, hardDeleted: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Delete by composite ID failed' });
  }
});

// ---- CRUD (Standard, for list and create) ----
mapCpmkCplRouter.get('/', requireAuth, permit('map_cpmk_cpl'), async (req, res) => {
  const { id_cpmk, id_cpl } = req.query; // Dapatkan parameter dari query
  let sql = `SELECT * FROM map_cpmk_cpl`;
  const params = [];

  if (id_cpmk) {
    sql += ` WHERE id_cpmk = ?`;
    params.push(id_cpmk);
  }

  if (id_cpl) {
    if (params.length > 0) {
      sql += ` AND id_cpl = ?`;
    } else {
      sql += ` WHERE id_cpl = ?`;
    }
    params.push(id_cpl);
  }

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch map_cpmk_cpl' });
  }
});

mapCpmkCplRouter.post('/', requireAuth, permit('map_cpmk_cpl'), crud.create);

export default mapCpmkCplRouter;
