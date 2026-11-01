import { clearSessionCookies, sameOrigin } from '../../server/auth.mjs';

export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  if (!sameOrigin(request)) return response.status(403).json({ error: 'Invalid request origin.' });
  response.setHeader('Set-Cookie', clearSessionCookies(request));
  return response.status(200).json({ ok: true });
}
