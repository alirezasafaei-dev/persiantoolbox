BEGIN;
CREATE TABLE IF NOT EXISTS image_generation_jobs (
  id uuid PRIMARY KEY,
  owner text NOT NULL,
  request_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('queued','running','ready','error','cancelled')),
  stage text NOT NULL,
  code text,
  prompt bytea,
  image bytea CHECK (octet_length(image)<=5243000),
  mime text CHECK (mime IN ('image/jpeg','image/png','image/webp')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  lease_until timestamptz,
  UNIQUE(owner,request_id)
);
CREATE INDEX IF NOT EXISTS image_generation_pending ON image_generation_jobs(created_at) WHERE status='queued';
CREATE INDEX IF NOT EXISTS image_generation_expiry ON image_generation_jobs(expires_at);
CREATE INDEX IF NOT EXISTS image_generation_owner ON image_generation_jobs(owner,created_at DESC);
CREATE TABLE IF NOT EXISTS image_generation_control (
  id integer PRIMARY KEY CHECK(id=1),
  heartbeat timestamptz,
  blocked_code text,
  key_fingerprint text NOT NULL
);
CREATE TABLE IF NOT EXISTS image_generation_quota (
  bucket text NOT NULL,
  window_id bigint NOT NULL,
  count integer NOT NULL,
  expires_at timestamptz NOT NULL,
  PRIMARY KEY(bucket,window_id)
);
COMMIT;
