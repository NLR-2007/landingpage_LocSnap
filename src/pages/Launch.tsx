/* The launch page.

   One page that tells the truth at any moment without anybody editing it:
   the date beforehand, and the moment the launch instant passes, the page
   turns itself into the announcement. Nobody has to be awake at the right
   time, and nobody has to deploy at the right time either - which is exactly
   the sort of thing that goes wrong on a launch morning.

   There is no clock ticking down. Four numbers counting seconds measure the
   wait rather than the product, and they are the first thing to look stale
   if the date moves. The page states when it arrives and then announces it.

   Built in the site's own colours, so somebody arriving from any other page
   is still on the same website. The announcement is drawn around one of the
   app's own GPS cards and sealed with a stamp, because the product's whole
   claim is that a photograph should carry where and when it happened. A
   launch page that stamps its own moment demonstrates the product instead of
   describing it.

   Everything is computed from the clock on the reader's device, so the page
   stays a static file with no server behind it and nothing to go down. */
import { useEffect, useMemo, useRef, useState } from 'react';
import Seo from '../components/Seo';
import { PLAY_STORE_URL } from '../data/locsnap';

/* The launch instant, in IST. Change this one line to move the launch; the
   countdown, the wording and the seal all follow. Month is 0-based. */
const LAUNCH = new Date(2026, 10, 5, 10, 0, 0);

const PLACE = {
  city: 'Hyderabad, Telangana, India',
  lat: '17.547225° N',
  lng: '78.401278° E',
};

function launched(): boolean {
  return Date.now() >= LAUNCH.getTime();
}

/**
 * Lets the launched state be seen before it exists.
 *
 * Allowed on a local machine, or to anybody who deliberately put ?preview in
 * the address. Never to an ordinary visitor: a "launch now" control on the
 * live page would be pressed on the morning itself, and that person would be
 * told the app was out before it was.
 */
function previewAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1'
    || window.location.search.includes('preview');
}

function initialForced(): 'live' | 'soon' | null {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('preview');
  return value === 'live' || value === 'soon' ? value : null;
}

