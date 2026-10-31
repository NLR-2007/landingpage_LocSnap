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
    answer: `Captures stay on your device, saved under Pictures/GeoSnap and Movies/GeoSnap. ${APP_NAME} runs no cloud storage of its own and never uploads your photos or videos to its own servers. If you switch on the optional Google Drive backup for a folder, copies of new photos in that folder also go to your own Google Drive account.`,
  },
  {
    question: 'How do I back up a folder to Google Drive?',
    answer:
      'Open the folder, tap the Drive icon in the top bar, enter an event name and tap Create Drive folder. Approve the Google prompt, then choose App + Drive. New photos taken in that folder are copied to a GeoSnap folder created in your own Google Drive. Backup is off until you turn it on, and you turn it on one folder at a time. Existing photos, videos and anything in the Private Vault are never uploaded.',
  },
  {
    question: 'How do I stop Drive backup, or delete what was uploaded?',
    answer:
      'Open the folder and tap the Drive icon. Switch off "Save in app + upload to Drive" to stop uploading while keeping the connection, or tap Remove Drive connection to disconnect the folder completely. Copies already in your Google Drive stay there until you delete them, which you do in Google Drive itself. To withdraw the app’s access to your Google account entirely, go to myaccount.google.com/permissions, select Geo Snap - NLR and choose Remove access.',
  },
  {
    question: 'What can the app see in my Google Drive?',
    answer:
      'Only the folder it created for you. Geo Snap - NLR requests Google’s drive.file permission, which grants access solely to files and folders the application itself creates. It cannot see, open or change any other file in your Google Drive. Photos travel directly from your device to Google over an encrypted connection and are never sent to a server belonging to NLR GROUP OF COMPANIES.',
  },
  {
    question: 'A photo did not upload to Drive',
    answer:
      'Uploads need a network connection and wait on the device until one is available, so a photo captured offline uploads later by itself. Open the folder, tap the Drive icon and check the number of photos waiting; tap Retry uploads to prompt it. The photo on your device is never affected by an upload problem. If your Google storage is full, free some space and the queue resumes.',
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
    <PageShell title="Support" eyebrow="Help with Geo Snap - NLR" wide>
      <Seo
        title="Geo Snap - NLR Support - Contact NLR GROUP OF COMPANIES"
        description="Get help with Geo Snap - NLR. Contact details, how to report a problem, and answers to common questions about GPS accuracy, offline use and photo storage."
      />
      <p className="mt-7 max-w-3xl text-sm font-normal leading-relaxed text-ink/80 sm:text-base">
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
      <div className="mt-14 max-w-3xl">
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
        <div className="mt-8 grid gap-x-12 gap-y-10 lg:grid-cols-2">
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
        <p className="max-w-3xl text-sm font-normal leading-relaxed text-ink/70">
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
