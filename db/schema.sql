-- Planned PostgreSQL schema. No database is connected by this change.
CREATE TABLE users (
  google_sub text PRIMARY KEY,
  email text NOT NULL,
  display_name text,
  picture_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pro_entitlements (
  google_sub text PRIMARY KEY REFERENCES users(google_sub),
  product_code text NOT NULL CHECK (product_code IN ('LOCSNAP_PRO_MONTHLY', 'LOCSNAP_PRO_YEARLY')),
  starts_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  source_payment_id text NOT NULL UNIQUE,
  verified_at timestamptz NOT NULL,
  CHECK (expires_at > starts_at)
);
