// src/utils/exporter.js
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, WidthType } from 'docx';
import PDFDocument from 'pdfkit';
import stream from 'stream';
import { pool } from '../db.js';

function buildWhereSql(q, { requireYear = false, extraWhere = '' } = {}) {
  const where = [];
  const params = [];

  if (String(q.include_deleted) !== '1') where.push('m.deleted_at IS NULL');

  const single = q.id_tahun ?? q.tahun;
  const multi = q.id_tahun_in;

  if (requireYear && !single && !multi) {
    return { error: 'Parameter "id_tahun"/"tahun" atau "id_tahun_in" wajib.' };
  }

  if (single) {
    where.push('m.id_tahun = ?');
    params.push(single);
  } else if (multi) {
    const arr = String(multi).split(',').map(s => s.trim()).filter(Boolean);
    if (arr.length) {
      where.push(`m.id_tahun IN (${arr.map(()=> '?').join(',')})`);
      params.push(...arr);
    }
  }

  if (extraWhere) where.push(`(${extraWhere})`);

  return { whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

async function fetchRows({ table, columns, orderBy = 'm.id DESC' }, q, options) {
  const { error, whereSql, params } = buildWhereSql(q, options);
  if (error) return { error };
  const colsSql = columns.map(c => `m.${c}`).join(', ');
  const sql = `
    SELECT ${colsSql}, t.tahun AS tahun_text
    FROM ${table} m
    LEFT JOIN tahun_akademik t ON t.id_tahun = m.id_tahun
    ${whereSql}
    ORDER BY ${orderBy}
  `;
  const [rows] = await pool.query(sql, params);
  return { rows };
}

async function toDocxBuffer({ title, headers, columns, rows }) {
  const heading = new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 300 },
  });

  const head = new TableRow({
    children: headers.map(h =>
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })
    )
  });

  const body = rows.map(r => new TableRow({
    children: columns.map(c => new TableCell({ children: [new Paragraph(String(r[c] ?? ''))] }))
  }));

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [head, ...body],
  });

  const doc = new Document({ sections: [{ children: [heading, table] }] });
  return Packer.toBuffer(doc);
}

async function streamPdf({ res, title, headers, columns, rows, filename }) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  doc.pipe(res);

  doc.fontSize(14).text(title, { align: 'left' });
  doc.moveDown(0.5);

  const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colW = pageW / headers.length;

  const drawRow = (cells, isHead = false) => {
    const y = doc.y;
    const startX = doc.page.margins.left; // Mulai menggambar dari margin kiri untuk setiap baris
    cells.forEach((cell, i) => {
      const x = startX + i * colW; // Gunakan startX untuk posisi kolom yang konsisten
      doc.save().rect(x, y - 2, colW, 20).strokeColor('#e5e7eb').stroke().restore();
      doc.text(String(cell ?? ''), x + 4, y, { width: colW - 8 });
    });
    doc.moveDown(isHead ? 1.1 : 0.8);
  };

  drawRow(headers, true);
  rows.forEach(r => {
    drawRow(columns.map(c => r[c]));
    if (doc.y > doc.page.height - 72) doc.addPage();
  });

  doc.end();
}

export function makeExportHandler(meta, options = {}) {
  const {
    resourceKey, table, columns, headers,
    title = (label)=>`${resourceKey} — ${label}`,
    orderBy = 'm.id DESC'
  } = meta;

  const makeLabel = (q) => {
    if (q.id_tahun_in) return `Tahun ${q.id_tahun_in}`;
    if (q.id_tahun || q.tahun) return `Tahun ${q.id_tahun || q.tahun}`;
    return 'Semua Tahun';
  };

  return async function handler(req, res) {
    try {
      const q = req.query || {};
      const { rows, error } = await fetchRows({ table, columns, orderBy }, q, options);
      if (error) return res.status(400).json({ error });

      const label = makeLabel(q);
      const docTitle = typeof title === 'function' ? title(label) : title;
      const base = `${resourceKey}_${(q.id_tahun || q.tahun || q.id_tahun_in || 'semua')}`.replace(/[^\w,-]+/g,'-');

      const fmt = (q.format || 'docx').toLowerCase();
      if (fmt === 'pdf') {
        await streamPdf({ res, title: docTitle, headers, columns, rows, filename: `${base}.pdf` });
        return;
      }
      const buf = await toDocxBuffer({ title: docTitle, headers, columns, rows });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${base}.docx"`);
      res.end(buf);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Export failed', message: e.message });
    }
  };
}

export function makeDocAlias(handler) {
  return (req, res, next) => {
    req.query.format = 'docx';
    return handler(req, res, next);
  };
}

export function makePdfAlias(handler) {
  return (req, res, next) => {
    req.query.format = 'pdf';
    return handler(req, res, next);
  };
}