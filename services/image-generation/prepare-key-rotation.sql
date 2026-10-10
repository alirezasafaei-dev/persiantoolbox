-- Operator-only recovery step. Stop and drain the worker before running this script.
BEGIN;

SET LOCAL lock_timeout = '5s';
SELECT pg_advisory_xact_lock(7321041);
SELECT pg_advisory_xact_lock(7321042);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM image_generation_jobs) THEN
    RAISE EXCEPTION 'key rotation refused: image jobs remain';
  END IF;

  IF EXISTS (
    SELECT 1 FROM image_generation_control WHERE id = 1 AND blocked_code IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'key rotation refused: provider circuit remains blocked';
  END IF;
END;
$$;

DELETE FROM image_generation_quota;
DELETE FROM image_generation_control;

COMMIT;
