/* Admin gate: a request is admin only when it carries a valid Firebase ID
   token whose verified email is in the ADMIN_EMAILS allowlist. */
import { adminAuth } from './firebase-admin.mjs';

/** The owner is the default, so the panel works without deployment config. */
const DEFAULT_ADMINS = 'nlreddy.ceo@gmail.com';

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || DEFAULT_ADMINS)
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function requireAdmin(request) {
  const header = request.headers.authorization || request.headers.Authorization || '';
  const match = /^Bearer (\S+)$/.exec(header);
  if (!match) throw fail(401, 'Sign in required.');
  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(match[1]);
  } catch {
    throw fail(401, 'Your session is invalid or expired.');
  }
  const email = (decoded.email || '').toLowerCase();
  if (!decoded.email_verified || !email || !adminEmails().includes(email)) {
    throw fail(403, 'This account is not allowed in the admin panel.');
  }
  return decoded;
}
