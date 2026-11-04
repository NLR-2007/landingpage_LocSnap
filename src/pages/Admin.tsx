import { useCallback, useEffect, useState } from 'react';
import AppAdsPanel from '../components/AppAdsPanel';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import { useAuth } from '../lib/auth-context';

type Row = {
  uid: string;
  email: string | null;
  displayName: string | null;
  plan: string;
  planTerm: string | null;
  active: boolean;
  lifetime: boolean;
  activatedAt: string | null;
  expiresAt: string | null;
  payments: number;
  paidPaise: number;
  lastPaymentAt: string | null;
  grantedBy: string | null;
  grantedAt: string | null;
  grantNote: string | null;
};

type Totals = {
  users: number;
  proActive: number;
  proExpired: number;
  lifetime: number;
  renewed: number;
  free: number;
  payments: number;
  paidPaise: number;
};

type Overview = { totals: Totals; users: Row[]; generatedAt: string };

function fmt(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

/** Amounts are held in paise, because money kept in decimals eventually rounds wrong. */
function rupees(paise: number): string {
  return `₹${((paise ?? 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

const TILES: { key: keyof Totals; label: string; money?: boolean }[] = [
  { key: 'users', label: 'Total users' },
  { key: 'proActive', label: 'Pro — active' },
  { key: 'proExpired', label: 'Pro — expired' },
  { key: 'free', label: 'Free users' },
  { key: 'renewed', label: 'Renewed' },
  { key: 'lifetime', label: 'Lifetime Pro' },
  { key: 'payments', label: 'Payments' },
  { key: 'paidPaise', label: 'Total collected', money: true },
];

export default function Admin() {
  const { user, loading, getToken } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');
  const [target, setTarget] = useState<Row | null>(null);
  const [note, setNote] = useState('');
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setError('Sign in with an admin Google account to continue.');
      setState('error');
      return;
    }
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || `Request failed (${response.status}).`);
      // A 200 that is not the overview is still a failure. Under `vite dev` the
      // serverless function is served as source rather than run, which answers
      // 200 with JavaScript; without this the page set no data, rendered
      // nothing, and gave no clue why.
      if (!body || typeof body !== 'object' || !body.totals) {
        throw new Error(
          'The server did not return admin data. If this is localhost, the API '
          + 'functions do not run under `npm run dev` - use `vercel dev`, or the '
          + 'deployed site.'
        );
      }
      setData(body);
      setState('done');
    } catch (cause) {
      setError((cause as Error).message);
      setState('error');
    }
  }, [user, getToken]);

  useEffect(() => {
    if (loading) return;
    void load();
  }, [loading, load]);

  async function submitGrant(action: 'lifetime' | 'revoke') {
    if (!target) return;
    setWorking(true);
    setNotice(null);
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/grant', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: target.uid, action, note }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || `Request failed (${response.status}).`);
      setNotice(
        action === 'lifetime'
          ? `Lifetime Pro granted to ${target.email || target.uid}.`
          : `Pro withdrawn from ${target.email || target.uid}.`
      );
      setTarget(null);
      setNote('');
      await load();
    } catch (cause) {
      setNotice((cause as Error).message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <PageShell title="Admin" eyebrow="Geo Snap Pro" wide>
      <Seo title="Admin - Geo Snap - NLR" description="Geo Snap Pro admin." noindex />

      {state === 'loading' && <p role="status" className="mt-8 text-sm text-ink/70">Loading…</p>}

      {state === 'error' && (
        <div className="mt-8 max-w-lg">
          <p role="alert" className="rounded-2xl border border-[#B3261E]/25 bg-[#B3261E]/[0.06] px-5 py-4 text-sm text-[#B3261E]">{error}</p>
          {!user && (
            <Link to="/login" className="btn-brand mt-5 inline-block rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em]">Sign in</Link>
          )}
        </div>
      )}

      {notice && (
        <p role="status" className="mt-6 rounded-2xl border border-green/25 bg-green/[0.07] px-5 py-3 text-sm text-ink/80">{notice}</p>
      )}

      {state === 'done' && data && (
        <>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {TILES.map((tile) => (
              <div key={tile.key} className="rounded-2xl border border-line bg-card p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink/55">{tile.label}</p>
                <p className="mt-2 font-display text-4xl font-semibold text-ink">
                  {tile.money ? rupees(data.totals[tile.key]) : data.totals[tile.key]}
                </p>
              </div>
            ))}
          </div>

          <h2 className="font-display mt-12 text-xl font-medium tracking-tight text-ink sm:text-2xl">Members</h2>
          <p className="mt-2 text-sm text-ink/60">
            {data.users.length} record{data.users.length === 1 ? '' : 's'} · as of {fmt(data.generatedAt)}
          </p>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-cream/70 text-[10px] uppercase tracking-[0.14em] text-ink/55">
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Activated</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                  <th className="px-4 py-3 font-medium">Payments</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {data.users.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-ink/55">No records yet.</td></tr>
                )}
                {data.users.map((row) => (
                  <tr key={row.uid} className="border-t border-line align-top">
                    <td className="px-4 py-3">
                      <span className="block text-ink">{row.email || row.uid}</span>
                      {row.displayName && <span className="block text-xs text-ink/55">{row.displayName}</span>}
                      {row.grantedBy && (
                        <span className="mt-1 block text-[11px] text-ink/45">
                          granted by {row.grantedBy}{row.grantNote ? ` · ${row.grantNote}` : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink/80">
                      {row.plan === 'pro' ? `Pro${row.planTerm ? ` · ${row.planTerm}` : ''}` : 'Free'}
                    </td>
                    <td className="px-4 py-3 text-ink/70">{fmt(row.activatedAt)}</td>
                    <td className="px-4 py-3 text-ink/70">{row.lifetime ? 'Never' : fmt(row.expiresAt)}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {row.payments > 0 ? (
                        <>
                          <span className="block">{row.payments} · {rupees(row.paidPaise)}</span>
                          {row.payments > 1 && <span className="text-[11px] font-medium text-green">renewed</span>}
                        </>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${row.lifetime ? 'bg-blue-600/15 text-blue-700' : row.active ? 'bg-green/15 text-green' : row.plan === 'pro' ? 'bg-[#B3261E]/10 text-[#B3261E]' : 'bg-line text-ink/60'}`}>
                        {row.lifetime ? 'Lifetime' : row.active ? 'Active' : row.plan === 'pro' ? 'Expired' : 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => { setTarget(row); setNote(''); setNotice(null); }}
                        className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink/70 transition hover:border-green/40 hover:text-ink"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AppAdsPanel getToken={getToken} />
        </>
      )}

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6">
            <h3 className="font-display text-lg font-medium text-ink">{target.email || target.uid}</h3>
            <p className="mt-1 text-xs text-ink/50">{target.uid}</p>
            <p className="mt-4 text-sm text-ink/70">
              Lifetime Pro takes effect the next time the app checks this account. Withdrawing it
              sets the plan back to free; a real payment can still be applied afterwards.
            </p>

            <label htmlFor="grant-note" className="mt-5 block text-[10px] font-medium uppercase tracking-[0.18em] text-ink/55">
              Reason
            </label>
            <input
              id="grant-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Why is this being granted?"
              className="mt-2 w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-green/50"
            />
            <p className="mt-1 text-[11px] text-ink/45">Recorded with your address against the grant.</p>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={working}
                onClick={() => { setTarget(null); setNote(''); }}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink/60"
              >
                Cancel
              </button>
              {target.plan === 'pro' && (
                <button
                  type="button"
                  disabled={working}
                  onClick={() => void submitGrant('revoke')}
                  className="rounded-full border border-[#B3261E]/30 px-4 py-2 text-sm font-medium text-[#B3261E] disabled:opacity-50"
                >
                  {working ? 'Working…' : 'Withdraw Pro'}
                </button>
              )}
              <button
                type="button"
                disabled={working}
                onClick={() => void submitGrant('lifetime')}
                className="btn-brand rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {working ? 'Working…' : 'Grant lifetime Pro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
