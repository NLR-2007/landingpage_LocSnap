/* Filling a college's own Word template.

   Our own layout is a fallback. What an institution actually wants is its
   letterhead, its margins, its fonts, its NAAC criterion numbering - the
   document its office has filed for fifteen years, with this event's details
   in it. So the template is not redrawn here: the uploaded .docx is opened,
   the text it already contains is edited in place, and everything else in the
   file - headers, footers, styles, logos, page setup - is written back
   untouched.

   Two ways in:

   Plan A, markers. The template contains {{title}}, {{venue}}, {{photos}}.
   We find them and substitute. Exact, repeatable, and the college controls
   placement entirely.

   Plan B, mapping. The template has no markers, because nobody is going to
   edit a document the principal approved in 2019. We list its paragraphs and
   the user says "this line is the title, that line is the venue". The same
   machinery then runs on paragraph positions instead of marker names.

   A .docx is a zip of XML. Word splits a typed {{title}} across several runs
   whenever spell-check or a formatting change intervenes, so matching happens
   on the paragraph's whole text, never on a single run. */
import { unzipSync, zipSync, strToU8, strFromU8 } from 'fflate';
import {
  blank, dateRange, departmentLine, formatDateTime, particulars,
  type EventFields, type Report,
} from './report';

const DOCUMENT = 'word/document.xml';
const RELS = 'word/_rels/document.xml.rels';
const CONTENT_TYPES = '[Content_Types].xml';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** English Metric Units: Word measures pictures in 914,400ths of an inch. */
const EMU_PER_INCH = 914400;

/** What a slot in the template can be filled with. */
export type Slot =
  | { kind: 'field'; field: keyof EventFields }
  | { kind: 'dateRange' }
  | { kind: 'photoCount' }
  | { kind: 'particulars' }
  | { kind: 'photos' }
  | { kind: 'annexure' };

/** The markers a template may use, and what each one stands for. */
export const MARKERS: { marker: string; slot: Slot; help: string }[] = [
  ...([
    ['institutionName', 'Name of the institution'],
    ['institutionUniversity', 'Affiliating university'],
    ['institutionAddress', 'Address of the institution'],
    ['department', 'Organising department'],
    ['eventType', 'Type of activity'],
    ['title', 'Title of the event'],
    ['subtitle', 'Theme or sub-title'],
    ['academicYear', 'Academic year'],
    ['startDate', 'Start date'],
    ['endDate', 'End date'],
    ['venue', 'Venue'],
    ['mode', 'Online or offline'],
    ['collaboratingAgency', 'Collaborating agency'],
    ['sponsor', 'Sponsor'],
    ['budget', 'Budget or expenditure'],
    ['coordinator', 'Coordinator'],
    ['coordinatorDesignation', "Coordinator's designation"],
    ['coCoordinator', 'Co-coordinator'],
    ['resourcePerson', 'Resource person'],
    ['resourceAffiliation', "Resource person's affiliation"],
    ['resourceTopic', 'Topic covered'],
    ['chiefGuest', 'Chief guest'],
    ['studentsCount', 'Number of students'],
    ['facultyCount', 'Number of faculty'],
    ['externalCount', 'Number of external participants'],
    ['objectives', 'Objectives'],
    ['description', 'Description of the activity'],
    ['outcome', 'Outcome'],
    ['impact', 'Impact and benefit'],
    ['beneficiaries', 'Beneficiaries'],
    ['feedback', 'Feedback'],
    ['remarks', 'Remarks'],
  ] as [keyof EventFields, string][]).map(([field, help]) => ({
    marker: field, slot: { kind: 'field', field } as Slot, help,
  })),
  { marker: 'dateRange', slot: { kind: 'dateRange' }, help: 'Dates, written out as a range' },
  { marker: 'photoCount', slot: { kind: 'photoCount' }, help: 'How many photographs are attached' },
  { marker: 'particulars', slot: { kind: 'particulars' }, help: 'The whole particulars list' },
  { marker: 'photos', slot: { kind: 'photos' }, help: 'The photographs, with captions' },
  { marker: 'annexure', slot: { kind: 'annexure' }, help: 'The photograph index' },
];

const SLOT_BY_MARKER = new Map(MARKERS.map((entry) => [entry.marker, entry.slot]));

/** The slot a marker name stands for, for the mapping dropdowns. */
export function slotFor(marker: string): Slot | undefined {
  return SLOT_BY_MARKER.get(marker);
}

/** A marker that stands for a block of content, not a phrase inside a line. */
function isBlock(slot: Slot): boolean {
  return slot.kind === 'particulars' || slot.kind === 'photos' || slot.kind === 'annexure';
}

export type TemplateParagraph = {
  index: number;
  text: string;
  /** Marker names found in this paragraph, if any. */
  markers: string[];
};

