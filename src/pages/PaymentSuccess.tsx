import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import { CONTACT_EMAIL } from '../data/locsnap';
import { useAuth } from '../lib/auth-context';
import { claimPayment } from '../lib/feeflo';

type Phase = 'checking' | 'active' | 'pending' | 'error' | 'need-signin' | 'no-id';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const paymentId = params.get('payment') || params.get('session') || params.get('paymentId');
  const { user, loading, getToken, refresh } = useAuth();
  const [phase, setPhase] = useState<Phase>('checking');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (loading || started.current) return;
    if (!paymentId) { setPhase('no-id'); return; }
    if (!user) { setPhase('need-signin'); return; }
    started.current = true;

    let cancelled = false;
    (async () => {
      // A verified bank credit can take a short while; poll the claim a few times.
      for (let attempt = 0; attempt < 5 && !cancelled; attempt += 1) {
        try {
          const token = await getToken();
          if (!token) { setPhase('need-signin'); return; }
          const result = await claimPayment(token, paymentId);
          if (result.active) {
            setExpiresAt(result.expiresAt);
            setPhase('active');
            void refresh();
            return;
          }
          setPhase('pending');
        } catch (cause) {
          const text = (cause as Error).message || '';
          // "Not verified yet" is not a failure — a late credit can still settle it.
          if (/verif/i.test(text) || /settle/i.test(text)) {
            setPhase('pending');
          } else {
            setMessage(text || 'We could not confirm this payment.');
            setPhase('error');
            return;
          }
        }
        if (attempt < 4 && !cancelled) await new Promise((r) => setTimeout(r, 3000));
      }
    })();

    return () => { cancelled = true; };
  }, [loading, user, paymentId, getToken, refresh]);

  return (
    <PageShell title="Payment status" eyebrow="Geo Snap Pro" center>
      <Seo title="Geo Snap Pro payment" description="Geo Snap Pro payment status." noindex />
      <div className="mx-auto mt-8 max-w-lg rounded-3xl border border-line bg-card p-7 text-center sm:p-10">
        {phase === 'checking' && (
          <>
            <h2 className="font-display text-2xl text-ink">Confirming your payment…</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">Checking the verified bank credit. This only takes a moment.</p>
          </>
        )}

        {phase === 'active' && (
          <>
            <h2 className="font-display text-2xl text-ink">Pro is active 🎉</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">
              Your Geo Snap Pro plan is active{expiresAt ? <> until <strong>{formatDate(expiresAt)}</strong></> : ''}. It also unlocks in the app on the same Google account.
            </p>
          </>
        )}

        {phase === 'pending' && (
          <>
            <h2 className="font-display text-2xl text-ink">Payment received — verifying</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">
              We have your payment but the bank credit has not been matched yet. Pro unlocks automatically once it is verified — you can safely close this page and check your account shortly.
            </p>
          </>
        )}

        {phase === 'error' && (
          <>
            <h2 className="font-display text-2xl text-ink">We could not confirm this payment here</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">{message}</p>
            <p className="mt-4 text-sm text-ink/75">If you have already paid, contact <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">{CONTACT_EMAIL}</a>.</p>
          </>
        )}

        {phase === 'need-signin' && (
          <>
            <h2 className="font-display text-2xl text-ink">Sign in to confirm your payment</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">Use the same Google account you paid with so we can apply Pro to it.</p>
            <Link to="/login" className="btn-brand mt-6 inline-block rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em]">Sign in</Link>
          </>
        )}

        {phase === 'no-id' && (
          <>
            <h2 className="font-display text-2xl text-ink">No payment to show</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">This page needs a payment reference from the checkout.</p>
          </>
        )}

        {paymentId && <p className="mt-6 break-all text-xs text-ink/55">Reference: {paymentId}</p>}
        <Link to="/my-plans" className="mt-7 inline-block text-sm font-medium text-green underline underline-offset-4">View my account</Link>
      </div>
    </PageShell>
  );
}
