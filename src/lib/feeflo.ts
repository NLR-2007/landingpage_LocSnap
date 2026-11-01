/* ==========================================================================
   FeeFlo Geo Snap API client (browser → FeeFlo, Firebase ID token as Bearer).
   --------------------------------------------------------------------------
   FeeFlo hosts the dedicated Geo Snap endpoints. The browser calls them
   directly with the signed-in user's Firebase ID token; FeeFlo verifies it,
   creates the fixed-price payment, and on a verified claim writes the Pro
   entitlement to Firestore. The website never sees or sets a price.

   FeeFlo must allow this site's origin in its CORS_ORIGINS. Base URL comes
   from VITE_FEEFLO_BASE_URL (the FeeFlo checkout origin).
   ========================================================================== */

export type GeoPlan = {
  uid: string;
  email: string | null;
  displayName: string | null;
  plan: 'free' | 'pro';
  planTerm: 'monthly' | 'yearly' | null;
  planStartedAt: string | null;
  planExpiresAt: string | null;
  lastPaymentId: string | null;
};

export type PaymentStatus = {
  paymentId: string;
  status: string; // QUEUED | ACTIVE | PROCESSING | MANUAL_REVIEW | UNCONFIRMED | SUCCESS | ...
  verified: boolean;
  productCode?: string;
  amountDisplay?: string;
};

// Deployed FeeFlo origin (Firebase Hosting). Env can override per environment.
// Trailing slash stripped so `${BASE}/api/...` never doubles the slash.
export const FEEFLO_BASE: string = (import.meta.env.VITE_FEEFLO_BASE_URL ?? 'https://feeflo.web.app').replace(/\/+$/, '');
export const feefloReady = Boolean(FEEFLO_BASE);

async function call<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  if (!FEEFLO_BASE) throw new Error('Payment service is not configured.');
  const response = await fetch(`${FEEFLO_BASE}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message || body?.error || `Payment service error (${response.status}).`);
  }
  return (body?.data ?? body) as T;
}

/** The signed-in user's current plan, as FeeFlo records it. The source of truth for Pro. */
export function getMe(token: string): Promise<GeoPlan> {
  return call<GeoPlan>('/api/v1/geo-snap/me', token);
}

/** Create a hosted checkout for a product code. Returns the FeeFlo checkout URL to send the user to. */
export function createPayment(
  token: string,
  productCode: string,
): Promise<{ paymentId: string; checkoutUrl: string; amountDisplay: string; status: string }> {
  return call('/api/v1/geo-snap/payments', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productCode }),
  });
}

/** Read a payment's current status (poll while pending). */
export function getPaymentStatus(token: string, paymentId: string): Promise<PaymentStatus> {
  return call<PaymentStatus>(`/api/v1/geo-snap/payments/${encodeURIComponent(paymentId)}`, token);
}

/** Apply a verified payment. FeeFlo re-checks product/amount/user/SUCCESS+verified before granting Pro. */
export function claimPayment(
  token: string,
  paymentId: string,
): Promise<{ alreadyApplied: boolean; active: boolean; expiresAt: string | null }> {
  return call(`/api/v1/geo-snap/payments/${encodeURIComponent(paymentId)}/claim`, token, {
    method: 'POST',
  });
}
