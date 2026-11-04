/* The launch page.

   One page that tells the truth at any moment without anybody editing it: a
   countdown before the launch instant, and the moment it passes, the page
   turns itself into the announcement. Nobody has to be awake at the right
   time, and nobody has to deploy at the right time either - which is exactly
   the sort of thing that goes wrong on a launch morning.

   The announcement is drawn as one of the app's own GPS stamp cards, because
   the product's whole claim is that a photograph should carry where and when
   it happened. A launch page that stamps its own moment is the product
   explaining itself.

   Everything is computed from the clock on the reader's device, so the page
   is a static file with no server behind it and nothing to go down. */
import { useEffect, useMemo, useState } from 'react';
import Seo from '../components/Seo';
import { PLAY_STORE_URL } from '../data/locsnap';

/* The launch instant, in IST. Change this one line to move the launch; the
   page, its countdown and its wording all follow from it. Month is 0-based:
   10 is November. */
const LAUNCH = new Date(2026, 10, 5, 10, 0, 0);

/** Where it was launched from, for the stamp card. */
const PLACE = {
  city: 'Hyderabad, Telangana, India',
  lat: '17.547225° N',
  lng: '78.401278° E',
};

type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function remaining(): Remaining {
  const ms = LAUNCH.getTime() - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const seconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: false,
  };
}

/**
 * Lets the launched state be looked at before it happens.
 *
 * Driven by the address rather than a button on the page: a "launch now"
 * control visible to everybody would be pressed by a visitor on the morning
 * itself, and they would see an announcement that was not true yet.
 *
 *   /launch?preview=live  - as it will look once it has launched
 *   /launch?preview=soon  - the countdown, even after it has
 */
function preview(): 'live' | 'soon' | null {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('preview');
  return value === 'live' || value === 'soon' ? value : null;
}

