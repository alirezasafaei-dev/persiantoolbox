-- Payment hardening migration: add explicit gateway columns and tighten schema.
-- Idempotent: all statements use IF NOT EXISTS / IF EXISTS / ON CONFLICT.

-- 1. Add gateway columns to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_amount_irr bigint;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_authority text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_ref_id text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_name text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_code text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_message text;

-- 2. Backfill gateway_authority from metadata for existing completed/pending rows
UPDATE payments
SET gateway_authority = COALESCE(metadata->>'gatewayAuthority', metadata->>'gatewayRef')
WHERE gateway_authority IS NULL
  AND (metadata->>'gatewayAuthority' IS NOT NULL OR metadata->>'gatewayRef' IS NOT NULL);

-- 3. Backfill gateway_amount_irr from amount (legacy rows stored in IRR or Toman inconsistently).
--    Only backfill where the column is NULL and a gateway_authority exists (meaning the payment
--    went through the gateway). We assume legacy completed payments stored amount in the currency
--    column. If currency = 'IRR', amount is already in IRR. If currency = 'TOMAN', multiply by 10.
UPDATE payments
SET gateway_amount_irr = CASE
  WHEN currency = 'IRR' THEN amount
  WHEN currency = 'TOMAN' THEN amount * 10
  ELSE amount
END
WHERE gateway_amount_irr IS NULL
  AND gateway_authority IS NOT NULL;

-- 4. Normalize currency to TOMAN for all existing rows (application works in Toman).
UPDATE payments SET currency = 'TOMAN' WHERE currency = 'IRR';

-- 5. Unique indexes for authority and ref_id (partial: only non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_authority_unique
  ON payments (gateway_authority) WHERE gateway_authority IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_ref_id_unique
  ON payments (gateway_ref_id) WHERE gateway_ref_id IS NOT NULL;

-- 6. Index for reconciliation queries
CREATE INDEX IF NOT EXISTS payments_status_created_idx ON payments (status, created_at);
CREATE INDEX IF NOT EXISTS payments_user_status_idx ON payments (user_id, status);

-- 7. Add payment_id to subscriptions for payment-subscription linkage
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_id uuid;
CREATE INDEX IF NOT EXISTS subscriptions_payment_id_idx ON subscriptions (payment_id) WHERE payment_id IS NOT NULL;

-- Verification queries (for post-migration check):
-- SELECT COUNT(*) AS total_payments FROM payments;
-- SELECT COUNT(*) AS with_authority FROM payments WHERE gateway_authority IS NOT NULL;
-- SELECT COUNT(*) AS with_irr_amount FROM payments WHERE gateway_amount_irr IS NOT NULL;
-- SELECT currency, COUNT(*) FROM payments GROUP BY currency;
-- SELECT status, COUNT(*) FROM payments GROUP BY status;
