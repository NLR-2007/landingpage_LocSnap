import { useEffect, useState } from 'react';
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
  startedAt: string | null;
  expiresAt: string | null;
  lastPaymentId: string | null;
  active: boolean;
};

type Overview = {
  totals: { users: number; proActive: number; proExpired: number; free: number };
  users: Row[];
  generatedAt: string;
};

function fmt(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

const TILES: { key: keyof Overview['totals']; label: string }[] = [
  { key: 'users', label: 'Total users' },
  { key: 'proActive', label: 'Pro — active' },
  { key: 'proExpired', label: 'Pro — expired' },
  { key: 'free', label: 'Free users' },
];

export default function Admin() {
  const { user, loading, getToken } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    if (loading) return;
    let active = true;
    (async () => {
      if (!user) {
        if (active) { setError('Sign in with an admin Google account to continue.'); setState('error'); }
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
        if (active) { setData(body); setState('done'); }
      } catch (cause) {
        if (active) { setError((cause as Error).message); setState('error'); }
      }
    })();
    return () => { active = false; };
  }, [loading, user, getToken]);

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

      {state === 'done' && data && (
        <>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {TILES.map((tile) => (
              <div key={tile.key} className="rounded-2xl border border-line bg-card p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink/55">{tile.label}</p>
                <p className="mt-2 font-display text-4xl font-semibold text-ink">{data.totals[tile.key]}</p>
              </div>
            ))}
          </div>

          <h2 className="font-display mt-12 text-xl font-medium tracking-tight text-ink sm:text-2xl">Pro members</h2>
          <p className="mt-2 text-sm text-ink/60">{data.users.length} record{data.users.length === 1 ? '' : 's'} · as of {fmt(data.generatedAt)}</p>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-cream/70 text-[10px] uppercase tracking-[0.14em] text-ink/55">
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.users.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-ink/55">No Pro purchases yet.</td></tr>
                )}
                {data.users.map((row) => (
                  <tr key={row.uid} className="border-t border-line">
                    <td className="px-4 py-3">
                      <span className="block text-ink">{row.email || row.uid}</span>
                      {row.displayName && <span className="block text-xs text-ink/55">{row.displayName}</span>}
                    </td>
                    <td className="px-4 py-3 text-ink/80">{row.plan === 'pro' ? `Pro${row.planTerm ? ` · ${row.planTerm}` : ''}` : 'Free'}</td>
                    <td className="px-4 py-3 text-ink/70">{fmt(row.startedAt)}</td>
                    <td className="px-4 py-3 text-ink/70">{fmt(row.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${row.active ? 'bg-green/15 text-green' : row.plan === 'pro' ? 'bg-[#B3261E]/10 text-[#B3261E]' : 'bg-line text-ink/60'}`}>
                        {row.active ? 'Active' : row.plan === 'pro' ? 'Expired' : 'Free'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageShell>
  );
}
