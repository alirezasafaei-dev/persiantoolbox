-- Payment hardening migration: explicit gateway fields and immutable fulfillment history.
-- Atomic and idempotent. Run on a recent backup before production.

BEGIN;

LOCK TABLE payments IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE subscriptions IN SHARE ROW EXCLUSIVE MODE;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_amount_irr bigint;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_authority text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_ref_id text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_name text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_code text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_message text;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_id uuid;

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

UPDATE payments
SET gateway_amount_irr = COALESCE(
  NULLIF(metadata->>'gatewayAmountRial', '')::bigint,
  amount * 10
)
WHERE gateway_amount_irr IS NULL
  AND gateway_authority IS NOT NULL;

UPDATE payments SET currency = 'TOMAN' WHERE currency = 'IRR';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM payments WHERE gateway_authority IS NOT NULL
    GROUP BY gateway_authority HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate gateway_authority values detected; run payments reconciliation before migration';
  END IF;

  IF EXISTS (
    SELECT 1 FROM payments WHERE gateway_ref_id IS NOT NULL
    GROUP BY gateway_ref_id HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate gateway_ref_id values detected; run payments reconciliation before migration';
  END IF;

  IF EXISTS (
    SELECT 1 FROM subscriptions WHERE payment_id IS NOT NULL
    GROUP BY payment_id HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate subscriptions.payment_id values detected; reconcile fulfillment before migration';
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_authority_unique
  ON payments (gateway_authority) WHERE gateway_authority IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_ref_id_unique
  ON payments (gateway_ref_id) WHERE gateway_ref_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payments_status_created_idx ON payments (status, created_at);
CREATE INDEX IF NOT EXISTS payments_user_status_idx ON payments (user_id, status);

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_gateway_amount_irr_positive;
ALTER TABLE payments
  ADD CONSTRAINT payments_gateway_amount_irr_positive
  CHECK (gateway_amount_irr IS NULL OR gateway_amount_irr > 0) NOT VALID;
ALTER TABLE payments VALIDATE CONSTRAINT payments_gateway_amount_irr_positive;

DROP INDEX IF EXISTS subscriptions_payment_id_unique;
CREATE INDEX IF NOT EXISTS subscriptions_payment_id_idx
  ON subscriptions (payment_id) WHERE payment_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subscriptions_payment_id_fkey'
      AND conrelid = 'subscriptions'::regclass
  ) THEN
    ALTER TABLE subscriptions
      ADD CONSTRAINT subscriptions_payment_id_fkey
      FOREIGN KEY (payment_id) REFERENCES payments(id)
      ON DELETE SET NULL NOT VALID;
  END IF;
END
$$;
ALTER TABLE subscriptions VALIDATE CONSTRAINT subscriptions_payment_id_fkey;

CREATE TABLE IF NOT EXISTS payment_fulfillments (
  payment_id uuid PRIMARY KEY REFERENCES payments(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  fulfillment_type text NOT NULL DEFAULT 'subscription',
  fulfilled_at bigint NOT NULL,
  metadata jsonb
);
CREATE INDEX IF NOT EXISTS payment_fulfillments_subscription_idx
  ON payment_fulfillments (subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payment_fulfillments_fulfilled_at_idx
  ON payment_fulfillments (fulfilled_at DESC);

-- Backfill only unambiguous historical payment links.
INSERT INTO payment_fulfillments (
  payment_id,
  subscription_id,
  fulfillment_type,
  fulfilled_at,
  metadata
)
SELECT
  s.payment_id,
  s.id,
  'subscription',
  COALESCE(p.completed_at, s.started_at),
  jsonb_build_object('source', 'migration-backfill')
FROM subscriptions s
JOIN payments p ON p.id = s.payment_id
WHERE s.payment_id IS NOT NULL
ON CONFLICT (payment_id) DO NOTHING;

COMMIT;

-- Post-migration verification:
-- SELECT status, COUNT(*) FROM payments GROUP BY status;
-- SELECT COUNT(*) FROM payment_fulfillments;
-- SELECT p.id FROM payments p
-- LEFT JOIN payment_fulfillments f ON f.payment_id = p.id
-- WHERE p.status = 'completed' AND p.metadata ? 'planId' AND f.payment_id IS NULL;
-- SELECT gateway_authority, COUNT(*) FROM payments
-- WHERE gateway_authority IS NOT NULL GROUP BY gateway_authority HAVING COUNT(*) > 1;
--
-- Rollback policy: deploy the prior application release without dropping additive
-- columns/tables. Any failure before COMMIT is rolled back automatically.
