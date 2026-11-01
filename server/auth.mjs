import { createHmac, createPublicKey, timingSafeEqual, verify as verifySignature } from 'node:crypto';

const GOOGLE_KEYS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const SESSION_COOKIE = '__Host-geosnap_session';
const LOCAL_COOKIE = 'geosnap_session';
const SESSION_SECONDS = 24 * 60 * 60;
let cachedKeys = null;
let keysExpireAt = 0;

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const decode = (value) => JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.');
  return value;
}

export function publicUser(payload) {
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name || null,
    picture: payload.picture || null,
  };
}

export function signSession(user, now = Date.now()) {
  const payload = { ...publicUser(user), iat: Math.floor(now / 1000), exp: Math.floor(now / 1000) + SESSION_SECONDS };
  const data = encode(payload);
  const mac = createHmac('sha256', secret()).update(data).digest('base64url');
  return `${data}.${mac}`;
}

export function verifySession(token, now = Date.now()) {
  if (!token || token.length > 8192) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = createHmac('sha256', secret()).update(parts[0]).digest();
  let actual;
  try { actual = Buffer.from(parts[1], 'base64url'); } catch { return null; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const payload = decode(parts[0]);
    const seconds = Math.floor(now / 1000);
    if (!payload.sub || !Number.isInteger(payload.iat) || !Number.isInteger(payload.exp)) return null;
    if (payload.iat > seconds + 60 || payload.exp <= seconds || payload.exp - payload.iat > SESSION_SECONDS) return null;
    return publicUser(payload);
  } catch { return null; }
}

function isLocal(request) {
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(request.headers.host || '');
}

export function sessionCookie(request, value) {
  const local = isLocal(request);
  const name = local ? LOCAL_COOKIE : SESSION_COOKIE;
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${local ? '' : '; Secure'}`;
}

export function clearSessionCookies(request) {
  const secure = isLocal(request) ? '' : '; Secure';
  return [SESSION_COOKIE, LOCAL_COOKIE].map((name) => `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

export function readSession(request) {
  const cookies = Object.fromEntries((request.headers.cookie || '').split(';').map((part) => {
    const index = part.indexOf('=');
    return index < 0 ? ['', ''] : [part.slice(0, index).trim(), part.slice(index + 1)];
  }));
  return verifySession(cookies[SESSION_COOKIE] || cookies[LOCAL_COOKIE]);
}

export function sameOrigin(request) {
  try {
    const origin = new URL(request.headers.origin);
    const expectedProtocol = isLocal(request) ? 'http:' : 'https:';
    return origin.protocol === expectedProtocol && origin.host === request.headers.host;
  } catch { return false; }
}

async function googleKeys() {
  if (cachedKeys && Date.now() < keysExpireAt) return cachedKeys;
  const response = await fetch(GOOGLE_KEYS_URL, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('Google verification keys are unavailable.');
  const body = await response.json();
  if (!Array.isArray(body.keys)) throw new Error('Invalid Google verification keys.');
  cachedKeys = body.keys;
  keysExpireAt = Date.now() + 60 * 60 * 1000;
  return cachedKeys;
}

export async function verifyGoogleCredential(credential, now = Date.now()) {
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('VITE_GOOGLE_CLIENT_ID is missing.');
  if (typeof credential !== 'string' || credential.length > 16384) return null;
  const parts = credential.split('.');
  if (parts.length !== 3) return null;
  let header;
  let payload;
  try {
    header = decode(parts[0]);
    payload = decode(parts[1]);
  } catch { return null; }
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') return null;
  // Key retrieval is an infrastructure failure, not proof that a token is invalid.
  const keys = await googleKeys();
  try {
    const key = keys.find((item) => item.kid === header.kid && item.kty === 'RSA' && item.use === 'sig');
    if (!key) return null;
    const valid = verifySignature('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key, format: 'jwk' }), Buffer.from(parts[2], 'base64url'));
    const seconds = Math.floor(now / 1000);
    if (!valid || !['https://accounts.google.com', 'accounts.google.com'].includes(payload.iss)) return null;
    if (payload.aud !== clientId || !payload.sub || !Number.isInteger(payload.exp) || payload.exp <= seconds) return null;
    if (!Number.isInteger(payload.iat) || payload.iat > seconds + 60) return null;
    if (payload.email_verified !== true || typeof payload.email !== 'string') return null;
    return publicUser(payload);
  } catch { return null; }
}
