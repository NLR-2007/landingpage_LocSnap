import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import { APP_NAME, CONTACT_EMAIL, DEVELOPER } from '../data/locsnap';

/**
 * When the Play Store listing goes live, set PLAY_STORE_URL to the real link.
 * The button below switches from the disabled "Launching Soon" state automatically.
 */
const PLAY_STORE_URL: string | null = null;

export default function Download() {
  return (
    <PageShell title="Launching Soon" eyebrow={`Get ${APP_NAME}`} wide>
      <Seo
        title="Download Geo Snap - NLR - Launching Soon on Android"
        description="Geo Snap - NLR is launching soon on Android. The Google Play listing is not published yet; this page will carry the download link as soon as it goes live."
      />
      <p className="mt-7 max-w-3xl text-sm font-normal leading-relaxed text-ink/80 sm:text-base">
        {APP_NAME} is being prepared for release on Android. The Play Store listing is not published
        yet, so there is no download link to give you today. This page will carry the real link as
        soon as it is live.
      </p>

      <div className="mt-12">
        {PLAY_STORE_URL ? (
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="liquid-glass inline-block rounded-full px-8 py-4 text-xs font-light uppercase tracking-[0.2em] text-ink/80"
          >
            Get it on Google Play
          </a>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="liquid-glass cursor-not-allowed rounded-full px-8 py-4 text-xs font-light uppercase tracking-[0.2em] text-ink/55"
          >
            Launching Soon
          </button>
        )}
      </div>

      <div className="mt-16 max-w-3xl border-t border-line pt-10">
        <h2 className="text-xs font-light uppercase tracking-[0.2em] text-ink/80">
          Want to know when it launches?
        </h2>
        <p className="mt-4 text-sm font-normal leading-relaxed text-ink/70">
          There is no mailing list yet. Email{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="break-all text-ink/80 underline underline-offset-4 hover:text-ink"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          and {DEVELOPER} will let you know when {APP_NAME} is available.
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
