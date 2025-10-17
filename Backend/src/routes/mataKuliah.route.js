import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';

export const mataKuliahRouter = Router();

const crud = crudFactory({
  table: 'mata_kuliah',
  idCol: 'id_mk',
  allowedCols: ['id_unit_prodi', 'kode_mk', 'nama_mk', 'sks', 'semester'],
  resourceKey: 'mata_kuliah',
});

const allowedCols = ['id_unit_prodi', 'kode_mk', 'nama_mk', 'sks', 'semester'];

// Custom PUT handler for mata kuliah with PL mapping support
mataKuliahRouter.put('/:id', requireAuth, permit('mata_kuliah'), async (req, res) => {
  const { id } = req.params;
  const { selectedPls, ...mataKuliahData } = req.body;

  try {
    // Start transaction
    await pool.query('START TRANSACTION');

    // 1. Update mata kuliah data
    const updateFields = [];
    const updateValues = [];

    Object.keys(mataKuliahData).forEach(key => {
      if (allowedCols.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(mataKuliahData[key]);
      }
    });

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.query(
        `UPDATE mata_kuliah SET ${updateFields.join(', ')} WHERE id_mk = ?`,
        updateValues
      );
    }

    // 2. Delete existing CPL-MK mappings for this mata kuliah
    await pool.query('DELETE FROM map_cpl_mk WHERE id_mk = ?', [id]);

    // 3. Create new CPL-MK mappings based on selected PLs
    if (Array.isArray(selectedPls) && selectedPls.length > 0) {
      // Get all CPLs that are mapped to the selected PLs for this mata kuliah's prodi
      const placeholders = selectedPls.map(() => '?').join(',');
      const prodiId = mataKuliahData.id_unit_prodi;

      console.log('Updating mata kuliah:', id, 'with selectedPls:', selectedPls, 'prodiId:', prodiId);

      if (!prodiId) {
        throw new Error('id_unit_prodi is required for PL mapping');
      }

      const [cplMappings] = await pool.query(`
        SELECT DISTINCT cpl.id_cpl
        FROM cpl
        INNER JOIN map_cpl_pl ON cpl.id_cpl = map_cpl_pl.id_cpl
        WHERE map_cpl_pl.id_pl IN (${placeholders})
        AND cpl.id_unit_prodi = ?
      `, [...selectedPls, prodiId]);

      console.log('Found CPL mappings:', cplMappings.length);

      // Insert new CPL-MK mappings
      if (cplMappings.length > 0) {
        const insertValues = cplMappings.flatMap(cpl => [cpl.id_cpl, id]);
        const insertPlaceholders = cplMappings.map(() => '(?, ?)').join(',');

        console.log('Inserting CPL-MK mappings:', insertValues);

        await pool.query(`
          INSERT INTO map_cpl_mk (id_cpl, id_mk) VALUES ${insertPlaceholders}
        `, insertValues);
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    // Return updated mata kuliah data
    const [updatedRows] = await pool.query(
      'SELECT * FROM mata_kuliah WHERE id_mk = ?',
      [id]
    );

    if (updatedRows.length === 0) {
      return res.status(404).json({ error: 'Mata kuliah not found' });
    }

    res.json(updatedRows[0]);
  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('Error updating mata kuliah:', error);
    res.status(500).json({ error: 'Failed to update mata kuliah', details: error.message });
  }
});

// Custom POST handler for mata kuliah with PL mapping support
mataKuliahRouter.post('/', requireAuth, permit('mata_kuliah'), async (req, res) => {
    const { selectedPls, ...mataKuliahData } = req.body;

  try {
    // Start transaction
    await pool.query('START TRANSACTION');

    // 1. Insert mata kuliah data
    const insertFields = [];
    const insertValues = [];
    const placeholders = [];

    Object.keys(mataKuliahData).forEach(key => {
      if (allowedCols.includes(key)) {
        insertFields.push(key);
        insertValues.push(mataKuliahData[key]);
        placeholders.push('?');
      }
    });

    const [insertResult] = await pool.query(
      `INSERT INTO mata_kuliah (${insertFields.join(', ')}) VALUES (${placeholders.join(', ')})`,
      insertValues
    );

    const newId = insertResult.insertId;

    // 2. Create CPL-MK mappings based on selected PLs
    if (Array.isArray(selectedPls) && selectedPls.length > 0) {
      // Get all CPLs that are mapped to the selected PLs for this mata kuliah's prodi
        const placeholders = selectedPls.map(() => '?').join(',');
      const prodiId = mataKuliahData.id_unit_prodi;

      console.log('Creating mata kuliah:', newId, 'with selectedPls:', selectedPls, 'prodiId:', prodiId);

      if (!prodiId) {
        throw new Error('id_unit_prodi is required for PL mapping');
      }

      const [cplMappings] = await pool.query(`
        SELECT DISTINCT cpl.id_cpl
        FROM cpl
        INNER JOIN map_cpl_pl ON cpl.id_cpl = map_cpl_pl.id_cpl
        WHERE map_cpl_pl.id_pl IN (${placeholders})
        AND cpl.id_unit_prodi = ?
      `, [...selectedPls, prodiId]);

      console.log('Found CPL mappings for new mata kuliah:', cplMappings.length);

      // Insert new CPL-MK mappings
      if (cplMappings.length > 0) {
        const insertValues = cplMappings.flatMap(cpl => [cpl.id_cpl, newId]);
        const insertPlaceholders = cplMappings.map(() => '(?, ?)').join(',');

        console.log('Inserting CPL-MK mappings for new mata kuliah:', insertValues);

        await pool.query(`
          INSERT INTO map_cpl_mk (id_cpl, id_mk) VALUES ${insertPlaceholders}
        `, insertValues);
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    // Return created mata kuliah data
    const [createdRows] = await pool.query(
      'SELECT * FROM mata_kuliah WHERE id_mk = ?',
      [newId]
    );

    res.status(201).json(createdRows[0]);
  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('Error creating mata kuliah:', error);
    res.status(500).json({ error: 'Failed to create mata kuliah', details: error.message });
  }
});

// ---- CRUD ----
mataKuliahRouter.get('/', requireAuth, permit('mata_kuliah'), crud.list);
mataKuliahRouter.get('/:id(\\d+)', requireAuth, permit('mata_kuliah'), crud.getById);
mataKuliahRouter.delete('/:id', requireAuth, permit('mata_kuliah'), crud.remove);
mataKuliahRouter.post('/:id/restore', requireAuth, permit('mata_kuliah'), crud.restore);
mataKuliahRouter.delete('/:id/hard-delete', requireAuth, permit('mata_kuliah'), crud.hardRemove);

export default mataKuliahRouter;
