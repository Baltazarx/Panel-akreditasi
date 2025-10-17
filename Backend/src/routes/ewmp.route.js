// src/routes/ewmp.route.js (1.A.4) - CRUD beban_kerja_dosen + endpoint report agregat
import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { crudFactory } from '../utils/crudFactory.js';
import { pool } from '../db.js';

const factory = crudFactory({
  table: 'beban_kerja_dosen',
  idCol: 'id_beban_kerja',
  resourceKey: 'ewmp',
  allowedCols: ['id_dosen','id_tahun','sks_pengajaran','sks_penelitian','sks_pkm','sks_manajemen'] // :contentReference[oaicite:20]{index=20}
});

export const ewmpRouter = Router();
ewmpRouter.use(requireAuth, permit('ewmp'));
ewmpRouter.get('/', factory.list);
ewmpRouter.get('/:id', factory.getById);
ewmpRouter.post('/', factory.create);
ewmpRouter.put('/:id', factory.update);
ewmpRouter.delete('/:id', factory.remove);

// laporan ringkas sesuai tabel 1.A.4 (rata-rata total SKS per dosen pada TS)
ewmpRouter.get('/report/:id_tahun', async (req, res) => {
  const { id_tahun } = req.params;
  const [rows] = await pool.query(
    `SELECT d.id_dosen, p.nama_lengkap, 
            b.sks_pengajaran, b.sks_penelitian, b.sks_pkm, b.sks_manajemen,
            (b.sks_pengajaran + b.sks_penelitian + b.sks_pkm + b.sks_manajemen) AS total_sks
     FROM beban_kerja_dosen b
     JOIN dosen d ON b.id_dosen = d.id_dosen
     JOIN pegawai p ON d.id_pegawai = p.id_pegawai
     WHERE b.id_tahun = ?`,
    [id_tahun]
  );
  res.json({ data: rows });
});
