import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

export default function NotFound() {
  return (
    <PageShell title="Page Not Found" eyebrow="404">
      <p className="mt-7 text-sm font-light leading-relaxed text-white/70 sm:text-base">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        to="/"
        className="liquid-glass mt-10 inline-block rounded-full px-7 py-3.5 text-xs font-light uppercase tracking-[0.18em] text-white/90"
      >
        Back to Home
      </Link>
    </PageShell>
  );
}
