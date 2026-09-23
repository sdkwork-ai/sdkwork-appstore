//! Test-only helpers shared by `sdkwork-appstore-service-host` unit tests.
//!
//! `std::env` is process-global and Rust runs unit tests on threads inside one
//! process, so any test that mutates the environment must serialise against the
//! others. [`env_lock`] is that serialisation point; [`with_env`] restores the
//! previous value even when the test body panics, so one failing test cannot
//! leak a posture into the next.

use std::sync::{Mutex, MutexGuard, OnceLock};

/// Serialises environment mutation across this crate's tests.
pub fn env_lock() -> MutexGuard<'static, ()> {
    static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
    LOCK.get_or_init(|| Mutex::new(()))
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

/// Run `test` with `key` set to `value` (or removed when `None`), then restore
/// the prior state.
pub fn with_env(key: &str, value: Option<&str>, test: impl FnOnce()) {
    let previous = std::env::var(key).ok();
    apply(key, value);
    let outcome = std::panic::catch_unwind(std::panic::AssertUnwindSafe(test));
    apply(key, previous.as_deref());
    if let Err(payload) = outcome {
        std::panic::resume_unwind(payload);
    }
}

fn apply(key: &str, value: Option<&str>) {
    match value {
        Some(value) => std::env::set_var(key, value),
        None => std::env::remove_var(key),
    }
}
