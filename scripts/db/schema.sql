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
