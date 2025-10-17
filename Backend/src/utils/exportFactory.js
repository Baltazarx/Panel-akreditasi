// src/utils/exportFactory.js
import { pool } from '../db.js';
import PDFDocument from 'pdfkit';
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  HeadingLevel, WidthType, TextRun
} from 'docx';

// All export-related functions have been moved to exporter.js
