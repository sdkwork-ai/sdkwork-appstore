//! How App Store reaches the sibling SDKWork modules it depends on.
//!
//! `MODULE_SPEC.md` §4.2 requires backend modules to reach each other
//! **in-process**: every packaged SDKWork deployment runs one backend process
//! against one PostgreSQL, so App Store can call sdkwork-drive and
//! sdkwork-search through their service/repository crates instead of through
//! their HTTP surfaces.
//!
//! The HTTP path is therefore a deliberate exception, kept only for a real
//! split deployment where the sibling really runs in another process or
//! container. It is an explicit opt-in, it is validated at startup, and its
//! absence can never stop the module from booting.

/// Selects how App Store reaches its sibling modules.
pub const APPSTORE_INTEGRATION_MODE_ENV: &str = "APPSTORE_INTEGRATION_MODE";

/// How this process talks to the sibling SDKWork modules.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum IntegrationMode {
    /// Call the sibling module's service/repository crates in this process.
    /// The default: it shares the transaction, the connection pool, and the
    /// error model, and needs no deployment-time endpoint or credential.
    InProcess,
    /// Call the sibling module's HTTP surface. Only valid for an explicit split
    /// deployment; requires endpoint and service credentials at startup.
    Http,
}

impl IntegrationMode {
    /// Stable spelling used in logs, health output, and the opt-in value.
    pub fn label(self) -> &'static str {
        match self {
            Self::InProcess => "in-process",
            Self::Http => "http",
        }
    }

    /// The opt-in value that selects this mode.
    pub fn as_env_value(self) -> &'static str {
        match self {
            Self::InProcess => "in-process",
            Self::Http => "http",
        }
    }
}

/// Resolves the integration mode from the process environment.
///
/// Absent or blank means [`IntegrationMode::InProcess`]: a deployment that
/// configures nothing must boot and serve. Only an explicit `http` selects the
/// split-deployment adapters.
///
/// # Errors
///
/// Returns an error for an unrecognised non-blank value instead of silently
/// falling back: a misspelled opt-in would otherwise boot with the in-process
/// adapters and look like a working split deployment.
pub fn integration_mode() -> Result<IntegrationMode, String> {
    let configured = std::env::var(APPSTORE_INTEGRATION_MODE_ENV).ok();
    resolve_integration_mode(configured.as_deref())
}

/// Pure mode resolution so the environment-free rules stay unit-testable.
///
/// # Errors
///
/// See [`integration_mode`].
pub fn resolve_integration_mode(configured: Option<&str>) -> Result<IntegrationMode, String> {
    match configured.map(str::trim).filter(|value| !value.is_empty()) {
        None => Ok(IntegrationMode::InProcess),
        Some(raw) => match raw.to_ascii_lowercase().as_str() {
            // `in-process` is the documented spelling; the underscore and the
            // bare `inprocess` forms are accepted so an operator cannot get a
            // boot failure from a trivial spelling difference.
            "in-process" | "in_process" | "inprocess" => Ok(IntegrationMode::InProcess),
            "http" => Ok(IntegrationMode::Http),
            other => Err(format!(
                "unsupported {APPSTORE_INTEGRATION_MODE_ENV} value: {other} \
                 (expected \"in-process\" or \"http\")"
            )),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::{
        integration_mode, resolve_integration_mode, IntegrationMode, APPSTORE_INTEGRATION_MODE_ENV,
    };
    use crate::test_support::{env_lock, with_env};

    #[test]
    fn an_unset_mode_boots_in_process() {
        assert_eq!(
            resolve_integration_mode(None),
            Ok(IntegrationMode::InProcess)
        );
    }

    #[test]
    fn a_blank_mode_is_treated_as_unset() {
        for value in ["", "   ", "\t"] {
            assert_eq!(
                resolve_integration_mode(Some(value)),
                Ok(IntegrationMode::InProcess),
                "value {value:?} must resolve to the in-process default"
            );
        }
    }

    #[test]
    fn http_is_an_explicit_opt_in() {
        for value in ["http", "HTTP", " Http "] {
            assert_eq!(
                resolve_integration_mode(Some(value)),
                Ok(IntegrationMode::Http),
                "value {value:?} must select the split-deployment adapters"
            );
        }
    }

    #[test]
    fn in_process_spellings_are_accepted() {
        for value in ["in-process", "IN-PROCESS", "in_process", "inprocess", " In-Process "] {
            assert_eq!(
                resolve_integration_mode(Some(value)),
                Ok(IntegrationMode::InProcess),
                "value {value:?} must select the in-process adapters"
            );
        }
    }

    #[test]
    fn an_unknown_mode_names_the_variable_and_the_accepted_values() {
        let error = resolve_integration_mode(Some("grpc"))
            .expect_err("an unknown mode must not silently fall back");
        assert!(error.contains(APPSTORE_INTEGRATION_MODE_ENV), "{error}");
        assert!(error.contains("\"in-process\""), "{error}");
        assert!(error.contains("\"http\""), "{error}");
    }

    #[test]
    fn labels_are_the_documented_spellings() {
        assert_eq!(IntegrationMode::InProcess.label(), "in-process");
        assert_eq!(IntegrationMode::Http.label(), "http");
        assert_eq!(IntegrationMode::Http.as_env_value(), "http");
    }

    #[test]
    fn reading_the_environment_never_panics_and_defaults_to_in_process() {
        let _guard = env_lock();
        with_env(APPSTORE_INTEGRATION_MODE_ENV, None, || {
            assert_eq!(
                integration_mode().expect("the default must resolve"),
                IntegrationMode::InProcess
            );
        });
    }

    #[test]
    fn the_default_is_in_process_so_a_missing_endpoint_cannot_block_boot() {
        // Regression guard: startup must never require a sibling module base
        // URL. The only accepted HTTP opt-in is the mode variable.
        let source = include_str!("mode.rs");
        assert!(
            source.contains("None => Ok(IntegrationMode::InProcess)"),
            "the unset mode must resolve to the in-process adapters"
        );
    }
}
