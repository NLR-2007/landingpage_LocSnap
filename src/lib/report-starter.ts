/* A template to start from.

   The upload panel asked for a .docx and gave no way to obtain one, which
   leaves anyone without a proforma already in hand with nothing to do. This
   builds one: every marker in its right place, laid out the way an Indian
   college activity report is laid out, for the user to open in Word, drop
   their letterhead into, and send back.

   It is deliberately the same document the filler expects, so downloading it,
   uploading it and generating a report is a closed loop a college can check
   for itself before trusting the page with the proforma it actually files. */
import {
  AlignmentType, BorderStyle, Document, HeadingLevel, Packer,
  Paragraph, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx';

export const STARTER_NAME = 'Geo-Snap-starter-template.docx';

export async function buildStarterTemplate(): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  children.push(
    note('Replace this line with your letterhead - paste your logo and address here, '
      + 'or set it as the page header so it repeats on every page.'),
    new Paragraph({ text: '' }),
    centred('{{institutionName}}', 30, true),
    centred('{{institutionUniversity}}', 22),
    centred('{{institutionAddress}}', 18),
    centred('{{department}}', 22, true),
    new Paragraph({ text: '' }),
    centred('ACTIVITY REPORT', 24, true),
    centred('{{title}}', 28, true),
    centred('{{subtitle}}', 22),
    centred('{{dateRange}}', 20),
    new Paragraph({ text: '' }),
  );

  children.push(new Paragraph({ text: 'Particulars', heading: HeadingLevel.HEADING_1 }));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: grey(),
    // Markers work inside table cells, which is where a proforma usually keeps
    // them, so the starter demonstrates that rather than only claiming it.
    rows: ([
      ['Type of activity', '{{eventType}}'],
      ['Title', '{{title}}'],
      ['Organising department', '{{department}}'],
      ['Academic year', '{{academicYear}}'],
      ['Date', '{{dateRange}}'],
      ['Venue', '{{venue}}'],
      ['Mode', '{{mode}}'],
      ['Collaborating agency', '{{collaboratingAgency}}'],
      ['Sponsor', '{{sponsor}}'],
      ['Budget / expenditure', '{{budget}}'],
      ['Coordinator', '{{coordinator}}, {{coordinatorDesignation}}'],
      ['Resource person', '{{resourcePerson}}, {{resourceAffiliation}}'],
      ['Topic covered', '{{resourceTopic}}'],
      ['Chief guest', '{{chiefGuest}}'],
      ['Participants', '{{studentsCount}} students, {{facultyCount}} faculty'],
      ['Photographs attached', '{{photoCount}}'],
    ] as [string, string][]).map(([label, marker]) => new TableRow({
      children: [
        new TableCell({ width: { size: 34, type: WidthType.PERCENTAGE }, children: [bold(label)] }),
        new TableCell({ width: { size: 66, type: WidthType.PERCENTAGE }, children: [plain(marker)] }),
      ],
    })),
  }));

  children.push(new Paragraph({ text: '' }));
  ([
    ['Objectives', '{{objectives}}'],
    ['Description of the activity', '{{description}}'],
    ['Outcome', '{{outcome}}'],
    ['Impact and benefit', '{{impact}}'],
    ['Beneficiaries', '{{beneficiaries}}'],
    ['Feedback', '{{feedback}}'],
    ['Remarks', '{{remarks}}'],
  ] as [string, string][]).forEach(([heading, marker]) => {
    children.push(new Paragraph({ text: heading, heading: HeadingLevel.HEADING_2 }));
    children.push(plain(marker));
    children.push(new Paragraph({ text: '' }));
  });

  children.push(new Paragraph({ text: 'Photographs', heading: HeadingLevel.HEADING_1 }));
  children.push(note('The photographs you tick are inserted where the next line stands, '
    + 'each with its own caption. Delete the next line to leave them out.'));
  children.push(plain('{{photos}}'));

  children.push(new Paragraph({ text: 'Annexure - photograph index', heading: HeadingLevel.HEADING_1 }));
  children.push(plain('{{annexure}}'));

  children.push(new Paragraph({ text: '' }), new Paragraph({ text: '' }));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: none(),
    rows: [new TableRow({
      children: [
        ['Event Coordinator', '{{coordinator}}'],
        ['Head of the Department', ''],
        ['Principal / Director', ''],
      ].map(([role, marker]) => new TableCell({
        width: { size: 33, type: WidthType.PERCENTAGE },
        children: [centred(marker, 18), centred('________________', 18), centred(role, 18, true)],
      })),
    })],
  }));

  children.push(new Paragraph({ text: '' }));
  children.push(note('Any marker you delete is simply not filled. Any marker you add must be '
    + 'spelled exactly as the list on the website spells it. Keep the double braces.'));

  return await Packer.toBlob(new Document({ sections: [{ children }] }));
}

function centred(text: string, size: number, strong = false): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, bold: strong, size })],
  });
}

function plain(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, size: 21 })] });
}

function bold(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, bold: true, size: 20 })] });
}

/** Instructions to the person editing the template, meant to be deleted. */
function note(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `[ ${text} ]`, italics: true, size: 18, color: '8A8A8A' })],
  });
}

function grey() {
  const side = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' };
  return { top: side, bottom: side, left: side, right: side, insideHorizontal: side, insideVertical: side };
}

function none() {
  const side = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  return { top: side, bottom: side, left: side, right: side, insideHorizontal: side, insideVertical: side };
}