export type TemplateDoc = {
  name: string;
  files: Record<string, Uint8Array>;
  paragraphs: TemplateParagraph[];
  /** Every distinct marker in the document, in the order first seen. */
  markers: string[];
  /** Markers written in the template that we do not recognise. */
  unknownMarkers: string[];
};

/** Opens an uploaded .docx and reports what is inside it. */
export async function readTemplate(file: File): Promise<TemplateDoc> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(bytes);
  } catch {
    throw new Error('That file is not a .docx. Save the template as Word (.docx), not .doc or PDF.');
  }
  if (!files[DOCUMENT]) {
    throw new Error('That .docx has no document body Word can read. Try re-saving it from Word.');
  }

  const xml = parse(strFromU8(files[DOCUMENT]));
  const paragraphs = paragraphNodes(xml).map((node, index) => {
    const text = paragraphText(node);
    return { index, text, markers: markersIn(text) };
  });

  const seen: string[] = [];
  const unknown: string[] = [];
  paragraphs.forEach((paragraph) => paragraph.markers.forEach((marker) => {
    const bucket = SLOT_BY_MARKER.has(marker) ? seen : unknown;
    if (!bucket.includes(marker)) bucket.push(marker);
  }));

  return { name: file.name, files, paragraphs, markers: seen, unknownMarkers: unknown };
}

/**
 * Plan A: the slots the template asked for by name.
 *
 * Returned as paragraph-indexed, so both plans feed the same filler.
 */
export function markerPlan(doc: TemplateDoc): Record<number, Slot[]> {
  const plan: Record<number, Slot[]> = {};
  doc.paragraphs.forEach((paragraph) => {
    const slots = paragraph.markers
      .map((marker) => SLOT_BY_MARKER.get(marker))
      .filter((slot): slot is Slot => Boolean(slot));
    if (slots.length) plan[paragraph.index] = slots;
  });
  return plan;
}

/**
 * The fields a filled template will actually read.
 *
 * A college that uploads its own proforma should be asked for what that
 * proforma asks for and nothing else - its letterhead already carries the
 * institution's name, so a box demanding it again is work for no output.
 * Derived from the plan, so it is what the document will genuinely use rather
 * than a guess at what it might.
 */
export function fieldsUsedBy(plan: Record<number, Slot[]>): Set<keyof EventFields> {
  const used = new Set<keyof EventFields>();
  Object.values(plan).flat().forEach((slot) => {
    if (slot.kind === 'field') used.add(slot.field);
    // The date range is written from the two dates, so both are still needed.
    if (slot.kind === 'dateRange') { used.add('startDate'); used.add('endDate'); }
    // Particulars prints most of the form, so asking for all of it is right.
    if (slot.kind === 'particulars') {
      ([
        'eventType', 'title', 'subtitle', 'department', 'academicYear', 'startDate', 'endDate',
        'venue', 'mode', 'collaboratingAgency', 'sponsor', 'budget', 'coordinator',
        'coordinatorDesignation', 'coCoordinator', 'resourcePerson', 'resourceAffiliation',
        'resourceTopic', 'chiefGuest', 'studentsCount', 'facultyCount', 'externalCount',
      ] as (keyof EventFields)[]).forEach((field) => used.add(field));
    }
  });
  return used;
}

/** What a slot resolves to as a line of text. Blocks return ''. */
function textFor(slot: Slot, report: Report): string {
  switch (slot.kind) {
    case 'field': {
      const value = report.fields[slot.field];
      if (blank(value)) return '';
      return slot.field === 'department' ? departmentLine(value) : value.trim();
    }
    case 'dateRange': return dateRange(report);
    case 'photoCount': return String(report.photos.length);
    default: return '';
  }
}

/**
 * Writes the report into the template and returns a new .docx.
 *
 * `plan` maps a paragraph index to what belongs there. Plan A builds it from
 * markers; Plan B builds it from what the user pointed at.
 */
