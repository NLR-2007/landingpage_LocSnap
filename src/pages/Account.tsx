import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import { Button } from '../components/ui/button';
import { useAuth } from '../lib/auth-context';

export default function Account() {
  const { user, loading, error, isPro, plan, refresh, signOut } = useAuth();
  const expiry = plan?.planExpiresAt
    ? new Date(plan.planExpiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    setActionError(null);
    try { await signOut(); }
    catch (cause) { setActionError((cause as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <PageShell title="My Account" eyebrow="Geo Snap - NLR" wide>
      <Seo title="My Account - Geo Snap - NLR" description="Your Geo Snap account." noindex />
      {loading ? <p role="status" className="mt-8 text-sm text-ink/70">Checking your session…</p> : user ? (
        <div className="mt-10 max-w-2xl overflow-hidden rounded-2xl border border-line bg-card">
          <div className="flex flex-wrap items-center gap-5 p-7 sm:p-9">
            {user.picture ? <img src={user.picture} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green/10 text-2xl text-green">{(user.name || user.email)[0].toUpperCase()}</div>}
            <div className="min-w-0">
              <h2 className="font-display text-xl font-medium text-ink">{user.name || 'Google account'}</h2>
              <p className="mt-1 break-all text-sm text-ink/70">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-line bg-cream/60 px-7 py-6 sm:px-9">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-lg font-medium text-ink">Geo Snap Pro</h3>
              <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${isPro ? 'bg-green text-white' : 'bg-line text-ink/70'}`}>
                {isPro ? 'Active' : 'Free'}
              </span>
            </div>
            {isPro ? (
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                Your Pro plan{plan?.planTerm ? ` (${plan.planTerm})` : ''} is active{expiry ? <> until <strong>{expiry}</strong></> : ''}. It also unlocks in the app on this Google account. Nothing renews automatically.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                You are on the Free plan. Upgrade to Pro for unlimited clicks, collages, folders and Drive links, and your own logo on every photo.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Link to="/plans" className="text-sm font-medium text-green underline underline-offset-4">{isPro ? 'Extend or view plans' : 'Get Pro'}</Link>
              <button type="button" onClick={() => void refresh()} className="text-sm text-ink/60 underline underline-offset-4 hover:text-ink">Refresh status</button>
            </div>
          </div>
          <div className="border-t border-line p-7 sm:p-9">
            {actionError && <p role="alert" className="mb-4 text-sm text-[#B3261E]">{actionError}</p>}
            <Button variant="outline" onClick={() => void logout()} disabled={busy} className="h-11 rounded-full border-ink/15 px-6 text-[11px] font-semibold uppercase tracking-[0.16em]">
              <LogOut size={14} className="mr-2" /> {busy ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 max-w-md">
          <p className="text-sm leading-relaxed text-ink/80">{error || 'Sign in to view your account.'}</p>
          {error && <Button variant="outline" onClick={() => void refresh()} className="mt-5 rounded-full">Try again</Button>}
          <Link to="/login" className="btn-brand mt-6 inline-block rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em]">Sign in</Link>
        </div>
      )}
    </PageShell>
  );
}
