/* Does a filled template still open in Word?

   The risky part of filling a college's own document is not the text - it is
   the picture: five nested DrawingML elements, a relationship, a content type
   and a media part, any one of which Word refuses the whole file for. This
   builds a template, fills it, unzips the result and checks each of those.

   Run with: npm run test:template */
import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import type { Report } from './report';

const dom = new JSDOM('<!doctype html><html></html>');
const globals = globalThis as Record<string, unknown>;
globals.DOMParser = dom.window.DOMParser;
globals.XMLSerializer = dom.window.XMLSerializer;
globals.Image = dom.window.Image;
globals.document = dom.window.document;
if (!globals.atob) globals.atob = (value: string) => Buffer.from(value, 'base64').toString('binary');

const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate');
const { readTemplate, markerPlan, fillTemplate } = await import('./docx-template');
const { EMPTY_EVENT } = await import('./report');

/** A one-pixel JPEG, enough to be a real image part. */
const PIXEL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a'
  + 'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/'
  + '2gAIAQEAAD8AKp//2Q==';

/** A minimal but genuine .docx, the way a college's template arrives. */
function templateFile(bodyParagraphs: string[]): File {
  const paragraphs = bodyParagraphs
    .map((text) => `<w:p><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`)
    .join('');
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      + '<Default Extension="xml" ContentType="application/xml"/>'
      + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
      + '</Types>'),
    '_rels/.rels': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
      + '</Relationships>'),
    'word/_rels/document.xml.rels': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>'),
    'word/document.xml': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
      + `<w:body>${paragraphs}</w:body></w:document>`),
  };
  const bytes = zipSync(files);
  return {
    name: 'college-template.docx',
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  } as unknown as File;
}

function report(): Report {
  return {
    fields: {
      ...EMPTY_EVENT,
      title: 'DBMS Hackathon',
      venue: 'Seminar Hall, Block A',
      department: 'Computer Science and Engineering',
      startDate: '2026-11-02',
      studentsCount: '60',
    },
    template: {
      letterheadDataUrl: null, footerDataUrl: null, photosPerPage: 2,
      includeCover: true, includeParticulars: true, includeWriteUp: true,
      includePhotos: true, includeAnnexure: true, includeSignatures: true,
    },
    photos: [
      { id: 'a', name: 'one.jpg', takenAt: '2026-11-02T12:37:00.000Z', dataUrl: PIXEL },
      { id: 'b', name: 'two.jpg', takenAt: '2026-11-02T12:38:00.000Z', dataUrl: PIXEL },
    ],
    folderName: 'DBMS_HACKTHON',
  };
}

async function fill(body: string[], plan?: Record<number, unknown>) {
  const doc = await readTemplate(templateFile(body));
  const blob = await fillTemplate(doc, report(), (plan ?? markerPlan(doc)) as never);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const files = unzipSync(bytes);
  return { doc, files, xml: strFromU8(files['word/document.xml']) };
}

