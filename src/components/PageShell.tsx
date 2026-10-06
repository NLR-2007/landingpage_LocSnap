import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { APP_NAME, DEVELOPER } from '../data/locsnap';
import Footer from './Footer';
import { BrandMark, NAV_LINKS } from './Navigation';

type PageShellProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

export default function PageShell({ title, eyebrow, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 leading-tight transition-opacity duration-300 hover:opacity-80"
          >
            <BrandMark className="h-9 w-9" />
            <span className="leading-tight">
              <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-ink">
                {APP_NAME}
              </span>
              <span className="mt-0.5 block text-[9px] font-light uppercase tracking-[0.2em] text-ink/55 sm:text-[10px]">
                by {DEVELOPER}
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1.5 sm:gap-x-7">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap text-[10px] font-light uppercase tracking-[0.2em] transition-colors duration-300 hover:text-green sm:text-xs ${
                    isActive ? 'text-green' : 'text-ink/55'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="brand-wash px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl">
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
