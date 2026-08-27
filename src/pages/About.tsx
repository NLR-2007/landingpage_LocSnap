import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
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
    body: 'Most photo tools want an account, an upload and a subscription before you can take a single picture, and your images end up on somebody else servers.',
  },
];

const SOLUTIONS: { title: string; body: string }[] = [
  {
    title: 'Stamp the location onto the photo',
    body: `${APP_NAME} writes the place name, full address, latitude, longitude, date and time directly onto the image, so the context travels with the photo wherever it is shared.`,
  },
  {
    title: 'Readable location, exact coordinates',
    body: 'Every stamp pairs a human-readable address with precise coordinates, plus optional accuracy, altitude and compass direction, so both people and systems can use it.',
  },
  {
    title: 'Built to work on your device first',
    body: 'The core camera, GPS, organization and export functionality is designed to work locally on your device. Detailed address and map availability may depend on your device and the map or geocoding data available to it.',
  },
  {
    title: 'Organise before you shoot, not after',
    body: 'Pick a folder such as Farm Visit or Plot 12 once, and every photo you take afterwards is filed there automatically. No sorting session at the end of the day.',
  },
  {
    title: 'Share it the way people expect',
    body: 'Turn a visit into a collage, a before and after comparison, or a ZIP of the whole folder, all created on the device with no upload required.',
  },
  {
    title: 'No account, no cloud, no AI',
    body: `${APP_NAME} needs no login and provides no cloud photo storage of its own. Your photos stay on your device and are not analysed by artificial intelligence.`,
  },
];

export default function About() {
  return (
    <PageShell title={`About ${APP_NAME}`} eyebrow={TAGLINE}>
      <p className="mt-7 text-sm font-light leading-relaxed text-white/70 sm:text-base">
        {APP_NAME} is an offline-first GPS camera for Android, built by {DEVELOPER}. It exists for
        anyone whose photos need to prove where and when they were taken.
      </p>

      {/* Problem statement */}
      <section className="mt-16">
        <p className="text-[10px] font-light uppercase tracking-[0.25em] text-white/40 sm:text-xs">
          Problem Statement
        </p>
        <h2 className="font-garamond mt-4 text-2xl font-normal tracking-tight text-white sm:text-4xl">
          A photo without a place is only half a record
        </h2>
        <div className="mt-8 space-y-8">
          {PROBLEMS.map((item, i) => (
            <div key={item.title} className="flex gap-5">
              <span className="mt-1 text-[10px] font-light tracking-[0.2em] text-white/25">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-xs font-light uppercase tracking-[0.2em] text-white/90">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-white/55">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="mt-20 border-t border-white/[0.08] pt-16">
        <p className="text-[10px] font-light uppercase tracking-[0.25em] text-white/40 sm:text-xs">
          Solution
        </p>
        <h2 className="font-garamond mt-4 text-2xl font-normal tracking-tight text-white sm:text-4xl">
          How {APP_NAME} answers it
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2">
          {SOLUTIONS.map((item) => (
            <article key={item.title} className="bg-[#010101] p-7">
              <h3 className="font-garamond text-xl font-normal tracking-tight text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-white/60">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* What is inside */}
      <section className="mt-20 border-t border-white/[0.08] pt-16">
        <h2 className="font-garamond text-2xl font-normal tracking-tight text-white sm:text-4xl">
          Everything you need in one camera
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="bg-[#010101] p-7">
              <h3 className="font-garamond text-xl font-normal tracking-tight text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-white/60">
                {feature.body}
              </p>
              {feature.points && (
                <ul className="mt-5 space-y-2">
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-xs font-light leading-relaxed text-white/50"
                    >
                      <span aria-hidden="true" className="text-white/25">
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
      <section className="mt-20 border-t border-white/[0.08] pt-16">
        <h2 className="font-garamond text-2xl font-normal tracking-tight text-white sm:text-4xl">
          More than just coordinates
        </h2>
        <p className="mt-4 text-sm font-light leading-relaxed text-white/60">
          {APP_NAME} combines readable location information with exact GPS coordinates so your
          photos are easier to understand and organize.
        </p>
        <div className="liquid-glass mt-8 max-w-sm rounded-2xl p-6">
          <p className="text-sm font-light text-white/90">{SAMPLE_STAMP.place}</p>
          <div className="mt-3 space-y-0.5">
            {SAMPLE_STAMP.address.map((line) => (
              <p key={line} className="text-xs font-light leading-relaxed text-white/60">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-4 space-y-0.5 text-xs font-light text-white/70">
            <p>{SAMPLE_STAMP.lat}</p>
            <p>{SAMPLE_STAMP.long}</p>
          </div>
          <div className="mt-4 space-y-0.5 text-xs font-light text-white/50">
            <p>{SAMPLE_STAMP.date}</p>
            <p>{SAMPLE_STAMP.time}</p>
          </div>
          <p className="mt-5 text-[10px] font-light uppercase tracking-[0.2em] text-white/25">
            Sample stamp
          </p>
        </div>
      </section>

      {/* Workflow */}
      <section className="mt-20 border-t border-white/[0.08] pt-16">
        <h2 className="font-garamond text-2xl font-normal tracking-tight text-white sm:text-4xl">
          How it works
        </h2>
        <ol className="mt-8 space-y-4">
          {[
            `Open ${APP_NAME}`,
            'Select a folder',
            'Take photos',
            'Photos are organized automatically',
            'Collage, ZIP or share',
          ].map((step, i) => (
            <li key={step} className="flex items-baseline gap-5">
              <span className="text-[10px] font-light tracking-[0.2em] text-white/30">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-sm font-light text-white/75 sm:text-base">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Who it is for */}
      <section className="mt-20 border-t border-white/[0.08] pt-16">
        <h2 className="font-garamond text-2xl font-normal tracking-tight text-white sm:text-4xl">
          Who it is for
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {AUDIENCES.map((audience) => (
            <div key={audience.title}>
              <h3 className="text-xs font-light uppercase tracking-[0.2em] text-white/90">
                {audience.title}
              </h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-white/55">
                {audience.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Developer */}
      <section className="mt-20 border-t border-white/[0.08] pt-16">
        <h2 className="font-garamond text-2xl font-normal tracking-tight text-white sm:text-3xl">
          Developed by {DEVELOPER}
        </h2>
        <p className="mt-4 text-sm font-light leading-relaxed text-white/60">
          {APP_NAME} is developed and maintained by {DEVELOPER}. Read the{' '}
          <Link to="/privacy" className="text-white/85 underline underline-offset-4 hover:text-white">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link to="/terms" className="text-white/85 underline underline-offset-4 hover:text-white">
            Terms &amp; Conditions
          </Link>
          , or{' '}
          <Link to="/support" className="text-white/85 underline underline-offset-4 hover:text-white">
            contact support
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}
