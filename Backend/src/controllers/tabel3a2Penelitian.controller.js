import { pool } from '../db.js';
import { buildWhere, buildOrderBy, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

/**
 * Helper PIVOT dinamis untuk 5 TAHUN (TS s.d. TS-4).
 * Helper ini HANYA digunakan untuk endpoint READ (list/export)
 * yang perlu menampilkan tabel PIVOT.
 */
const getPivotClauses = (reqQuery) => {
    const years = ['ts', 'ts_1', 'ts_2', 'ts_3', 'ts_4']; // 5 tahun
    const params = [];
    const selectDana = [];
    const selectLinkBukti = [];

    for (const year of years) {
        const idTahunKey = `id_tahun_${year}`;
        const idTahunVal = reqQuery[idTahunKey];
        
        if (!idTahunVal) {
            throw new Error(`Query parameter ${idTahunKey} wajib ada.`);
        }
        
        const idTahunInt = parseInt(idTahunVal);
        params.push(idTahunInt); // Tambahkan ke params

        // 1. Buat SQL untuk SELECT Dana
        selectDana.push(
            `SUM(CASE WHEN pd.id_tahun = ? THEN pd.jumlah_dana ELSE 0 END) AS dana_${year}`
        );

        // 2. Buat SQL untuk SELECT Link Bukti
        selectLinkBukti.push(
            `MAX(CASE WHEN pd.id_tahun = ? THEN pd.link_bukti ELSE NULL END)`
        );
    }

    let allSelects = [
        ...selectDana,
        // Ambil 1 link bukti (prioritas TS)
        `COALESCE(${selectLinkBukti.join(', ')}) AS link_bukti_display`
    ];

    // Params untuk dana (5) + params untuk link (5)
    let allParams = [...params, ...params];
    
    return {
        selectSql: `, ${allSelects.join(',\n')}`, 
        params: allParams
    };
};

// === FUNGSI CRUD ===

/**
 * [PIVOT] Mengambil data yang sudah di-pivot untuk tampilan tabel.
 * Membutuhkan 5 query params: id_tahun_ts, id_tahun_ts_1, ...
 */
export const listTabel3a2Penelitian = async (req, res) => {
  try {
    // Special handling: Role LPPM bisa melihat semua data tanpa filter unit
    const userRole = req.user?.role?.toLowerCase();
    const isLppm = userRole === 'lppm';
    const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole);
    
    const { selectSql, params: pivotParams } = getPivotClauses(req.query);
    const { where, params: whereParams } = await buildWhere(req, 'tabel_3a2_penelitian', 'p');
    
    // Hapus filter id_unit untuk role LPPM (bisa lihat semua data)
    if (isLppm && !isSuperAdmin) {
      // Cari dan hapus filter id_unit dari where clause
      const unitFilterPattern = /p\.id_unit\s*=\s*\?/i;
      let unitFilterIndex = -1;
      for (let i = 0; i < where.length; i++) {
        if (unitFilterPattern.test(where[i])) {
          unitFilterIndex = i;
          break;
        }
      }
      
      if (unitFilterIndex !== -1) {
        where.splice(unitFilterIndex, 1);
        // Hapus 1 param yang sesuai dengan filter id_unit
        // Hitung berapa banyak placeholder ? sebelum index ini
        let paramIndex = 0;
        for (let i = 0; i < unitFilterIndex; i++) {
          const matches = where[i].match(/\?/g);
          if (matches) paramIndex += matches.length;
        }
        // Hapus 1 param di posisi paramIndex
        if (paramIndex < whereParams.length) {
          whereParams.splice(paramIndex, 1);
        }
      }
    }
    
    const orderBy = buildOrderBy(req.query?.order_by, 'id', 'p');

    // Ambil tahun-tahun dari pivot params (5 tahun pertama adalah id_tahun)
    const tahunList = pivotParams.slice(0, 5); // TS, TS-1, TS-2, TS-3, TS-4

    // Build WHERE clause dengan filter tahun
    const whereClauses = [...where];
    // Filter: Hanya tampilkan penelitian yang memiliki pendanaan dalam rentang TS sampai TS-4
    whereClauses.push(`EXISTS (
      SELECT 1 FROM tabel_3a2_pendanaan pd2 
      WHERE pd2.id_penelitian = p.id 
      AND pd2.id_tahun IN (?, ?, ?, ?, ?)
    )`);

    const sql = `
      SELECT 
        p.id, p.id_unit, uk.nama_unit AS nama_unit_prodi,
        p.id_dosen_ketua, pg.nama_lengkap AS nama_dosen_ketua,
        p.judul_penelitian, p.jml_mhs_terlibat, p.jenis_hibah,
        p.sumber_dana, p.durasi_tahun, p.deleted_at,
        p.link_roadmap -- [PERBAIKAN] Ambil link_roadmap
        
        -- Tambahkan query PIVOT 5 TAHUN di sini
        ${selectSql}

      FROM tabel_3a2_penelitian p
      LEFT JOIN tabel_3a2_pendanaan pd ON p.id = pd.id_penelitian
      LEFT JOIN dosen d ON p.id_dosen_ketua = d.id_dosen
      LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
      LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      
      ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
      
      GROUP BY
        p.id, uk.nama_unit, pg.nama_lengkap
      ORDER BY ${orderBy}
    `;

    // Gabungkan params: pivot dulu, baru where, lalu tahun filter
    const allParams = [...pivotParams, ...whereParams, ...tahunList];
    const [rows] = await pool.query(sql, allParams);
    
    // Ganti link_bukti (per baris) dengan link_bukti_display (pivot)
    const finalRows = rows.map(row => {
        row.link_bukti = row.link_bukti_display;
        delete row.link_bukti_display;
        return row;
    });

    res.json(finalRows);

  } catch (err) {
    console.error("Error listTabel3a2Penelitian:", err);
    res.status(500).json({ error: 'Gagal mengambil daftar penelitian', details: err.message });
  }
};

