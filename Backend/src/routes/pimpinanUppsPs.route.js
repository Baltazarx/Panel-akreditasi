// src/routes/pimpinanUppsPs.route.js
import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import { pool } from '../db.js';

import PDFDocument from 'pdfkit';
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  HeadingLevel, WidthType, TextRun
} from 'docx';

export const pimpinanUppsPsRouter = Router();

const crud = crudFactory({
  table: 'pimpinan_upps_ps',
  idCol: 'id_pimpinan',
  allowedCols: ['id_unit','id_pegawai','id_jabatan','periode_mulai','periode_selesai','tupoksi'],
  resourceKey: 'pimpinan_upps_ps',
});

/* ===================== LIST (dengan filter role/unit) ===================== */
const listPimpinanUppsPs = async (req, res, next) => {
  try {
    const userUnitId = req.user?.id_unit ?? null;
    const role = req.user?.role ?? '';
    const superRoles = new Set(['waket-1', 'waket-2', 'tpm', 'ketuastikom']);

    let sql = `
      SELECT
        p.id_pimpinan,
        p.id_unit,
        uk.nama_unit AS unit_kerja,
        p.id_pegawai,
        pg.nama_lengkap AS nama_ketua,
        DATE_FORMAT(p.periode_mulai, '%Y-%m-%d') AS periode_mulai,
        DATE_FORMAT(p.periode_selesai, '%Y-%m-%d') AS periode_selesai,
        pg.pendidikan_terakhir AS pendidikan_terakhir,
        p.id_jabatan,
        rjs.nama_jabatan AS jabatan_struktural,
        p.tupoksi,
        p.deleted_at
      FROM pimpinan_upps_ps p
      JOIN unit_kerja uk ON p.id_unit = uk.id_unit
      JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
      JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
    `;
    const params = [];
    const whereClauses = [];

    // Handle soft-delete filtering
    const includeDeleted = req.query?.include_deleted;
    if (String(includeDeleted) !== '1') {
      whereClauses.push('p.deleted_at IS NULL');
    }

    if (!superRoles.has(role)) {
      whereClauses.push(`p.id_unit = ?`);
      params.push(userUnitId);
    }

    if (whereClauses.length) sql += ` WHERE ${whereClauses.join(' AND ')}`;
    sql += ` ORDER BY p.periode_mulai DESC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

pimpinanUppsPsRouter.get('/', requireAuth, permit('pimpinan_upps_ps'), listPimpinanUppsPs);
pimpinanUppsPsRouter.get('/:id', requireAuth, permit('pimpinan_upps_ps'), crud.getById);
pimpinanUppsPsRouter.post('/', requireAuth, permit('pimpinan_upps_ps'), crud.create);
pimpinanUppsPsRouter.put('/:id', requireAuth, permit('pimpinan_upps_ps'), crud.update);
pimpinanUppsPsRouter.delete('/:id', requireAuth, permit('pimpinan_upps_ps'), crud.remove);
pimpinanUppsPsRouter.post('/:id/restore', requireAuth, permit('pimpinan_upps_ps'), crud.restore);
pimpinanUppsPsRouter.delete('/:id/hard-delete', requireAuth, permit('pimpinan_upps_ps'), crud.hardRemove); // New hard delete route

/* ===================== EXPORT HELPERS (DOCX & PDF) ===================== */

const EXPORT_HEADERS = ['ID','Unit','Pegawai','Jabatan','Mulai','Selesai','Tupoksi'];
const EXPORT_COLUMNS = [
  'id_pimpinan', 'unit_kerja', 'nama_ketua', 'jabatan_struktural',
  'periode_mulai', 'periode_selesai', 'tupoksi'
];

// Query data untuk export (tanpa asumsi id_tahun)
async function fetchExportRows(req) {
  const role = req.user?.role ?? '';
  const userUnitId = req.user?.id_unit ?? null;
  const superRoles = new Set(['waket-1', 'waket-2', 'tpm', 'ketuastikom']);

  let where = 'p.deleted_at IS NULL';
  const params = [];
  if (!superRoles.has(role)) {
    where += ' AND p.id_unit = ?';
    params.push(userUnitId);
  }

  const sql = `
    SELECT
      p.id_pimpinan,
      uk.nama_unit AS unit_kerja,
      pg.nama_lengkap AS nama_ketua,
      rjs.nama_jabatan AS jabatan_struktural,
      DATE_FORMAT(p.periode_mulai, '%Y-%m-%d') AS periode_mulai,
      DATE_FORMAT(p.periode_selesai, '%Y-%m-%d') AS periode_selesai,
      p.tupoksi
    FROM pimpinan_upps_ps p
    JOIN unit_kerja uk ON p.id_unit = uk.id_unit
    JOIN pegawai pg ON p.id_pegawai = pg.id_pegawai
    JOIN ref_jabatan_struktural rjs ON p.id_jabatan = rjs.id_jabatan
    WHERE ${where}
    ORDER BY p.periode_mulai DESC
  `;
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function makeDocxBuffer(title, rows) {
  const heading = new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 300 },
  });

  const head = new TableRow({
    children: EXPORT_HEADERS.map(h =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
      })
    )
  });

  const body = rows.map(r =>
    new TableRow({
      children: EXPORT_COLUMNS.map(c =>
        new TableCell({ children: [new Paragraph(String(r[c] ?? ''))] })
      )
    })
  );

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [head, ...body],
  });

  const doc = new Document({ sections: [{ children: [heading, table] }] });
  return Packer.toBuffer(doc);
}

function streamPdf(res, title, rows, filename) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  doc.pipe(res);

  doc.fontSize(14).text(title, { align: 'left' });
  doc.moveDown(0.5);

  const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colW = pageW / EXPORT_HEADERS.length;

  const drawRow = (cells, isHead = false) => {
    const y = doc.y;
    cells.forEach((cell, i) => {
      const x = doc.x + i * colW;
      doc.save().rect(x, y - 2, colW, 20).strokeColor('#e5e7eb').stroke().restore();
      doc.text(String(cell ?? ''), x + 4, y, { width: colW - 8 });
    });
    doc.moveDown(isHead ? 1.1 : 0.8);
  };

  drawRow(EXPORT_HEADERS, true);
  rows.forEach(r => {
    drawRow(EXPORT_COLUMNS.map(c => r[c]));
    if (doc.y > doc.page.height - 72) doc.addPage();
  });

  doc.end();
}

/* ===================== ROUTES EXPORT ===================== */

// Endpoint utama: /export (format=docx|pdf)
pimpinanUppsPsRouter.post('/export', requireAuth, permit('pimpinan_upps_ps'), async (req, res, next) => {
  try {
    const rows = await fetchExportRows(req);
    const title = 'Pimpinan UPPS/PS — Daftar';
    const base = `pimpinan_upps_ps_${Date.now()}`;
    const fmt = (req.query?.format || 'docx').toLowerCase();

    if (fmt === 'pdf') {
      streamPdf(res, title, rows, `${base}.pdf`);
      return;
    }
    const buf = await makeDocxBuffer(title, rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${base}.docx"`);
    res.end(buf);
  } catch (err) {
    next(err);
  }
});

// Alias agar FE bisa panggil langsung:
pimpinanUppsPsRouter.post('/export-doc', requireAuth, permit('pimpinan_upps_ps'), async (req, res, next) => {
  try {
    req.query.format = 'docx';
    return pimpinanUppsPsRouter.handle(req, res, next); // pass ke handler di atas
  } catch (e) {
    next(e);
  }
});

pimpinanUppsPsRouter.post('/export-pdf', requireAuth, permit('pimpinan_upps_ps'), async (req, res, next) => {
  try {
    req.query.format = 'pdf';
    return pimpinanUppsPsRouter.handle(req, res, next);
  } catch (e) {
    next(e);
  }
});
