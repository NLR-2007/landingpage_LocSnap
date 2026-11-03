/* The promo slides the Android app shows on its home screen.

   Up to five, pictures or video, played inside the app. Saving here changes
   what every phone shows the next time it opens the app - there is no release
   to ship and nothing for anyone to update.

   Files are uploaded to Firebase Storage and their download links pasted in.
   The endpoint refuses a link we do not host, so a mistyped address cannot
   point the app at somebody else's server. */
import { useCallback, useEffect, useState } from 'react';

type Slide = {
  type: 'image' | 'video';
  url: string;
  poster: string | null;
  description: string;
};

const EMPTY: Slide = { type: 'image', url: '', poster: null, description: '' };
const MAX = 5;

export default function AppAdsPanel({ getToken }: { getToken: () => Promise<string | null> }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/app-ads', { cache: 'no-store' });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || `Request failed (${response.status}).`);
      setSlides(Array.isArray(body?.slides) ? body.slides : []);
      setState('ready');
    } catch (cause) {
      setMessage((cause as Error).message);
      setState('error');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Sign in with an admin Google account to continue.');
      const response = await fetch('/api/app-ads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: slides.filter((slide) => slide.url.trim()) }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || `Save failed (${response.status}).`);
      setSlides(body.slides ?? []);
      setMessage(
        `Saved. ${(body.slides ?? []).length} slide(s) are live - phones pick them up `
        + 'within about five minutes of opening the app.'
      );
    } catch (cause) {
      setMessage((cause as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function edit(index: number, change: Partial<Slide>) {
    setSlides((current) => current.map((slide, at) => (at === index ? { ...slide, ...change } : slide)));
  }

  function move(index: number, by: number) {
    const to = index + by;
    if (to < 0 || to >= slides.length) return;
    setSlides((current) => {
      const next = [...current];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
        App home promo
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">
        Up to {MAX} slides on the app's home screen, shown in this order, five seconds each,
        running forward and then back again. Video plays inside the app and starts muted.
        Upload the file to Firebase Storage and paste its download link - links we do not host
        are refused.
      </p>

      {state === 'loading' && <p className="mt-6 text-sm text-ink/60">Loading the campaign…</p>}

      {state !== 'loading' && (
        <>
          <div className="mt-6 space-y-4">
            {slides.map((slide, index) => (
              <div key={index} className="rounded-2xl border border-line p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-ink/55">Slide {index + 1}</span>
                  <div className="flex overflow-hidden rounded-full border border-line">
                    {(['image', 'video'] as const).map((kind) => (
                      <button key={kind} type="button"
                        onClick={() => edit(index, { type: kind })}
                        className={`px-3 py-1 text-xs ${slide.type === kind ? 'btn-brand' : 'text-ink/60'}`}>
                        {kind === 'image' ? 'Picture' : 'Video'}
                      </button>
                    ))}
                  </div>
                  <span className="flex-1" />
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0}
                    className="rounded-full border border-line px-2.5 py-1 text-xs text-ink/60 disabled:opacity-40">↑</button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === slides.length - 1}
                    className="rounded-full border border-line px-2.5 py-1 text-xs text-ink/60 disabled:opacity-40">↓</button>
                  <button type="button"
                    onClick={() => setSlides((current) => current.filter((_, at) => at !== index))}
                    className="rounded-full border border-line px-3 py-1 text-xs font-medium text-[#B3261E]">
                    Remove
                  </button>
                </div>

                <label className="mt-3 block text-[11px] font-medium uppercase tracking-[0.12em] text-ink/50">
                  {slide.type === 'video' ? 'Video link' : 'Picture link'}
                </label>
                <input value={slide.url} onChange={(event) => edit(index, { url: event.target.value })}
                  placeholder="https://firebasestorage.googleapis.com/…"
                  className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink" />

                {slide.type === 'video' && (
                  <>
                    <label className="mt-3 block text-[11px] font-medium uppercase tracking-[0.12em] text-ink/50">
                      Still picture
                    </label>
                    <input value={slide.poster ?? ''}
                      onChange={(event) => edit(index, { poster: event.target.value || null })}
                      placeholder="https://firebasestorage.googleapis.com/… (shown while the video loads)"
                      className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink" />
                  </>
                )}

                <label className="mt-3 block text-[11px] font-medium uppercase tracking-[0.12em] text-ink/50">
                  Description
                </label>
                <input value={slide.description}
                  onChange={(event) => edit(index, { description: event.target.value })}
                  placeholder="Read aloud by a screen reader"
                  className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink" />

                {slide.url.trim() && slide.type === 'image' && (
                  <img src={slide.url} alt="" className="mt-3 max-h-40 rounded-xl border border-line" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" disabled={slides.length >= MAX}
              onClick={() => setSlides((current) => [...current, { ...EMPTY }])}
              className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink/75 disabled:opacity-40">
              + Add a slide
            </button>
            <button type="button" onClick={() => void save()} disabled={saving}
              className="btn-brand rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-[0.15em] disabled:opacity-50">
              {saving ? 'Saving…' : 'Publish to the app'}
            </button>
            {slides.length === 0 && (
              <span className="text-xs text-ink/55">
                With no slides the app falls back to the picture built into it.
              </span>
            )}
          </div>

          {message && <p className="mt-4 text-sm text-ink/70">{message}</p>}
        </>
      )}
    </section>
  );
}
