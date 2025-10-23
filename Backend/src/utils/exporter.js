// src/utils/exporter.js
import { pool } from '../db.js';
import { jsPDF } from 'jspdf';
import ExcelJS from 'exceljs';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun
} from 'docx';

/**
 * Fungsi utama untuk membuat endpoint export (PDF, DOCX, XLSX)
 * @param {object} meta - konfigurasi resource
 * @param {object} options - opsi tambahan
 */
export function makeExportHandler(meta, options = {}) {
  return async (req, res) => {
    try {
      // 🎯 Deteksi format dari query atau header
      const accept = req.headers.accept || '';
      const format =
        (req.query.format ||
          (accept.includes('sheet')
            ? 'xlsx'
            : accept.includes('word')
            ? 'docx'
            : accept.includes('pdf')
            ? 'pdf'
            : 'pdf')
        ).toLowerCase();

      // 📦 Ambil data
      const [rows] = await pool.query(
        `SELECT ${meta.columns.join(', ')} FROM ${meta.table} m ORDER BY ${meta.orderBy}`
      );

      // ========================================================
      // 🟢 EXPORT KE EXCEL (.xlsx)
      // ========================================================
      if (format === 'xlsx' || format === 'xls') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(meta.title('Export XLSX'));

        // header
        worksheet.addRow(meta.headers);
        worksheet.getRow(1).font = { bold: true };

        // data
        rows.forEach((r) => {
          worksheet.addRow(meta.columns.map((c) => r[c] ?? ''));
        });

        // styling
        worksheet.columns.forEach((col) => {
          col.width = 25;
          col.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        });

        // kirim hasil
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', `attachment; filename=${meta.resourceKey}.xlsx`);

        const buffer = await workbook.xlsx.writeBuffer();
        res.send(Buffer.from(buffer));
        return;
      }

      // ========================================================
      // 🟣 EXPORT KE WORD (.docx)
      // ========================================================
      if (format === 'docx') {
        const tableRows = [
          new TableRow({
            children: meta.headers.map(
              (h) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: h, bold: true })],
                    }),
                  ],
                })
            ),
          }),
          ...rows.map(
            (r) =>
              new TableRow({
                children: meta.columns.map(
                  (c) =>
                    new TableCell({
                      children: [
                        new Paragraph(String(r[c] ?? '')),
                      ],
                    })
                ),
              })
          ),
        ];

        const doc = new Document({
          sections: [
            {
              children: [
                new Paragraph({
                  text: meta.title('Export DOCX'),
                  heading: 'Heading1',
                  spacing: { after: 300 },
                }),
                new Table({ rows: tableRows }),
              ],
            },
          ],
        });

        const buffer = await Packer.toBuffer(doc);
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        res.setHeader('Content-Disposition', `attachment; filename=${meta.resourceKey}.docx`);
        res.send(buffer);
        return;
      }

      // ========================================================
      // 🔵 EXPORT KE PDF
      // ========================================================
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(meta.title('Export PDF'), 10, 10);

      let y = 20;
      const lineHeight = 7;

      // Header
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      meta.headers.forEach((h, i) => {
        doc.text(h, 10 + i * 40, y);
      });
      y += lineHeight;

      // Data rows
      doc.setFont(undefined, 'normal');
      rows.forEach((r) => {
        meta.columns.forEach((c, i) => {
          doc.text(String(r[c] ?? ''), 10 + i * 40, y);
        });
        y += lineHeight;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      const pdfBuffer = doc.output('arraybuffer');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${meta.resourceKey}.pdf`);
      res.send(Buffer.from(pdfBuffer));
    } catch (err) {
      console.error('Export error:', err);
      res.status(500).json({ error: 'Export failed' });
    }
  };
}

/**
 * Alias untuk rute legacy agar tetap backward-compatible
 */
export const makeDocAlias = (handler) => (req, res) =>
  handler({ ...req, query: { ...req.query, format: 'docx' } }, res);

export const makePdfAlias = (handler) => (req, res) =>
  handler({ ...req, query: { ...req.query, format: 'pdf' } }, res);
