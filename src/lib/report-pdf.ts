/* The PDF renderer.

   A4 at 72dpi, drawn with jsPDF entirely in the browser - the photographs come
   from the user's Drive and go straight into the document without passing
   through a server.

   Long text is wrapped and flowed, so a pasted three-page description produces
   three pages rather than running off the edge of one. */
import { jsPDF } from 'jspdf';
import {
  dateRange, formatDateTime, particulars, sections, type Report,
} from './report';

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LINE = 15;

type Cursor = { y: number; headerH: number; footerH: number };

export async function buildPdf(report: Report): Promise<Blob> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFont('times', 'normal');

  const header = report.template.letterheadDataUrl;
  const footer = report.template.footerDataUrl;
  const headerH = header ? Math.min(110, await imageHeight(header, CONTENT_W)) : 0;
  const footerH = footer ? Math.min(60, await imageHeight(footer, CONTENT_W)) : 0;
  const cursor: Cursor = { y: 0, headerH, footerH };

  let started = false;
  const newPage = () => {
    if (started) doc.addPage();
    started = true;
    if (header) doc.addImage(header, 'PNG', MARGIN, MARGIN / 2, CONTENT_W, headerH);
    if (footer) doc.addImage(footer, 'PNG', MARGIN, PAGE_H - MARGIN / 2 - footerH, CONTENT_W, footerH);
    cursor.y = header ? MARGIN / 2 + headerH + 18 : MARGIN + LINE;
  };
  const bottom = () => PAGE_H - MARGIN - cursor.footerH;
  const room = (needed: number) => { if (cursor.y + needed > bottom()) newPage(); };

  newPage();
  const t = report.template;
  if (t.includeCover) cover(doc, report, cursor, newPage, bottom);
  if (t.includeParticulars) particularsTable(doc, report, cursor, room);
  if (t.includeWriteUp) writeUp(doc, report, cursor, room);
  if (t.includePhotos) await photoPages(doc, report, cursor, room, newPage, bottom);
  if (t.includeAnnexure) annexure(doc, report, cursor, room, newPage);

  return doc.output('blob');
}

function centred(doc: jsPDF, text: string, y: number, size: number, bold = false): number {
  if (!text.trim()) return y;
  doc.setFont('times', bold ? 'bold' : 'normal').setFontSize(size);
  const lines = doc.splitTextToSize(text, CONTENT_W - 60);
  lines.forEach((line: string, index: number) => {
    doc.text(line, PAGE_W / 2, y + index * (size + 4), { align: 'center' });
  });
  return y + lines.length * (size + 4);
}

function cover(doc: jsPDF, report: Report, cursor: Cursor, newPage: () => void, bottom: () => number) {
  const f = report.fields;
  let y = cursor.y + 30;
  y = centred(doc, f.institutionName, y, 20, true) + 6;
  y = centred(doc, f.institutionUniversity, y, 12) + 2;
  y = centred(doc, f.institutionAddress, y, 10) + 4;
  if (f.department) y = centred(doc, `Department of ${f.department}`, y, 12, true) + 10;

  doc.setDrawColor(190).line(MARGIN + 60, y, PAGE_W - MARGIN - 60, y);
  y += 34;

  y = centred(doc, 'ACTIVITY REPORT', y, 13, true) + 14;
  y = centred(doc, f.title, y, 18, true) + 6;
  y = centred(doc, f.subtitle, y, 12) + 18;
  y = centred(doc, f.eventType, y, 12) + 4;
  y = centred(doc, dateRange(report), y, 12) + 4;
  centred(doc, f.venue, y, 10);

  doc.setFont('times', 'normal').setFontSize(8).setTextColor(130);
  doc.text(
    `Compiled from ${report.photos.length} geo-tagged photograph(s) · ${formatDateTime(new Date().toISOString())}`,
    PAGE_W / 2, bottom() - 10, { align: 'center' }
  );
  doc.setTextColor(0);
  newPage();
}

function heading(doc: jsPDF, text: string, cursor: Cursor) {
  doc.setFont('times', 'bold').setFontSize(14);
  doc.text(text, MARGIN, cursor.y);
  cursor.y += LINE + 4;
  doc.setDrawColor(200).line(MARGIN, cursor.y - 10, PAGE_W - MARGIN, cursor.y - 10);
}

