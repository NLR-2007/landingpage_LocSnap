import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { APP_NAME, DEVELOPER } from '../data/locsnap';
import Footer from './Footer';
import { BrandMark, NAV_LINKS } from './Navigation';

type PageShellProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  /** Content-heavy pages (e.g. About) use the wide column; reading pages stay narrow. */
  wide?: boolean;
};

export default function PageShell({ title, eyebrow, children, wide = false }: PageShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-5">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 leading-tight transition-opacity duration-300 hover:opacity-80"
            onClick={() => setOpen(false)}
          >
            <BrandMark className="h-9 w-9" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold uppercase tracking-[0.18em] text-ink">
                {APP_NAME}
              </span>
              <span className="mt-0.5 block truncate text-[9px] font-light uppercase tracking-[0.2em] text-ink/55 sm:text-[10px]">
                by {DEVELOPER}
              </span>
            </span>
          </Link>

          {/* Full links on large screens. */}
          <nav className="hidden items-center gap-x-6 lg:flex xl:gap-x-8">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap text-xs font-light uppercase tracking-[0.2em] transition-colors duration-300 hover:text-green ${
                    isActive ? 'text-green' : 'text-ink/55'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Hamburger below large screens. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="shrink-0 text-ink/80 transition-colors duration-300 hover:text-ink lg:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              key="page-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden border-t border-line bg-cream/95 backdrop-blur-md lg:hidden"
            >
              <nav className="mx-auto flex max-w-6xl flex-col px-5 py-2 sm:px-8">
                {NAV_LINKS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `border-b border-line/60 py-3 text-xs font-light uppercase tracking-[0.2em] transition-colors duration-300 last:border-b-0 hover:text-green ${
                        isActive ? 'text-green' : 'text-ink/70'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="brand-wash px-5 py-16 sm:px-8 sm:py-24">
        <div className={`mx-auto ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>
          {eyebrow && (
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-green sm:text-xs">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display mt-4 text-3xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
