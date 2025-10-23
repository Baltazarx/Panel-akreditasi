import { pool } from '../db.js';
import { buildWhere, hasColumn } from '../utils/queryHelper.js';
import ExcelJS from 'exceljs';

// === LIST DATA UNTUK TABEL 2.D (REVISI) ===
export const listRekognisi = async (req, res) => {
  try {
    const { where, params } = await buildWhere(req, 'rekognisi_lulusan_tahunan', 'rlt');
    const [masterSumber] = await pool.query('SELECT id_sumber, nama_sumber FROM sumber_rekognisi_master WHERE deleted_at IS NULL ORDER BY id_sumber');
    const sqlTahunan = `
      SELECT rlt.id, rlt.id_tahun, th.tahun, rlt.jumlah_lulusan_ts
      FROM rekognisi_lulusan_tahunan rlt
      LEFT JOIN tahun_akademik th ON rlt.id_tahun = th.id_tahun
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY th.tahun ASC
    `;
    const [dataTahunan] = await pool.query(sqlTahunan, params);
    const idsTahunan = dataTahunan.map(d => d.id);
    let dataDetails = [];
    if (idsTahunan.length > 0) {
        // Ambil semua kolom detail, termasuk jumlah_mahasiswa_rekognisi
        const [details] = await pool.query(
            `SELECT * FROM rekognisi_lulusan_detail WHERE id_tahunan IN (?)`,
            [idsTahunan]
        );
        dataDetails = details;
    }
    res.json({ masterSumber, dataTahunan, dataDetails });
  } catch (err) {
    console.error("Error listRekognisi:", err);
    res.status(500).json({ error: 'Gagal mengambil data rekognisi lulusan' });
  }
};

// === CREATE / UPDATE DATA UNTUK SATU TAHUN (REVISI) ===
export const createOrUpdateRekognisi = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const {
      id_tahun,
      details // Array: [{ id_sumber: 1, jenis_pengakuan: "...", link_bukti: "...", jumlah_mahasiswa_rekognisi: 6 }, ...]
    } = req.body;
    const id_unit_prodi = req.user?.id_unit_prodi;

    if (!id_unit_prodi || req.user?.role !== 'prodi') {
        return res.status(403).json({ error: 'Forbidden: Hanya user prodi yang bisa mengubah data ini.' });
    }
    if (!id_tahun) {
        return res.status(400).json({ error: 'Tahun Akademik wajib diisi.' });
    }

    const [lulusanRows] = await conn.query(
        'SELECT jml_lulus FROM tabel_2a3_kondisi_mahasiswa WHERE id_unit_prodi = ? AND id_tahun = ? AND deleted_at IS NULL',
        [id_unit_prodi, id_tahun]
    );
    const jumlah_lulusan_ts = lulusanRows.length > 0 ? lulusanRows[0].jml_lulus : 0;

    const [existing] = await conn.query(
      'SELECT id FROM rekognisi_lulusan_tahunan WHERE id_unit_prodi = ? AND id_tahun = ?',
      [id_unit_prodi, id_tahun]
    );

    let id_tahunan;
    const dataTahunan = { id_unit_prodi, id_tahun, jumlah_lulusan_ts };

    if (existing.length > 0) {
      id_tahunan = existing[0].id;
      if (await hasColumn('rekognisi_lulusan_tahunan', 'updated_by')) { dataTahunan.updated_by = req.user.id_user; }
      await conn.query('UPDATE rekognisi_lulusan_tahunan SET ? WHERE id = ?', [dataTahunan, id_tahunan]);
      await conn.query('DELETE FROM rekognisi_lulusan_detail WHERE id_tahunan = ?', [id_tahunan]);
    } else {
      if (await hasColumn('rekognisi_lulusan_tahunan', 'created_by')) { dataTahunan.created_by = req.user.id_user; }
      const [result] = await conn.query('INSERT INTO rekognisi_lulusan_tahunan SET ?', [dataTahunan]);
      id_tahunan = result.insertId;
    }

    if (details && details.length > 0) {
        // REVISI: Sertakan jumlah_mahasiswa_rekognisi dalam VALUES
        const detailValues = details
            .filter(d => d.jenis_pengakuan && d.jenis_pengakuan.trim() !== '')
            .map(d => [
                id_tahunan, 
                d.id_sumber, 
                d.jenis_pengakuan, 
                d.link_bukti, 
                d.jumlah_mahasiswa_rekognisi || 0 // Ambil jumlahnya
            ]);
        
        if (detailValues.length > 0) {
            await conn.query(
                'INSERT INTO rekognisi_lulusan_detail (id_tahunan, id_sumber, jenis_pengakuan, link_bukti, jumlah_mahasiswa_rekognisi) VALUES ?',
                [detailValues]
            );
        }
    }

    await conn.commit();
    res.status(201).json({ message: 'Data rekognisi lulusan berhasil disimpan.' });
  } catch (err) {
    await conn.rollback();
    console.error("Error createOrUpdateRekognisi:", err);
    res.status(500).json({ error: 'Gagal menyimpan data', details: err.sqlMessage || err.message });
  } finally {
    conn.release();
  }
};

