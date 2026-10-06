import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import { APP_NAME, AUDIENCES, DEVELOPER, FEATURES, SAMPLE_STAMP, TAGLINE } from '../data/locsnap';

const PROBLEMS: { title: string; body: string }[] = [
  {
    title: 'Photos lose their place',
    body: 'A normal camera photo tells you what was captured, but not where. Weeks later, a folder of field photos becomes a pile of images nobody can place on a map.',
  },
  {
    title: 'Coordinates alone are unreadable',
    body: 'Raw latitude and longitude buried in EXIF data mean nothing to the person reviewing the work. They need a place name and an address they can actually read.',
  },
  {
    title: 'Field work happens off the grid',
    body: 'Farms, construction sites, plots and remote inspections often have weak or no network coverage, exactly where location-tagged proof of work is needed most.',
  },
  {
    title: 'Organising afterwards never happens',
    body: 'Sorting hundreds of photos into the right site or visit after the fact is tedious, so it gets skipped and the record falls apart.',
  },
  {
    title: 'Cloud tools ask for too much',
    body: "Most photo tools want an account, an upload and a subscription before you can take a single picture, and your images end up on somebody else's servers.",
  },
];

const SOLUTIONS: { title: string; body: string }[] = [
  {
    title: 'Stamp it onto the photo or video',
    body: `${APP_NAME} burns the place name, full address, coordinates, altitude, compass heading, date and time directly onto each photo and video, so the context travels with the capture wherever it is shared.`,
  },
  {
    title: 'Readable location, exact coordinates',
    body: 'Every stamp pairs a human-readable address with precise coordinates, plus accuracy, altitude and compass direction, so both people and systems can use it — with a degradation ladder that keeps the stamp sensible when a field is missing.',
  },
  {
    title: 'Built to work on your device first',
    body: 'The core camera, GPS, organization and export functionality works locally on your device. Map tiles and reverse geocoding are optional enhancements — cached for places you return to — never prerequisites for taking a shot.',
  },
  {
    title: 'Organise before you shoot, not after',
    body: 'Pick a folder such as Farm Visit or Plot 12 once, and every capture afterwards is filed there automatically. A private vault and recycle bin keep sensitive and deleted items handled too.',
  },
  {
    title: 'Share it the way people expect',
    body: 'Turn a visit into a collage, or export the whole folder as a ZIP archive or a PDF document, all created on the device with no upload required.',
  },
  {
    title: 'No account, no cloud, no AI',
    body: `${APP_NAME} needs no login and provides no cloud photo storage of its own. Your photos and videos stay on your device and are not analysed by artificial intelligence.`,
  },
];