/**
 * [RAW] Mengambil data mentah (parent + children) untuk mengisi form Edit.
 * Tidak membutuhkan query params tahun.
 */
export const getTabel3a2PenelitianById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Ambil data parent (penelitian)
        const [parentRows] = await pool.query(
            `SELECT p.*, uk.nama_unit AS nama_unit_prodi
             FROM tabel_3a2_penelitian p
             LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
             WHERE p.id = ?`, 
            [id]
        );
        if (!parentRows[0]) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        
        // 2. Ambil data children (pendanaan)
        const [childrenRows] = await pool.query(
            `SELECT id_tahun, jumlah_dana, link_bukti 
             FROM tabel_3a2_pendanaan 
             WHERE id_penelitian = ?`, 
            [id]
        );
        
        // 3. Gabungkan
        const result = {
            ...parentRows[0],
            // Cari 1 link_bukti dari array children untuk ditampilkan di form
            link_bukti: childrenRows.find(c => c.link_bukti)?.link_bukti || null,
            pendanaan: childrenRows // Kirim sebagai array
            // link_roadmap sudah termasuk di parentRows[0] karena SELECT p.*
        };
        
        res.json(result);

    } catch (err) {
        console.error("Error getTabel3a2PenelitianById:", err);
        res.status(500).json({ error: 'Gagal mengambil detail data', details: err.message });
    }
};

/**
 * [TRANSACTIONAL] Membuat data baru dari form repeater.
 * Menerima payload: { ...parentData, pendanaan: "[{...}]" }
 */
