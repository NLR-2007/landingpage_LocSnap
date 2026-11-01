import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign as signRsa } from 'node:crypto';
import { signSession, verifySession, verifyGoogleCredential, sameOrigin, sessionCookie, clearSessionCookies } from '../server/auth.mjs';
import googleHandler from '../api/auth/google.mjs';
import sessionHandler from '../api/auth/session.mjs';
import logoutHandler from '../api/auth/logout.mjs';
import redirectHandler from '../api/auth/google-redirect.mjs';

const now = Date.now();
process.env.SESSION_SECRET = 'testing-only-session-secret-with-more-than-32-characters';
process.env.VITE_GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';

test('signed session persists, expires, and rejects tampering', () => {
  const user = { sub: 'stable-google-sub', email: 'person@example.com', name: 'Person', picture: null };
  const token = signSession(user, now);
  assert.deepEqual(verifySession(token, now + 1000), user);
  assert.equal(verifySession(token, now + 25 * 60 * 60 * 1000), null);
  assert.equal(verifySession(`${token.slice(0, -1)}x`, now), null);
  assert.equal(verifySession('broken', now), null);
});

test('origin and cookie attributes protect state-changing endpoints', () => {
  const request = { headers: { origin: 'https://locsnapnlr.vercel.app', host: 'locsnapnlr.vercel.app' } };
  assert.equal(sameOrigin(request), true);
  assert.match(sessionCookie(request, 'value'), /HttpOnly; SameSite=Lax; Max-Age=86400; Secure/);
  assert.match(clearSessionCookies(request)[0], /Max-Age=0; Secure/);
  assert.equal(sameOrigin({ headers: { ...request.headers, origin: 'https://evil.example' } }), false);
});

test('Google token needs a valid signature, audience, issuer and expiry', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', use: 'sig', alg: 'RS256' };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ keys: [jwk] }) });
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const make = (changes = {}) => {
    const header = encode({ alg: 'RS256', kid: 'test-key' });
    const payload = encode({ iss: 'https://accounts.google.com', aud: process.env.VITE_GOOGLE_CLIENT_ID, sub: 'google-sub', email: 'person@example.com', email_verified: true, name: 'Person', picture: 'https://example.com/p.png', iat: Math.floor(now / 1000), exp: Math.floor(now / 1000) + 3600, ...changes });
    const data = `${header}.${payload}`;
    return `${data}.${signRsa('RSA-SHA256', Buffer.from(data), privateKey).toString('base64url')}`;
  };
  try {
    assert.equal((await verifyGoogleCredential(make(), now))?.sub, 'google-sub');
    assert.equal(await verifyGoogleCredential(make({ aud: 'wrong-client' }), now), null);
    assert.equal(await verifyGoogleCredential(make({ iss: 'https://evil.example' }), now), null);
    assert.equal(await verifyGoogleCredential(make({ exp: Math.floor(now / 1000) - 1 }), now), null);
    const signed = make();
    const pieces = signed.split('.');
    pieces[2] = `${pieces[2][0] === 'A' ? 'B' : 'A'}${pieces[2].slice(1)}`;
    assert.equal(await verifyGoogleCredential(pieces.join('.'), now), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

function response() {
  return {
    code: 200, headers: {}, body: null,
    setHeader(name, value) { this.headers[name] = value; return this; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    end(body) { this.body = body; return this; },
  };
}

test('API rejects invalid sign-in and keeps unauthenticated session empty', async () => {
  const headers = { host: 'locsnapnlr.vercel.app', origin: 'https://locsnapnlr.vercel.app' };
  const bad = response();
  await googleHandler({ method: 'POST', headers, body: { credential: 'invalid' } }, bad);
  assert.equal(bad.code, 401);
  assert.equal(bad.headers['Set-Cookie'], undefined);

  const session = response();
  sessionHandler({ method: 'GET', headers }, session);
  assert.equal(session.code, 200);
  assert.equal(session.body.user, null);
  assert.equal(session.body.entitlement, null);

  const csrf = response();
  await redirectHandler({ method: 'POST', headers, body: { credential: 'invalid' } }, csrf);
  assert.equal(csrf.code, 403);

  const logout = response();
  logoutHandler({ method: 'POST', headers }, logout);
  assert.equal(logout.code, 200);
  assert.equal(logout.headers['Set-Cookie'].length, 2);
});
