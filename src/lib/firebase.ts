/* ==========================================================================
   Firebase Auth (Google) for the Geo Snap website.
   --------------------------------------------------------------------------
   FeeFlo authenticates Geo Snap users by verifying a Firebase ID token from
   the `geosanp---nlr` project and keys Pro on the Firebase uid. The app signs
   in the same way, so a web purchase unlocks Pro on the phone automatically.

   All values come from env (VITE_FIREBASE_*), never hard-coded. Create a Web
   app in the `geosanp---nlr` Firebase project and copy its config into the
   website environment (see .env.example).
   ========================================================================== */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

// Firebase web config for the Geo Snap project (geosnap-nlr). These values are
// public by design (they ship in the client bundle); env vars can override them
// per environment, but the baked-in defaults let the site work out of the box.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCoVhSYCIJF0XKxUJ-IXJgxQGs0XU7Fs3E',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'geosnap-nlr.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'geosnap-nlr',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'geosnap-nlr.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '282874241071',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:282874241071:web:753436ef6d357b237a26da',
};

/** True only when the minimum Firebase web config is present. */
export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId);

export const app: FirebaseApp | null = firebaseReady
  ? getApps()[0] ?? initializeApp(config)
  : null;

export const auth: Auth | null = app ? getAuth(app) : null;

export const googleProvider = new GoogleAuthProvider();
// Always let the user pick an account rather than silently reusing one.
googleProvider.setCustomParameters({ prompt: 'select_account' });
