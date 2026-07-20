-- Payment hardening migration: explicit gateway fields and safer reconciliation.
--
-- Atomicity: every mutation runs inside one transaction. Any failed preflight,
-- constraint, or index creation rolls the entire migration back.
-- Idempotency: schema mutations use IF NOT EXISTS and data backfills only fill
-- missing values or normalize known legacy representations.
--
-- Run on a recent backup first. Production execution still requires an owner-
-- approved maintenance window and a verified rollback target.

BEGIN;

-- Prevent concurrent payment writes while legacy values are normalized and
-- uniqueness is established. This lock is intentionally scoped to this short
-- migration transaction.
LOCK TABLE payments IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE subscriptions IN SHARE ROW EXCLUSIVE MODE;

-- 1. Add explicit gateway columns.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_amount_irr bigint;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_authority text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_ref_id text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_name text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_code text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_message text;

-- 2. Backfill and normalize the raw Zarinpal Authority.
-- Legacy metadata may store either raw Authority or zarinpal_<Authority>.
UPDATE payments
SET gateway_authority = regexp_replace(
  COALESCE(metadata->>'gatewayAuthority', metadata->>'gatewayRef'),
  '^zarinpal_',
  ''
)
WHERE gateway_authority IS NULL
  AND (metadata->>'gatewayAuthority' IS NOT NULL OR metadata->>'gatewayRef' IS NOT NULL);

UPDATE payments
SET gateway_authority = regexp_replace(gateway_authority, '^zarinpal_', '')
WHERE gateway_authority LIKE 'zarinpal\_%' ESCAPE '\';

-- 3. Backfill the exact gateway amount.
-- Historical createPayment stored UI amounts in Toman while labelling the row
-- IRR. Existing gateway metadata created by hardened code is preferred when
-- present; otherwise the historical application amount is converted once.
UPDATE payments
SET gateway_amount_irr = COALESCE(
  NULLIF(metadata->>'gatewayAmountRial', '')::bigint,
  CASE
    WHEN currency = 'TOMAN' THEN amount * 10
    WHEN currency = 'IRR' THEN amount * 10
    ELSE amount * 10
  END
)
WHERE gateway_amount_irr IS NULL
  AND gateway_authority IS NOT NULL;

-- 4. Normalize the application-facing currency label. The historical amount
-- column contains UI prices in Toman; gateway_amount_irr preserves the exact
-- amount used for gateway request and verification.
UPDATE payments SET currency = 'TOMAN' WHERE currency = 'IRR';

-- 5. Abort atomically before adding uniqueness if historical duplicates exist.
-- The reconciliation command must resolve these rows explicitly; the migration
-- never guesses which financial record should win.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM payments
    WHERE gateway_authority IS NOT NULL
    GROUP BY gateway_authority
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate gateway_authority values detected; run payments reconciliation before migration';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM payments
    WHERE gateway_ref_id IS NOT NULL
    GROUP BY gateway_ref_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate gateway_ref_id values detected; run payments reconciliation before migration';
  END IF;
END
$$;

-- 6. Enforce gateway invariants and lookup performance.
CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_authority_unique
  ON payments (gateway_authority) WHERE gateway_authority IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_ref_id_unique
  ON payments (gateway_ref_id) WHERE gateway_ref_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS payments_status_created_idx ON payments (status, created_at);
CREATE INDEX IF NOT EXISTS payments_user_status_idx ON payments (user_id, status);

ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_gateway_amount_irr_positive;
ALTER TABLE payments
  ADD CONSTRAINT payments_gateway_amount_irr_positive
  CHECK (gateway_amount_irr IS NULL OR gateway_amount_irr > 0) NOT VALID;
ALTER TABLE payments VALIDATE CONSTRAINT payments_gateway_amount_irr_positive;

-- 7. Link subscriptions to the payment that most recently created/extended it.
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_id uuid;
CREATE INDEX IF NOT EXISTS subscriptions_payment_id_idx
  ON subscriptions (payment_id) WHERE payment_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subscriptions_payment_id_fkey'
      AND conrelid = 'subscriptions'::regclass
  ) THEN
    ALTER TABLE subscriptions
      ADD CONSTRAINT subscriptions_payment_id_fkey
      FOREIGN KEY (payment_id) REFERENCES payments(id)
      ON DELETE SET NULL
      NOT VALID;
  END IF;
END
$$;
ALTER TABLE subscriptions VALIDATE CONSTRAINT subscriptions_payment_id_fkey;

COMMIT;

-- Post-migration verification (read-only):
-- SELECT COUNT(*) AS total_payments FROM payments;
-- SELECT COUNT(*) AS with_authority FROM payments WHERE gateway_authority IS NOT NULL;
-- SELECT COUNT(*) AS with_irr_amount FROM payments WHERE gateway_amount_irr IS NOT NULL;
-- SELECT currency, COUNT(*) FROM payments GROUP BY currency;
-- SELECT status, COUNT(*) FROM payments GROUP BY status;
-- SELECT gateway_authority, COUNT(*) FROM payments
--   WHERE gateway_authority IS NOT NULL GROUP BY gateway_authority HAVING COUNT(*) > 1;
-- SELECT gateway_ref_id, COUNT(*) FROM payments
--   WHERE gateway_ref_id IS NOT NULL GROUP BY gateway_ref_id HAVING COUNT(*) > 1;
--
-- Rollback policy:
-- Because this migration is additive, application rollback should deploy the
-- previous release without dropping columns. Destructive schema rollback is
-- intentionally excluded from emergency recovery. If this script fails before
-- COMMIT, PostgreSQL rolls back every statement automatically.
