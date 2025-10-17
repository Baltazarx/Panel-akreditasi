// src/utils/crudFactory.js
import { pool } from '../db.js';

/**
 * CRUD factory (TS-ready):
 * - Filter TS:
 *    • ?id_tahun=ID       (baru)
 *    • ?id_tahun_in=1,2   (baru, multi tahun)
 *    • ?tahun=ID          (legacy, tetap didukung)
 * - ?relasi=1  -> LEFT JOIN tahun_akademik (jika tabel punya id_tahun)
 * - soft delete (deleted_at, deleted_by) + ?include_deleted=1
 * - restore: POST /:id/restore
 * - auto created_by / updated_by jika kolomnya ada
 * - ?order_by=kolom ASC|DESC (disanitasi + auto prefix alias "m.")
 */
export function crudFactory({
  table,
  idCol,
  allowedCols = [],
  resourceKey,
  softDelete = true,
  withRestore = true,
}) {
  const colCache = new Map();
  const hasCol = async (col) => {
    const key = `${table}.${col}`;
    if (colCache.has(key)) return colCache.get(key);
    const [rows] = await pool.query(
      `SELECT 1 FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
      [table, col]
    );
    const ok = rows.length > 0;
    colCache.set(key, ok);
    return ok;
  };

  const pick = (obj, keys) => {
    const out = {};
    for (const k of keys) if (obj?.[k] !== undefined) out[k] = obj[k];
    return out;
  };

  // --- TS & soft-delete where builder ---
  const buildWhere = async (req) => {
    const where = [];
    const params = [];

    const hasIdTahun = await hasCol('id_tahun');
    
    if (hasIdTahun) {
      const q = req.query || {};
      const qSingle = q.id_tahun ?? q.tahun; // single (baru / legacy)
      const qMulti = q.id_tahun_in;          // "1,2,3"
      if (qSingle) {
        where.push('m.id_tahun = ?');                 // pakai alias m.
        params.push(qSingle);
      } else if (qMulti) {
        const arr = String(qMulti).split(',').map(s => s.trim()).filter(Boolean);
        if (arr.length) {
          where.push(`m.id_tahun IN (${arr.map(()=> '?').join(',')})`); // alias m.
          params.push(...arr);
        }
      }
    }

    if (softDelete && await hasCol('deleted_at')) {
      const includeDeleted = req.query?.include_deleted;
      if (String(includeDeleted) !== '1') where.push('m.deleted_at IS NULL'); // alias m.
    }

    return { where, params, hasIdTahun };
  };

  // --- whitelist order_by sederhana untuk cegah injection + auto prefix alias "m." ---
  const buildOrderBy = (raw, idCol) => {
    const def = `m.${idCol} DESC`;
    if (!raw) return def;
    // izinkan huruf/angka/underscore/titik/koma/whitespace + ASC|DESC
    const ok = /^[a-zA-Z0-9_,\s\.]+(ASC|DESC)?(\s*,\s*[a-zA-Z0-9_\.\s]+(ASC|DESC)?)*$/.test(raw);
    if (!ok) return def;
    // auto prefix "m." jika tidak ada alias/ titik
    const withAlias = raw
      .split(',')
      .map(s => s.trim())
      .map(part => {
        // sudah ada alias/titik? biarkan
        if (part.includes('.')) return part;
        // split "kolom [ASC|DESC]"
        const m = part.match(/^([a-zA-Z0-9_]+)(\s+(ASC|DESC))?$/i);
        if (!m) return part;
        const col = m[1];
        const dir = (m[2] || '').trim();
        return `m.${col}${dir ? ' ' + dir : ''}`;
      })
      .join(', ');
    return withAlias || def;
  };

  const list = async (req, res) => {
    try {
      const { where, params, hasIdTahun } = await buildWhere(req);

      // SELECT & optional JOIN tahun_akademik
      const selectCols = ['m.*'];
      let joinSql = '';
      if (req.query?.relasi === '1' && hasIdTahun) {
        joinSql = ` LEFT JOIN tahun_akademik t ON t.id_tahun = m.id_tahun`;
        // hanya ambil t.tahun (jangan t.nama)
        selectCols.push('t.tahun AS tahun_text');
      }

      const orderBy = buildOrderBy(req.query?.order_by, idCol);

      const sql = `
        SELECT ${selectCols.join(', ')}
        FROM ${table} m
        ${joinSql}
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY ${orderBy}
      `;

      // Special handling for map_cpl_pl to filter by id_unit_prodi if requested
      if (table === 'map_cpl_pl' && (req.query?.id_unit_prodi || req.query?.id_cpl)) {
        // We need to join with cpl and profil_lulusan to filter by id_unit_prodi
        const cplJoin = 'LEFT JOIN cpl ON cpl.id_cpl = m.id_cpl';
        const profilLulusanJoin = 'LEFT JOIN profil_lulusan pl ON pl.id_pl = m.id_pl';
        const conditions = [];
        const queryParams = [];

        if (req.query?.id_unit_prodi) {
          // Filter by BOTH cpl.id_unit_prodi AND pl.id_unit_prodi to ensure consistency
          conditions.push(`cpl.id_unit_prodi = ? AND pl.id_unit_prodi = ?`);
          queryParams.push(req.query.id_unit_prodi, req.query.id_unit_prodi);
        }
        if (req.query?.id_cpl) {
          conditions.push(`m.id_cpl = ?`);
          queryParams.push(req.query.id_cpl);
        }

        const finalSql = `
          SELECT m.*
          FROM map_cpl_pl m
          ${cplJoin}
          ${profilLulusanJoin}
          ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
          ORDER BY m.id_cpl ASC, m.id_pl ASC
        `;
        const [rows] = await pool.query(finalSql, queryParams);
        return res.json(rows);
      }

      const [rows] = await pool.query(sql, params);
      res.json(rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'List failed' });
    }
  };

  const getById = async (req, res) => {
    try {
      let queryIdCol = idCol;
      let queryIdVal = [req.params.id];

      if (Array.isArray(idCol)) {
        queryIdCol = idCol.map(col => `${col}=?`).join(' AND ');
        queryIdVal = idCol.map(col => req.params[col]);
      } else {
        queryIdCol = `${idCol}=?`;
      }

      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${queryIdCol}`, queryIdVal);
      if (!rows[0]) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Get failed' });
    }
  };

  const create = async (req, res) => {
    try {
      // Special handling for map_cpl_pl (multiple inserts)
      if (table === 'map_cpl_pl' && Array.isArray(req.body) && req.body.every(item => item.id_cpl && item.id_pl)) {
        if (req.body.length === 0) return res.status(201).json([]); // No items to insert

        const insertPromises = req.body.map(async (item) => {
          const data = pick(item, ['id_cpl', 'id_pl']);
          // Check for existing mapping before inserting
          const [existing] = await pool.query(
            `SELECT 1 FROM ${table} WHERE id_cpl = ? AND id_pl = ?`,
            [data.id_cpl, data.id_pl]
          );
          if (existing.length === 0) {
            await pool.query(`INSERT INTO ${table} SET ?`, [data]);
            return { ...data, inserted: true };
          }
          return { ...data, inserted: false, reason: 'already exists' };
        });
        const results = await Promise.all(insertPromises);
        return res.status(201).json(results);
      }

      const data = pick(req.body, allowedCols);
      if (await hasCol('created_by') && req.user?.id_user && data.created_by === undefined) {
        data.created_by = req.user.id_user;
      }
      // --- START: Penanganan khusus untuk daya_tampung di tabel tabel_2a1_mahasiswa_baru_aktif ---
      if (table === 'tabel_2a1_mahasiswa_baru_aktif' && allowedCols.includes('daya_tampung')) {
        if (data.daya_tampung === undefined || data.daya_tampung === '') {
          // Jika daya_tampung tidak disediakan dalam payload, coba ambil dari yang sudah ada
          const [existingDayaTampungRows] = await pool.query(
            `SELECT daya_tampung FROM tabel_2a1_mahasiswa_baru_aktif
             WHERE id_unit_prodi = ? AND id_tahun = ? LIMIT 1`,
            [data.id_unit_prodi, data.id_tahun]
          );

          if (existingDayaTampungRows.length > 0) {
            data.daya_tampung = existingDayaTampungRows[0].daya_tampung; // Gunakan daya_tampung yang sudah ada
          } else {
            data.daya_tampung = 0; // Jika tidak ada dan tidak disediakan, gunakan 0 sebagai default
          }
        } else {
          // Jika daya_tampung disediakan dalam payload, pastikan itu adalah angka
          data.daya_tampung = Number(data.daya_tampung); // Konversi ke angka
          if (isNaN(data.daya_tampung)) data.daya_tampung = 0; // Fallback jika konversi gagal
        }
      }
      // --- END: Penanganan khusus ---
      const [r] = await pool.query(`INSERT INTO ${table} SET ?`, [data]);
      if (r.affectedRows === 0) {
        return res.status(400).json({ error: 'Create failed' });
      }
      const [row] = await pool.query(`SELECT * FROM ${table} WHERE ${idCol}=?`, [r.insertId]);
      res.status(201).json(row[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Create failed' });
    }
  };

  const update = async (req, res) => {
    try {
      console.log(`crudFactory.update: Table: ${table}, ID: ${req.params.id}, Data:`, req.body);
      const data = pick(req.body, allowedCols);
      console.log("crudFactory.update: Picked data for update:", data);
      if (await hasCol('updated_by') && req.user?.id_user) {
        data.updated_by = req.user.id_user;
      }
      const updateSql = `UPDATE ${table} SET ? WHERE ${idCol}=?`;
      console.log("crudFactory.update: Update SQL:", updateSql, [data, req.params.id]);
      const [updateResult] = await pool.query(updateSql, [data, req.params.id]);
      console.log("crudFactory.update: Update result:", updateResult);

      const selectSql = `SELECT * FROM ${table} WHERE ${idCol}=?`;
      console.log("crudFactory.update: Select SQL after update:", selectSql, [req.params.id]);
      const [row] = await pool.query(selectSql, [req.params.id]);
      console.log("crudFactory.update: Selected row after update:", row);
      if (!row[0]) return res.status(404).json({ error: 'Not found' });
      res.json(row[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Update failed' });
    }
  };

  const updateComposite = async (req, res) => {
    try {
      const data = pick(req.body, allowedCols.filter(col => !Array.isArray(idCol) || !idCol.includes(col)));
      if (await hasCol('updated_by') && req.user?.id_user) {
        data.updated_by = req.user.id_user;
      }

      if (!Array.isArray(idCol)) {
        return res.status(400).json({ error: 'idCol must be an array for updateComposite' });
      }

      const idValues = idCol.map(col => req.params[col]);
      const whereClause = idCol.map(col => `${col}=?`).join(' AND ');

      const updateSql = `UPDATE ${table} SET ? WHERE ${whereClause}`;
      await pool.query(updateSql, [data, ...idValues]);

      const selectSql = `SELECT * FROM ${table} WHERE ${whereClause}`;
      const [row] = await pool.query(selectSql, [...idValues]);
      if (!row[0]) return res.status(404).json({ error: 'Not found' });
      res.json(row[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Update composite failed' });
    }
  };

  const remove = async (req, res) => {
    console.log(`crudFactory.remove: Attempting to delete ID: ${req.params.id} from table: ${table}`); // Added console.log
    try {
      const id = req.params.id;
      if (softDelete && await hasCol('deleted_at')) {
        const by = req.user?.id_user ?? null;
        const payload = { deleted_at: new Date() };
        if (await hasCol('deleted_by')) payload.deleted_by = by;
        const [r] = await pool.query(`UPDATE ${table} SET ? WHERE ${idCol}=?`, [payload, id]);
        return res.json({ ok: r.affectedRows > 0, softDeleted: true });
      }
      const [r] = await pool.query(`DELETE FROM ${table} WHERE ${idCol}=?`, [id]);
      res.json({ ok: r.affectedRows > 0, hardDeleted: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Delete failed' });
    }
  };

  const removeComposite = async (req, res) => {
    console.log(`crudFactory.removeComposite: Attempting to delete composite ID from table: ${table}`);
    try {
      if (!Array.isArray(idCol)) {
        return res.status(400).json({ error: 'idCol must be an array for removeComposite' });
      }

      const idValues = idCol.map(col => req.params[col]);
      console.log(`crudFactory.removeComposite: Extracted ID values: ${idValues}`);
      const whereClause = idCol.map(col => `${col}=?`).join(' AND ');
      console.log(`crudFactory.removeComposite: Generated WHERE clause: ${whereClause}`);

      const [r] = await pool.query(`DELETE FROM ${table} WHERE ${whereClause}`, [...idValues]);
      console.log(`crudFactory.removeComposite: DELETE SQL result:`, r);
      res.json({ ok: r.affectedRows > 0, hardDeleted: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Remove composite failed' });
    }
  };

  const restore = async (req, res) => {
    console.log(`crudFactory.restore: Attempting to restore ID: ${req.params.id} from table: ${table}`);
    try {
      if (!(withRestore && await hasCol('deleted_at'))) {
        return res.status(405).json({ error: 'Restore not supported' });
      }
      const [r] = await pool.query(
        `UPDATE ${table} SET deleted_at=NULL, deleted_by=NULL WHERE ${idCol}=?`,
        [req.params.id]
      );
      res.json({ ok: r.affectedRows > 0 });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Restore failed' });
    }
  };

  const restoreMultiple = async (req, res) => {
    try {
      if (!(withRestore && await hasCol('deleted_at'))) {
        return res.status(405).json({ error: 'Restore multiple not supported' });
      }
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty array of IDs' });
      }

      const placeholders = ids.map(() => '?').join(',');
      const [r] = await pool.query(
        `UPDATE ${table} SET deleted_at=NULL, deleted_by=NULL WHERE ${idCol} IN (${placeholders})`,
        ids
      );
      res.json({ ok: r.affectedRows > 0 });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Restore multiple failed' });
    }
  };

  const hardRemove = async (req, res) => {
    console.log(`crudFactory.hardRemove: Attempting to hard delete ID: ${req.params.id} from table: ${table}`);
    try {
      const id = req.params.id;
      const [r] = await pool.query(`DELETE FROM ${table} WHERE ${idCol}=?`, [id]);
      res.json({ ok: r.affectedRows > 0, hardDeleted: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Hard delete failed' });
    }
  };

  const fetchRowById = async (id) => {
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${Array.isArray(idCol) ? idCol.map(col => `${col}=?`).join(' AND ') : `${idCol}=?`}`, Array.isArray(idCol) ? id : [id]);
    return rows[0];
  };

  return { list, getById, create, update, remove, restore, restoreMultiple, hardRemove, fetchRowById, updateComposite, removeComposite, resourceKey };
}