export async function fillTemplate(
  doc: TemplateDoc,
  report: Report,
  plan: Record<number, Slot[]>
): Promise<Blob> {
  const files: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = { ...doc.files };
  const xml = parse(strFromU8(doc.files[DOCUMENT]));
  ensureNamespaces(xml);
  const paragraphs = paragraphNodes(xml);

  const media: { path: string; relId: string; bytes: Uint8Array }[] = [];
  let nextMedia = 1;
  const addImage = (dataUrl: string): string => {
    const relId = `rIdGeoSnap${nextMedia}`;
    const path = `media/geosnap${nextMedia}.jpeg`;
    media.push({ path, relId, bytes: dataUrlBytes(dataUrl) });
    nextMedia += 1;
    return relId;
  };

  // Sizes must be known before the XML is written, so they are measured first.
  const ratios = new Map<string, number>();
  for (const photo of report.photos) {
    if (photo.dataUrl) ratios.set(photo.id, await imageRatio(photo.dataUrl));
  }

  for (const [key, slots] of Object.entries(plan)) {
    const node = paragraphs[Number(key)];
    if (!node) continue;

    const blocks = slots.filter(isBlock);
    const inline = slots.filter((slot) => !isBlock(slot));

    if (inline.length) {
      const original = paragraphText(node);
      const replaced = original.includes('{{')
        // Plan A: the marker sits inside a line the college wrote, so only the
        // marker is swapped and the surrounding words stay.
        ? original.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (whole, name: string) => {
          const slot = SLOT_BY_MARKER.get(name);
          return slot && !isBlock(slot) ? textFor(slot, report) : whole;
        })
        // Plan B: the user pointed at this line and said what it is, so the
        // line becomes the value.
        : inline.map((slot) => textFor(slot, report)).filter(Boolean).join(', ');
      setParagraphText(node, replaced);
    }

    for (const slot of blocks) {
      const built = blockParagraphs(xml, slot, report, ratios, addImage);
      built.forEach((paragraph) => node.parentNode?.insertBefore(paragraph, node));
      // A paragraph that held nothing but {{photos}} would leave a blank line.
      if (!paragraphText(node).replace(/\{\{\s*[\w.]+\s*\}\}/g, '').trim()) {
        node.parentNode?.removeChild(node);
      }
    }
  }

  files[DOCUMENT] = strToU8(serialise(xml));
  if (media.length) {
    files[RELS] = strToU8(withRelationships(strFromU8(doc.files[RELS] ?? emptyRels()), media));
    files[CONTENT_TYPES] = strToU8(withJpegType(strFromU8(doc.files[CONTENT_TYPES] ?? '')));
    // Already-compressed photographs are stored, not deflated again.
    media.forEach((item) => { files[`word/${item.path}`] = [item.bytes, { level: 0 }]; });
  }

  return new Blob([zipSync(files as Parameters<typeof zipSync>[0])], { type: DOCX_MIME });
}

/* ---------- building the generated blocks ---------- */

function blockParagraphs(
  xml: XMLDocument,
  slot: Slot,
  report: Report,
  ratios: Map<string, number>,
  addImage: (dataUrl: string) => string
): Element[] {
  if (slot.kind === 'particulars') {
    return particulars(report).map((row) => textParagraph(xml, [
      { text: `${row.label}: `, bold: true },
      { text: row.value, bold: false },
    ]));
  }

  if (slot.kind === 'annexure') {
    return report.photos.map((photo, index) => textParagraph(xml, [
      { text: `${index + 1}. `, bold: true },
      { text: [photo.name, photo.takenAt ? formatDateTime(photo.takenAt) : '']
        .filter(Boolean).join(' - '), bold: false },
    ]));
  }

  const built: Element[] = [];
  report.photos.forEach((photo, index) => {
    if (!photo.dataUrl) return;
    const ratio = ratios.get(photo.id) ?? 4 / 3;
    // Portrait phone photographs are limited by height, landscape by width,
    // so that two still fit on a page of the college's own margins.
    let widthIn = 5.2;
    let heightIn = widthIn / ratio;
    if (heightIn > 3.9) { heightIn = 3.9; widthIn = heightIn * ratio; }
    built.push(imageParagraph(xml, addImage(photo.dataUrl), widthIn, heightIn, index + 1));
    built.push(textParagraph(xml, [
      { text: `Photograph ${index + 1}`, bold: true },
      { text: photo.takenAt ? ` - ${formatDateTime(photo.takenAt)}` : '', bold: false },
    ]));
  });
  return built;
}

function textParagraph(xml: XMLDocument, runs: { text: string; bold: boolean }[]): Element {
  const paragraph = xml.createElement('w:p');
  runs.filter((run) => run.text).forEach((run) => {
    const element = xml.createElement('w:r');
    if (run.bold) {
      const properties = xml.createElement('w:rPr');
      properties.appendChild(xml.createElement('w:b'));
      element.appendChild(properties);
    }
    const text = xml.createElement('w:t');
    text.setAttribute('xml:space', 'preserve');
    text.textContent = run.text;
    element.appendChild(text);
    paragraph.appendChild(element);
  });
  return paragraph;
}

/**
 * An inline picture.
 *
 * Built from XML text rather than node by node: a picture needs five nested
 * DrawingML elements from three namespaces, and the string is the form every
 * reference to it is written in, so it is the form that can be checked.
 */