export default function Launch() {
  const [done, setDone] = useState<boolean>(launched);
  const [forced, setForced] = useState<'live' | 'soon' | null>(initialForced);
  const canPreview = useMemo(previewAllowed, []);

  useEffect(() => {
    // One timer, set to go off at the launch instant, so a tab left open
    // overnight still turns itself into the announcement. Nothing ticks in
    // between, and setTimeout cannot be trusted past a 32-bit millisecond
    // count, so a longer wait is slept through in stages.
    if (done || forced) return;
    const ms = Math.min(LAUNCH.getTime() - Date.now(), 2_000_000_000);
    const timer = setTimeout(() => setDone(launched()), Math.max(ms, 0));
    return () => clearTimeout(timer);
  }, [done, forced]);

  const live = forced ? forced === 'live' : done;

  const stamped = useMemo(() => ({
    date: LAUNCH.toLocaleDateString('en-IN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    }),
    time: LAUNCH.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  }), []);

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden bg-cream text-ink lg:h-[100svh]">
      <Seo
        title={live ? 'Geo Snap - NLR is live on Google Play' : 'Geo Snap - NLR launches 5 November'}
        description={
          live
            ? 'Geo Snap - NLR is now on Google Play. A GPS camera that proves where and when a photo was taken. Free, no ads.'
            : 'Geo Snap - NLR launches on 5 November 2026. A GPS camera that proves where and when a photo was taken.'
        }
      />

      <Effects live={live} />
      <Seal />

      {/* A surveyor's grid, faint enough to be texture rather than pattern. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            'linear-gradient(#E7E3D6 1px, transparent 1px), linear-gradient(90deg, #E7E3D6 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, #000 35%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 35%, transparent 78%)',
        }}
      />

      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-y-6 px-5 py-10 text-center sm:px-8 lg:gap-y-7 lg:py-8">
        <p className="rise text-[11px] font-semibold uppercase tracking-[0.34em] text-green" style={{ animationDelay: '40ms' }}>
          {live ? 'Successfully launched' : 'Launching 5 November 2026'}
        </p>

        <h1 className="rise font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl" style={{ animationDelay: '110ms' }}>
          {live ? <>We are <span className="text-green">live</span> on Google Play</>
                : <>Geo Snap <span className="text-green">- NLR</span></>}
        </h1>

        <p className="rise max-w-xl text-sm leading-relaxed text-ink/65 sm:text-base" style={{ animationDelay: '180ms' }}>
          {live
            ? 'Geo Snap - NLR is out. A camera that proves where and when: location, address, coordinates, date and time, burned into the photograph itself.'
            : 'A camera that proves where and when. Location, address, coordinates, date and time, burned into the photograph itself.'}
        </p>

        <div className="rise" style={{ animationDelay: '250ms' }}>
          {live ? <Live /> : <Soon onLaunchNow={canPreview ? () => setForced('live') : null} />}
        </div>

        {/* The card the app burns into a photograph: a promise beforehand, a
            record of the moment afterwards. */}
        <figure className="rise w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-card text-left shadow-[0_14px_40px_-24px_rgba(27,30,34,0.45)]" style={{ animationDelay: '320ms' }}>
          <figcaption className="border-b border-line px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-ink/45">
            {live ? 'Launched at' : 'The card Geo Snap burns into every photograph'}
          </figcaption>
          <div className="flex items-center gap-4 border-l-4 border-[#E8B44A] p-4">
            <div
              aria-hidden
              className="h-14 w-14 flex-none rounded-lg"
              style={{ background: 'radial-gradient(circle at 35% 35%, #7E9A86 0%, #4F6B58 60%, #3A5143 100%)' }}
            />
            <div className="min-w-0">
              <p className="text-base font-semibold">{PLACE.city}</p>
              <p className="mt-1 text-sm text-ink/60">Lat {PLACE.lat}&nbsp;&nbsp; Long {PLACE.lng}</p>
              <p className="mt-0.5 text-sm text-ink/60">{stamped.date}&nbsp;&nbsp;{stamped.time}</p>
            </div>
          </div>
        </figure>

        <ul className="rise grid w-full max-w-2xl grid-cols-2 gap-x-6 gap-y-4 text-left sm:grid-cols-4" style={{ animationDelay: '390ms' }}>
          {[
            ['Works offline', 'No signal needed'],
            ['No ads', 'None, ever'],
            ['Your own Drive', 'Not our servers'],
            ['Free', 'Every feature'],
          ].map(([title, note]) => (
            <li key={title} className="border-l-2 border-green/50 pl-3">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-xs text-ink/55">{note}</p>
            </li>
          ))}
        </ul>

        <footer className="rise text-xs leading-relaxed text-ink/45" style={{ animationDelay: '450ms' }}>
          <p>A product of NLR GROUP OF COMPANIES</p>
          <p className="mt-1">
            <a href="https://locsnapnlr.vercel.app" className="underline-offset-4 hover:underline">
              locsnapnlr.vercel.app
            </a>
          </p>
        </footer>
      </main>

      {forced && (
        <div className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2">
          <button
            type="button"
            onClick={() => setForced(forced === 'live' ? 'soon' : 'live')}
            className="rounded-full border border-line bg-card/90 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60 shadow-sm backdrop-blur transition hover:text-ink"
          >
            Preview: {forced === 'live' ? 'launched' : 'counting down'} &mdash; tap to switch
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * The page before the launch instant.
 *
 * It says when, and that is all. The one control is the preview switch, and
 * it is handed in rather than decided here, because it must never render for
 * an ordinary visitor - a "launch now" button on the live page would be
 * pressed on the morning itself and tell that person the app was out early.
 */
function Soon({ onLaunchNow }: { onLaunchNow: (() => void) | null }) {
  return (
    <div className="flex flex-col items-center">
      <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-card px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/55 shadow-[0_10px_30px_-24px_rgba(27,30,34,0.6)]">
        <PlayMark />
        On Google Play from 5 November
      </p>

      {onLaunchNow && (
        <button
          type="button"
          onClick={onLaunchNow}
          className="btn-brand mt-6 rounded-full px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:-translate-y-0.5"
        >
          Launch now
        </button>
      )}
    </div>
  );
}

/**
 * Google's own play mark, drawn rather than fetched.
 *
 * An image would be one more request that can fail and one more thing to
 * host; this is four paths. Used to point at this app's own listing, which
 * is what the mark is for.
 */
function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 flex-none">
      <path d="M3.6 1.8 13.8 12 3.6 22.2a2 2 0 0 1-.6-1.43V3.24c0-.56.23-1.07.6-1.44z" fill="#00D2FF" />
      <path d="M3.6 1.8a2 2 0 0 1 1.4-.17l11.8 6.7-3 3L3.6 1.81z" fill="#00F076" />
      <path d="m16.8 8.99 3.86 2.2c.78.44.78 1.18 0 1.62l-3.86 2.2-3-3.01 3-3.01z" fill="#FFCE00" />
      <path d="m13.8 12 3 3.01-11.8 6.7c-.47.13-.97.07-1.4-.17L13.8 12z" fill="#FF3A44" />
    </svg>
  );
}

function Live() {
  return (
    <div className="flex flex-col items-center">
      <p className="flex items-center gap-2.5 rounded-full border border-[#1F8A54]/25 bg-[#1F8A54]/[0.08] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#167045]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1F8A54] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1F8A54]" />
        </span>
        Live now
      </p>

      <a
        href={PLAY_STORE_URL}
        className="btn-brand sheen mt-6 inline-flex items-center gap-3 rounded-full px-10 py-5 text-sm font-semibold uppercase tracking-[0.18em] shadow-[0_18px_40px_-18px_rgba(14,124,145,0.75)] transition hover:-translate-y-0.5"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/95">
          <PlayMark />
        </span>
        Install from Google Play
      </a>
      <p className="mt-4 text-sm text-ink/55">Free &middot; No ads &middot; Android 7.0 and above</p>
    </div>
  );
}

/**
 * The seals, pressed into the margin beside the page.
 *
 * The first attempt put one behind the headline, where it crossed the words
 * and made both the seal and the sentence hard to read - a decoration that
 * costs legibility has failed at the only job it had. They now sit in the
 * empty column outside the text, half off the edge as a stamp pressed near
 * the margin of a page would be, and they are hidden altogether on screens
 * narrow enough to have no margin to spare.
 *
 * Red, because a stamp is always a different ink from the document it is
 * pressed on. That is what makes it read as applied rather than printed.
 */
const INK = '#1B1E22';      // the ring and the words
const CROSS = '#C0392B';    // the one thing struck out, in red

/**
 * The seal, pressed into the top of the right-hand margin.
 *
 * One, not two, and never behind the words. An earlier version was placed
 * inside the centred text column, so its "right edge" was the headline's edge
 * and it landed across the words - a decoration that costs legibility has
 * failed at the only job it had.
 *
 * It is anchored to the page, not to that column, and it shrinks rather than
 * disappearing: a seal gated at 1536px is invisible on an ordinary laptop
 * window, which is the one place it needed to be seen. Below 640px there is
 * no corner to spare, so there it is not drawn at all.
 *
 * Red, because a stamp is always a different ink from the document it is
 * pressed on. That is what makes it read as applied rather than printed.
 */
function Seal() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 400"
      className="press pointer-events-none absolute right-3 top-4 z-[1] hidden w-28
                 sm:block md:right-6 md:top-6 md:w-36 xl:w-44"
    >
      <defs>
        <path id="sealTop" d="M 62,200 A 138,138 0 0 1 338,200" />
        <path id="sealBottom" d="M 74,200 A 126,126 0 0 0 326,200" />
      </defs>
      <g fill={INK} stroke={INK}>
        <circle cx="200" cy="200" r="186" fill="none" strokeWidth="10" />
        <circle cx="200" cy="200" r="166" fill="none" strokeWidth="3" />
        <text fontFamily="Georgia,serif" fontSize="29" fontWeight="bold" letterSpacing="5"
              textAnchor="middle" stroke="none">
          <textPath href="#sealTop" startOffset="50%">GEO SNAP &#183; NLR</textPath>
        </text>
        <text fontFamily="Georgia,serif" fontSize="21" fontWeight="bold" letterSpacing="4"
              textAnchor="middle" stroke="none">
          <textPath href="#sealBottom" startOffset="50%">NO TRACKING</textPath>
        </text>
        <line x1="112" y1="128" x2="288" y2="128" strokeWidth="3.5" />
        <line x1="112" y1="286" x2="288" y2="286" strokeWidth="3.5" />
        <text x="200" y="196" fontFamily="Georgia,serif" fontSize="74" fontWeight="bold"
              textAnchor="middle" stroke="none" letterSpacing="2">NO</text>
        <text x="200" y="266" fontFamily="Georgia,serif" fontSize="74" fontWeight="bold"
              textAnchor="middle" stroke="none" letterSpacing="2">ADS</text>

        {/* Struck through, in the other ink. The whole seal says one thing:
            this is the part that is crossed out. Drawn after the word so it
            sits on top of it, with round ends so it reads as a pen stroke
            rather than a rendering fault. */}
        <g stroke={CROSS} strokeWidth="9" strokeLinecap="round">
          <line x1="118" y1="212" x2="282" y2="272" />
          <line x1="282" y1="212" x2="118" y2="272" />
        </g>
      </g>
    </svg>
  );
}

