import express from 'express';
const router = express.Router();
import { crudFactory } from '../utils/crudFactory.js';

const TABLE_NAME = 'tabel_2b6_rekap_jumlah';
const crud = crudFactory({
  table: TABLE_NAME,
  idCol: 'id',
  allowedCols: ['id_unit_prodi', 'id_tahun', 'jumlah_alumni_3_tahun', 'jumlah_pengguna_responden', 'jumlah_mahasiswa_aktif_ts'],
  softDelete: false,
  withRestore: false,
});

// Get all records
router.get('/', crud.list);

// Get record by ID
router.get('/:id', crud.getById);

// Create a new record
router.post('/', crud.create);

// Update a record by ID
router.put('/:id', crud.update);

// Delete a record by ID
router.delete('/:id', crud.remove);

export default router;
