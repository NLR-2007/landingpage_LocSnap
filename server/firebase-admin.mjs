/* ==========================================================================
   Firebase Admin SDK for the website's server (Vercel) functions.
   --------------------------------------------------------------------------
   Used only by the admin panel API: verify an admin's Firebase ID token and
   read the Pro entitlement collections that FeeFlo writes. Credentials come
   from FIREBASE_SERVICE_ACCOUNT (a one-line JSON service-account key) set as a
   private Vercel env var — never shipped to the browser.
   ========================================================================== */
import { cert, applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let cached;

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON.');
  }
}

export function adminConfigured() {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);
}

export function adminApp() {
  if (cached) return cached;
  const existing = getApps().find((app) => app.name === 'website-admin');
  if (existing) {
    cached = existing;
    return cached;
  }
  const sa = serviceAccount();
  cached = initializeApp(
    {
      credential: sa ? cert(sa) : applicationDefault(),
      // Entitlements live in the project FeeFlo writes to. Default to the
      // service account's own project (geosnap-nlr), override if separated.
      projectId: process.env.ENTITLEMENTS_PROJECT_ID || sa?.project_id,
    },
    'website-admin',
  );
  return cached;
}

/* adminAuth is gone on purpose: importing firebase-admin/auth drags in
   jwks-rsa, which require()s the ESM-only jose and throws before any of
   this runs. Token verification lives in verify-id-token.mjs. */
export const adminDb = () => getFirestore(adminApp());
