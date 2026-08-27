import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import StaggeredFade from './StaggeredFade';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4';

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#010101]">
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="absolute inset-0 bg-black/25" aria-hidden="true" />

      <div className="relative z-10 flex h-full flex-col">
        <Navigation />

        <div className="relative z-10 flex flex-col items-center px-5 pt-12 text-center sm:px-8 sm:pt-16 md:pt-24">
          <h1 className="font-garamond mb-6 font-normal tracking-tight text-white text-4xl leading-[1.08] sm:mb-8 sm:text-6xl md:text-8xl lg:text-9xl">
            <span className="block">
              <StaggeredFade text="CAPTURE EVERY PLACE" />
            </span>
            <span className="block">
              <StaggeredFade text="KEEP EVERY DETAIL" />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6, ease: 'easeOut' }}
            className="mb-8 max-w-xs text-sm font-light leading-relaxed text-white/70 sm:mb-10 sm:max-w-md sm:text-base md:text-lg"
          >
            A fast, private, offline-first GPS camera that stamps
            <br className="hidden sm:block" /> location, address and time onto every photo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.0, ease: 'easeOut' }}
          >
            <Link
              to="/about"
              className="liquid-glass inline-block rounded-full px-7 py-3.5 text-xs font-light uppercase tracking-[0.18em] text-white/90 sm:px-10 sm:py-4 sm:text-sm sm:tracking-[0.2em]"
            >
              Explore LocSnap
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