function imageParagraph(
  xml: XMLDocument, relId: string, widthIn: number, heightIn: number, number: number
): Element {
  const cx = Math.round(widthIn * EMU_PER_INCH);
  const cy = Math.round(heightIn * EMU_PER_INCH);
  const id = 9000 + number;
  const markup = `<w:p xmlns:w="${NS.w}">
  <w:pPr><w:jc w:val="center"/></w:pPr>
  <w:r><w:drawing xmlns:wp="${NS.wp}">
    <wp:inline distT="0" distB="0" distL="0" distR="0">
      <wp:extent cx="${cx}" cy="${cy}"/>
      <wp:effectExtent l="0" t="0" r="0" b="0"/>
      <wp:docPr id="${id}" name="Photograph ${number}"/>
      <wp:cNvGraphicFramePr/>
      <a:graphic xmlns:a="${NS.a}">
        <a:graphicData uri="${NS.pic}">
          <pic:pic xmlns:pic="${NS.pic}">
            <pic:nvPicPr>
              <pic:cNvPr id="${id}" name="Photograph ${number}"/>
              <pic:cNvPicPr/>
            </pic:nvPicPr>
            <pic:blipFill>
              <a:blip xmlns:r="${NS.r}" r:embed="${relId}"/>
              <a:stretch><a:fillRect/></a:stretch>
            </pic:blipFill>
            <pic:spPr>
              <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
              <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            </pic:spPr>
          </pic:pic>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  </w:drawing></w:r>
</w:p>`;
  const fragment = parse(markup);
  return xml.importNode(fragment.documentElement, true) as Element;
}

/* ---------- the XML plumbing ---------- */

const NS = {
  w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
  wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
  a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
  pic: 'http://schemas.openxmlformats.org/drawingml/2006/picture',
  r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
};

function parse(text: string): XMLDocument {
  const parsed = new DOMParser().parseFromString(text, 'application/xml');
  const failure = parsed.getElementsByTagName('parsererror')[0];
  if (failure) throw new Error('Word could not be read from that file - it may be corrupt.');
  return parsed;
}

function serialise(xml: XMLDocument): string {
  return new XMLSerializer().serializeToString(xml);
}

/** Older templates omit the namespaces a picture needs; Word rejects those. */
function ensureNamespaces(xml: XMLDocument) {
  const root = xml.documentElement;
  ([['wp', NS.wp], ['a', NS.a], ['pic', NS.pic], ['r', NS.r]] as [string, string][])
    .forEach(([prefix, uri]) => {
      if (!root.getAttribute(`xmlns:${prefix}`)) {
        root.setAttribute(`xmlns:${prefix}`, uri);
      }
    });
}

function paragraphNodes(xml: XMLDocument): Element[] {
  return Array.from(xml.getElementsByTagName('w:p'));
}

function paragraphText(node: Element): string {
  return Array.from(node.getElementsByTagName('w:t'))
    .map((text) => text.textContent ?? '')
    .join('');
}

/**
 * Rewrites a paragraph's words while keeping it the same paragraph.
 *
 * The text goes into the first run and the others are emptied: the paragraph
 * keeps its style, indent and the formatting of its opening run, which is what
 * a letterhead depends on. Formatting that changed mid-marker is lost, and
 * that is the right thing to lose.
 */
function setParagraphText(node: Element, text: string) {
  const runs = Array.from(node.getElementsByTagName('w:t'));
  if (!runs.length) return;
  runs[0].setAttribute('xml:space', 'preserve');
  runs[0].textContent = text;
  runs.slice(1).forEach((run) => { run.textContent = ''; });
}

function markersIn(text: string): string[] {
  return Array.from(text.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)).map((match) => match[1]);
}

function dataUrlBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

/**
 * The natural shape of a photograph, needed before Word can be told its size.
 *
 * Timed out deliberately: a decoder that answers neither onload nor onerror
 * would otherwise hang the export for ever with the button still spinning, and
 * a report laid out on a guessed 4:3 is far better than no report.
 */
function imageRatio(dataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const settle = (ratio: number) => { clearTimeout(timer); resolve(ratio); };
    const timer = setTimeout(() => settle(4 / 3), 5000);
    const image = new Image();
    image.onload = () => settle(image.width / Math.max(1, image.height));
    image.onerror = () => settle(4 / 3);
    image.src = dataUrl;
  });
}

function emptyRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;
}

function withRelationships(
  text: string,
  media: { path: string; relId: string }[]
): string {
  const type = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image';
  const additions = media
    .map((item) => `<Relationship Id="${item.relId}" Type="${type}" Target="${item.path}"/>`)
    .join('');
  return text.replace('</Relationships>', `${additions}</Relationships>`);
}

/** Word will not display a picture whose extension it has no content type for. */
function withJpegType(text: string): string {
  if (!text) return text;
  if (/Extension="jpeg"/i.test(text)) return text;
  return text.replace(
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      + '<Default Extension="jpeg" ContentType="image/jpeg"/>'
  );
}