export default function Launch() {
  const [left, setLeft] = useState<Remaining>(() => remaining());
  const [forced, setForced] = useState<'live' | 'soon' | null>(() => preview());

  useEffect(() => {
    // Stops ticking once it has launched: a timer running for ever on a page
    // somebody leaves open is just a battery being spent for no reason.
    if (left.done || forced) return;
    const timer = setInterval(() => setLeft(remaining()), 1000);
    return () => clearInterval(timer);
  }, [left.done, forced]);

  const stamp = useMemo(() => {
    const date = LAUNCH.toLocaleDateString('en-IN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    });
    const time = LAUNCH.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
    return { date, time };
  }, []);

  const live = forced ? forced === 'live' : left.done;

  return (
    <div className="flex min-h-[100svh] flex-col bg-[#0B1A26] text-[#F7F5EC] lg:h-[100svh] lg:overflow-hidden">
      <Seo
        title={live ? 'Geo Snap - NLR is live on Google Play' : 'Geo Snap - NLR launches 5 November'}
        description={
          live
            ? 'Geo Snap - NLR is now on Google Play. A GPS camera that proves where and when a photo was taken. Free, no ads.'
            : 'Geo Snap - NLR launches on 5 November 2026. A GPS camera that proves where and when a photo was taken.'
        }
      />

      {/* A faint grid, like a map, rather than a photograph that would fight
          with the text sitting on it. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#5FD3E6 1px, transparent 1px), linear-gradient(90deg, #5FD3E6 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-y-6 px-5 py-10 text-center sm:px-8 lg:gap-y-7 lg:py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#5FD3E6]">
          {live ? 'Now on Google Play' : 'Launching 5 November 2026'}
        </p>

        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          Geo Snap <span className="text-[#5FD3E6]">- NLR</span>
        </h1>

        <p className="max-w-xl text-sm leading-relaxed text-[#A9BECD] sm:text-base">
          A camera that proves where and when. Location, address, coordinates,
          date and time, burned into the photograph itself.
        </p>

        {live ? <Live /> : <Countdown left={left} />}

        {/* The stamp card: before launch it says what will be stamped, after
            launch it is the record of what was. */}
        <figure className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-black/35 text-left backdrop-blur">
          <figcaption className="sr-only">
            The GPS card Geo Snap burns into every photograph
          </figcaption>
          <div className="flex items-center gap-4 border-l-4 border-[#E8B44A] p-4">
            <div
              aria-hidden
              className="h-14 w-14 flex-none rounded-lg"
              style={{
                background:
                  'radial-gradient(circle at 35% 35%, #3C5A4A 0%, #22362C 60%, #16241D 100%)',
              }}
            />
            <div className="min-w-0">
              <p className="text-base font-semibold">{PLACE.city}</p>
              <p className="mt-1 text-sm text-[#C6D4DF]">
                Lat {PLACE.lat}&nbsp;&nbsp; Long {PLACE.lng}
              </p>
              <p className="mt-0.5 text-sm text-[#C6D4DF]">
                {stamp.date}&nbsp;&nbsp;{stamp.time}
              </p>
            </div>
          </div>
        </figure>

        <ul className="grid w-full max-w-2xl grid-cols-2 gap-x-6 gap-y-4 text-left sm:grid-cols-4">
          {[
            ['Works offline', 'No signal needed'],
            ['No ads', 'None, ever'],
            ['Your own Drive', 'Not our servers'],
            ['Free', 'Every feature'],
          ].map(([title, note]) => (
            <li key={title} className="border-l-2 border-[#5FD3E6]/60 pl-3">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-xs text-[#8FA7B8]">{note}</p>
            </li>
          ))}
        </ul>

        <footer className="text-xs leading-relaxed text-[#6F8799]">
          <p>A product of NLR GROUP OF COMPANIES</p>
          <p className="mt-1">
            <a href="https://locsnapnlr.vercel.app" className="underline-offset-4 hover:underline">
              locsnapnlr.vercel.app
            </a>
          </p>
        </footer>
      </main>

      {forced && (
        <div className="pointer-events-auto fixed bottom-4 left-1/2 z-10 -translate-x-1/2">
          <button
            type="button"
            onClick={() => setForced(forced === 'live' ? 'soon' : 'live')}
            className="rounded-full border border-white/20 bg-black/60 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A9BECD] backdrop-blur transition hover:text-white"
          >
            Preview: {forced === 'live' ? 'launched' : 'counting down'} &mdash; tap to switch
          </button>
        </div>
      )}
    </div>
  );
}

function Countdown({ left }: { left: Remaining }) {
  const cells: [number, string][] = [
    [left.days, 'days'],
    [left.hours, 'hours'],
    [left.minutes, 'minutes'],
    [left.seconds, 'seconds'],
  ];
  return (
    <div>
      <div className="flex items-start justify-center gap-3 sm:gap-6">
        {cells.map(([value, label]) => (
          <div key={label} className="min-w-[68px] sm:min-w-[96px]">
            <div
              className="rounded-2xl border border-white/10 bg-white/[0.04] py-3 font-display text-3xl font-medium tabular-nums sm:py-5 sm:text-5xl lg:text-6xl"
              /* Announced only as it changes, so a screen reader is not read a
                 ticking clock one second at a time. */
              aria-hidden={label !== 'minutes'}
            >
              {String(value).padStart(2, '0')}
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#8FA7B8]">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-[#8FA7B8]">
        This page turns itself into the announcement the moment it launches.
      </p>
    </div>
  );
}

function Live() {
  return (
    <div className="flex flex-col items-center">
      <a
        href={PLAY_STORE_URL}
        className="rounded-full bg-[#5FD3E6] px-10 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#06202C] transition hover:bg-[#8AE3F2]"
      >
        Install from Google Play
      </a>
      <p className="mt-4 text-sm text-[#8FA7B8]">Free &middot; No ads &middot; Android 7.0 and above</p>
    </div>
  );
}