function particularsTable(doc: jsPDF, report: Report, cursor: Cursor, room: (n: number) => void) {
  const rows = particulars(report);
  if (!rows.length) return;
  room(LINE * 3);
  heading(doc, 'Particulars', cursor);

  const labelW = 150;
  rows.forEach((row) => {
    doc.setFont('times', 'normal').setFontSize(10);
    const lines = doc.splitTextToSize(row.value, CONTENT_W - labelW - 10);
    room(lines.length * LINE + 6);
    doc.setFont('times', 'bold').text(row.label, MARGIN, cursor.y);
    doc.setFont('times', 'normal');
    lines.forEach((line: string, index: number) => {
      doc.text(line, MARGIN + labelW, cursor.y + index * LINE);
    });
    cursor.y += lines.length * LINE + 6;
  });
}

function writeUp(doc: jsPDF, report: Report, cursor: Cursor, room: (n: number) => void) {
  sections(report).forEach((section) => {
    room(LINE * 3);
    cursor.y += 10;
    doc.setFont('times', 'bold').setFontSize(12).text(section.heading, MARGIN, cursor.y);
    cursor.y += LINE + 2;
    doc.setFont('times', 'normal').setFontSize(10);
    section.body.split('\n').forEach((paragraph) => {
      if (!paragraph.trim()) { cursor.y += LINE / 2; return; }
      doc.splitTextToSize(paragraph, CONTENT_W).forEach((line: string) => {
        room(LINE);
        doc.text(line, MARGIN, cursor.y);
        cursor.y += LINE;
      });
    });
  });
}

async function photoPages(
  doc: jsPDF, report: Report, cursor: Cursor,
  room: (n: number) => void, newPage: () => void, bottom: () => number
) {
  const withImages = report.photos.filter((p) => p.dataUrl);
  if (!withImages.length) return;
  newPage();
  heading(doc, 'Photographs', cursor);

  const perPage = report.template.photosPerPage;
  const slotH = (bottom() - cursor.y - 10) / perPage;

  for (let index = 0; index < withImages.length; index += 1) {
    const photo = withImages[index];
    const caption = [
      `Photograph ${index + 1}`,
      photo.takenAt ? formatDateTime(photo.takenAt) : '',
    ].filter(Boolean);
    const captionH = caption.length * 12 + 6;
    room(slotH);

    const maxH = Math.max(70, slotH - captionH - 12);
    const ratio = await imageRatio(photo.dataUrl as string);
    let w = CONTENT_W;
    let h = w / ratio;
    if (h > maxH) { h = maxH; w = h * ratio; }
    const left = MARGIN + (CONTENT_W - w) / 2;

    doc.addImage(photo.dataUrl as string, 'JPEG', left, cursor.y, w, h);
    doc.setDrawColor(210).rect(left, cursor.y, w, h);
    cursor.y += h + 8;

    doc.setFontSize(9);
    caption.forEach((line, i) => {
      doc.setFont('times', i === 0 ? 'bold' : 'normal');
      doc.text(line, MARGIN, cursor.y);
      cursor.y += 12;
    });
    cursor.y += 12;
  }
}

function annexure(
  doc: jsPDF, report: Report, cursor: Cursor,
  room: (n: number) => void, newPage: () => void
) {
  if (!report.photos.length) return;
  newPage();
  heading(doc, 'Annexure - photograph index', cursor);

  doc.setFont('times', 'bold').setFontSize(9);
  doc.text('#', MARGIN, cursor.y);
  doc.text('File', MARGIN + 30, cursor.y);
  doc.text('Captured', MARGIN + 330, cursor.y);
  cursor.y += LINE;
  doc.setDrawColor(210).line(MARGIN, cursor.y - 9, PAGE_W - MARGIN, cursor.y - 9);

  doc.setFont('times', 'normal');
  report.photos.forEach((photo, index) => {
    room(LINE);
    doc.text(String(index + 1), MARGIN, cursor.y);
    doc.text(doc.splitTextToSize(photo.name, 290)[0], MARGIN + 30, cursor.y);
    doc.text(photo.takenAt ? formatDateTime(photo.takenAt) : '', MARGIN + 330, cursor.y);
    cursor.y += LINE;
  });
}

/** Natural aspect ratio, needed before a photograph can be placed. */
function imageRatio(dataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image.width / Math.max(1, image.height));
    image.onerror = () => resolve(4 / 3);
    image.src = dataUrl;
  });
}

async function imageHeight(dataUrl: string, width: number): Promise<number> {
  const ratio = await imageRatio(dataUrl);
  return width / ratio;
}
