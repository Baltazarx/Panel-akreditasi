import { pool } from '../db.js';
import ExcelJS from 'exceljs';

// Query Pivot (Sama persis dengan codinganmu)
const getPivotQuery = () => `
  SELECT 
    tk.jenis_tendik,
    COALESCE(uk.nama_unit, 'Belum diset') AS unit_kerja,
    
    COUNT(CASE WHEN UPPER(p.pendidikan_terakhir) = 'S3' THEN 1 END) AS s3,
    COUNT(CASE WHEN UPPER(p.pendidikan_terakhir) = 'S2' THEN 1 END) AS s2,
    COUNT(CASE WHEN UPPER(p.pendidikan_terakhir) = 'S1' THEN 1 END) AS s1,
    COUNT(CASE WHEN UPPER(p.pendidikan_terakhir) = 'D4' THEN 1 END) AS d4,
    COUNT(CASE WHEN UPPER(p.pendidikan_terakhir) = 'D3' THEN 1 END) AS d3,
    COUNT(CASE WHEN UPPER(p.pendidikan_terakhir) = 'D2' THEN 1 END) AS d2,
    COUNT(CASE WHEN UPPER(p.pendidikan_terakhir) = 'D1' THEN 1 END) AS d1,
    COUNT(CASE WHEN UPPER(p.pendidikan_terakhir) IN ('SMA', 'SMK', 'MA', 'SLTA', 'SMA/SMK/MA') THEN 1 END) AS sma_smk,
    
    COUNT(*) AS total

  FROM tenaga_kependidikan tk
  JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
  LEFT JOIN unit_kerja uk ON p.id_unit = uk.id_unit
  
  WHERE tk.deleted_at IS NULL 
    AND p.deleted_at IS NULL
  
  GROUP BY tk.jenis_tendik, uk.nama_unit
  ORDER BY tk.jenis_tendik ASC, uk.nama_unit ASC
`;

// ===== LIST (GET) =====
// Nama fungsi disesuaikan agar match dengan Route
export const listKualifikasiTendik = async (req, res) => {
  try {
    const sql = getPivotQuery();
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Error listKualifikasiTendik:", err);
    res.status(500).json({ error: 'Gagal mengambil laporan', details: err.message });
  }
};

// ===== EXPORT EXCEL =====
// Nama fungsi disesuaikan agar match dengan Route
export const exportKualifikasiTendik = async (req, res) => {
    try {
        const sql = getPivotQuery();
        const [rows] = await pool.query(sql);
        
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Tabel 1.A.5');

        // Header
        sheet.mergeCells('A1:K1');
        sheet.getCell('A1').value = 'Tabel 1.A.5 Kualifikasi Tenaga Kependidikan';
        sheet.getCell('A1').font = { bold: true, size: 14 };
        sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

        sheet.mergeCells('A2:A3'); sheet.getCell('A2').value = 'No';
        sheet.mergeCells('B2:B3'); sheet.getCell('B2').value = 'Jenis Tenaga Kependidikan';
        sheet.mergeCells('C2:J2'); sheet.getCell('C2').value = 'Jumlah Tenaga Kependidikan dengan Pendidikan Terakhir';
        
        sheet.getCell('C3').value = 'S3'; sheet.getCell('D3').value = 'S2'; sheet.getCell('E3').value = 'S1';
        sheet.getCell('F3').value = 'D4'; sheet.getCell('G3').value = 'D3'; sheet.getCell('H3').value = 'D2';
        sheet.getCell('I3').value = 'D1'; sheet.getCell('J3').value = 'SMA/SMK';
        
        sheet.mergeCells('K2:K3'); sheet.getCell('K2').value = 'Unit Kerja';

        // Styling
        ['A2','B2','C2','K2','C3','D3','E3','F3','G3','H3','I3','J3'].forEach(c => {
            sheet.getCell(c).font = { bold: true };
            sheet.getCell(c).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            sheet.getCell(c).border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
        });

        // Data
        let rowIndex = 4;
        rows.forEach((row, index) => {
            sheet.getCell(`A${rowIndex}`).value = index + 1;
            sheet.getCell(`B${rowIndex}`).value = row.jenis_tendik;
            sheet.getCell(`C${rowIndex}`).value = parseInt(row.s3)||0;
            sheet.getCell(`D${rowIndex}`).value = parseInt(row.s2)||0;
            sheet.getCell(`E${rowIndex}`).value = parseInt(row.s1)||0;
            sheet.getCell(`F${rowIndex}`).value = parseInt(row.d4)||0;
            sheet.getCell(`G${rowIndex}`).value = parseInt(row.d3)||0;
            sheet.getCell(`H${rowIndex}`).value = parseInt(row.d2)||0;
            sheet.getCell(`I${rowIndex}`).value = parseInt(row.d1)||0;
            sheet.getCell(`J${rowIndex}`).value = parseInt(row.sma_smk)||0;
            sheet.getCell(`K${rowIndex}`).value = row.unit_kerja;
            
            ['A','B','C','D','E','F','G','H','I','J','K'].forEach(col => {
                 sheet.getCell(`${col}${rowIndex}`).border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
            });
            rowIndex++;
        });
        
        // Footer Total
        const totalRow = rowIndex;
        sheet.mergeCells(`A${totalRow}:B${totalRow}`);
        sheet.getCell(`A${totalRow}`).value = 'Total';
        sheet.getCell(`A${totalRow}`).font = { bold: true };
        sheet.getCell(`A${totalRow}`).alignment = { horizontal: 'center' };
        sheet.getCell(`A${totalRow}`).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

        ['C','D','E','F','G','H','I','J'].forEach(col => {
            const c = sheet.getCell(`${col}${totalRow}`);
            c.value = { formula: `SUM(${col}4:${col}${totalRow-1})` };
            c.font = { bold: true };
            c.alignment = { horizontal: 'center' };
            c.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        });
        sheet.getCell(`K${totalRow}`).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Tabel_1A5_Kualifikasi_Tendik.xlsx');
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Error exportKualifikasiTendik:", err);
        res.status(500).json({ error: 'Gagal export', details: err.message });
    }
};