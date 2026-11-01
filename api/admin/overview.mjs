/* Admin overview: user counts, the Pro member list, payments and renewals.

   Two sources, because the data genuinely lives in two places. Who has signed
   in is Firebase Auth in this project. Who has paid, when it expires and what
   they were charged is FeeFlo's Firestore, in FeeFlo's own project - so that
   half is asked for rather than read. Reading it directly would mean
   cross-project credentials in a second codebase and two services that could
   disagree about who is a subscriber.

   The caller's Geo Snap token is passed through; FeeFlo checks its own admin
   allowlist as well as the one checked here. */
import { adminAuth, adminConfigured } from '../../server/firebase-admin.mjs';
import { requireAdmin } from '../../server/admin-auth.mjs';

const FEEFLO_BASE = (process.env.FEEFLO_BASE_URL ?? 'https://feeflo.web.app').replace(/\/+$/, '');

/** Everyone who has ever signed in, which is more than everyone who has paid. */
async function countSignedInUsers() {
  if (!adminConfigured()) return null;
  try {
    let count = 0;
    let pageToken;
    do {
      const page = await adminAuth().listUsers(1000, pageToken);
      count += page.users.length;
      pageToken = page.pageToken;
    } while (pageToken);
    return count;
  } catch {
    // listUsers needs a service account with the right role; without it the
    // entitlement rows are still worth showing.
    return null;
  }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });

  const authorization = request.headers.authorization;
  if (!authorization) {
    return response.status(401).json({ error: 'Sign in with an admin Google account to continue.' });
  }

  try {
    if (adminConfigured()) await requireAdmin(request);

    const upstream = await fetch(`${FEEFLO_BASE}/api/v1/geo-snap/admin/overview`, {
      headers: { Authorization: authorization },
      cache: 'no-store'
    });
    const body = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return response.status(upstream.status).json({
        error: body?.error?.message ?? body?.error ?? `FeeFlo request failed (${upstream.status}).`
      });
    }

    const data = body?.data ?? body ?? {};
    const signedIn = await countSignedInUsers();
    const totals = { ...data.totals };
    if (signedIn !== null) {
      totals.users = signedIn;
      totals.free = Math.max(0, signedIn - (totals.proActive ?? 0) - (totals.proExpired ?? 0));
    }

    return response.status(200).json({ ...data, totals });
  } catch (error) {
    const status = error.status || 500;
    return response.status(status).json({ error: error.message || 'Admin request failed.' });
  }
}
