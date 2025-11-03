import { pool } from '../db.js';
import { buildWhere, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

// === LIST DATA UNTUK TABEL 2.C ===
export const listFleksibilitas = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'fleksibilitas_pembelajaran_tahunan', 'fpt');

    const [masterBentuk] = await pool.query('SELECT id_bentuk, nama_bentuk FROM bentuk_pembelajaran_master WHERE deleted_at IS NULL ORDER BY id_bentuk');

    // PERBAIKAN: Ganti 'th.tahun_akademik' menjadi 'th.tahun'
    const sqlTahunan = `
      SELECT 
        fpt.id, fpt.id_tahun, fpt.id_unit_prodi, th.tahun,
        fpt.jumlah_mahasiswa_aktif, fpt.link_bukti
      FROM fleksibilitas_pembelajaran_tahunan fpt
      LEFT JOIN tahun_akademik th ON fpt.id_tahun = th.id_tahun
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY th.tahun ASC
    `;
    const [dataTahunan] = await pool.query(sqlTahunan, params);

    const idsTahunan = dataTahunan.map(d => d.id);
    let dataDetails = [];
    if (idsTahunan.length > 0) {
        const [details] = await pool.query(
            `SELECT * FROM fleksibilitas_pembelajaran_detail WHERE id_tahunan IN (?)`,
            [idsTahunan]
        );
        dataDetails = details;
    }

    res.json({ masterBentuk, dataTahunan, dataDetails });
  } catch (err) {
    console.error("Error listFleksibilitas:", err);
    res.status(500).json({ error: 'Gagal mengambil data fleksibilitas pembelajaran' });
  }
};

// === CREATE / UPDATE DATA UNTUK SATU TAHUN ===
export const createOrUpdateFleksibilitas = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id_tahun_akademik: id_tahun, jumlah_mahasiswa_aktif, link_bukti, details, id_unit_prodi: body_id_unit_prodi } = req.body;
    
    // Determine id_unit_prodi: dari body untuk superadmin, atau dari user untuk prodi
    const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(req.user?.role?.toLowerCase());
    let id_unit_prodi = body_id_unit_prodi || req.user?.id_unit_prodi;

    // Jika bukan superadmin dan tidak ada id_unit_prodi, gunakan dari user
    if (!isSuperAdmin && !id_unit_prodi && req.user?.role === 'prodi') {
      id_unit_prodi = req.user.id_unit_prodi;
    }

    if (!id_unit_prodi) {
        return res.status(400).json({ error: 'Field `id_unit_prodi` wajib diisi.' });
    }
    if (!id_tahun) {
        return res.status(400).json({ error: 'Tahun Akademik wajib diisi.' });
    }

    const [existing] = await conn.query(
      'SELECT id FROM fleksibilitas_pembelajaran_tahunan WHERE id_unit_prodi = ? AND id_tahun = ?',
      [id_unit_prodi, id_tahun]
    );

    let id_tahunan;
    const dataTahunan = { id_unit_prodi, id_tahun, jumlah_mahasiswa_aktif, link_bukti };

    if (existing.length > 0) {
      id_tahunan = existing[0].id;
      if (await hasColumn('fleksibilitas_pembelajaran_tahunan', 'updated_by')) {
        dataTahunan.updated_by = req.user.id_user;
      }
      await conn.query('UPDATE fleksibilitas_pembelajaran_tahunan SET ? WHERE id = ?', [dataTahunan, id_tahunan]);
      await conn.query('DELETE FROM fleksibilitas_pembelajaran_detail WHERE id_tahunan = ?', [id_tahunan]);
    } else {
      if (await hasColumn('fleksibilitas_pembelajaran_tahunan', 'created_by')) {
        dataTahunan.created_by = req.user.id_user;
      }
      const [result] = await conn.query('INSERT INTO fleksibilitas_pembelajaran_tahunan SET ?', [dataTahunan]);
      id_tahunan = result.insertId;
    }

    if (details && details.length > 0) {
        const detailValues = details
            .filter(d => d.jumlah_mahasiswa_ikut > 0)
            .map(d => [id_tahunan, d.id_bentuk, d.jumlah_mahasiswa_ikut]);
        if (detailValues.length > 0) {
            await conn.query(
                'INSERT INTO fleksibilitas_pembelajaran_detail (id_tahunan, id_bentuk, jumlah_mahasiswa_ikut) VALUES ?',
                [detailValues]
            );
        }
    }

    await conn.commit();
    res.status(201).json({ message: 'Data fleksibilitas pembelajaran berhasil disimpan.' });
  } catch (err) {
    await conn.rollback();
    console.error("Error createOrUpdateFleksibilitas:", err);
    res.status(500).json({ error: 'Gagal menyimpan data', details: err.sqlMessage || err.message });
  } finally {
    conn.release();
  }
};

