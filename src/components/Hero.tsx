import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import StaggeredFade from './StaggeredFade';
import { PLAY_STORE_URL, WHATS_NEW } from '../data/locsnap';
import { PlayBadge } from './PlayMark';

export default function Hero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-cream">
      {/* Soft warm background with gentle teal + cyan brand tints and a faint grid. */}
      <div
        className="absolute inset-0 bg-[radial-gradient(85%_55%_at_50%_-10%,rgba(14,124,145,0.12),transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(55%_45%_at_88%_108%,rgba(0,188,212,0.12),transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(75%_60%_at_50%_35%,black,transparent)] bg-[linear-gradient(rgba(27,30,34,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(27,30,34,0.045)_1px,transparent_1px)] bg-[size:46px_46px]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cream to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <Navigation />

        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-32 pt-8 text-center sm:px-8 sm:pb-36 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="mb-7 flex flex-col items-center gap-3"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/10 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-green sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              Offline GPS Camera · Android
            </span>
            {/* The current release, announced until the next one replaces it. */}
            <Link
              to="/about#whats-new"
              className="group inline-flex max-w-[22rem] items-center gap-2 rounded-full border border-line bg-card/80 px-3.5 py-1.5 text-[11px] font-normal text-ink/70 backdrop-blur transition hover:border-green/40 hover:text-ink sm:max-w-none sm:text-xs"
            >
              <span className="rounded-full bg-green px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white sm:text-[10px]">
                New
              </span>
              <span className="truncate">{WHATS_NEW.headline} in v{WHATS_NEW.version}</span>
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
          </motion.div>

          <h1 className="font-display mb-7 font-semibold tracking-tight text-ink text-4xl leading-[1.05] sm:mb-8 sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            <span className="block">
              <StaggeredFade text="CAPTURE THE PLACE" />
            </span>
            <span className="block text-green">
              <StaggeredFade text="KEEP THE PROOF" />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: 'easeOut' }}
            className="mb-10 max-w-md text-base font-normal leading-relaxed text-ink/70 sm:max-w-xl sm:text-lg"
          >
            An offline-first GPS camera that stamps photos and video with location, address,
            coordinates, altitude and time — burned right onto every frame.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.9, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              to="/about"
              className="btn-brand inline-block rounded-full px-9 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] sm:px-10 sm:py-4 sm:text-sm sm:tracking-[0.2em]"
            >
              Explore the App
            </Link>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex transition hover:opacity-90"
              aria-label="Get it on Google Play"
            >
              {/* Taller than the button beside it on purpose. Google bakes
                  its required clear space into the image, so only about four
                  fifths of this height is the badge itself - matched on the
                  CSS height the two would look mismatched, which is exactly
                  how it looked. */}
              <PlayBadge className="h-14 sm:h-16" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
