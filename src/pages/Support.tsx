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
      'Check that location permission is granted to Geo Snap - NLR and that device location services are switched on. An open sky and a few seconds for the first fix both help accuracy.',
  },
  {
    question: 'Does Geo Snap - NLR work without internet?',
    answer:
      'The core camera, GPS, folder organization and export functionality is designed to work locally on your device. Detailed address and map availability may depend on your device and the map or geocoding data available to it.',
  },
  {
    question: 'Where are my photos and videos stored?',
    answer: `Captures stay on your device, saved under Pictures/GeoSnap and Movies/GeoSnap. ${APP_NAME} does not provide its own cloud storage and does not upload your photos or videos to its own servers for core functionality.`,
  },
  {
    question: 'How do I export a folder?',
    answer:
      'Open the folder or select captures, choose export, and Geo Snap - NLR creates a ZIP archive or a PDF document on your device. No server upload is involved.',
  },
  {
    question: 'How does the Private Vault work?',
    answer:
      'Captures you move into the Private Vault are encrypted on your device, with the key held in the Android Keystore. The vault auto-locks when the app leaves the screen, and you can choose the auto-lock delay. Because the key lives in the Keystore, vault contents do not survive an uninstall — move anything you want to keep out of the vault first.',
  },
  {
    question: 'I deleted a capture by mistake',
    answer:
      'Deleted captures go to the recycle bin, where they can be restored. Only emptying the recycle bin permanently removes them.',
  },
  {
    question: 'I lost photos after uninstalling',
    answer:
      'Deleting the application may remove application-specific locally stored data, including Private Vault contents. Please keep your own backups of important photos, videos and exported files.',
  },
];

export default function Support() {
  return (
    <PageShell title="Support" eyebrow="Help with Geo Snap - NLR">
      <Seo
        title="Geo Snap - NLR Support - Contact NLR GROUP OF COMPANIES"
        description="Get help with Geo Snap - NLR. Contact details, how to report a problem, and answers to common questions about GPS accuracy, offline use and photo storage."
      />
      <p className="mt-7 text-sm font-normal leading-relaxed text-ink/80 sm:text-base">
        Get in touch with the {APP_NAME} team for questions about the application, bug reports,
        feature requests or privacy enquiries.
      </p>

      {/* Contact */}
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
        <div className="bg-card p-7">
          <p className="text-[10px] font-light uppercase tracking-[0.2em] text-ink/50">Email</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-2 block break-all text-sm font-light text-ink/80 transition-colors duration-300 hover:text-ink"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mt-3 text-xs font-normal leading-relaxed text-ink/50">
            App support, privacy questions and questions about the Terms.
          </p>
        </div>
        <div className="bg-card p-7">
          <p className="text-[10px] font-light uppercase tracking-[0.2em] text-ink/50">Phone</p>
          <a
            href={CONTACT_PHONE_HREF}
            className="mt-2 block text-sm font-light text-ink/80 transition-colors duration-300 hover:text-ink"
          >
            {CONTACT_PHONE}
          </a>
          <p className="mt-3 text-xs font-normal leading-relaxed text-ink/50">
            Developed by {DEVELOPER}.
          </p>
        </div>
      </div>

      {/* What to include */}
      <div className="mt-14">
        <h2 className="text-xs font-light uppercase tracking-[0.2em] text-ink/80">
          Reporting a problem
        </h2>
        <p className="mt-4 text-sm font-normal leading-relaxed text-ink/70">
          Including these details in your email helps us reproduce the issue faster:
        </p>
        <ul className="mt-4 space-y-2">
          {[
            'Device model and Android version',
            'The Geo Snap - NLR version you are using',
            'What you were doing when the problem happened',
            'Whether location and camera permissions are granted',
            'A screenshot, if the issue is visible on screen',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-sm font-normal leading-relaxed text-ink/65">
              <span aria-hidden="true" className="text-ink/40">
                —
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Common questions */}
      <div className="mt-16">
        <h2 className="text-xs font-light uppercase tracking-[0.2em] text-ink/80">
          Common questions
        </h2>
        <div className="mt-8 space-y-10">
          {HELP_TOPICS.map((topic) => (
            <div key={topic.question}>
              <h3 className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
                {topic.question}
              </h3>
              <p className="mt-3 text-sm font-normal leading-relaxed text-ink/70">
                {topic.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal links */}
      <div className="mt-16 border-t border-line pt-10">
        <p className="text-sm font-normal leading-relaxed text-ink/70">
          For details on how {APP_NAME} handles your data, read the{' '}
          <Link to="/privacy" className="text-ink/80 underline underline-offset-4 hover:text-ink">
            Privacy Policy
          </Link>{' '}
          and the{' '}
          <Link to="/terms" className="text-ink/80 underline underline-offset-4 hover:text-ink">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
