import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import { PlayBadge } from '../components/PlayMark';
import { APP_NAME, CONTACT_EMAIL, DEVELOPER, PLAY_STORE_URL } from '../data/locsnap';

export default function Download() {
  return (
    <PageShell title="Download" eyebrow={`Get ${APP_NAME}`} wide>
      <Seo
        title="Download Geo Snap - NLR for Android on Google Play"
        description="Download Geo Snap - NLR free from Google Play. An offline-first GPS camera that stamps photos and video with location, address, coordinates, altitude and time."
      />
      <p className="mt-7 max-w-3xl text-sm font-normal leading-relaxed text-ink/80 sm:text-base">
        {APP_NAME} is live on Google Play. Install it on your Android phone and start capturing
        stamped photos and video straight away — there is no account to create and no sign-in
        before you take a shot.
      </p>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex transition hover:opacity-90"
          aria-label="Get it on Google Play"
        >
          <PlayBadge className="h-14 sm:h-16" />
        </a>
        <a
          href="/plans"
          className="liquid-glass inline-flex rounded-full px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink sm:text-sm"
        >
          See the plans
        </a>
      </div>

      <p className="mt-5 max-w-3xl text-sm font-normal leading-relaxed text-ink/70">
        The button opens the Google Play listing for {APP_NAME} in a new tab.
      </p>

      <div className="mt-16 max-w-3xl border-t border-line pt-10">
        <h2 className="text-xs font-light uppercase tracking-[0.2em] text-ink/80">
          Installing from the Play Store
        </h2>
        <p className="mt-4 text-sm font-normal leading-relaxed text-ink/70">
          Tap the button above on your Android phone, or open Google Play, search for{' '}
          <span className="text-ink/85">{APP_NAME}</span> and install it. If the button does not
          work on your device, email{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="break-all text-ink/80 underline underline-offset-4 hover:text-ink"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          and {DEVELOPER} will help you get set up.
        </p>
      </div>

      <div className="mt-14">
        <h2 className="text-xs font-light uppercase tracking-[0.2em] text-ink/80">
          What to expect
        </h2>
        <ul className="mt-4 grid gap-x-10 gap-y-2 sm:grid-cols-2">
          {[
            'Android 7.0 (API 24) and newer',
            'GPS-stamped photos and video with readable address, coordinates, altitude and time',
            'Smart folders, gallery, recycle bin and an encrypted private vault',
            'Live mini-map, collages and on-device ZIP or PDF export',
            'No account required and no Geo Snap - NLR cloud storage',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-sm font-normal leading-relaxed text-ink/65">
              <span aria-hidden="true" className="text-ink/40">
                —
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-sm font-normal leading-relaxed text-ink/55">
          {APP_NAME} is designed to keep advertising minimal and non-intrusive if advertising is
          introduced in future versions. The{' '}
          <Link to="/privacy" className="text-ink/70 underline underline-offset-4 hover:text-ink">
            Privacy Policy
          </Link>{' '}
          will be updated before any such functionality is enabled.
        </p>
      </div>
    </PageShell>
  );
}