// === EXPORT KE EXCEL ===
export const exportFleksibilitas = async (req, res) => {
    try {
        const { where, params } = await buildWhere(req, 'fleksibilitas_pembelajaran_tahunan', 'fpt');

        // PERBAIKAN: Ganti 'tahun_akademik' menjadi 'tahun'
        const [allYears] = await pool.query('SELECT id_tahun, tahun FROM tahun_akademik WHERE deleted_at IS NULL ORDER BY tahun DESC LIMIT 5');
        const years = allYears.reverse();

        const [masterBentuk] = await pool.query('SELECT id_bentuk, nama_bentuk FROM bentuk_pembelajaran_master WHERE deleted_at IS NULL ORDER BY id_bentuk');
        
        const sqlTahunan = `
            SELECT fpt.id, fpt.id_tahun, fpt.jumlah_mahasiswa_aktif, fpt.link_bukti
            FROM fleksibilitas_pembelajaran_tahunan fpt
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        `;
        const [dataTahunan] = await pool.query(sqlTahunan, params);

        const idsTahunan = dataTahunan.map(d => d.id);
        let dataDetails = [];
        if (idsTahunan.length > 0) {
            const [details] = await pool.query(`SELECT * FROM fleksibilitas_pembelajaran_detail WHERE id_tahunan IN (?)`, [idsTahunan]);
            dataDetails = details;
        }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Tabel 2.C');
        
        // PERBAIKAN: Gunakan 'tahun' untuk header
        const header = ['Tahun Akademik', ...years.map(y => y.tahun), 'Link Bukti'];
        const headerRow = sheet.addRow(header);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        
        const rowJumlahAktif = ['Jumlah Mahasiswa Aktif'];
        years.forEach(y => {
            const d = dataTahunan.find(dt => dt.id_tahun === y.id_tahun);
            rowJumlahAktif.push(d ? d.jumlah_mahasiswa_aktif : 0);
        });
        rowJumlahAktif.push('');
        sheet.addRow(rowJumlahAktif);

        const cellBentuk = sheet.addRow(['Bentuk Pembelajaran']);
        sheet.mergeCells(cellBentuk.number, 2, cellBentuk.number, header.length - 1);
        sheet.getCell(cellBentuk.number, 2).value = 'Jumlah mahasiswa untuk setiap bentuk pembelajaran';
        cellBentuk.font = { bold: true };

        const totalsByYear = {};
        years.forEach(y => totalsByYear[y.id_tahun] = 0);

        masterBentuk.forEach(bp => {
            const rowData = [bp.nama_bentuk];
            years.forEach(y => {
                const dTahunan = dataTahunan.find(dt => dt.id_tahun === y.id_tahun);
                let jumlah = 0;
                if (dTahunan) {
                    const dDetail = dataDetails.find(dd => dd.id_tahunan === dTahunan.id && dd.id_bentuk === bp.id_bentuk);
                    jumlah = dDetail ? dDetail.jumlah_mahasiswa_ikut : 0;
                }
                totalsByYear[y.id_tahun] += jumlah;
                rowData.push(jumlah);
            });
            const linkTahunanTS = dataTahunan.find(dt => dt.id_tahun === years[years.length - 1].id_tahun);
            rowData.push(linkTahunanTS ? linkTahunanTS.link_bukti : '');
            sheet.addRow(rowData);
        });

        const rowJumlah = sheet.addRow(['Jumlah', ...years.map(y => totalsByYear[y.id_tahun]), '']);
        rowJumlah.font = { bold: true };

        const rowPersen = ['Persentase'];
        years.forEach(y => {
            const dTahunan = dataTahunan.find(dt => dt.id_tahun === y.id_tahun);
            const mhsAktif = dTahunan ? dTahunan.jumlah_mahasiswa_aktif : 0;
            const percentage = mhsAktif > 0 ? ((totalsByYear[y.id_tahun] / mhsAktif)) : 0;
            rowPersen.push(percentage);
        });
        rowPersen.push('');
        const lastRow = sheet.addRow(rowPersen);
        lastRow.font = { bold: true };
        lastRow.eachCell((cell, colNumber) => {
            if (colNumber > 1 && colNumber < header.length) cell.numFmt = '0.00%';
        });

        sheet.columns.forEach(col => col.width = 20);
        sheet.getColumn(1).width = 30;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Tabel_2C_Fleksibilitas.xlsx');
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Error exportFleksibilitas:", err);
        res.status(500).json({ error: 'Gagal mengekspor data' });
    }
};

// === SOFT DELETE ===
export const softDeleteFleksibilitas = async (req, res) => {
    const { id } = req.params; 
    try {
        const payload = { deleted_at: new Date() };
        if (await hasColumn('fleksibilitas_pembelajaran_tahunan', 'deleted_by')) {
            payload.deleted_by = req.user?.id_user || null;
        }
        await pool.query('UPDATE fleksibilitas_pembelajaran_tahunan SET ? WHERE id = ?', [payload, id]);
        res.json({ message: 'Data berhasil dihapus (soft delete)' });
    } catch (err) {
        console.error("Error softDeleteFleksibilitas:", err);
        res.status(500).json({ error: 'Gagal menghapus data' });
    }
};

// === HARD DELETE ===
export const hardDeleteFleksibilitas = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM fleksibilitas_pembelajaran_tahunan WHERE id = ?', [id]);
        res.json({ message: 'Data berhasil dihapus secara permanen (hard delete).' });
    } catch (err) {
        console.error("Error hardDeleteFleksibilitas:", err);
        res.status(500).json({ error: 'Gagal menghapus data secara permanen.' });
    }
};

