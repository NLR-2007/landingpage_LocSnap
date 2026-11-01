import { sameOrigin, sessionCookie, signSession, verifyGoogleCredential } from '../../server/auth.mjs';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  if (!sameOrigin(request)) return response.status(403).json({ error: 'Invalid request origin.' });
  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const user = await verifyGoogleCredential(body?.credential);
    if (!user) return response.status(401).json({ error: 'Google sign-in could not be verified.' });
    response.setHeader('Set-Cookie', sessionCookie(request, signSession(user)));
    return response.status(200).json({ user });
  } catch (error) {
    if (error instanceof SyntaxError) return response.status(400).json({ error: 'Invalid request.' });
    return response.status(503).json({ error: 'Sign-in is temporarily unavailable.' });
  }
}