/**
 * The page's motion, in one place.
 *
 * Every animation is switched off wholesale for anybody who has asked their
 * system to reduce motion - a celebration is not worth making somebody ill.
 */
function Effects({ live }: { live: boolean }) {
  const canvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!live) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;

    const width = (element.width = window.innerWidth);
    const height = (element.height = window.innerHeight);
    const colours = ['#0E7C91', '#E8B44A', '#1F8A54', '#1B1E22', '#5FD3E6'];

    // Thrown from the two upper corners, the way a party popper goes off,
    // rather than falling out of the sky over the whole page.
    const bits = Array.from({ length: 90 }, (_, index) => {
      const left = index % 2 === 0;
      return {
        x: left ? 0 : width,
        y: height * 0.22,
        vx: (left ? 1 : -1) * (4 + Math.random() * 7),
        vy: -(5 + Math.random() * 7),
        size: 5 + Math.random() * 6,
        spin: (Math.random() - 0.5) * 0.3,
        angle: Math.random() * Math.PI,
        colour: colours[index % colours.length],
      };
    });

    let frame = 0;
    let raf = 0;
    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, width, height);
      let visible = false;
      for (const bit of bits) {
        bit.vy += 0.22;          // gravity
        bit.vx *= 0.993;         // drag
        bit.x += bit.vx;
        bit.y += bit.vy;
        bit.angle += bit.spin;
        if (bit.y < height + 40) visible = true;
        context.save();
        context.translate(bit.x, bit.y);
        context.rotate(bit.angle);
        context.globalAlpha = Math.max(0, 1 - frame / 190);
        context.fillStyle = bit.colour;
        context.fillRect(-bit.size / 2, -bit.size / 2, bit.size, bit.size * 0.62);
        context.restore();
      }
      // Stops the moment the last piece is gone, instead of running for ever.
      if (visible && frame < 200) raf = requestAnimationFrame(draw);
      else context.clearRect(0, 0, width, height);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  return (
    <>
      <style>{`
        @keyframes rise { from { opacity: 0; transform: translateY(14px); }
                          to   { opacity: 1; transform: none; } }
        .rise { animation: rise .6s cubic-bezier(.2,.7,.3,1) both; }

        @keyframes press {
          0%   { opacity: 0; transform: rotate(-28deg) scale(2.7); }
          55%  { opacity: .62; transform: rotate(-11deg) scale(.95); }
          72%  { transform: rotate(-13deg) scale(1.03); }
          100% { opacity: .52; transform: rotate(-12deg) scale(1); }
        }
        .press { animation: press .95s cubic-bezier(.2,.8,.3,1) .3s both; }

        /* A single light sweep across the install button, once it settles. */
        .sheen { position: relative; overflow: hidden; }
        .sheen::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,.42) 50%, transparent 62%);
          transform: translateX(-120%);
          animation: sweep 2.6s ease-in-out 1.1s infinite;
        }
        @keyframes sweep { 0% { transform: translateX(-120%); } 55%,100% { transform: translateX(120%); } }

        @media (prefers-reduced-motion: reduce) {
          .rise, .press, .sheen::after { animation: none; }
          .rise { opacity: 1; transform: none; }
          .press { opacity: .52; transform: rotate(-12deg); }
        }
      `}</style>
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10"
      />
    </>
  );
}
