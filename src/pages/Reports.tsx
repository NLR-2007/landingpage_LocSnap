/* Writing an event report on a keyboard, from photographs already in Drive.

   The phone is where an event is captured; a laptop is where it is written up.
   This reads the folders the app backed up, takes the details on a screen with
   a keyboard, and produces the PDF or Word file a college actually files.

   Nothing is uploaded here. Photographs go Drive -> browser -> document. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import { useAuth } from '../lib/auth-context';
import {
  connectDrive, listEventFolders, listPhotos, photoDataUrl,
  type DriveFolder, type DrivePhoto,
} from '../lib/drive';
import {
  DEFAULT_TEMPLATE, EMPTY_EVENT, EVENT_TYPES,
  type EventFields, type Report, type ReportPhoto, type ReportTemplate, fileStem,
} from '../lib/report';
import { buildPdf } from '../lib/report-pdf';
import { buildDocx } from '../lib/report-docx';

const DRAFT_KEY = 'geosnap-report-draft';

type Stage = 'connect' | 'folders' | 'edit';

export default function Reports() {
  const { user, loading } = useAuth();
  const [stage, setStage] = useState<Stage>('connect');
  const [token, setToken] = useState<string | null>(null);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [folder, setFolder] = useState<DriveFolder | null>(null);
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [fields, setFields] = useState<EventFields>(EMPTY_EVENT);
  const [template, setTemplate] = useState<ReportTemplate>(DEFAULT_TEMPLATE);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drafts survive a closed tab. Nothing here leaves the browser.
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const draft = JSON.parse(saved);
      if (draft.fields) setFields({ ...EMPTY_EVENT, ...draft.fields });
      if (draft.template) setTemplate({ ...DEFAULT_TEMPLATE, ...draft.template });
    } catch { /* a corrupt draft is not worth failing over */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ fields, template }));
  }, [fields, template]);

  const connect = useCallback(async () => {
    setBusy('Asking Google for permission…');
    setError(null);
    try {
      const granted = await connectDrive();
      setToken(granted);
      const found = await listEventFolders(granted);
      setFolders(found);
      setStage('folders');
      if (!found.length) {
        setError('No GeoSnap folders found in this Drive. Turn on Drive backup for a folder in the app, take a photo, then come back.');
      }
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(null);
    }
  }, []);

  async function openFolder(target: DriveFolder) {
    if (!token) return;
    setBusy('Reading photographs…');
    setError(null);
    try {
      const found = await listPhotos(token, target.id);
      setFolder(target);
      setPhotos(found);
      setChosen(new Set(found.map((p) => p.id)));
      setFields((current) => ({
        ...current,
        title: current.title || target.name.replace(/_/g, ' '),
      }));
      setStage('edit');
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const selected = useMemo(
    () => photos.filter((photo) => chosen.has(photo.id)),
    [photos, chosen]
  );

  async function generate(kind: 'pdf' | 'docx') {
    if (!token || !folder) return;
    setBusy(`Building the ${kind === 'pdf' ? 'PDF' : 'Word file'}…`);
    setError(null);
    try {
      // Only the chosen photographs are fetched - a 200-photo folder should not
      // be downloaded to produce a report that uses six of them.
      const withImages: ReportPhoto[] = [];
      for (const photo of selected) {
        setBusy(`Fetching photograph ${withImages.length + 1} of ${selected.length}…`);
        withImages.push({
          id: photo.id, name: photo.name, takenAt: photo.takenAt,
          dataUrl: await photoDataUrl(token, photo.id),
        });
      }
      const report: Report = { fields, template, photos: withImages, folderName: folder.name };
      setBusy(`Building the ${kind === 'pdf' ? 'PDF' : 'Word file'}…`);
      const blob = kind === 'pdf' ? await buildPdf(report) : await buildDocx(report);
      download(blob, `${fileStem(report)}.${kind}`);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function set<K extends keyof EventFields>(key: K, value: EventFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function pickImage(which: 'letterheadDataUrl' | 'footerDataUrl', file: File | null) {
    if (!file) { setTemplate((t) => ({ ...t, [which]: null })); return; }
    const reader = new FileReader();
    reader.onload = () => setTemplate((t) => ({ ...t, [which]: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  if (loading) return <PageShell title="Reports" eyebrow="Geo Snap Pro" wide><p className="mt-8 text-sm text-ink/70">Loading…</p></PageShell>;

  return (
    <PageShell title="Reports" eyebrow="Geo Snap Pro" wide>
      <Seo title="Event reports - Geo Snap - NLR" description="Write an event report from the photographs in your Drive." noindex />

      {!user && (
        <p className="mt-8 max-w-xl rounded-2xl border border-line bg-card px-5 py-4 text-sm text-ink/80">
          Sign in with the same Google account your phone backs up to.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-6 max-w-2xl rounded-2xl border border-[#B3261E]/25 bg-[#B3261E]/[0.06] px-5 py-4 text-sm text-[#B3261E]">{error}</p>
      )}
      {busy && <p role="status" className="mt-6 text-sm text-ink/70">{busy}</p>}

      {user && stage === 'connect' && (
        <div className="mt-8 max-w-2xl">
          <p className="text-sm leading-relaxed text-ink/70">
            Your photographs stay in your own Google Drive. This page reads the folders the app
            created and nothing else, builds the document in your browser, and uploads nothing.
          </p>
          <button type="button" onClick={() => void connect()} disabled={Boolean(busy)}
            className="btn-brand mt-6 rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] disabled:opacity-50">
            Connect Drive
          </button>
        </div>
      )}

      {stage === 'folders' && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-medium text-ink">Choose an event</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((item) => (
              <button key={item.id} type="button" onClick={() => void openFolder(item)}
                className="rounded-2xl border border-line bg-card p-5 text-left transition hover:border-green/40">
                <span className="block font-medium text-ink">{item.name.replace(/_/g, ' ')}</span>
                <span className="mt-1 block text-xs text-ink/55">Open</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === 'edit' && folder && (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-xl font-medium text-ink">{folder.name.replace(/_/g, ' ')}</h2>
            <p className="mt-1 text-sm text-ink/55">{selected.length} of {photos.length} photograph(s) selected</p>

            <Section title="Institution" />
            <Field label="College / institution name" value={fields.institutionName} onChange={(v) => set('institutionName', v)} />
            <Field label="Affiliated university" value={fields.institutionUniversity} onChange={(v) => set('institutionUniversity', v)} />
            <Field label="Institution address" value={fields.institutionAddress} onChange={(v) => set('institutionAddress', v)} rows={2} />
            <Field label="Organising department" value={fields.department} onChange={(v) => set('department', v)} />

            <Section title="Event" />
            <label className="mt-4 block text-[10px] font-medium uppercase tracking-[0.16em] text-ink/55">Type of activity</label>
            <select value={fields.eventType} onChange={(e) => set('eventType', e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-green/50">
              {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <Field label="Title of the activity" value={fields.title} onChange={(v) => set('title', v)} />
            <Field label="Theme / sub-title" value={fields.subtitle} onChange={(v) => set('subtitle', v)} />
            <Field label="Academic year" value={fields.academicYear} onChange={(v) => set('academicYear', v)} placeholder="2026-27" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Start date" type="date" value={fields.startDate} onChange={(v) => set('startDate', v)} />
              <Field label="End date" type="date" value={fields.endDate} onChange={(v) => set('endDate', v)} />
            </div>
            <Field label="Venue" value={fields.venue} onChange={(v) => set('venue', v)} rows={2} />
            <Field label="Collaborating agency" value={fields.collaboratingAgency} onChange={(v) => set('collaboratingAgency', v)} />
            <Field label="Sponsor" value={fields.sponsor} onChange={(v) => set('sponsor', v)} />
            <Field label="Budget / expenditure" value={fields.budget} onChange={(v) => set('budget', v)} />

            <Section title="People" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Coordinator" value={fields.coordinator} onChange={(v) => set('coordinator', v)} />
              <Field label="Designation" value={fields.coordinatorDesignation} onChange={(v) => set('coordinatorDesignation', v)} />
            </div>
            <Field label="Co-coordinator" value={fields.coCoordinator} onChange={(v) => set('coCoordinator', v)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Resource person" value={fields.resourcePerson} onChange={(v) => set('resourcePerson', v)} />
              <Field label="Affiliation" value={fields.resourceAffiliation} onChange={(v) => set('resourceAffiliation', v)} />
            </div>
            <Field label="Topic covered" value={fields.resourceTopic} onChange={(v) => set('resourceTopic', v)} rows={2} />
            <Field label="Chief guest" value={fields.chiefGuest} onChange={(v) => set('chiefGuest', v)} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Students" value={fields.studentsCount} onChange={(v) => set('studentsCount', v)} />
              <Field label="Faculty" value={fields.facultyCount} onChange={(v) => set('facultyCount', v)} />
              <Field label="External" value={fields.externalCount} onChange={(v) => set('externalCount', v)} />
            </div>

            <Section title="Report write-up" />
            <Field label="Objectives" value={fields.objectives} onChange={(v) => set('objectives', v)} rows={4} />
            <Field label="Description of the activity" value={fields.description} onChange={(v) => set('description', v)} rows={7} />
            <Field label="Outcome" value={fields.outcome} onChange={(v) => set('outcome', v)} rows={4} />
            <Field label="Impact and benefit" value={fields.impact} onChange={(v) => set('impact', v)} rows={4} />
            <Field label="Beneficiaries" value={fields.beneficiaries} onChange={(v) => set('beneficiaries', v)} rows={2} />
            <Field label="Feedback" value={fields.feedback} onChange={(v) => set('feedback', v)} rows={3} />
            <Field label="Remarks" value={fields.remarks} onChange={(v) => set('remarks', v)} rows={3} />
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <h3 className="font-display text-lg font-medium text-ink">Your college template</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink/55">
              Put your letterhead on every page and leave out the parts your own proforma covers.
            </p>

            <ImagePick label="Letterhead" value={template.letterheadDataUrl}
              onPick={(file) => void pickImage('letterheadDataUrl', file)} />
            <ImagePick label="Footer" value={template.footerDataUrl}
              onPick={(file) => void pickImage('footerDataUrl', file)} />

            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-ink/70">Photos per page</span>
              {[2, 4].map((count) => (
                <button key={count} type="button"
                  onClick={() => setTemplate((t) => ({ ...t, photosPerPage: count as 2 | 4 }))}
                  className={`rounded-full px-4 py-1 text-sm ${template.photosPerPage === count ? 'btn-brand' : 'border border-line text-ink/70'}`}>
                  {count}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {([
                ['includeCover', 'Cover page'],
                ['includeParticulars', 'Particulars table'],
                ['includeWriteUp', 'Write-up sections'],
                ['includePhotos', 'Photographs'],
                ['includeAnnexure', 'Annexure index'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-ink/70">
                  <input type="checkbox" checked={template[key]}
                    onChange={(e) => setTemplate((t) => ({ ...t, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
            </div>

            <h3 className="font-display mt-8 text-lg font-medium text-ink">Photographs</h3>
            <div className="mt-3 grid max-h-72 grid-cols-3 gap-2 overflow-y-auto rounded-2xl border border-line p-3">
              {photos.map((photo) => (
                <button key={photo.id} type="button"
                  onClick={() => setChosen((current) => {
                    const next = new Set(current);
                    if (next.has(photo.id)) next.delete(photo.id); else next.add(photo.id);
                    return next;
                  })}
                  className={`rounded-lg border p-2 text-left text-[10px] leading-tight ${chosen.has(photo.id) ? 'border-green bg-green/10 text-ink' : 'border-line text-ink/50'}`}>
                  {chosen.has(photo.id) ? '✓ ' : ''}{photo.name.slice(0, 26)}
                </button>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => void generate('pdf')} disabled={Boolean(busy)}
                className="btn-brand flex-1 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] disabled:opacity-50">
                PDF
              </button>
              <button type="button" onClick={() => void generate('docx')} disabled={Boolean(busy)}
                className="flex-1 rounded-full border border-line px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink/80 disabled:opacity-50">
                Word
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink/50">
              Word opens in your college's own template for editing; PDF is ready to submit.
              Your answers are kept in this browser until you clear them.
            </p>
            <button type="button" onClick={() => { setStage('folders'); setFolder(null); }}
              className="mt-5 text-xs font-medium text-ink/55">← Choose a different event</button>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function Section({ title }: { title: string }) {
  return <h3 className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-green">{title}</h3>;
}

function Field({ label, value, onChange, rows = 1, type = 'text', placeholder }: {
  label: string; value: string; onChange: (value: string) => void;
  rows?: number; type?: string; placeholder?: string;
}) {
  const classes = 'mt-1 w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-green/50';
  return (
    <div className="mt-4">
      <label className="block text-[10px] font-medium uppercase tracking-[0.16em] text-ink/55">{label}</label>
      {rows > 1 ? (
        <textarea value={value} rows={rows} placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)} className={classes} />
      ) : (
        <input value={value} type={type} placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)} className={classes} />
      )}
    </div>
  );
}

function ImagePick({ label, value, onPick }: {
  label: string; value: string | null; onPick: (file: File | null) => void;
}) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="h-10 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-cream/40">
        {value && <img src={value} alt={label} className="h-full w-full object-contain" />}
      </div>
      <span className="flex-1 text-sm text-ink/70">{label}</span>
      {value ? (
        <button type="button" onClick={() => onPick(null)} className="text-xs font-medium text-ink/55">Remove</button>
      ) : (
        <label className="cursor-pointer text-xs font-medium text-green">
          Choose
          <input type="file" accept="image/*" className="hidden"
            onChange={(event) => onPick(event.target.files?.[0] ?? null)} />
        </label>
      )}
    </div>
  );
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
