# Geo Snap website work

Do not deploy this website unless the user explicitly changes the no-deploy instruction.

## FeeFlo integration questions for the user

The website is moving from Firebase Authentication to Google Identity Services. FeeFlo's existing `/api/v1/geo-snap/*` endpoints currently require a Firebase ID token. Before Pro checkout can be enabled again, please provide the FeeFlo backend repository path or API contract and confirm:

1. Can FeeFlo accept a server-to-server assertion signed by the Geo Snap website backend containing the verified Google `sub`? What issuer, audience, signing key, and expiry should it require?
2. Which endpoint creates a payment for a product code while binding the order to that `sub`? Which endpoint reads payment status and claims a verified purchase?
3. Where is the authoritative purchase record stored, and how will FeeFlo expose an active Pro entitlement to the website server? A browser return URL or client storage must not grant Pro.
4. Is a PostgreSQL database (or another persistent store) available for `users`, `last_login_at`, and `pro_entitlements`? If so, provide the connection method and secret names, not secret values in source control.
5. What exact success, pending, failed, and refunded states should the website display? Can previously started Firebase-bound payments still be reconciled manually?

Until those answers and the backend changes are available, leave checkout disabled and do not display an unverified Pro badge.
