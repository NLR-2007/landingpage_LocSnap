# Geo Snap website authentication setup

The website now uses Google's official GIS button. The browser sends a Google ID token to a same-origin Vercel Function. The function verifies the token's signature, issuer, audience and expiry against Google's public keys, then issues a signed, HTTP-only, one-day session cookie. The Google `sub` is the account identifier. The OAuth client secret is not used or required.

## Configuration before release

1. In Google Cloud project `geo-snap-nlr-513217`, check that the public Web Client ID in `.env.example` matches the **Client ID** shown in Google Auth Platform. Set its Authorized JavaScript origins to `https://locsnapnlr.vercel.app` and the **exact origin shown in your local browser address bar**. Standard Vite is `http://localhost:5173`; `http://127.0.0.1:5173` is a separate origin and must be registered separately if used.
2. Set Authorized redirect URIs to `https://locsnapnlr.vercel.app/api/auth/google-redirect` and the corresponding local URI, normally `http://localhost:5173/api/auth/google-redirect`. iOS browsers use this redirect flow; other browsers use the GIS callback flow.
3. In Vercel project settings, add `VITE_GOOGLE_CLIENT_ID` with that public Web Client ID for Production and any Preview origins that are also registered in Google Cloud. Add `SESSION_SECRET` as a private server environment variable with at least 32 random characters. Do not prefix the secret with `VITE_`. Both environment values must be present before a release build. The OAuth client secret must not be added to the website.
4. For local testing, put the same two variables in ignored `.env.local`, then run `npm run dev`. The Vite development server now serves the `/api/auth/*` handlers locally. Restart an already running Vite process after changing `vite.config.ts` or environment values. Register the exact origin it reports; Google treats different ports and `localhost` versus `127.0.0.1` as different origins.
5. Run `npm test` and `npm run build`. When function tooling is available, also run `vercel build` locally before any release. No deployment is part of this work.

## Required browser checks

- On desktop Chrome and a mobile browser, use the Google button and confirm the Google account chooser shows Geo Snap branding and no Firebase domain.
- Confirm that My Account shows the verified name, email and profile photo. Reload and verify the one-day session persists. Sign out and verify the account disappears on reload.
- Try a blocked network request or invalid ID token and confirm sign-in fails without a session. Check that cross-origin POSTs and iOS redirect POSTs without matching `g_csrf_token` are rejected.
- Confirm that Pro checkout remains disabled and no Pro badge appears without a trusted payment record.

## Payment and database handoff

FeeFlo currently requires Firebase ID tokens for payment creation, status, claims and account reads. Those calls are intentionally removed from the website. Checkout is disabled until FeeFlo can verify a server-side assertion tied to the Google `sub`, persist verified payment records, and expose an authoritative entitlement to the website server. `db/schema.sql` is a proposed PostgreSQL schema for users, login timestamps and Pro membership; it has not been applied to a database. The questions needed to finish this work are in `AGENTS.md`.
