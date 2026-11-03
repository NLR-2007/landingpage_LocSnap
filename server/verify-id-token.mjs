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
 * The project whose sign-in minted the token.
 *
 * A token is only proof of anything against the project that issued it;
 * without pinning this, a token from any Firebase project would verify.
 *
 * Deliberately not ENTITLEMENTS_PROJECT_ID. That names where the paid-plan
 * records are kept, which is allowed to be a different project from the one
 * people sign in to - and if it ever is, checking tokens against it would
 * reject every valid administrator.
 */
function authProjectId() {
  if (process.env.FIREBASE_AUTH_PROJECT_ID) return process.env.FIREBASE_AUTH_PROJECT_ID;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    try {
      const id = JSON.parse(raw).project_id;
      if (id) return id;
    } catch {
      // Falls through to the known project below.
    }
  }
  // The project the site and the app both sign in to.
  return 'geosnap-nlr';
}

/**
 * Returns the token's claims, or throws with a status.
 *
 * Shaped like the decoded token firebase-admin returned, so callers that read
 * `email` and `email_verified` need no changes.
 */
export async function verifyIdToken(token) {
  const project = authProjectId();
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
