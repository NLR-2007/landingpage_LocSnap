/* What a report contains, independent of how it is rendered.

   Both renderers read this, so a PDF and a Word file of the same event cannot
   drift into saying different things. Mirrors the field set the Android app
   collects, so an event documented on the phone and one documented here are
   the same shape. */

export type ReportPhoto = {
  id: string;
  name: string;
  takenAt: string | null;
  /** Filled only for photographs the user chose to include. */
  dataUrl?: string;
};

export type EventFields = {
  institutionName: string;
  institutionUniversity: string;
  institutionAddress: string;
  department: string;
  eventType: string;
  title: string;
  subtitle: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  venue: string;
  mode: string;
  collaboratingAgency: string;
  sponsor: string;
  budget: string;
  coordinator: string;
  coordinatorDesignation: string;
  coCoordinator: string;
  resourcePerson: string;
  resourceAffiliation: string;
  resourceTopic: string;
  chiefGuest: string;
  studentsCount: string;
  facultyCount: string;
  externalCount: string;
  objectives: string;
  description: string;
  outcome: string;
  impact: string;
  beneficiaries: string;
  feedback: string;
  remarks: string;
};

export const EMPTY_EVENT: EventFields = {
  institutionName: '', institutionUniversity: '', institutionAddress: '', department: '',
  eventType: 'Workshop', title: '', subtitle: '', academicYear: '',
  startDate: '', endDate: '', venue: '', mode: 'Offline',
  collaboratingAgency: '', sponsor: '', budget: '',
  coordinator: '', coordinatorDesignation: '', coCoordinator: '',
  resourcePerson: '', resourceAffiliation: '', resourceTopic: '', chiefGuest: '',
  studentsCount: '', facultyCount: '', externalCount: '',
  objectives: '', description: '', outcome: '', impact: '',
  beneficiaries: '', feedback: '', remarks: '',
};

export const EVENT_TYPES = [
  'NSS camp / activity', 'NCC camp / activity', 'Workshop', 'Seminar', 'Conference',
  'Faculty development programme', 'Guest lecture', 'Industrial visit', 'Field work / survey',
  'Placement drive', 'Plantation drive', 'Awareness rally', 'Blood donation camp',
  'Health / medical camp', 'Community service', 'Sports event', 'Cultural event',
  'Exhibition', 'Competition', 'Training programme', 'Inauguration', 'Other',
];

export type ReportTemplate = {
  /** The college's own letterhead, printed across the top of every page. */
  letterheadDataUrl: string | null;
  footerDataUrl: string | null;
  photosPerPage: 2 | 4;
  includeCover: boolean;
  includeParticulars: boolean;
  includeWriteUp: boolean;
  includePhotos: boolean;
  includeAnnexure: boolean;
};

export const DEFAULT_TEMPLATE: ReportTemplate = {
  letterheadDataUrl: null,
  footerDataUrl: null,
  photosPerPage: 2,
  includeCover: true,
  includeParticulars: true,
  includeWriteUp: true,
  includePhotos: true,
  includeAnnexure: true,
};

export type Report = {
  fields: EventFields;
  template: ReportTemplate;
  photos: ReportPhoto[];
  folderName: string;
};

export function formatDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/** The date range, derived from the photographs when the user has not said. */
export function dateRange(report: Report): string {
  const { startDate, endDate } = report.fields;
  if (startDate) {
    return endDate && endDate !== startDate
      ? `${formatDate(startDate)} to ${formatDate(endDate)}`
      : formatDate(startDate);
  }
  const taken = report.photos.map((p) => p.takenAt).filter(Boolean).sort() as string[];
  if (!taken.length) return '';
  const first = formatDate(taken[0]);
  const last = formatDate(taken[taken.length - 1]);
  return first === last ? first : `${first} to ${last}`;
}

/** Label and value, with the blanks dropped - a report should not print "Venue: —". */
export function particulars(report: Report): { label: string; value: string }[] {
  const f = report.fields;
  const participants = [
    f.studentsCount && `${f.studentsCount} students`,
    f.facultyCount && `${f.facultyCount} faculty`,
    f.externalCount && `${f.externalCount} external`,
  ].filter(Boolean).join(', ');

  return [
    { label: 'Type of activity', value: f.eventType },
    { label: 'Title', value: f.title },
    { label: 'Theme', value: f.subtitle },
    { label: 'Organising department', value: f.department },
    { label: 'Academic year', value: f.academicYear },
    { label: 'Date', value: dateRange(report) },
    { label: 'Venue', value: f.venue },
    { label: 'Mode', value: f.mode },
    { label: 'Collaborating agency', value: f.collaboratingAgency },
    { label: 'Sponsor', value: f.sponsor },
    { label: 'Budget / expenditure', value: f.budget },
    { label: 'Coordinator', value: [f.coordinator, f.coordinatorDesignation].filter(Boolean).join(', ') },
    { label: 'Co-coordinator', value: f.coCoordinator },
    { label: 'Resource person', value: [f.resourcePerson, f.resourceAffiliation].filter(Boolean).join(', ') },
    { label: 'Topic covered', value: f.resourceTopic },
    { label: 'Chief guest', value: f.chiefGuest },
    { label: 'Participants', value: participants },
    { label: 'Photographs attached', value: report.photos.length ? String(report.photos.length) : '' },
  ].filter((row) => row.value.trim().length > 0);
}

export function sections(report: Report): { heading: string; body: string }[] {
  const f = report.fields;
  return [
    { heading: 'Objectives', body: f.objectives },
    { heading: 'Description of the activity', body: f.description },
    { heading: 'Outcome', body: f.outcome },
    { heading: 'Impact and benefit', body: f.impact },
    { heading: 'Beneficiaries', body: f.beneficiaries },
    { heading: 'Feedback', body: f.feedback },
    { heading: 'Remarks', body: f.remarks },
  ].filter((section) => section.body.trim().length > 0);
}

export function fileStem(report: Report): string {
  const base = report.fields.title || report.folderName || 'Event report';
  return base.replace(/[^\p{L}\p{N} ._-]+/gu, ' ').replace(/ +/g, '_').replace(/^_|_$/g, '').slice(0, 60);
}
