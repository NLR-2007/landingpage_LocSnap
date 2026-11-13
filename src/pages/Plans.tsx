/* ==========================================================================
   Plans.
   --------------------------------------------------------------------------
   The page now sells something, so it says exactly what is bought: thirty
   days, no subscription, nothing stored. The price is NOT written here in a
   way the checkout trusts — the button sends a product code and FeeFlo
   decides what that costs. A page that could name its own price would be a
   page worth tampering with.
   ========================================================================== */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Minus } from 'lucide-react';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import { Button } from '../components/ui/button';
import { APP_NAME, CONTACT_EMAIL } from '../data/locsnap';
import { useAuth } from '../lib/auth-context';
import { createPayment, feefloReady } from '../lib/feeflo';

/* The free allowances, as the app actually enforces them.

   These said 15 clicks, 3 collages, 3 folders and 3 Drive links - numbers the
   app stopped using some releases ago. A plans page that overstates the free
   tier is not a harmless typo: somebody chooses the app on it and meets a
   limit they were told they would not. Kept in step with ProAccess.kt. */
const FREE_POINTS = [
  '10 clicks every 8 hours',
  '1 collage every 8 hours',
  '1 folder',
  '1 Drive link connection',
  'No ads',
];
/* Drawbacks of the free tier, listed against a minus rather than a tick.

   The watermark used to be here. It is on every photo now, paid or not, so it
   is no longer something Free puts up with - it is how anybody receiving a
   photo can tell it came from Geo Snap and not from a camera that will write
   whatever it is told. Selling its removal would have been selling away the
   reason the photograph is worth anything to the person being shown it. */
const FREE_LIMITS: string[] = [];

/* Whether anything is actually for sale, decided in the admin panel.

   This was a constant edited by hand, which meant the switch in the admin
   panel moved the Android app and left this page behind: phones would begin
   applying allowances while the website still said Pro was coming later, and
   the one place a customer goes to pay would refuse to take their money.

   It now reads the same `allFree` flag from the same /api/app-ads document
   the app reads, so the two cannot disagree. One switch, both surfaces.

   Until the answer arrives - and if the request fails - the page stays shut.
   Showing a checkout that turns out to be closed is worse than briefly
   understating what is on offer, and a failed health check is no reason to
   start asking people for money. */
function useSelling(): boolean {
  const [selling, setSelling] = useState(false);
  useEffect(() => {
    let live = true;
    fetch('/api/app-ads')
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (live && body) setSelling(body.allFree === false);
      })
      .catch(() => {
        /* Leave it closed. */
      });
    return () => {
      live = false;
    };
  }, []);
  return selling;
}

const PRO_POINTS = [
  'Unlimited clicks',
  'Unlimited collages',
  'Unlimited folders',
  'Unlimited Drive link connections',
  // Creating one. Joining somebody else's is free on every plan, and the
  // wording has to make that clear: a teacher's whole class would otherwise
  // believe they each need to pay.
  'Run collections for a class or team',
  'Documentation export',
  // Your own mark beside the Geo Snap one, never instead of it.
  'Your logo on every photo',
  // True of every plan, and charged for on none of them.
  'No ads',
];

