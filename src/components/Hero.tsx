import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Navigation from './Navigation';
import StaggeredFade from './StaggeredFade';
import { SAMPLE_STAMP } from '../data/locsnap';

export default function Hero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-cream">
      {/* Soft warm background with gentle green + cyan tints and a faint grid. */}
      <div
        className="absolute inset-0 bg-[radial-gradient(85%_55%_at_50%_-10%,rgba(47,166,79,0.12),transparent_60%)]"
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
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/10 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-green sm:text-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            Offline GPS Camera · Android
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
            <Link
              to="/download"
              className="liquid-glass inline-block rounded-full px-9 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-ink sm:px-10 sm:py-4 sm:text-sm sm:tracking-[0.2em]"
            >
              Get it on Android
            </Link>
          </motion.div>
        </div>

        {/* Floating GPS stamp — styled like the dark overlay the app burns into each capture. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 2.2, ease: 'easeOut' }}
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden w-[20rem] -translate-x-1/2 sm:bottom-8 sm:left-8 sm:block sm:translate-x-0"
        >
          <div className="rounded-2xl border border-black/20 bg-[#0E2238]/95 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-light">
              <MapPin size={12} className="text-brand-light" />
              {SAMPLE_STAMP.accuracy}
              <span className="ml-auto text-white/70">{SAMPLE_STAMP.heading}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-white">{SAMPLE_STAMP.place}</p>
            <p className="mt-0.5 text-[11px] font-light leading-snug text-white/75">
              {SAMPLE_STAMP.address[0]} {SAMPLE_STAMP.address[1]}
            </p>
            <p className="mt-2 text-[11px] font-light text-white/90">
              {SAMPLE_STAMP.lat} &nbsp; {SAMPLE_STAMP.long}
            </p>
            <p className="text-[11px] font-light text-white/65">{SAMPLE_STAMP.date}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