// === EXPORT KE EXCEL (REVISI) ===
export const exportRekognisi = async (req, res) => {
    try {
        const { where, params } = await buildWhere(req, 'rekognisi_lulusan_tahunan', 'rlt');
        const [allYears] = await pool.query('SELECT id_tahun, tahun FROM tahun_akademik WHERE deleted_at IS NULL ORDER BY tahun DESC LIMIT 3');
        const years = allYears.reverse();
        const [masterSumber] = await pool.query('SELECT id_sumber, nama_sumber FROM sumber_rekognisi_master WHERE deleted_at IS NULL ORDER BY id_sumber');
        const sqlTahunan = `SELECT rlt.id, rlt.id_tahun, rlt.jumlah_lulusan_ts FROM rekognisi_lulusan_tahunan rlt ${where.length ? `WHERE ${where.join(' AND ')}` : ''}`;
        const [dataTahunan] = await pool.query(sqlTahunan, params);
        const idsTahunan = dataTahunan.map(d => d.id);
        let dataDetails = [];
        if (idsTahunan.length > 0) {
            const [details] = await pool.query(`SELECT * FROM rekognisi_lulusan_detail WHERE id_tahunan IN (?)`, [idsTahunan]);
            dataDetails = details;
        }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Tabel 2.D');
        const header = ['Sumber Rekognisi', 'Jenis Pengakuan Lulusan (Rekognisi)', ...years.map(y => y.tahun), 'Link Bukti'];
        const headerRow = sheet.addRow(header);
        headerRow.getCell(3).value = 'Tahun Akademik';
        sheet.mergeCells(headerRow.number, 3, headerRow.number, 3 + years.length - 1);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        const subHeader = ['', '', ...years.map(y => y.tahun), ''];
        const subHeaderRow = sheet.addRow(subHeader);
        subHeaderRow.font = { bold: true };
        subHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(headerRow.number, 1, subHeaderRow.number, 1);
        sheet.mergeCells(headerRow.number, 2, subHeaderRow.number, 2);
        sheet.mergeCells(headerRow.number, header.length, subHeaderRow.number, header.length);

        const recognitionsCountByYear = {}; // Sekarang menyimpan jumlah mahasiswa
        years.forEach(y => recognitionsCountByYear[y.id_tahun] = 0);

        masterSumber.forEach(sumber => {
            const rowData = [sumber.nama_sumber, ''];
            let jenisPengakuanTS = '';
            let linkBuktiTS = '';

            years.forEach(y => {
                const dTahunan = dataTahunan.find(dt => dt.id_tahun === y.id_tahun);
                let jumlahMhs = 0; // Default 0
                if (dTahunan) {
                    const dDetail = dataDetails.find(dd => dd.id_tahunan === dTahunan.id && dd.id_sumber === sumber.id_sumber);
                    if (dDetail) {
                        jumlahMhs = dDetail.jumlah_mahasiswa_rekognisi || 0; // Ambil jumlah
                        recognitionsCountByYear[y.id_tahun] += jumlahMhs; // Jumlahkan total mahasiswa
                        if (y.id_tahun === years[years.length - 1].id_tahun) {
                            jenisPengakuanTS = dDetail.jenis_pengakuan || '';
                            linkBuktiTS = dDetail.link_bukti || '';
                        }
                    }
                }
                rowData.push(jumlahMhs); // Masukkan angka jumlah
            });
            rowData[1] = jenisPengakuanTS;
            rowData.push(linkBuktiTS);
            sheet.addRow(rowData);
        });

        const rowJumlahRekognisi = sheet.addRow(['Jumlah Rekognisi', '', ...years.map(y => recognitionsCountByYear[y.id_tahun]), '']);
        rowJumlahRekognisi.font = { bold: true };
        const rowJumlahLulusan = ['Jumlah Lulusan', ''];
        years.forEach(y => {
            const dTahunan = dataTahunan.find(dt => dt.id_tahun === y.id_tahun);
            rowJumlahLulusan.push(dTahunan ? dTahunan.jumlah_lulusan_ts : 0);
        });
        rowJumlahLulusan.push('');
        sheet.addRow(rowJumlahLulusan).font = { bold: true };
        const rowPersen = ['Persentase', ''];
        years.forEach(y => {
            const dTahunan = dataTahunan.find(dt => dt.id_tahun === y.id_tahun);
            const jmlLulusan = dTahunan ? dTahunan.jumlah_lulusan_ts : 0;
            const percentage = jmlLulusan > 0 ? (recognitionsCountByYear[y.id_tahun] / jmlLulusan) : 0;
            rowPersen.push(percentage);
        });
        rowPersen.push('');
        const persenRow = sheet.addRow(rowPersen);
        persenRow.font = { bold: true };
        persenRow.eachCell((cell, colNumber) => {
            if (colNumber > 2 && colNumber < header.length) cell.numFmt = '0.00%';
        });

        sheet.columns.forEach((col, idx) => col.width = idx === 1 ? 40 : (idx === 0 ? 25 : 15));
        sheet.getColumn(header.length).width = 30;
        sheet.eachRow(row => {
            row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Tabel_2D_Rekognisi.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("Error exportRekognisi:", err);
        res.status(500).json({ error: 'Gagal mengekspor data' });
    }
};

// === SOFT DELETE (REVISI: Menggunakan ID Tahunan) ===
export const softDeleteRekognisi = async (req, res) => {
    const { id } = req.params; // ID dari rekognisi_lulusan_tahunan
    try {
        const payload = { deleted_at: new Date() };
        if (await hasColumn('rekognisi_lulusan_tahunan', 'deleted_by')) {
            payload.deleted_by = req.user?.id_user || null;
        }
        const [result] = await pool.query('UPDATE rekognisi_lulusan_tahunan SET ? WHERE id = ?', [payload, id]);
        if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
        res.json({ message: 'Data berhasil dihapus (soft delete)' });
    } catch (err) {
        console.error("Error softDeleteRekognisi:", err);
        res.status(500).json({ error: 'Gagal menghapus data' });
    }
};

// === HARD DELETE (REVISI: Menggunakan ID Tahunan) ===
export const hardDeleteRekognisi = async (req, res) => {
    const { id } = req.params; // ID dari rekognisi_lulusan_tahunan
    try {
        const [result] = await pool.query('DELETE FROM rekognisi_lulusan_tahunan WHERE id = ?', [id]);
        if (result.affectedRows === 0) { return res.status(404).json({ error: 'Data tidak ditemukan.' }); }
        res.json({ message: 'Data berhasil dihapus secara permanen (hard delete).' });
    } catch (err) {
        console.error("Error hardDeleteRekognisi:", err);
        res.status(500).json({ error: 'Gagal menghapus data secara permanen.' });
    }
};
// 