export default function Plans() {
  const selling = useSelling();
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(productCode: string) {
    setError(null);
    if (!user) {
      navigate('/login?next=plans');
      return;
    }
    setBusy(productCode);
    try {
      const token = await getToken();
      if (!token) throw new Error('Please sign in again to continue.');
      const { checkoutUrl } = await createPayment(token, productCode);
      // Hand the customer to FeeFlo's hosted checkout.
      window.location.assign(checkoutUrl);
    } catch (cause) {
      setError((cause as Error).message || 'Could not start checkout. Please try again.');
      setBusy(null);
    }
  }

  return (
    <PageShell title="Plans" eyebrow="Simple and honest" wide>
      <Seo
        title="Geo Snap - NLR Plans"
        description="Every Geo Snap feature is free right now. Pro is coming later at ₹49 per 30 days or ₹499 per year."
      />

      <p className="mt-7 max-w-3xl text-sm font-normal leading-relaxed text-ink/85 sm:text-base">
        {selling
          ? 'Start free and move to Pro when the limits get in the way. Pay ₹49 for 30 days or '
            + '₹499 for one year. Both are one-time payments; nothing renews automatically.'
          : 'Every feature is free right now - no limits, nothing to pay, nothing to sign up '
            + 'for. Pro is coming later, and these are the prices it will have. Anything you '
            + 'capture in the meantime stays yours either way.'}
      </p>

      {error && (
        <div role="alert" className="mt-8 rounded-2xl border border-[#B3261E]/25 bg-[#B3261E]/[0.06] p-5 text-sm leading-relaxed text-[#B3261E]">
          {error}
        </div>
      )}
      {selling && !feefloReady && (
        <div role="status" className="mt-8 rounded-2xl border border-green/30 bg-green/[0.07] p-5 text-sm leading-relaxed text-ink">
          Checkout is not configured in this environment yet. Prices and features are shown for reference.
        </div>
      )}

      {/* ================================================================
          The plans
      ================================================================ */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {/* --- Free --------------------------------------------------- */}
        <article className="flex flex-col rounded-2xl border border-line bg-card p-7 sm:p-9">
          <h2 className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
            Free
          </h2>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-display text-5xl font-medium tracking-tight text-ink">₹0</span>
            <span className="text-sm text-ink/60">forever</span>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-ink/80">
            Everything you need to try {APP_NAME}. No account required — the camera works on your
            device without signing in.
          </p>

          <ul className="mt-7 space-y-3">
            {FREE_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-ink/85">
                <Check size={16} className="mt-0.5 shrink-0 text-green" />
                {point}
              </li>
            ))}
            {FREE_LIMITS.map((limit) => (
              <li key={limit} className="flex items-start gap-3 text-sm text-ink/55">
                <Minus size={16} className="mt-0.5 shrink-0 text-ink/40" />
                {limit}
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-8">
            <Link to="/download">
              <Button
                variant="outline"
                className="h-11 w-full rounded-full border-ink/15 text-[11px] font-semibold uppercase tracking-[0.16em]"
              >
                Download the app
              </Button>
            </Link>
          </div>
        </article>

        {/* --- Pro ---------------------------------------------------- */}
        <article className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-green bg-green/[0.05] p-7 sm:p-9">
          <span className="absolute right-7 top-7 rounded-full bg-green px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:right-9 sm:top-9">
            Recommended
          </span>

          <h2 className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
            Pro
          </h2>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-display text-5xl font-medium tracking-tight text-ink">₹49</span>
            <span className="text-sm text-ink/60">for 30 days</span>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-ink/80">
            For field work that does not stop at one folder or ten shots. Pay once, use it
            for a month, pay again only if you want to.
          </p>

          <ul className="mt-7 space-y-3">
            {PRO_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-ink/85">
                <Check size={16} className="mt-0.5 shrink-0 text-green" />
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-8">
            {selling ? (
              <Button
                onClick={() => void buy('LOCSNAP_PRO_MONTHLY')}
                disabled={busy !== null || !feefloReady}
                className="btn-brand h-12 w-full rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] disabled:opacity-70"
              >
                {busy === 'LOCSNAP_PRO_MONTHLY' ? 'Starting checkout…' : user ? 'Get Pro' : 'Sign in to get Pro'}
              </Button>
            ) : (
              <div className="flex h-12 w-full items-center justify-center rounded-full border border-line text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/55">
                Coming soon
              </div>
            )}
            <p className="mt-3 text-center text-xs leading-relaxed text-ink/55">
              {selling
                ? 'Secure UPI payment via FeeFlo. The exact amount is shown on the checkout page.'
                : 'Free to use in full until this opens.'}
            </p>
          </div>
        </article>
        <article className="flex flex-col rounded-2xl border border-line bg-card p-7 sm:p-9">
          <h2 className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">Pro yearly</h2>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-display text-5xl font-medium tracking-tight text-ink">₹499</span>
            <span className="text-sm text-ink/60">for 365 days</span>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-ink/80">
            The same Pro features for a full year. Pay once and keep using Pro for 365 days.
          </p>
          <ul className="mt-7 space-y-3">
            {PRO_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-ink/85">
                <Check size={16} className="mt-0.5 shrink-0 text-green" />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-8">
            {selling ? (
              <Button
                onClick={() => void buy('LOCSNAP_PRO_YEARLY')}
                disabled={busy !== null || !feefloReady}
                className="btn-brand h-12 w-full rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] disabled:opacity-70"
              >
                {busy === 'LOCSNAP_PRO_YEARLY' ? 'Starting checkout…' : user ? 'Get Pro yearly' : 'Sign in to get Pro'}
              </Button>
            ) : (
              <div className="flex h-12 w-full items-center justify-center rounded-full border border-line text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/55">
                Coming soon
              </div>
            )}
            <p className="mt-3 text-center text-xs leading-relaxed text-ink/55">
              {selling
                ? 'Secure UPI payment via FeeFlo. The exact amount is shown on the checkout page.'
                : 'Free to use in full until this opens.'}
            </p>
          </div>
        </article>
      </div>

      {/* ================================================================
          How paying works — the part people are nervous about
      ================================================================ */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
          How Pro payments will work
        </h2>
        <div className="mt-7 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Pay by UPI',
              body: 'When checkout resumes, scan a QR or open your UPI app. The gateway will set the amount.',
            },
            {
              step: '2',
              title: 'The bank confirms it',
              body: 'Pro will unlock only when a verified bank credit is matched to your payment and Google account.',
            },
            {
              step: '3',
              title: 'Your Pro period starts',
              body: 'Your account will show the exact expiry date. Nothing will renew on its own.',
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-line bg-card p-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green/10 text-sm font-semibold text-green">
                {item.step}
              </span>
              <h3 className="mt-4 font-display text-base font-medium text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-12 text-sm leading-relaxed text-ink/65">
        Questions about billing, or a payment that did not unlock?{' '}
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${APP_NAME} billing`)}`}
          className="underline underline-offset-4 hover:text-ink"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
    </PageShell>
  );
}
