-- sdkwork:migration
-- id: 0005_appstore_web_stores
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: Cluster-safe web chain backing stores: shared fixed-window rate
--   limit buckets and idempotency reservations persisted in the authoritative
--   database so every gateway replica observes the same counters. Replaces
--   the per-process memory stores (SECURITY_SPEC §5, API_SPEC §17).
-- reversible: false
-- rollback: forward-fix (additive tables; rollback by pointing the gateway
--   back at memory stores and dropping these tables)
-- transactional: true
-- lock: lightweight
-- lock_timeout: 2s
-- statement_timeout: 60s

CREATE TABLE IF NOT EXISTS appstore_web_rate_limit_bucket (
  bucket_key TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  request_count BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_appstore_web_rate_limit_bucket_window
  ON appstore_web_rate_limit_bucket (window_start);

CREATE TABLE IF NOT EXISTS appstore_web_idempotency_entry (
  idempotency_key TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  response_status INTEGER,
  response_content_type TEXT,
  response_body BYTEA,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_appstore_web_idempotency_entry_expires
  ON appstore_web_idempotency_entry (expires_at);
