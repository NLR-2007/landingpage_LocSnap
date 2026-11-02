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
  cachedToken, connectDrive, DriveAuthError, forgetToken, inBatches, listEventFolders,
  listPhotos, photoDataUrl, photoForPrint, photoThumbnail,
  type DriveFolder, type DrivePhoto,
} from '../lib/drive';
import {
  DEFAULT_TEMPLATE, EMPTY_EVENT, EVENT_TYPES, PARTICULAR_LABELS, WRITE_UP_HEADINGS, formatDateTime,
  type EventFields, type Report, type ReportPhoto, type ReportTemplate, fileStem,
} from '../lib/report';
import { buildPdf } from '../lib/report-pdf';
import { buildDocx } from '../lib/report-docx';
import TemplatePanel from '../components/TemplatePanel';
import {
  fillTemplate, markerPlan, readTemplate, type Slot, type TemplateDoc,
} from '../lib/docx-template';

const DRAFT_KEY = 'geosnap-report-draft';

type Stage = 'connect' | 'folders' | 'choose' | 'edit';
/** Our PDF, our Word layout, or the college's own document. */
type Kind = 'pdf' | 'docx' | 'template';
/** Whose document this report gets written into. Asked before anything else. */
type Route = 'ask' | 'own' | 'ours';

export default function Reports() {
  const { user, loading } = useAuth();
  const [stage, setStage] = useState<Stage>('connect');
  const [token, setToken] = useState<string | null>(null);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [folder, setFolder] = useState<DriveFolder | null>(null);
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  /** Small versions for the picking grid, keyed by file id, filled in as they arrive. */
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  /** The photograph being looked at full size; dataUrl null while it loads. */
  const [preview, setPreview] = useState<{ photo: DrivePhoto; dataUrl: string | null } | null>(null);
  /** The college's own .docx, held in this tab only - it is far too big for localStorage. */
  const [custom, setCustom] = useState<TemplateDoc | null>(null);
  /** Plan B: which paragraph of that template holds what. */
  const [mapping, setMapping] = useState<Record<number, Slot[]>>({});
  const [route, setRoute] = useState<Route>('ask');
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

  const connect = useCallback(async (reconsent = false) => {
    setBusy('Asking Google for permission…');
    setError(null);
    try {
      const granted = await connectDrive(reconsent);
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

  /* A token that is still alive survives a reload, so coming back to the page
     does not mean connecting again. */
  useEffect(() => {
    if (token || loading || !user) return;
    const kept = cachedToken();
    if (!kept) return;
    let cancelled = false;
    (async () => {
      try {
        const found = await listEventFolders(kept);
        if (cancelled) return;
        setToken(kept);
        setFolders(found);
        setStage((current) => (current === 'connect' ? 'folders' : current));
      } catch {
        // Expired after all; the page simply stays on the connect step.
        forgetToken();
      }
    })();
    return () => { cancelled = true; };
  }, [token, loading, user]);

  /**
   * Runs a piece of Drive work, reconnecting once if the hour has run out.
   *
   * Google's browser flow has no refresh token, so the only way back is
   * another popup. Doing it here means a long export does not fail with a
   * raw error halfway through a folder.
   */
  const withDrive = useCallback(async <T,>(work: (token: string) => Promise<T>): Promise<T> => {
    const current = token ?? cachedToken();
    if (!current) throw new DriveAuthError('Connect your Drive to continue.');
    try {
      return await work(current);
    } catch (cause) {
      if (!(cause instanceof DriveAuthError)) throw cause;
      setBusy('The Drive connection expired - reconnecting…');
      const granted = await connectDrive();
      setToken(granted);
      return await work(granted);
    }
  }, [token]);

  async function openFolder(target: DriveFolder) {
    setBusy('Reading photographs…');
    setError(null);
    try {
      const { found, granted } = await withDrive(async (active) => ({
        found: await listPhotos(active, target.id), granted: active,
      }));
      setFolder(target);
      setPhotos(found);
      setChosen(new Set(found.map((p) => p.id)));
      setThumbs({});
      // The grid is usable before the pictures land, so the thumbnails are
      // fetched in the background, a few at a time, and appear as they come.
      void loadThumbs(granted, found);
      setFields((current) => ({
        ...current,
        title: current.title || target.name.replace(/_/g, ' '),
      }));
      setStage(route === 'ask' ? 'choose' : 'edit');
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function loadThumbs(granted: string, list: DrivePhoto[]) {
    await inBatches(list, 4, async (photo) => {
      try {
        const small = await photoThumbnail(granted, photo.id);
        setThumbs((current) => ({ ...current, [photo.id]: small }));
      } catch {
        // A photograph that will not load simply keeps its placeholder tile.
      }
    });
  }

  /** Full size, fetched on demand - a preview should not cost a whole folder. */
  async function openPreview(photo: DrivePhoto) {
    setPreview({ photo, dataUrl: thumbs[photo.id] ?? null });
    try {
      const full = await withDrive((active) => photoDataUrl(active, photo.id));
      setPreview((current) => (current?.photo.id === photo.id ? { photo, dataUrl: full } : current));
    } catch (cause) {
      setError((cause as Error).message);
    }
  }

  const selected = useMemo(
    () => photos.filter((photo) => chosen.has(photo.id)),
    [photos, chosen]
  );

  async function loadTemplate(file: File) {
    setBusy('Reading the template…');
    setError(null);
    try {
      const doc = await readTemplate(file);
      setCustom(doc);
      setMapping({});
      if (!doc.markers.length) {
        setError(null);
      }
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const label = (kind: Kind) => (kind === 'pdf' ? 'PDF' : 'Word file');

  async function generate(kind: Kind) {
    if (!folder) return;
    if (kind === 'template' && !custom) return;
    setBusy(`Building the ${label(kind)}…`);
    setError(null);
    try {
      // Only the chosen photographs are fetched - a 200-photo folder should not
      // be downloaded to produce a report that uses six of them.
      const withImages: ReportPhoto[] = [];
      for (const photo of selected) {
        setBusy(`Fetching photograph ${withImages.length + 1} of ${selected.length}…`);
        withImages.push({
          id: photo.id, name: photo.name, takenAt: photo.takenAt,
          dataUrl: await withDrive((active) => photoForPrint(active, photo.id)),
        });
      }
      const report: Report = { fields, template, photos: withImages, folderName: folder.name };
      setBusy(`Building the ${label(kind)}…`);

      if (kind === 'template' && custom) {
        // Plan A when the template named its own slots, Plan B when the user did.
        const plan = custom.markers.length ? markerPlan(custom) : mapping;
        if (!Object.keys(plan).length) {
          throw new Error('Nothing is mapped yet. Say what at least one line of the template is.');
        }
        download(await fillTemplate(custom, report, plan), `${fileStem(report)}.docx`);
        return;
      }

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
          <p className="mt-4 text-xs text-ink/50">
            Google's permission lasts about an hour. It is reused for as long as it is good and
            renewed when it runs out, so you should not have to do this often.{' '}
            <button type="button" onClick={() => { forgetToken(); void connect(true); }}
              className="font-medium text-green">Use a different Google account</button>
          </p>
        </div>
      )}

      {stage === 'folders' && (
        <div className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-medium text-ink">Choose an event</h2>
            <button type="button" onClick={() => { forgetToken(); setToken(null); void connect(true); }}
              className="text-xs font-medium text-ink/55">Reconnect or switch account</button>
          </div>
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

      {stage === 'choose' && folder && (
        <div className="mt-8 max-w-3xl">
          <h2 className="font-display text-xl font-medium text-ink">
            Which document should this report go into?
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            {folder.name.replace(/_/g, ' ')} · {photos.length} photograph(s) found
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button type="button" onClick={() => { setRoute('own'); setStage('edit'); }}
              className="rounded-2xl border border-line bg-card p-6 text-left transition hover:border-green/50">
              <span className="block font-display text-lg font-medium text-ink">
                My institution's own template
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-ink/60">
                Upload the Word file your office already files. Your letterhead, margins, fonts and
                proforma are kept exactly as they are - this event's details are written into it.
              </span>
              <span className="mt-3 block text-xs font-medium text-green">Recommended for colleges →</span>
            </button>

            <button type="button" onClick={() => { setRoute('ours'); setStage('edit'); }}
              className="rounded-2xl border border-line bg-card p-6 text-left transition hover:border-green/50">
              <span className="block font-display text-lg font-medium text-ink">
                Build one for me
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-ink/60">
                A ready report - cover, particulars, write-up, photographs, annexure and signature
                lines. Add your own sections, remove any you do not need, and put your letterhead on
                top.
              </span>
              <span className="mt-3 block text-xs font-medium text-green">Nothing to upload →</span>
            </button>
          </div>

          <button type="button" onClick={() => { setStage('folders'); setFolder(null); }}
            className="mt-6 text-xs font-medium text-ink/55">← Choose a different event</button>
        </div>
      )}

      {stage === 'edit' && folder && (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-xl font-medium text-ink">{folder.name.replace(/_/g, ' ')}</h2>
            <p className="mt-1 text-sm text-ink/55">
              {selected.length} of {photos.length} photograph(s) selected ·{' '}
              {route === 'own' ? 'your own template' : 'our layout'}
              <button type="button" onClick={() => setStage('choose')}
                className="ml-2 font-medium text-green">change</button>
            </p>

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

            <div className="mt-8 flex items-center justify-between">
              <Section title="Your own sections" />
              <button type="button"
                onClick={() => setTemplate((t) => ({
                  ...t,
                  extraSections: [
                    ...t.extraSections,
                    { id: `s${Date.now()}`, heading: '', body: '' },
                  ],
                }))}
                className="mt-8 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink/70">
                + Add a section
              </button>
            </div>
            <p className="text-xs leading-relaxed text-ink/55">
              For anything your proforma asks for that is not above - a NAAC criterion, an
              attendance summary, an action taken report. These print after the standard sections.
            </p>
            {template.extraSections.map((section, index) => (
              <div key={section.id} className="mt-4 rounded-2xl border border-line p-4">
                <div className="flex items-center gap-2">
                  <input value={section.heading} placeholder={`Heading for section ${index + 1}`}
                    onChange={(event) => setTemplate((t) => ({
                      ...t,
                      extraSections: t.extraSections.map((item) => (
                        item.id === section.id ? { ...item, heading: event.target.value } : item
                      )),
                    }))}
                    className="flex-1 rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink" />
                  <button type="button" aria-label="Delete this section"
                    onClick={() => setTemplate((t) => ({
                      ...t,
                      extraSections: t.extraSections.filter((item) => item.id !== section.id),
                    }))}
                    className="shrink-0 rounded-full border border-line px-3 py-2 text-xs font-medium text-ink/55">
                    Delete
                  </button>
                </div>
                <textarea value={section.body} rows={4} placeholder="What this section says"
                  onChange={(event) => setTemplate((t) => ({
                    ...t,
                    extraSections: t.extraSections.map((item) => (
                      item.id === section.id ? { ...item, body: event.target.value } : item
                    )),
                  }))}
                  className="mt-2 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink" />
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            {route === 'own' && (
              <>
                <h3 className="font-display text-lg font-medium text-ink">Your own Word document</h3>
                <TemplatePanel doc={custom} mapping={mapping} busy={Boolean(busy)}
                  onUpload={(file) => void loadTemplate(file)}
                  onClear={() => { setCustom(null); setMapping({}); }}
                  onMapping={setMapping} />
              </>
            )}

            <h3 className={`font-display text-lg font-medium text-ink ${route === 'own' ? 'mt-8' : ''}`}>
              {route === 'own' ? 'Or fall back to our layout' : 'Our layout'}
            </h3>
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
                ['includeSignatures', 'Signature lines'],
              ] as const).map(([key, caption]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-ink/70">
                  <input type="checkbox" checked={template[key]}
                    onChange={(e) => setTemplate((t) => ({ ...t, [key]: e.target.checked }))} />
                  {caption}
                </label>
              ))}
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-medium text-green">
                Leave out particular rows or headings
              </summary>
              <p className="mt-2 text-[11px] leading-relaxed text-ink/55">
                Untick anything your proforma does not ask for. Rows you left blank are already
                left out.
              </p>
              <div className="mt-2 space-y-1.5">
                {PARTICULAR_LABELS.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-xs text-ink/65">
                    <input type="checkbox" checked={!template.omitParticulars.includes(item)}
                      onChange={(event) => setTemplate((t) => ({
                        ...t,
                        omitParticulars: event.target.checked
                          ? t.omitParticulars.filter((label) => label !== item)
                          : [...t.omitParticulars, item],
                      }))} />
                    {item}
                  </label>
                ))}
              </div>
              <div className="mt-3 space-y-1.5 border-t border-line pt-3">
                {WRITE_UP_HEADINGS.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-xs text-ink/65">
                    <input type="checkbox" checked={!template.omitSections.includes(item)}
                      onChange={(event) => setTemplate((t) => ({
                        ...t,
                        omitSections: event.target.checked
                          ? t.omitSections.filter((heading) => heading !== item)
                          : [...t.omitSections, item],
                      }))} />
                    {item}
                  </label>
                ))}
              </div>
            </details>

            <h3 className="font-display mt-8 text-lg font-medium text-ink">Photographs</h3>
            <p className="mt-1 text-xs text-ink/50">
              Tap a photograph to see it full size. The tick in the corner decides whether it goes
              into the report.
            </p>
            <div className="mt-3 grid max-h-[26rem] grid-cols-2 gap-3 overflow-y-auto rounded-2xl border border-line p-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((photo, index) => (
                <figure key={photo.id}
                  className={`relative overflow-hidden rounded-xl border ${chosen.has(photo.id) ? 'border-green' : 'border-line'}`}>
                  <button type="button" onClick={() => void openPreview(photo)}
                    className="block w-full" title="Open preview">
                    {thumbs[photo.id]
                      ? <img src={thumbs[photo.id]} alt={photo.name} loading="lazy"
                          className="aspect-[4/3] w-full object-cover" />
                      : <span className="flex aspect-[4/3] w-full items-center justify-center bg-ink/5 text-[10px] text-ink/40">
                          loading…
                        </span>}
                  </button>
                  <button type="button" aria-label={chosen.has(photo.id) ? 'Remove from report' : 'Include in report'}
                    onClick={() => setChosen((current) => {
                      const next = new Set(current);
                      if (next.has(photo.id)) next.delete(photo.id); else next.add(photo.id);
                      return next;
                    })}
                    className={`absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-xs font-bold shadow ${chosen.has(photo.id) ? 'bg-green text-white' : 'bg-white/90 text-ink/40'}`}>
                    {chosen.has(photo.id) ? '✓' : '+'}
                  </button>
                  <figcaption className="px-2 py-1 text-[10px] leading-tight text-ink/55">
                    {index + 1}. {photo.takenAt ? formatDateTime(photo.takenAt) : photo.name.slice(0, 22)}
                  </figcaption>
                </figure>
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
            {custom && (
              <button type="button" onClick={() => void generate('template')} disabled={Boolean(busy)}
                className="btn-brand mt-3 w-full rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] disabled:opacity-50">
                Fill my own template
              </button>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-ink/50">
              Word opens for editing; PDF is ready to submit. Filling your own template returns that
              same document with this event written into it. Your answers are kept in this browser
              until you clear them.
            </p>
            <button type="button" onClick={() => { setStage('folders'); setFolder(null); }}
              className="mt-5 text-xs font-medium text-ink/55">← Choose a different event</button>
          </div>
        </div>
      )}

      {preview && (
        <div role="dialog" aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/80 p-4"
          onClick={() => setPreview(null)}>
          <div className="max-h-full w-full max-w-3xl overflow-hidden rounded-2xl bg-card"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{preview.photo.name}</p>
                {preview.photo.takenAt && (
                  <p className="text-xs text-ink/55">{formatDateTime(preview.photo.takenAt)}</p>
                )}
              </div>
              <button type="button" onClick={() => setPreview(null)}
                className="shrink-0 text-xs font-medium text-ink/55">Close</button>
            </div>
            {preview.dataUrl ? (
              <img src={preview.dataUrl} alt={preview.photo.name}
                className="max-h-[70vh] w-full bg-ink/5 object-contain" />
            ) : (
              <div className="grid h-72 place-items-center text-sm text-ink/50">Loading photograph…</div>
            )}
            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
              <span className="text-xs text-ink/55">
                {chosen.has(preview.photo.id) ? 'In the report' : 'Not in the report'}
              </span>
              <button type="button"
                onClick={() => setChosen((current) => {
                  const next = new Set(current);
                  if (next.has(preview.photo.id)) next.delete(preview.photo.id);
                  else next.add(preview.photo.id);
                  return next;
                })}
                className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] ${chosen.has(preview.photo.id) ? 'border border-line text-ink/70' : 'btn-brand'}`}>
                {chosen.has(preview.photo.id) ? 'Remove' : 'Include'}
              </button>
            </div>
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
