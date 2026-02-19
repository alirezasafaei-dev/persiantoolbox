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