export const createTabel3a2Penelitian = async (req, res) => {
  let connection;
  try {
    const { 
      id_unit, id_dosen_ketua, judul_penelitian,
      jml_mhs_terlibat, jenis_hibah, sumber_dana, durasi_tahun,
      link_bukti,
      pendanaan, // Ini adalah JSON string
      link_roadmap // <-- [PERBAIKAN] 1. Ambil link_roadmap dari body
    } = req.body;

    // Validasi
    if (!id_unit) { return res.status(400).json({ error: 'Unit/Prodi wajib dipilih.' }); }
    if (!id_dosen_ketua) { return res.status(400).json({ error: 'Dosen Ketua wajib diisi.' }); }
    if (!judul_penelitian) { return res.status(400).json({ error: 'Judul Penelitian wajib diisi.' }); }
    
    // [PERBAIKAN] 2. Tambahkan link_roadmap ke parentData
    const parentData = {
      id_unit: id_unit, 
      id_dosen_ketua, judul_penelitian,
      jml_mhs_terlibat, jenis_hibah, sumber_dana, durasi_tahun,
      link_roadmap // <-- [PERBAIKAN] 2. Tambahkan di sini
    };
    if (await hasColumn('tabel_3a2_penelitian', 'created_by') && req.user?.id_user) {
      parentData.created_by = req.user.id_user;
    }

    // Parse array pendanaan
    let pendanaanArray = [];
    if (pendanaan) {
        try {
            pendanaanArray = JSON.parse(pendanaan);
            if (!Array.isArray(pendanaanArray)) throw new Error("Format pendanaan tidak valid.");
        } catch (e) {
            return res.status(400).json({ error: 'Data pendanaan (JSON) tidak valid.' });
        }
    }

    // --- MULAI TRANSAKSI ---
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Insert ke tabel Parent
    const [parentResult] = await connection.query('INSERT INTO tabel_3a2_penelitian SET ?', [parentData]);
    const insertedPenelitianId = parentResult.insertId;

    // 2. Insert ke tabel Child (Pendanaan)
    if (pendanaanArray.length > 0) {
        const pendanaanValues = pendanaanArray.map((item, index) => [
            insertedPenelitianId,
            item.id_tahun,
            item.jumlah_dana || 0,
            (index === 0) ? link_bukti : null // Simpan link_bukti di baris pertama
        ]);
        
        await connection.query(
            'INSERT INTO tabel_3a2_pendanaan (id_penelitian, id_tahun, jumlah_dana, link_bukti) VALUES ?', 
            [pendanaanValues]
        );
    }

    // 3. Commit Transaksi
    await connection.commit();
    // --- AKHIR TRANSAKSI ---
    
    res.status(201).json({ message: 'Data penelitian berhasil dibuat', id: insertedPenelitianId });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error createTabel3a2Penelitian:", err);
    res.status(500).json({ error: 'Gagal membuat data penelitian', details: err.sqlMessage || err.message });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * [TRANSACTIONAL] Memperbarui data dari form repeater.
 * Menerima payload: { ...parentData, pendanaan: "[{...}]" }
 */
export const updateTabel3a2Penelitian = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // ID Penelitian
    
    const { 
      id_unit, id_dosen_ketua, judul_penelitian,
      jml_mhs_terlibat, jenis_hibah, sumber_dana, durasi_tahun,
      link_bukti, // Tetap ambil dari body
      pendanaan, // JSON string
      link_roadmap // <-- [PERBAIKAN] 1. Ambil link_roadmap dari body
    } = req.body;

    // Validasi
    if (!id_unit) { return res.status(400).json({ error: 'Unit/Prodi wajib dipilih.' }); }
    // ... (validasi lain)

    // [PERBAIKAN] 2. Tambahkan link_roadmap ke parentData
    const parentData = {
      id_unit: id_unit,
      id_dosen_ketua, judul_penelitian,
      jml_mhs_terlibat, jenis_hibah, sumber_dana, durasi_tahun,
      link_roadmap // <-- [PERBAIKAN] 2. Tambahkan di sini
    };
    if (await hasColumn('tabel_3a2_penelitian', 'updated_by') && req.user?.id_user) {
      parentData.updated_by = req.user.id_user;
    }

    // Parse array pendanaan
    let pendanaanArray = [];
    if (pendanaan) {
        try {
            pendanaanArray = JSON.parse(pendanaan);
            if (!Array.isArray(pendanaanArray)) throw new Error("Format pendanaan tidak valid.");
        } catch (e) {
            return res.status(400).json({ error: 'Data pendanaan (JSON) tidak valid.' });
        }
    }

    // --- MULAI TRANSAKSI ---
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Update tabel Parent
    const [parentResult] = await connection.query('UPDATE tabel_3a2_penelitian SET ? WHERE id = ?', [parentData, id]);
    if (parentResult.affectedRows === 0) {
        throw new Error('Data penelitian tidak ditemukan.');
    }

    // 2. Hapus data pendanaan lama (Child)
    await connection.query('DELETE FROM tabel_3a2_pendanaan WHERE id_penelitian = ?', [id]);

    // 3. Insert ulang data pendanaan (Child)
    if (pendanaanArray.length > 0) {
        const pendanaanValues = pendanaanArray.map((item, index) => [
            id, // ID dari params
            item.id_tahun,
            item.jumlah_dana || 0,
            (index === 0) ? link_bukti : null // Simpan link_bukti di baris pertama
        ]);
        
        await connection.query(
            'INSERT INTO tabel_3a2_pendanaan (id_penelitian, id_tahun, jumlah_dana, link_bukti) VALUES ?', 
            [pendanaanValues]
        );
    }

    // 4. Commit Transaksi
    await connection.commit();
    // --- AKHIR TRANSAKSI ---

    res.json({ message: 'Data penelitian berhasil diperbarui' });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error updateTabel3a2Penelitian:", err);
    res.status(500).json({ error: 'Gagal memperbarui data penelitian', details: err.sqlMessage || err.message });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * [SOFT DELETE] Hanya menghapus parent.
 */
export const softDeleteTabel3a2Penelitian = async (req, res) => {
  try {
    const payload = { deleted_at: new Date() };
    if (await hasColumn('tabel_3a2_penelitian', 'deleted_by')) { 
      payload.deleted_by = req.user?.id_user || null; 
    }
    const [result] = await pool.query('UPDATE tabel_3a2_penelitian SET ? WHERE id = ?', [payload, req.params.id]);
    if (result.affectedRows === 0) { 
      return res.status(404).json({ error: 'Data tidak ditemukan.' }); 
    }
    res.json({ message: 'Data berhasil dihapus (soft delete)' });
  } catch (err) {
    console.error("Error softDeleteTabel3a2Penelitian:", err);
    res.status(500).json({ error: 'Gagal menghapus data' });
  }
};

/**
 * [HARD DELETE] Menghapus parent dan child.
 */
export const hardDeleteTabel3a2Penelitian = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.beginTransaction();
    // 1. Hapus data Child
    await connection.query('DELETE FROM tabel_3a2_pendanaan WHERE id_penelitian = ?', [id]);
    // 2. Hapus data Parent
    const [parentResult] = await connection.query('DELETE FROM tabel_3a2_penelitian WHERE id = ?', [id]);
    if (parentResult.affectedRows === 0) {
        throw new Error('Data tidak ditemukan.');
    }
    await connection.commit();
    res.json({ message: 'Data berhasil dihapus secara permanen (hard delete).' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error hardDeleteTabel3a2Penelitian:", err);
    res.status(500).json({ error: 'Gagal menghapus data secara permanen.', details: err.sqlMessage || err.message });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * [EXPORT/PIVOT] Ekspor data PIVOT 5 tahun ke Excel.
 */
export const exportTabel3a2Penelitian = async (req, res) => {
    try {
        // 1. Ambil data (logika sama dengan 'list')
        const { selectSql, params: pivotParams } = getPivotClauses(req.query);
        const { where, params: whereParams } = await buildWhere(req, 'tabel_3a2_penelitian', 'p');
        const orderBy = buildOrderBy(req.query?.order_by, 'id', 'p');

        // Ambil tahun-tahun dari pivot params (5 tahun pertama adalah id_tahun)
        const tahunList = pivotParams.slice(0, 5); // TS, TS-1, TS-2, TS-3, TS-4

        // Build WHERE clause dengan filter tahun
        const whereClauses = [...where];
        // Filter: Hanya tampilkan penelitian yang memiliki pendanaan dalam rentang TS sampai TS-4
        whereClauses.push(`EXISTS (
          SELECT 1 FROM tabel_3a2_pendanaan pd2 
          WHERE pd2.id_penelitian = p.id 
          AND pd2.id_tahun IN (?, ?, ?, ?, ?)
        )`);

        const sql = `
          SELECT 
            pg.nama_lengkap AS nama_dosen_ketua,
            p.judul_penelitian, p.jml_mhs_terlibat, p.jenis_hibah,
            p.sumber_dana, p.durasi_tahun,
            p.link_roadmap -- [PERBAIKAN] Ambil link_roadmap
            
            ${selectSql}

          FROM tabel_3a2_penelitian p
          LEFT JOIN tabel_3a2_pendanaan pd ON p.id = pd.id_penelitian
          LEFT JOIN dosen d ON p.id_dosen_ketua = d.id_dosen
          LEFT JOIN pegawai pg ON d.id_pegawai = pg.id_pegawai
          LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
          
          ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
          
          GROUP BY
            p.id, uk.nama_unit, pg.nama_lengkap
          ORDER BY ${orderBy}
        `;
        
        const allParams = [...pivotParams, ...whereParams, ...tahunList];
        const [rows] = await pool.query(sql, allParams);
        
        // Ganti link_bukti (per baris) dengan link_bukti_display (pivot)
        const finalRows = rows.map(row => {
            row.link_bukti = row.link_bukti_display;
            delete row.link_bukti_display;
            return row;
        });

        // 2. Buat Workbook Excel
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Tabel 3.A.2');

        // 3. Definisikan Header (Update 5 TAHUN)
        sheet.columns = [
            // [PERBAIKAN] Tambahkan kolom Link Roadmap
            { header: 'Link Roadmap', key: 'link_roadmap', width: 30 },
            { header: 'Nama DTPR (Ketua)', key: 'nama_dosen_ketua', width: 30 },
            { header: 'Judul Penelitian', key: 'judul_penelitian', width: 45 },
            { header: 'Jumlah Mahasiswa yang Terlibat', key: 'jml_mhs_terlibat', width: 20 },
            { header: 'Jenis Hibah Penelitian', key: 'jenis_hibah', width: 25 },
            { header: 'Sumber (L/N/I)', key: 'sumber_dana', width: 15 },
            { header: 'Durasi (tahun)', key: 'durasi_tahun', width: 15 },
            // Update 5 TAHUN
            { header: 'Pendanaan (Rp Juta) TS-4', key: 'dana_ts_4', width: 20, style: { numFmt: '#,##0' } },
            { header: 'Pendanaan (Rp Juta) TS-3', key: 'dana_ts_3', width: 20, style: { numFmt: '#,##0' } },
            { header: 'Pendanaan (Rp Juta) TS-2', key: 'dana_ts_2', width: 20, style: { numFmt: '#,##0' } },
            { header: 'Pendanaan (Rp Juta) TS-1', key: 'dana_ts_1', width: 20, style: { numFmt: '#,##0' } },
            { header: 'Pendanaan (Rp Juta) TS', key: 'dana_ts', width: 20, style: { numFmt: '#,##0' } },
            { header: 'Link Bukti', key: 'link_bukti', width: 30 }
        ];

        // 4. Tambahkan data
        sheet.addRows(finalRows);

        // 5. Styling
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) {
                row.alignment = { vertical: 'middle', wrapText: true };
                ['jml_mhs_terlibat', 'sumber_dana', 'durasi_tahun'].forEach(key => {
                    row.getCell(key).alignment = { vertical: 'middle', horizontal: 'center' };
                });
            }
        });

        // 6. Kirim file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Tabel_3A2_Penelitian.xlsx');
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Error exportTabel3a2Penelitian:", err);
        res.status(500).json({ error: 'Gagal mengekspor data penelitian', details: err.message });
    }
};