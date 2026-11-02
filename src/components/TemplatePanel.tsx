/* Choosing and wiring up a college's own Word template.

   Two routes, picked by what the uploaded file turns out to contain rather
   than by asking the user which one they want - they have no way of knowing.

   Plan A: the template has {{markers}}. Nothing to configure; we show what we
   found and what we could not place.

   Plan B: it has none, which is the common case, because the document was
   approved years ago and nobody will reopen it to add braces. We list its
   paragraphs and ask what each line is. Only the lines the user names are
   touched; everything else in the document stays exactly as it was. */
import { useRef } from 'react';
import {
  MARKERS, slotFor, type Slot, type TemplateDoc,
} from '../lib/docx-template';

type Props = {
  doc: TemplateDoc | null;
  mapping: Record<number, Slot[]>;
  busy: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
  onMapping: (mapping: Record<number, Slot[]>) => void;
};

export default function TemplatePanel({ doc, mapping, busy, onUpload, onClear, onMapping }: Props) {
  const input = useRef<HTMLInputElement>(null);

  if (!doc) {
    return (
      <div className="mt-3 rounded-2xl border border-dashed border-line p-5">
        <p className="text-sm text-ink/70">
          Upload the Word file your institution already files - letterhead, margins, fonts and all.
          The report is written into that document; nothing else in it is changed.
        </p>
        <button type="button" disabled={busy} onClick={() => input.current?.click()}
          className="btn-brand mt-4 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] disabled:opacity-50">
          Choose a .docx
        </button>
        <input ref={input} type="file" accept=".docx" className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.target.value = '';
          }} />
        <MarkerReference />
      </div>
    );
  }

  const planA = doc.markers.length > 0;

  return (
    <div className="mt-3 rounded-2xl border border-line p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{doc.name}</p>
          <p className="mt-0.5 text-xs text-ink/55">
            {doc.paragraphs.length} paragraph(s) ·{' '}
            {planA
              ? `${doc.markers.length} marker(s) found - nothing to set up`
              : 'no markers - tell us what each line is below'}
          </p>
        </div>
        <button type="button" onClick={onClear} className="shrink-0 text-xs font-medium text-ink/55">
          Remove
        </button>
      </div>

      {planA && (
        <>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {doc.markers.map((marker) => (
              <span key={marker} className="rounded-full bg-green/10 px-2.5 py-1 text-[11px] font-medium text-green">
                {`{{${marker}}}`}
              </span>
            ))}
          </div>
          {doc.unknownMarkers.length > 0 && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Not recognised, so left exactly as written:{' '}
              {doc.unknownMarkers.map((marker) => `{{${marker}}}`).join(', ')}. Check the spelling
              against the list below.
            </p>
          )}
        </>
      )}

      {!planA && (
        <div className="mt-4 max-h-80 space-y-1 overflow-y-auto rounded-xl border border-line p-2">
          {doc.paragraphs.filter((paragraph) => paragraph.text.trim()).map((paragraph) => {
            const chosen = mapping[paragraph.index]?.[0];
            const value = chosen
              ? MARKERS.find((entry) => sameSlot(entry.slot, chosen))?.marker ?? ''
              : '';
            return (
              <div key={paragraph.index} className="flex items-center gap-2">
                <span className="flex-1 truncate text-xs text-ink/70" title={paragraph.text}>
                  {paragraph.text.trim().slice(0, 90)}
                </span>
                <select value={value}
                  onChange={(event) => {
                    const next = { ...mapping };
                    const slot = slotFor(event.target.value);
                    if (slot) next[paragraph.index] = [slot];
                    else delete next[paragraph.index];
                    onMapping(next);
                  }}
                  className={`w-44 shrink-0 rounded-lg border px-2 py-1 text-[11px] ${value ? 'border-green text-ink' : 'border-line text-ink/50'}`}>
                  <option value="">leave as it is</option>
                  {MARKERS.map((entry) => (
                    <option key={entry.marker} value={entry.marker}>{entry.help}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-ink/50">
        {planA
          ? 'Each marker is replaced where it stands; the words around it are kept.'
          : 'A named line is replaced by its value. "The photographs" and "The particulars list" are inserted at that point instead, and the line itself removed.'}
        {' '}The template is held in this tab only - upload it again after a reload.
      </p>
      {!planA && <MarkerReference />}
    </div>
  );
}

function sameSlot(a: Slot, b: Slot): boolean {
  if (a.kind !== b.kind) return false;
  return a.kind !== 'field' || b.kind !== 'field' || a.field === b.field;
}

/** So a college can paste the markers into its own document once and be done. */
function MarkerReference() {
  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-xs font-medium text-green">
        Markers you can put in a template
      </summary>
      <p className="mt-2 text-[11px] leading-relaxed text-ink/55">
        Type these anywhere in your Word file - in a table cell, a heading, mid-sentence. Any that
        are absent are simply not filled.
      </p>
      <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-line">
        {MARKERS.map((entry) => (
          <div key={entry.marker} className="flex gap-3 border-b border-line/60 px-3 py-1.5 last:border-0">
            <code className="w-40 shrink-0 text-[11px] text-green">{`{{${entry.marker}}}`}</code>
            <span className="text-[11px] text-ink/60">{entry.help}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
