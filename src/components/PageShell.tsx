import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { APP_NAME, DEVELOPER } from '../data/locsnap';
import Footer from './Footer';
import { NAV_LINKS } from './Navigation';

type PageShellProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

export default function PageShell({ title, eyebrow, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-[#010101]">
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <Link to="/" className="leading-tight transition-opacity duration-300 hover:opacity-70">
            <span className="block text-sm font-light uppercase tracking-[0.3em] text-white">
              {APP_NAME}
            </span>
            <span className="mt-1 block text-[9px] font-light uppercase tracking-[0.2em] text-white/45 sm:text-[10px]">
              by {DEVELOPER}
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-7">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap text-[10px] font-light uppercase tracking-[0.2em] transition-colors duration-300 hover:text-white sm:text-xs ${
                    isActive ? 'text-white' : 'text-white/50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl">
          {eyebrow && (
            <p className="text-[10px] font-light uppercase tracking-[0.25em] text-white/40 sm:text-xs">
              {eyebrow}
            </p>
          )}
          <h1 className="font-garamond mt-4 text-3xl font-normal leading-[1.1] tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
