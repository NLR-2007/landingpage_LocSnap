import { Link } from 'react-router-dom';
import {
  APP_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  DEVELOPER,
  TAGLINE,
} from '../data/locsnap';

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
    <footer className="relative border-t border-white/[0.08] bg-[#010101] px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 sm:grid-cols-2">
          <div>
            <p className="font-light uppercase tracking-[0.3em] text-white">{APP_NAME}</p>
            <p className="mt-3 text-xs font-light uppercase tracking-[0.2em] text-white/40">
              {TAGLINE}
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <p className="text-[10px] font-light uppercase tracking-[0.2em] text-white/40">
                  Email
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="mt-1 block break-all text-sm font-light text-white/70 transition-colors duration-300 hover:text-white"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div>
                <p className="text-[10px] font-light uppercase tracking-[0.2em] text-white/40">
                  Phone
                </p>
                <a
                  href={CONTACT_PHONE_HREF}
                  className="mt-1 block text-sm font-light text-white/70 transition-colors duration-300 hover:text-white"
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
                className="text-xs font-light uppercase tracking-[0.2em] text-white/60 transition-colors duration-300 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-16 border-t border-white/[0.08] pt-8">
          <p className="text-xs font-light uppercase tracking-[0.25em] text-white/80">
            Developed by {DEVELOPER}
          </p>
          <p className="mt-4 text-xs font-light text-white/35">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="mt-2 text-xs font-light text-white/35">
            {APP_NAME} is an independent application and is not affiliated with Google Maps.
          </p>
        </div>
      </div>
    </footer>
  );
}
