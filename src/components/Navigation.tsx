import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { APP_NAME, DEVELOPER } from '../data/locsnap';

export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Geo Snap - NLR logo"
      width={72}
      height={72}
      className={`${className} shrink-0 rounded-xl`}
    />
  );
}

export const NAV_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Support', to: '/support' },
  { label: 'Download', to: '/download' },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="relative z-20 flex items-center justify-between px-5 py-6 sm:px-8 lg:justify-center lg:gap-10 xl:gap-14">
        <Link to="/" className="group flex items-center gap-2.5 leading-tight">
          <BrandMark />
          <span className="leading-tight">
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-ink sm:text-base">
              {APP_NAME}
            </span>
            <span className="mt-0.5 block text-[9px] font-light uppercase tracking-[0.2em] text-ink/55 sm:text-[10px]">
              by {DEVELOPER}
            </span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-6 xl:gap-9">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="whitespace-nowrap text-[10px] font-light uppercase tracking-[0.2em] text-ink/70 transition-colors duration-300 hover:text-green lg:text-xs"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="lg:hidden text-ink/80 transition-colors duration-300 hover:text-ink"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mobile-menu-glass fixed left-4 right-4 top-16 z-50 flex flex-col items-center gap-5 rounded-2xl py-8 lg:hidden"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.3, ease: 'easeOut' }}
              >
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="text-sm font-light uppercase tracking-[0.25em] text-ink/80 transition-colors duration-300 hover:text-green"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
