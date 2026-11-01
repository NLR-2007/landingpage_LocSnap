/* Grants or withdraws lifetime Pro for one account.

   Forwarded to FeeFlo, which owns the entitlement record the app actually
   reads. Writing it here instead would produce a grant the app never sees:
   the app asks FeeFlo whether someone has Pro, not this project.

   FeeFlo checks its own admin allowlist and records who granted what. */
const FEEFLO_BASE = (process.env.FEEFLO_BASE_URL ?? 'https://feeflo.web.app').replace(/\/+$/, '');

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });

  const authorization = request.headers.authorization;
  if (!authorization) {
    return response.status(401).json({ error: 'Sign in with an admin Google account to continue.' });
  }

  try {
    // Loaded on demand: a failure to import must not take the endpoint down,
    // and FeeFlo checks the caller and the allowlist itself.
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const { requireAdmin } = await import('../../server/admin-auth.mjs');
        await requireAdmin(request);
      } catch (cause) {
        if (cause?.status) throw cause;
      }
    }

    const payload = typeof request.body === 'string' ? JSON.parse(request.body) : (request.body ?? {});
    if (!payload.uid) return response.status(400).json({ error: 'A user id is required.' });

    const upstream = await fetch(`${FEEFLO_BASE}/api/v1/geo-snap/admin/grant`, {
      method: 'POST',
      headers: { Authorization: authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: payload.uid,
        action: payload.action === 'revoke' ? 'revoke' : 'lifetime',
        note: payload.note ?? ''
      })
    });
    const body = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return response.status(upstream.status).json({
        error: body?.error?.message ?? body?.error ?? `FeeFlo request failed (${upstream.status}).`
      });
    }
    return response.status(200).json(body?.data ?? body);
  } catch (error) {
    return response.status(error.status || 500).json({ error: error.message || 'Grant failed.' });
  }
}
