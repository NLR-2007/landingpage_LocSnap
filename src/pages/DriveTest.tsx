/* Can this website read the photos the Android app put in Drive?

   The app asks Google for the `drive.file` scope, which grants access only to
   files "the app" created. Whether this website counts as the same app - both
   now live in the geosnap-nlr project - decides whether desktop report writing
   is a few days of work or needs a different design entirely. It is cheaper to
   ask Google than to argue about the documentation.

   A separate GoogleAuthProvider is used deliberately. Adding the Drive scope to
   the shared one would start asking every visitor for access to their Drive
   just to sign in. */
import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import { auth } from '../lib/firebase';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

type Found = { id: string; name: string; mimeType: string; parents?: string[] };

export default function DriveTest() {
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function say(line: string) {
    setLog((previous) => [...previous, line]);
  }

  async function run() {
    if (!auth) { say('Firebase is not configured on this site.'); return; }
    setBusy(true);
    setLog([]);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope(DRIVE_SCOPE);
      provider.setCustomParameters({ prompt: 'consent' });

      say('Asking Google for Drive access…');
      const result = await signInWithPopup(auth, provider);
      const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
      if (!token) { say('No Drive access token was returned.'); return; }
      say('Got a Drive access token.');

      // Everything this website is allowed to see. Under drive.file that is
      // exactly the set of files "this app" created - which is the question.
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files' +
          '?q=trashed=false&fields=files(id,name,mimeType,parents)&pageSize=100',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const body = await response.json();
      if (!response.ok) {
        say(`Drive refused the request (${response.status}): ${body?.error?.message ?? 'unknown'}`);
        return;
      }

      const files: Found[] = body.files ?? [];
      say(`Drive returned ${files.length} item(s) this site may read.`);

      const folders = files.filter((f) => f.mimeType === 'application/vnd.google-apps.folder');
      const photos = files.filter((f) => f.mimeType.startsWith('image/'));
      folders.forEach((f) => say(`  folder: ${f.name}  (${f.id})`));
      photos.slice(0, 10).forEach((f) => say(`  photo:  ${f.name}`));

      say('');
      if (photos.length > 0 || folders.some((f) => f.name === 'GeoSnap')) {
        say('RESULT: the website CAN see what the app created. Plan works as drawn.');
      } else {
        say('RESULT: the website sees nothing from the app. We need Google Picker.');
      }
    } catch (cause) {
      say(`Failed: ${(cause as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="Drive access test" eyebrow="Internal" wide>
      <Seo title="Drive test" description="Internal check." noindex />
      <p className="mt-6 max-w-2xl text-sm text-ink/70">
        Checks whether this website can read the photos the Geo Snap app backed up to your Drive.
        Nothing is uploaded, changed or deleted — it only lists what Google is willing to show.
      </p>
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className="btn-brand mt-6 rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] disabled:opacity-50"
      >
        {busy ? 'Checking…' : 'Connect Drive and check'}
      </button>

      {log.length > 0 && (
        <pre className="mt-8 max-w-3xl overflow-x-auto rounded-2xl border border-line bg-card p-5 text-xs leading-relaxed text-ink/80">
          {log.join('\n')}
        </pre>
      )}
    </PageShell>
  );
}
