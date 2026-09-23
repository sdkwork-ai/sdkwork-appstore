//! App Store runtime environment resolution.
//!
//! Every posture decision in this application — CORS allow-list strictness,
//! Snowflake node allocation, secret handling — must derive from **one**
//! resolution of "which environment am I running in". Resolving it twice with
//! two different key lists is how a process ends up thinking it is in
//! development for identity purposes while the gateway applies the production
//! CORS policy.
//!
//! The platform already owns the resolution rules; this module only names the
//! key list App Store uses and exposes the production-like predicate on top of
//! [`sdkwork_web_bootstrap::web_environment_from_env`].
//!
//! # Why two keys
//!
//! `SDKWORK_APPSTORE_ENVIRONMENT` is the App Store-specific key and wins when
//! both are set. `SDKWORK_ENVIRONMENT` is the workspace-wide key that every
//! deployment profile also writes, so it is honoured as a fallback: resolving
//! to `Dev` because only the shared key was set would silently relax
//! production postures, and `/etc/topology/*.env` sets both consistently.

use sdkwork_web_bootstrap::web_environment_from_env;
use sdkwork_web_core::WebEnvironment;

/// Environment keys consulted, most specific first.
pub const APPSTORE_ENVIRONMENT_KEYS: &[&str] =
    &["SDKWORK_APPSTORE_ENVIRONMENT", "SDKWORK_ENVIRONMENT"];

/// Resolve the App Store runtime environment.
///
/// Unknown values fail closed onto [`WebEnvironment::Prod`] — the platform
/// resolver's own rule, so a typo can never buy a relaxed posture.
pub fn appstore_environment() -> WebEnvironment {
    web_environment_from_env(APPSTORE_ENVIRONMENT_KEYS)
}

/// Canonical environment name for logs and diagnostics.
pub fn appstore_environment_name() -> &'static str {
    match appstore_environment() {
        WebEnvironment::Dev => "dev",
        WebEnvironment::Test => "test",
        WebEnvironment::Prod => "prod",
    }
}

/// Whether this process must run with production posture.
///
/// Staging and production both resolve to [`WebEnvironment::Prod`], so this is
/// the single predicate to gate fail-closed behaviour on.
pub fn appstore_is_production_like() -> bool {
    appstore_environment() == WebEnvironment::Prod
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_support::{env_lock, with_env};

    #[test]
    fn appstore_key_wins_over_shared_key() {
        let _guard = env_lock();
        with_env("SDKWORK_APPSTORE_ENVIRONMENT", Some("development"), || {
            with_env("SDKWORK_ENVIRONMENT", Some("production"), || {
                assert_eq!(appstore_environment(), WebEnvironment::Dev);
                assert!(!appstore_is_production_like());
            });
        });
    }

    #[test]
    fn shared_key_is_honoured_when_the_appstore_key_is_absent() {
        let _guard = env_lock();
        with_env("SDKWORK_APPSTORE_ENVIRONMENT", None, || {
            with_env("SDKWORK_ENVIRONMENT", Some("production"), || {
                assert_eq!(appstore_environment(), WebEnvironment::Prod);
                assert!(appstore_is_production_like());
            });
        });
    }

    #[test]
    fn staging_is_production_like() {
        let _guard = env_lock();
        with_env("SDKWORK_APPSTORE_ENVIRONMENT", Some("staging"), || {
            assert!(appstore_is_production_like());
        });
    }

    #[test]
    fn unknown_environment_fails_closed() {
        let _guard = env_lock();
        with_env(
            "SDKWORK_APPSTORE_ENVIRONMENT",
            Some("not-a-real-tier"),
            || {
                with_env("SDKWORK_ENVIRONMENT", None, || {
                    assert_eq!(appstore_environment(), WebEnvironment::Prod);
                });
            },
        );
    }

    #[test]
    fn missing_environment_defaults_to_development() {
        let _guard = env_lock();
        with_env("SDKWORK_APPSTORE_ENVIRONMENT", None, || {
            with_env("SDKWORK_ENVIRONMENT", None, || {
                assert_eq!(appstore_environment(), WebEnvironment::Dev);
            });
        });
    }
}
