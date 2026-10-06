import { Link } from 'react-router-dom';
import {
  APP_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  DEVELOPER,
  TAGLINE,
} from '../data/locsnap';
import { BrandMark } from './Navigation';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Support', to: '/support' },
  { label: 'Download', to: '/download' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-[#EFEBDD] px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark className="h-9 w-9" />
              <p className="font-semibold uppercase tracking-[0.18em] text-ink">{APP_NAME}</p>
            </div>
            <p className="mt-3 text-xs font-light uppercase tracking-[0.2em] text-ink/50">
              {TAGLINE}
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <p className="text-[10px] font-light uppercase tracking-[0.2em] text-ink/50">
                  Email
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="mt-1 block break-all text-sm font-light text-ink/80 transition-colors duration-300 hover:text-green"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div>
                <p className="text-[10px] font-light uppercase tracking-[0.2em] text-ink/50">
                  Phone
                </p>
                <a
                  href={CONTACT_PHONE_HREF}
                  className="mt-1 block text-sm font-light text-ink/80 transition-colors duration-300 hover:text-green"
                >
                  {CONTACT_PHONE}
                </a>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-4 sm:items-end">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-xs font-light uppercase tracking-[0.2em] text-ink/70 transition-colors duration-300 hover:text-green"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-16 border-t border-line pt-8">
          <p className="text-xs font-light uppercase tracking-[0.25em] text-ink/70">
            Developed by {DEVELOPER}
          </p>
          <p className="mt-4 text-xs font-light text-ink/45">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="mt-2 text-xs font-light text-ink/45">
            {APP_NAME} (formerly LocSnap) is an independent application and is not affiliated with
            Google Maps.
          </p>
        </div>
      </div>
    </footer>
  );
}
