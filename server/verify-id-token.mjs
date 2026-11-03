/* Verifying a Firebase ID token without firebase-admin's auth module.

   firebase-admin pulls in jwks-rsa, whose CommonJS code calls require() on
   jose, and jose 6 is ESM only. Node refuses that, so merely importing
   firebase-admin/auth throws at runtime - which is what had the admin
   endpoints failing while looking correctly written.

   These functions are ES modules, so they can import jose the way it expects
   to be imported. A Firebase ID token is an ordinary RS256 JWT signed by
   Google: fetch the public keys, check the signature, the issuer and the
   audience. That is all firebase-admin was doing here. */
import { createRemoteJWKSet, jwtVerify } from 'jose';

/** Google's public keys for Firebase ID tokens, in JWK form. */
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

/**
 * The project the token must have been issued for.
 *
 * A token is only proof of anything against the project that minted it;
 * without pinning this, a token from any Firebase project would pass.
 */
function projectId() {
  if (process.env.ENTITLEMENTS_PROJECT_ID) return process.env.ENTITLEMENTS_PROJECT_ID;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    return JSON.parse(raw).project_id ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns the token's claims, or throws with a status.
 *
 * Shaped like the decoded token firebase-admin returned, so callers that read
 * `email` and `email_verified` need no changes.
 */
export async function verifyIdToken(token) {
  const project = projectId();
  if (!project) {
    const error = new Error('The server has no Firebase project configured.');
    error.status = 500;
    throw error;
  }
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${project}`,
      audience: project
    });
    return payload;
  } catch {
    const error = new Error('Your session is invalid or expired.');
    error.status = 401;
    throw error;
  }
}
