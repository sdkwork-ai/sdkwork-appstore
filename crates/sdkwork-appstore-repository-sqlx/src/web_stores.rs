//! Cluster-safe HTTP chain backing stores (rate limit + idempotency).
//!
//! Both stores persist in the appstore authoritative database so every
//! replica in a cluster observes the same counters and idempotency
//! reservations. The in-process memory stores from `sdkwork-web-core` are
//! per-replica: rate limits multiply by replica count and a retry routed to
//! another replica replays nothing, which breaks SECURITY_SPEC §5 and the
//! idempotency contract under multi-replica SaaS production.

use std::time::Duration;

use sdkwork_web_core::error::WebFrameworkError;
use sdkwork_web_core::idempotency::{IdempotencyBeginOutcome, IdempotencyResponseRecord};
use sdkwork_web_core::{IdempotencyStore, RateLimitStore};

use crate::pool::AppstoreSqlxDb;

/// Expired rows older than this threshold are swept opportunistically.
/// Any live window or reservation is well below this age; a rate-limit
/// window longer than a day is not a supported configuration.
const SWEEP_THRESHOLD: chrono::Duration = chrono::Duration::hours(24);

/// Fixed-window rate limiter backed by the shared database.
pub struct AppstoreDbRateLimitStore {
    db: AppstoreSqlxDb,
}

impl AppstoreDbRateLimitStore {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self { db }
    }
}

#[derive(sqlx::FromRow)]
struct RequestCountRow {
    request_count: i64,
}

#[async_trait::async_trait]
impl RateLimitStore for AppstoreDbRateLimitStore {
    fn is_distributed_ha(&self) -> bool {
        true
    }

    async fn check_and_record(
        &self,
        key: &str,
        max_requests: u32,
        window: Duration,
    ) -> Result<(), WebFrameworkError> {
        let now = chrono::Utc::now();
        let window_expiry = now - chrono::Duration::from_std(window).unwrap_or_default();
        let sweep_before = now - SWEEP_THRESHOLD;

        // Atomically open a new window or bump the shared counter, then read
        // back the post-increment count. Reject when it exceeds the budget,
        // which admits exactly `max_requests` per window like the memory
        // reference implementation.
        let row = self
            .db
            .query_as::<RequestCountRow>(
                r#"
            INSERT INTO appstore_web_rate_limit_bucket (bucket_key, window_start, request_count)
            VALUES (?, ?, 1)
            ON CONFLICT (bucket_key) DO UPDATE SET
              window_start = CASE
                WHEN appstore_web_rate_limit_bucket.window_start <= ?
                THEN ? ELSE appstore_web_rate_limit_bucket.window_start END,
              request_count = CASE
                WHEN appstore_web_rate_limit_bucket.window_start <= ?
                THEN 1 ELSE appstore_web_rate_limit_bucket.request_count + 1 END
            RETURNING request_count
            "#,
            )
            .bind(key)
            .bind(now)
            .bind(window_expiry)
            .bind(now)
            .bind(window_expiry)
            .fetch_optional(&self.db)
            .await
            .map_err(database_error("rate limit check failed"))?;

        // Opportunistic sweep of dead buckets (indexed on window_start).
        let _ = self
            .db
            .query("DELETE FROM appstore_web_rate_limit_bucket WHERE window_start < ?")
            .bind(sweep_before)
            .execute_unified(&self.db)
            .await;

        let count = row.map(|row| row.request_count).unwrap_or(0);
        if count > i64::from(max_requests) {
            return Err(WebFrameworkError::rate_limit_exceeded(
                "rate limit exceeded",
                window.as_secs().max(1),
            ));
        }
        Ok(())
    }
}

/// Idempotency reservation store backed by the shared database.
pub struct AppstoreDbIdempotencyStore {
    db: AppstoreSqlxDb,
}

impl AppstoreDbIdempotencyStore {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self { db }
    }
}

#[derive(sqlx::FromRow)]
struct IdempotencyStateRow {
    fingerprint: String,
    response_status: Option<i32>,
    response_content_type: Option<String>,
    response_body: Option<Vec<u8>>,
}

impl IdempotencyStateRow {
    fn replay(&self) -> Option<IdempotencyResponseRecord> {
        let status = self.response_status?;
        Some(IdempotencyResponseRecord {
            status_code: u16::try_from(status).unwrap_or(500),
            body: self.response_body.clone().unwrap_or_default(),
            content_type: self.response_content_type.clone(),
        })
    }
}

#[async_trait::async_trait]
impl IdempotencyStore for AppstoreDbIdempotencyStore {
    fn is_distributed_ha(&self) -> bool {
        true
    }