export default function About() {
  return (
    <PageShell title={`About ${APP_NAME}`} eyebrow={TAGLINE}>
      <Seo
        title="About Geo Snap - NLR - Offline GPS Camera by NLR GROUP OF COMPANIES"
        description="Why Geo Snap - NLR exists and how it works: GPS-stamped photos and video with readable addresses, coordinates and altitude, smart folders, a private vault, collages and on-device ZIP or PDF export."
      />
      <p className="mt-7 text-sm font-normal leading-relaxed text-ink/80 sm:text-base">
        {APP_NAME} is an offline-first GPS camera for Android, built by {DEVELOPER}. It exists for
        anyone whose photos need to prove where and when they were taken.
      </p>

      {/* Problem statement */}
      <section className="mt-16">
        <p className="text-[10px] font-light uppercase tracking-[0.25em] text-ink/50 sm:text-xs">
          Problem Statement
        </p>
        <h2 className="font-display mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
          A photo without a place is only half a record
        </h2>
        <div className="mt-8 space-y-8">
          {PROBLEMS.map((item, i) => (
            <div key={item.title} className="flex gap-5">
              <span className="mt-1 text-[10px] font-light tracking-[0.2em] text-ink/40">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-xs font-light uppercase tracking-[0.2em] text-ink/80">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm font-normal leading-relaxed text-ink/65">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="mt-20 border-t border-line pt-16">
        <p className="text-[10px] font-light uppercase tracking-[0.25em] text-ink/50 sm:text-xs">
          Solution
        </p>
        <h2 className="font-display mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
          How {APP_NAME} answers it
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {SOLUTIONS.map((item) => (
            <article key={item.title} className="bg-card p-7">
              <h3 className="font-display text-xl font-medium tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-sm font-normal leading-relaxed text-ink/70">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* What is inside */}
      <section className="mt-20 border-t border-line pt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
          Everything you need in one camera
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="bg-card p-7">
              <h3 className="font-display text-xl font-medium tracking-tight text-ink">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm font-normal leading-relaxed text-ink/70">
                {feature.body}
              </p>
              {feature.points && (
                <ul className="mt-5 space-y-2">
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-xs font-normal leading-relaxed text-ink/55"
                    >
                      <span aria-hidden="true" className="text-ink/40">
                        —
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* GPS stamp sample */}
      <section className="mt-20 border-t border-line pt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
          More than just coordinates
        </h2>
        <p className="mt-4 text-sm font-normal leading-relaxed text-ink/70">
          {APP_NAME} combines readable location information with exact GPS coordinates, altitude and
          heading, so your photos and videos are easier to understand and organize.
        </p>
        <div className="mt-8 max-w-sm rounded-2xl border border-black/10 bg-[#0E2238] p-6 shadow-card">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-light">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-light" />
            {SAMPLE_STAMP.accuracy}
            <span className="ml-auto text-white/60">{SAMPLE_STAMP.heading}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-white">{SAMPLE_STAMP.place}</p>
          <div className="mt-2 space-y-0.5">
            {SAMPLE_STAMP.address.map((line) => (
              <p key={line} className="text-xs font-normal leading-relaxed text-white/70">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-4 space-y-0.5 text-xs font-light text-white/90">
            <p>
              {SAMPLE_STAMP.lat} &nbsp; {SAMPLE_STAMP.long}
            </p>
            <p>{SAMPLE_STAMP.altitude}</p>
          </div>
          <div className="mt-4 space-y-0.5 text-xs font-light text-white/60">
            <p>{SAMPLE_STAMP.date}</p>
            <p>{SAMPLE_STAMP.time}</p>
          </div>
          <p className="mt-5 text-[10px] font-light uppercase tracking-[0.2em] text-white/45">
            Sample stamp
          </p>
        </div>
      </section>

      {/* Workflow */}
      <section className="mt-20 border-t border-line pt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
          How it works
        </h2>
        <ol className="mt-8 space-y-4">
          {[
            `Open ${APP_NAME}`,
            'Pick a folder',
            'Capture photos or video',
            'Each shot is stamped and filed automatically',
            'Collage, export as ZIP or PDF, or share',
          ].map((step, i) => (
            <li key={step} className="flex items-baseline gap-5">
              <span className="text-[10px] font-light tracking-[0.2em] text-ink/45">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-sm font-light text-ink/65 sm:text-base">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Who it is for */}
      <section className="mt-20 border-t border-line pt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
          Who it is for
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {AUDIENCES.map((audience) => (
            <div key={audience.title}>
              <h3 className="text-xs font-light uppercase tracking-[0.2em] text-ink/80">
                {audience.title}
              </h3>
              <p className="mt-2 text-sm font-normal leading-relaxed text-ink/65">
                {audience.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Developer */}
      <section className="mt-20 border-t border-line pt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Developed by {DEVELOPER}
        </h2>
        <p className="mt-4 text-sm font-normal leading-relaxed text-ink/70">
          {APP_NAME} is developed and maintained by {DEVELOPER}. Read the{' '}
          <Link to="/privacy" className="text-ink/80 underline underline-offset-4 hover:text-ink">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link to="/terms" className="text-ink/80 underline underline-offset-4 hover:text-ink">
            Terms &amp; Conditions
          </Link>
          , or{' '}
          <Link to="/support" className="text-ink/80 underline underline-offset-4 hover:text-ink">
            contact support
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}
