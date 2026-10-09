-- Review with existing database migration owner before applying.
-- No deployment, database mutation or production configuration is authorized by this PR.
CREATE TABLE IF NOT EXISTS ai_chat_quota (
  quota_key TEXT NOT NULL,
  bucket_start TIMESTAMPTZ NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0 CHECK (hits >= 0),
  PRIMARY KEY (quota_key, bucket_start)
);

-- Maintenance (operator-managed): DELETE FROM ai_chat_quota WHERE bucket_start < NOW() - INTERVAL '30 days';
