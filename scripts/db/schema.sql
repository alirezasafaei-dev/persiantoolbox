CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY,
  token text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at bigint NOT NULL,
  expires_at bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id text NOT NULL,
  status text NOT NULL,
  started_at bigint NOT NULL,
  expires_at bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS subscriptions_user_status_idx ON subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS subscriptions_expires_at_idx ON subscriptions (expires_at);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount bigint NOT NULL,
  currency text NOT NULL DEFAULT 'IRR',
  method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  description text NOT NULL DEFAULT '',
  metadata jsonb,
  created_at bigint NOT NULL,
  completed_at bigint
);

CREATE INDEX IF NOT EXISTS payments_user_idx ON payments (user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments (status);

CREATE TABLE IF NOT EXISTS checkouts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id text NOT NULL,
  status text NOT NULL,
  created_at bigint NOT NULL,
  paid_at bigint
);

CREATE INDEX IF NOT EXISTS checkouts_user_idx ON checkouts (user_id);
CREATE INDEX IF NOT EXISTS checkouts_status_idx ON checkouts (status);

CREATE TABLE IF NOT EXISTS history_entries (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool text NOT NULL,
  input_summary text NOT NULL,
  output_summary text NOT NULL,
  output_url text,
  created_at bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS history_user_created_idx ON history_entries (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS history_share_links (
  token uuid PRIMARY KEY,
  entry_id uuid NOT NULL REFERENCES history_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at bigint NOT NULL,
  expires_at bigint NOT NULL,
  output_url text
);

CREATE INDEX IF NOT EXISTS history_share_links_user_idx ON history_share_links (user_id);
CREATE INDEX IF NOT EXISTS history_share_links_expires_idx ON history_share_links (expires_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL,
  window_start bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limit_metrics (
  key text NOT NULL,
  bucket_day bigint NOT NULL,
  blocked integer NOT NULL DEFAULT 0,
  PRIMARY KEY (key, bucket_day)
);

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at bigint NOT NULL
);

-- Self-hosted analytics (aggregated counters only; no raw event storage by default)
CREATE TABLE IF NOT EXISTS analytics_summary (
  id integer PRIMARY KEY,
  total_events bigint NOT NULL DEFAULT 0,
  last_updated bigint
);

INSERT INTO analytics_summary (id, total_events, last_updated)
VALUES (1, 0, NULL)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS analytics_counters (
  kind text NOT NULL,
  key text NOT NULL,
  count bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (kind, key)
);

CREATE INDEX IF NOT EXISTS analytics_counters_kind_idx ON analytics_counters (kind);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at bigint NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::bigint
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_endpoint_idx ON push_subscriptions (endpoint);

CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id text NOT NULL,
  date text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  last_used_at bigint NOT NULL,
  UNIQUE(user_id, tool_id, date)
);

CREATE INDEX IF NOT EXISTS usage_tracking_user_idx ON usage_tracking (user_id);
CREATE INDEX IF NOT EXISTS usage_tracking_date_idx ON usage_tracking (date);

CREATE TABLE IF NOT EXISTS financial_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  scenario_type text NOT NULL,
  inputs jsonb NOT NULL DEFAULT '{}',
  outputs jsonb DEFAULT '{}',
  notes text DEFAULT '',
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS financial_scenarios_user_idx ON financial_scenarios (user_id);
CREATE INDEX IF NOT EXISTS financial_scenarios_type_idx ON financial_scenarios (scenario_type);
