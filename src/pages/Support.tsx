import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import {
  APP_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  DEVELOPER,
} from '../data/locsnap';

const HELP_TOPICS: { question: string; answer: string }[] = [
  {
    question: 'The GPS stamp shows the wrong place name',
    answer:
      'Place names and addresses come from your device geocoding or map services and can be outdated or imprecise. Coordinates are usually more reliable than the written address. Please verify location information independently when accuracy matters.',
  },
  {
    question: 'Location is not being detected',
    answer:
      'Check that location permission is granted to LocSnap and that device location services are switched on. An open sky and a few seconds for the first fix both help accuracy.',
  },
  {
    question: 'Does LocSnap work without internet?',
    answer:
      'The core camera, GPS, folder organization and export functionality is designed to work locally on your device. Detailed address and map availability may depend on your device and the map or geocoding data available to it.',
  },
  {
    question: 'Where are my photos stored?',
    answer: `Photos stay on your device. ${APP_NAME} does not provide its own cloud storage and does not upload your photos to its own servers for core functionality.`,
  },
  {
    question: 'How do I export a folder?',
    answer:
      'Open the folder, choose export, and LocSnap creates a ZIP file on your device. No server upload is involved.',
  },
  {
    question: 'I lost photos after uninstalling',
    answer:
      'Deleting the application may remove application-specific locally stored data. Please keep your own backups of important photos and exported files.',
  },
];

export default function Support() {
  return (
    <PageShell title="Support" eyebrow="Help with LocSnap">
      <Seo
        title="LocSnap Support - Contact NLR GROUP OF COMPANIES"
        description="Get help with LocSnap. Contact details, how to report a problem, and answers to common questions about GPS accuracy, offline use and photo storage."
      />
      <p className="mt-7 text-sm font-light leading-relaxed text-white/70 sm:text-base">
        Get in touch with the {APP_NAME} team for questions about the application, bug reports,
        feature requests or privacy enquiries.
      </p>

      {/* Contact */}
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2">
        <div className="bg-[#010101] p-7">
          <p className="text-[10px] font-light uppercase tracking-[0.2em] text-white/40">Email</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-2 block break-all text-sm font-light text-white/85 transition-colors duration-300 hover:text-white"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mt-3 text-xs font-light leading-relaxed text-white/40">
            App support, privacy questions and questions about the Terms.
          </p>
        </div>
        <div className="bg-[#010101] p-7">
          <p className="text-[10px] font-light uppercase tracking-[0.2em] text-white/40">Phone</p>
          <a
            href={CONTACT_PHONE_HREF}
            className="mt-2 block text-sm font-light text-white/85 transition-colors duration-300 hover:text-white"
          >
            {CONTACT_PHONE}
          </a>
          <p className="mt-3 text-xs font-light leading-relaxed text-white/40">
            Developed by {DEVELOPER}.
          </p>
        </div>
      </div>

      {/* What to include */}
      <div className="mt-14">
        <h2 className="text-xs font-light uppercase tracking-[0.2em] text-white/90">
          Reporting a problem
        </h2>
        <p className="mt-4 text-sm font-light leading-relaxed text-white/60">
          Including these details in your email helps us reproduce the issue faster:
        </p>
        <ul className="mt-4 space-y-2">
          {[
            'Device model and Android version',
            'The LocSnap version you are using',
            'What you were doing when the problem happened',
            'Whether location and camera permissions are granted',
            'A screenshot, if the issue is visible on screen',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-sm font-light leading-relaxed text-white/55">
              <span aria-hidden="true" className="text-white/25">
                —
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Common questions */}
      <div className="mt-16">
        <h2 className="text-xs font-light uppercase tracking-[0.2em] text-white/90">
          Common questions
        </h2>
        <div className="mt-8 space-y-10">
          {HELP_TOPICS.map((topic) => (
            <div key={topic.question}>
              <h3 className="font-garamond text-xl font-normal tracking-tight text-white sm:text-2xl">
                {topic.question}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-white/60">
                {topic.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal links */}
      <div className="mt-16 border-t border-white/[0.08] pt-10">
        <p className="text-sm font-light leading-relaxed text-white/60">
          For details on how {APP_NAME} handles your data, read the{' '}
          <Link to="/privacy" className="text-white/85 underline underline-offset-4 hover:text-white">
            Privacy Policy
          </Link>{' '}
          and the{' '}
          <Link to="/terms" className="text-white/85 underline underline-offset-4 hover:text-white">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