test('a marker inside a sentence is replaced, and the sentence kept', async () => {
  const { xml } = await fill(['Report on {{title}} held at {{venue}}.']);
  assert.match(xml, /Report on DBMS Hackathon held at Seminar Hall, Block A\./);
  assert.doesNotMatch(xml, /\{\{/, 'no marker should survive');
});

test('markers are found even when Word split them across runs', async () => {
  // Word does this constantly: {{ti | tle}} across two runs after a spell-check.
  const split = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'
    + '<w:p><w:r><w:t>{{ti</w:t></w:r><w:r><w:t>tle}}</w:t></w:r></w:p>'
    + '</w:body></w:document>';
  const files = { ...unzipSync(zipSync({})) } as Record<string, Uint8Array>;
  void files;
  const base = await readTemplate(templateFile(['placeholder']));
  base.files['word/document.xml'] = strToU8(split);
  const rebuilt = await readTemplate({
    name: 'split.docx',
    arrayBuffer: async () => {
      const zipped = zipSync(base.files);
      return zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength);
    },
  } as unknown as File);
  assert.deepEqual(rebuilt.markers, ['title']);
  const blob = await fillTemplate(rebuilt, report(), markerPlan(rebuilt));
  const xml = strFromU8(unzipSync(new Uint8Array(await blob.arrayBuffer()))['word/document.xml']);
  assert.match(xml, /DBMS Hackathon/);
  assert.doesNotMatch(xml, /\{\{/);
});

test('the department is not given a second "Department of"', async () => {
  const { xml } = await fill(['{{department}}']);
  assert.match(xml, />Department of Computer Science and Engineering</);
  assert.doesNotMatch(xml, /Department of Department of/);
});

test('an empty field leaves the line empty, not the word NA', async () => {
  const { xml } = await fill(['Sponsor: {{sponsor}}']);
  assert.match(xml, />Sponsor: </);
});

test('photographs arrive as real picture parts Word can resolve', async () => {
  const { files, xml } = await fill(['Photographs follow.', '{{photos}}']);

  // The media parts exist...
  assert.ok(files['word/media/geosnap1.jpeg'], 'first photograph missing from the zip');
  assert.ok(files['word/media/geosnap2.jpeg'], 'second photograph missing from the zip');

  // ...the drawing points at them by relationship id...
  assert.match(xml, /r:embed="rIdGeoSnap1"/);
  assert.match(xml, /r:embed="rIdGeoSnap2"/);

  // ...the relationships resolve...
  const rels = strFromU8(files['word/_rels/document.xml.rels']);
  assert.match(rels, /Id="rIdGeoSnap1"[^>]*Target="media\/geosnap1\.jpeg"/);
  assert.match(rels, /relationships\/image/);

  // ...and Word knows what a .jpeg is.
  assert.match(strFromU8(files['[Content_Types].xml']), /Extension="jpeg"/);

  // Captions, and no leftover marker paragraph.
  assert.match(xml, /Photograph 1/);
  assert.match(xml, /Photograph 2/);
  assert.doesNotMatch(xml, /\{\{photos\}\}/);
  assert.match(xml, /Photographs follow\./, 'the college\'s own text must survive');
});

test('the filled document is still well-formed XML', async () => {
  const { xml } = await fill(['{{title}}', '{{particulars}}', '{{photos}}', '{{annexure}}']);
  const parsed = new dom.window.DOMParser().parseFromString(xml, 'application/xml');
  assert.equal(parsed.getElementsByTagName('parsererror').length, 0, 'Word would refuse this file');
  assert.match(xml, /Type of activity|Title|Venue/, 'particulars did not render');
  assert.match(xml, /one\.jpg/, 'annexure did not render');
});

test('plan B fills a template that has no markers at all', async () => {
  const body = ['TITLE OF THE PROGRAMME', 'Venue line', 'Photographs:'];
  const { xml } = await fill(body, {
    0: [{ kind: 'field', field: 'title' }],
    1: [{ kind: 'field', field: 'venue' }],
    2: [{ kind: 'photos' }],
  });
  assert.match(xml, />DBMS Hackathon</, 'the mapped line should become the title');
  assert.doesNotMatch(xml, /TITLE OF THE PROGRAMME/, 'the old wording should be gone');
  assert.match(xml, />Seminar Hall, Block A</);
  assert.match(xml, /r:embed="rIdGeoSnap1"/);
  // "Photographs:" was a real line, not a marker, so it is kept.
  assert.match(xml, /Photographs:/);
});

test('a file that is not a .docx is refused in words a person can act on', async () => {
  await assert.rejects(
    () => readTemplate({
      name: 'letterhead.pdf',
      arrayBuffer: async () => new TextEncoder().encode('%PDF-1.7 not a zip').buffer,
    } as unknown as File),
    /not a \.docx/
  );
});
