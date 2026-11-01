/* Admin overview: user + Pro counts and the Pro member list.
   Reads the entitlement collection FeeFlo writes (feeflo_geo_snap_users) and
   the Firebase Auth user count. Admin-only (ADMIN_EMAILS allowlist). */
import { adminAuth, adminDb, adminConfigured } from '../../server/firebase-admin.mjs';
import { requireAdmin } from '../../server/admin-auth.mjs';

function toIso(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (typeof value._seconds === 'number') return new Date(value._seconds * 1000).toISOString();
  return null;
}

function toMillis(value) {
  if (!value) return null;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value._seconds === 'number') return value._seconds * 1000;
  return null;
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  if (!adminConfigured()) return response.status(503).json({ error: 'Admin panel is not configured on the server.' });

  try {
    await requireAdmin(request);
    const db = adminDb();
    const now = Date.now();

    const snapshot = await db.collection('feeflo_geo_snap_users').get();
    let proActive = 0;
    let proExpired = 0;
    const users = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const expiresMs = toMillis(data.planExpiresAt);
      const isPro = data.plan === 'pro';
      const active = isPro && expiresMs !== null && expiresMs > now;
      if (isPro) {
        if (active) proActive += 1;
        else proExpired += 1;
      }
      users.push({
        uid: doc.id,
        email: data.email ?? null,
        displayName: data.displayName ?? null,
        plan: data.plan ?? 'free',
        planTerm: data.planTerm ?? null,
        startedAt: toIso(data.planStartedAt),
        expiresAt: toIso(data.planExpiresAt),
        lastPaymentId: data.lastPaymentId ?? null,
        active,
      });
    });

    // Total accounts = everyone who has signed in (free + pro).
    let totalUsers = users.length;
    try {
      let count = 0;
      let pageToken;
      do {
        const page = await adminAuth().listUsers(1000, pageToken);
        count += page.users.length;
        pageToken = page.pageToken;
      } while (pageToken);
      totalUsers = count;
    } catch {
      // listUsers may be unavailable; fall back to known entitlement docs.
    }

    const free = Math.max(0, totalUsers - proActive);
    users.sort((a, b) => (b.expiresAt || '').localeCompare(a.expiresAt || ''));

    return response.status(200).json({
      totals: { users: totalUsers, proActive, proExpired, free },
      users,
      generatedAt: new Date(now).toISOString(),
    });
  } catch (error) {
    return response.status(error.status || 500).json({ error: error.message || 'Admin request failed.' });
  }
}