    async fn begin(
        &self,
        key: &str,
        fingerprint: &str,
        ttl: Duration,
    ) -> Result<IdempotencyBeginOutcome, WebFrameworkError> {
        let now = chrono::Utc::now();
        let expires_at =
            now + chrono::Duration::from_std(ttl).unwrap_or_else(|_| chrono::Duration::hours(1));
        let sweep_before = now - SWEEP_THRESHOLD;

        // Claim leadership. An expired row (from a crashed leader) is taken
        // over; a live row blocks the conditional update so no row returns.
        let claimed = self
            .db
            .query_as::<(String,)>(
                r#"
            INSERT INTO appstore_web_idempotency_entry
              (idempotency_key, fingerprint, response_status, response_content_type,
               response_body, expires_at, created_at)
            VALUES (?, ?, NULL, NULL, NULL, ?, ?)
            ON CONFLICT (idempotency_key) DO UPDATE SET
              fingerprint = EXCLUDED.fingerprint,
              response_status = NULL,
              response_content_type = NULL,
              response_body = NULL,
              expires_at = EXCLUDED.expires_at,
              created_at = EXCLUDED.created_at
            WHERE appstore_web_idempotency_entry.expires_at <= ?
            RETURNING fingerprint
            "#,
            )
            .bind(key)
            .bind(fingerprint)
            .bind(expires_at)
            .bind(now)
            .bind(now)
            .fetch_optional(&self.db)
            .await
            .map_err(database_error("idempotency reservation failed"))?;

        // Opportunistic sweep of long-expired entries (indexed on expires_at).
        let _ = self
            .db
            .query("DELETE FROM appstore_web_idempotency_entry WHERE expires_at < ?")
            .bind(sweep_before)
            .execute_unified(&self.db)
            .await;

        if claimed.is_some() {
            return Ok(IdempotencyBeginOutcome::Leader);
        }

        let row = self
            .db
            .query_as::<IdempotencyStateRow>(
                r#"
            SELECT fingerprint, response_status, response_content_type, response_body
            FROM appstore_web_idempotency_entry
            WHERE idempotency_key = ?
            "#,
            )
            .bind(key)
            .fetch_optional(&self.db)
            .await
            .map_err(database_error("idempotency lookup failed"))?;

        let Some(row) = row else {
            // The claim vanished between the upsert and the read (a concurrent
            // release won the race). Asking the client to retry the same key
            // is the only safe outcome; the next begin() claims cleanly.
            return Err(WebFrameworkError::conflict(
                "idempotency key reservation raced with a release, retry",
            ));
        };
        if row.fingerprint != fingerprint {
            return Err(WebFrameworkError::conflict(
                "idempotency key was already used with a different request fingerprint",
            ));
        }
        if let Some(record) = row.replay() {
            return Ok(IdempotencyBeginOutcome::Replay(record));
        }
        Err(WebFrameworkError::conflict(
            "idempotency key is already in progress",
        ))
    }

    async fn complete(
        &self,
        key: &str,
        fingerprint: &str,
        record: IdempotencyResponseRecord,
        ttl: Duration,
    ) -> Result<(), WebFrameworkError> {
        let expires_at = chrono::Utc::now()
            + chrono::Duration::from_std(ttl).unwrap_or_else(|_| chrono::Duration::hours(1));
        let status = i32::try_from(record.status_code).map_err(|_| {
            WebFrameworkError::bad_request("idempotency response status out of range")
        })?;
        let result = self
            .db
            .query(
                r#"
            UPDATE appstore_web_idempotency_entry
            SET response_status = ?, response_content_type = ?, response_body = ?, expires_at = ?
            WHERE idempotency_key = ? AND fingerprint = ?
            "#,
            )
            .bind(status)
            .bind(record.content_type)
            .bind(record.body)
            .bind(expires_at)
            .bind(key)
            .bind(fingerprint)
            .execute_unified(&self.db)
            .await
            .map_err(database_error("idempotency completion failed"))?;

        if result.rows_affected() > 0 {
            return Ok(());
        }
        let exists = self
            .db
            .query_as::<(String,)>(
                "SELECT fingerprint FROM appstore_web_idempotency_entry WHERE idempotency_key = ?",
            )
            .bind(key)
            .fetch_optional(&self.db)
            .await
            .map_err(database_error("idempotency lookup failed"))?;
        match exists {
            Some(_) => Err(WebFrameworkError::conflict(
                "idempotency key fingerprint mismatch while completing response",
            )),
            None => Err(WebFrameworkError::bad_request(
                "idempotency key was not reserved",
            )),
        }
    }

    async fn release(&self, key: &str, fingerprint: &str) -> Result<(), WebFrameworkError> {
        self.db
            .query(
                r#"
            DELETE FROM appstore_web_idempotency_entry
            WHERE idempotency_key = ? AND fingerprint = ? AND response_status IS NULL
            "#,
            )
            .bind(key)
            .bind(fingerprint)
            .execute_unified(&self.db)
            .await
            .map_err(database_error("idempotency release failed"))?;
        Ok(())
    }
}

fn database_error(message: &'static str) -> impl Fn(sqlx::Error) -> WebFrameworkError {
    move |error| {
        tracing::error!(error = %error, message);
        WebFrameworkError::internal_server_error(format!("{message}: database unavailable"))
    }
}
