import { sessionCookie, signSession, verifyGoogleCredential } from '../../server/auth.mjs';

function parseBody(request) {
  if (typeof request.body === 'object' && request.body !== null) return request.body;
  return Object.fromEntries(new URLSearchParams(request.body || ''));
}

function readCsrfCookie(request) {
  return (request.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('g_csrf_token='))?.slice('g_csrf_token='.length);
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).end();
  const body = parseBody(request);
  const csrfCookie = readCsrfCookie(request);
  if (!csrfCookie || !body.g_csrf_token || csrfCookie !== body.g_csrf_token) return response.status(403).end('Invalid sign-in request.');
  try {
    const user = await verifyGoogleCredential(body.credential);
    if (!user) throw new Error('Invalid Google credential.');
    response.setHeader('Set-Cookie', sessionCookie(request, signSession(user)));
    response.setHeader('Location', '/my-plans');
  } catch {
    response.setHeader('Location', '/login?error=google');
  }
  return response.status(303).end();
}
