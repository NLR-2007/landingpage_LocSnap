/* Connecting a teacher's Drive, and finishing that connection.

   Both halves live here because they are one conversation: GET sends the
   teacher to Google, and Google sends them back to the same path with a code.
   Splitting them across two files would mean two redirect URIs to register
   and keep in step.

   What is asked for is `drive.file` and nothing wider - permission to make
   files and folders of our own, never to read what else is in somebody's
   Drive. That is also what keeps this out of Google's restricted-scope
   review, which would otherwise mean a paid security assessment every year.

   Only a teacher ever comes through here. Students authorise nothing, which
   is the point: there is no consent screen in a student's way, and no
   permission on a student's account to misuse later. */
import {
  DRIVE_CREDENTIALS, encryptSecret, exchangeAuthCode, requireUser, fail
} from '../../server/collections.mjs';

const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';

function redirectUri(request) {
  // Must match a redirect URI registered on the OAuth client, exactly.
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  const proto = request.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}/api/collections/connect`;
}

/** A page, because Google lands a browser here rather than a fetch(). */
function page({ title, message, ok }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
 :root{color-scheme:light}
 body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F7F5EC;
      color:#1B1E22;font:16px/1.6 'Geist',-apple-system,BlinkMacSystemFont,sans-serif}
 .card{max-width:30rem;padding:40px;text-align:center}
 .mark{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;
       margin:0 auto 20px;font-size:26px;color:#fff;background:${ok ? '#1F8A54' : '#B3261E'}}
 h1{font-size:1.4rem;margin:0 0 10px;letter-spacing:-.02em}
 p{margin:0;color:rgba(27,30,34,.7)}
 a{display:inline-block;margin-top:26px;padding:12px 26px;border-radius:999px;
   background:linear-gradient(180deg,#12A0B8,#0E7C91);color:#fff;text-decoration:none;
   font-weight:600;font-size:.85rem;text-transform:uppercase;letter-spacing:.14em}
</style></head>
<body><div class="card">
 <div class="mark">${ok ? '&check;' : '!'}</div>
 <h1>${title}</h1><p>${message}</p>
 <a href="/collections">Back to collections</a>
</div></body></html>`;
}

export default async function handler(request, response) {
  const code = request.query?.code;
  const error = request.query?.error;

  /* ---- coming back from Google ---- */
  if (code || error) {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');

    if (error) {
      return response.status(200).send(page({
        ok: false,
        title: 'Drive was not connected',
        message: 'You can try again whenever you are ready. Nothing was changed.'
      }));
    }

    try {
      /* `state` carries who asked, signed as a Firebase ID token, so the
         credential cannot be attached to somebody else's account by anybody
         who manages to replay this redirect. */
      const user = await (async () => {
        const { verifyIdToken } = await import('../../server/verify-id-token.mjs');
        const claims = await verifyIdToken(String(request.query?.state ?? ''));
        return { uid: claims.sub, email: claims.email ?? null };
      })();

      const granted = await exchangeAuthCode(code, redirectUri(request));
      if (!granted.refresh_token) {
        /* Google only returns a refresh token on a fresh consent. Without one
           the collection would work until the access token aged out and then
           fail in the middle of a class, so it is refused while the teacher
           is still looking at a screen and can do something about it. */
        return response.status(200).send(page({
          ok: false,
          title: 'Google did not grant lasting access',
          message: 'Remove Geo Snap at myaccount.google.com/permissions, then connect again.'
        }));
      }

      const { adminDb } = await import('../../server/firebase-admin.mjs');
      await adminDb().collection(DRIVE_CREDENTIALS).doc(user.uid).set({
        refreshToken: encryptSecret(granted.refresh_token),
        email: user.email,
        connectedAt: new Date().toISOString()
      });

      return response.status(200).send(page({
        ok: true,
        title: 'Drive connected',
        message: 'You can now create collections. Photos your students submit '
          + 'will land in your Drive, owned by you.'
      }));
    } catch (cause) {
      return response.status(200).send(page({
        ok: false,
        title: 'That did not work',
        message: cause?.message || 'Please try connecting again.'
      }));
    }
  }

  /* ---- starting out ---- */
  try {
    const user = await requireUser(request);
    const header = request.headers.authorization || '';
    const idToken = header.slice(7).trim();

    const url = new URL(AUTH);
    url.searchParams.set('client_id', process.env.GOOGLE_OAUTH_CLIENT_ID ?? '');
    url.searchParams.set('redirect_uri', redirectUri(request));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', SCOPE);
    // Offline, and forced consent: without both, a teacher who has authorised
    // before comes back with no refresh token and the collection dies quietly
    // an hour later.
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('include_granted_scopes', 'true');
    url.searchParams.set('login_hint', user.email ?? '');
    url.searchParams.set('state', idToken);

    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({ authorizeUrl: url.toString() });
  } catch (cause) {
    return fail(response, cause);
  }
}
