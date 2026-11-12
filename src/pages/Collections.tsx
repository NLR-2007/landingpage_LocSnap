/* Collections, for the person running one.

   A teacher makes a folder here, sets when it closes, and gets a code to read
   out. Students enter that code in the app and their photographs arrive in
   this folder, owned by the teacher, without any student ever being given
   access to the folder itself.

   That is worth spelling out on the page, because it is the part people
   assume works the usual way and it does not: there is no share link to
   forward, no student who can delete another's work, and when the collection
   closes there is no second route still open.

   What has been submitted is read from Drive each time rather than kept here.
   Drive is holding the files, so it already knows what arrived and who owns
   each one - and a second copy would eventually disagree with it, during a
   deadline, with no way to tell which was lying. */
import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, FolderOpen, Loader2, Plus, RefreshCw, X } from 'lucide-react';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import { useAuth } from '../lib/auth-context';

type Collection = {
  code: string;
  name: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
  closed: boolean;
  folderUrl: string;
};

type Person = { email: string; name: string | null; count: number; latest: string | null };
type Joined = { email: string; name: string | null; joinedAt: string; submitted: number };
type Detail = Collection & { total: number; people: Person[]; joined: Joined[] };

function when(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

/** Two weeks out, rounded to the hour - a sane default nobody has to think about. */
function defaultExpiry(): string {
  const date = new Date(Date.now() + 14 * 86_400_000);
  date.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function Collections() {
  const { user, loading: authLoading, signIn, getToken } = useAuth();

  const [ready, setReady] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [expiresAt, setExpiresAt] = useState(defaultExpiry);

  const call = useCallback(async (path: string, init?: RequestInit) => {
    const token = await getToken();
    if (!token) throw new Error('Sign in again.');
    const response = await fetch(path, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
        Authorization: `Bearer ${token}`
      }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'That did not work.');
    return body;
  }, [getToken]);

  const load = useCallback(async () => {
    try {
      const body = await call('/api/collections/mine');
      setDriveConnected(Boolean(body.driveConnected));
      setCollections(body.collections ?? []);
    } catch (cause) {
      setMessage((cause as Error).message);
    } finally {
      setReady(true);
    }
  }, [call]);

  useEffect(() => {
    if (!authLoading && user) void load();
    if (!authLoading && !user) setReady(true);
  }, [authLoading, user, load]);

  async function connectDrive() {
    setBusy(true);
    setMessage(null);
    try {
      const body = await call('/api/collections/connect');
      // A full navigation, not a popup: Google's consent screen refuses to be
      // framed, and a blocked popup is a dead end with nothing on screen.
      window.location.href = body.authorizeUrl;
    } catch (cause) {
      setMessage((cause as Error).message);
      setBusy(false);
    }
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const body = await call('/api/collections/create', {
        method: 'POST',
        body: JSON.stringify({ name, expiresAt: new Date(expiresAt).toISOString() })
      });
      setName('');
      setExpiresAt(defaultExpiry());
      setMessage(`Collection open. Read out the code: ${body.code}`);
      await load();
    } catch (cause) {
      setMessage((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function open(code: string) {
    setBusy(true);
    setMessage(null);
    try {
      setDetail(await call(`/api/collections/mine?code=${code}`));
    } catch (cause) {
      setMessage((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function setActive(code: string, active: boolean) {
    setBusy(true);
    try {
      await call('/api/collections/mine', {
        method: 'POST',
        body: JSON.stringify({ code, active })
      });
      setDetail(null);
      await load();
    } catch (cause) {
      setMessage((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function copy(code: string) {
    navigator.clipboard?.writeText(code)
      .then(() => {
        setCopied(code);
        window.setTimeout(() => setCopied(null), 1800);
      })
      .catch(() => setMessage(`Copy this code: ${code}`));
  }

  /* ------------------------------------------------------------- states --- */

  if (authLoading || !ready) {
    return (
      <PageShell title="Collections" center>
        <p className="flex items-center gap-2 text-sm text-ink/60">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </p>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell title="Collections" eyebrow="For teachers" center>
        <Seo title="Collections - Geo Snap - NLR" description="Collect stamped photos from a class into your own Google Drive." />
        <p className="text-sm leading-relaxed text-ink/70">
          Sign in to open a collection. Your students submit photographs from the app
          and they arrive in your Drive, owned by you.
        </p>
        <button type="button" onClick={() => void signIn()} className="btn-brand mt-6 rounded-full px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em]">
          Sign in with Google
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell title="Collections" eyebrow="For teachers" wide>
      <Seo title="Collections - Geo Snap - NLR" description="Collect stamped photos from a class into your own Google Drive." />

      <p className="max-w-2xl text-sm leading-relaxed text-ink/70">
        Give your class a code. Every photo they take in Geo Snap arrives in a folder in
        your Drive, owned by you — stamped with where and when it was taken. Students never
        get access to the folder, so nobody can see or delete anybody else&rsquo;s work, and
        when the collection closes there is no other way in.
      </p>

      {message && (
        <p className="mt-6 rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink/80">{message}</p>
      )}

      {!driveConnected ? (
        <section className="mt-8 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-display text-lg font-medium">Connect your Drive</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/65">
            Once, not for every class. Geo Snap only ever gets access to folders it creates
            for you — never to anything else in your Drive.
          </p>
          <button type="button" disabled={busy} onClick={() => void connectDrive()} className="btn-brand mt-5 inline-flex items-center gap-2 rounded-full px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <FolderOpen size={14} />}
            Connect Drive
          </button>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-display text-lg font-medium">New collection</h2>
          <form onSubmit={create} className="mt-4 flex flex-wrap items-end gap-4">
            <label className="min-w-[14rem] flex-1 text-[11px] font-medium uppercase tracking-[0.12em] text-ink/50">
              Name
              <input
                id="collection-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={80}
                placeholder="NAAC visit — Lab inspection"
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink/50">
              Closes
              <input
                id="collection-expiry"
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                required
                className="mt-1 block rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink"
              />
            </label>
            <button type="submit" disabled={busy} className="btn-brand inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] disabled:opacity-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create
            </button>
          </form>
        </section>
      )}

      {collections.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-medium">Your collections</h2>
          <ul className="mt-4 grid gap-3">
            {collections.map((item) => (
              <li key={item.code} className="rounded-2xl border border-line bg-card p-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-0.5 text-xs text-ink/55">
                      {item.closed ? 'Closed' : `Closes ${when(item.expiresAt)}`}
                    </p>
                  </div>

                  <button type="button" onClick={() => copy(item.code)} title="Copy the code" className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 font-mono text-sm tracking-[0.18em] text-ink">
                    {item.code}
                    {copied === item.code ? <Check size={13} className="text-green" /> : <Copy size={13} className="text-ink/40" />}
                  </button>

                  <button type="button" onClick={() => void open(item.code)} className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-ink/75">
                    Who submitted
                  </button>
                  <a href={item.folderUrl} target="_blank" rel="noreferrer" className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-ink/75">
                    Open folder
                  </a>
                  {!item.closed && (
                    <button type="button" onClick={() => void setActive(item.code, false)} className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-[#B3261E]">
                      Close now
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail && (
        <section className="mt-8 rounded-2xl border border-line bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-medium">{detail.name}</h2>
              <p className="mt-1 text-sm text-ink/60">
                {detail.total} photo{detail.total === 1 ? '' : 's'} from {detail.people.length} {detail.people.length === 1 ? 'person' : 'people'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => void open(detail.code)} title="Refresh" className="rounded-full border border-line p-2 text-ink/60">
                <RefreshCw size={14} />
              </button>
              <button type="button" onClick={() => setDetail(null)} title="Close" className="rounded-full border border-line p-2 text-ink/60">
                <X size={14} />
              </button>
            </div>
          </div>

          {detail.joined.length === 0 && detail.people.length === 0 ? (
            <p className="mt-5 text-sm text-ink/60">
              Nobody has joined yet. Read out the code <span className="font-mono tracking-[0.18em]">{detail.code}</span>.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {/* Everyone who joined, including those who have sent nothing -
                  the teacher's real question is usually who is missing. */}
              {detail.joined.map((person) => (
                <li key={person.email} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <span className="min-w-0 truncate">
                    {person.name || person.email}
                    {person.name && <span className="ml-2 text-xs text-ink/45">{person.email}</span>}
                  </span>
                  <span className={person.submitted ? 'font-medium text-green' : 'text-[#B3261E]'}>
                    {person.submitted ? `${person.submitted} submitted` : 'nothing yet'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </PageShell>
  );
}
