//! Service host startup preflight.
//!
//! `sdkwork-appstore-service-host` is the same-origin composition host: the
//! domains it consumes are composed into this process instead of being reached
//! over an HTTP base URL. The standalone gateway therefore probes environment
//! base URLs in its own `preflight::dependency_surfaces`, while this host
//! validates the contract that makes same-origin composition possible at all:
//! the integration capability registry declared by [`crate::integrations`].
//!
//! [`preflight`] runs the registry checks and returns a [`PreflightReport`].
//! Callers are expected to fail startup when [`PreflightReport::is_ready`] is
//! `false`, so that a mis-declared capability surfaces as a boot failure rather
//! than as a runtime `provider_error` on the first request that needs it.

use std::collections::BTreeSet;

use crate::integrations::registry::{integration_capabilities, IntegrationCapability};

/// A single preflight finding.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PreflightIssue {
    /// Two capabilities declared the same registry key.
    DuplicateCapabilityKey { key: &'static str },
    /// A capability declared an empty key, so it can never be resolved.
    EmptyCapabilityKey { purpose: &'static str },
    /// A required capability declared no delivery surface.
    RequiredCapabilityWithoutSurface { key: &'static str },
    /// A required capability is still an unwired handoff.
    RequiredCapabilityUnwired {
        key: &'static str,
        todo: &'static str,
    },
}

impl PreflightIssue {
    /// Registry key the issue belongs to, or an empty string when the key itself
    /// is the problem.
    pub fn key(&self) -> &'static str {
        match self {
            Self::DuplicateCapabilityKey { key }
            | Self::RequiredCapabilityWithoutSurface { key }
            | Self::RequiredCapabilityUnwired { key, .. } => key,
            Self::EmptyCapabilityKey { .. } => "",
        }
    }

    /// Whether this issue must abort startup.
    ///
    /// `RequiredCapabilityUnwired` is a warning: a capability may still be
    /// carried as a declared handoff while its adapter is being built out, and
    /// `crates/IMPLEMENTATION_TODO.md` tracks that work. Every other issue
    /// corrupts the registry contract itself and is fatal.
    pub fn is_fatal(&self) -> bool {
        !matches!(self, Self::RequiredCapabilityUnwired { .. })
    }
}

/// Result of running the service host preflight.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PreflightReport {
    pub checked_capabilities: usize,
    pub issues: Vec<PreflightIssue>,
}

impl PreflightReport {
    /// `true` when no fatal issue was found.
    pub fn is_ready(&self) -> bool {
        !self.issues.iter().any(PreflightIssue::is_fatal)
    }

    /// Fatal issues only, in declaration order.
    pub fn fatal_issues(&self) -> Vec<&PreflightIssue> {
        self.issues
            .iter()
            .filter(|issue| issue.is_fatal())
            .collect()
    }

    /// Non-fatal issues only, in declaration order.
    pub fn warnings(&self) -> Vec<&PreflightIssue> {
        self.issues
            .iter()
            .filter(|issue| !issue.is_fatal())
            .collect()
    }
}

fn inspect(capabilities: &[IntegrationCapability]) -> PreflightReport {
    let mut issues = Vec::new();
    let mut seen: BTreeSet<&'static str> = BTreeSet::new();

    for capability in capabilities {
        if capability.key.trim().is_empty() {
            issues.push(PreflightIssue::EmptyCapabilityKey {
                purpose: capability.purpose,
            });
            continue;
        }
        if !seen.insert(capability.key) {
            issues.push(PreflightIssue::DuplicateCapabilityKey {
                key: capability.key,
            });
        }
        if capability.required && capability.surfaces.is_empty() {
            issues.push(PreflightIssue::RequiredCapabilityWithoutSurface {
                key: capability.key,
            });
        }
        if capability.required && !capability.todo.trim().is_empty() {
            issues.push(PreflightIssue::RequiredCapabilityUnwired {
                key: capability.key,
                todo: capability.todo,
            });
        }
    }

    PreflightReport {
        checked_capabilities: capabilities.len(),
        issues,
    }
}

/// Runs the startup preflight against the registered integration capabilities.
pub fn preflight() -> PreflightReport {
    inspect(integration_capabilities())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::integrations::registry::{IntegrationOwner, IntegrationSurface};

    fn capability(
        key: &'static str,
        required: bool,
        surfaces: &'static [IntegrationSurface],
        todo: &'static str,
    ) -> IntegrationCapability {
        IntegrationCapability {
            key,
            owner: IntegrationOwner::AppStore,
            purpose: "test capability",
            surfaces,
            required,
            todo,
        }
    }

    #[test]
    fn registered_capabilities_pass_preflight() {
        let report = preflight();
        assert!(
            report.is_ready(),
            "registered integration capabilities must satisfy the registry contract: {:?}",
            report.fatal_issues(),
        );
        assert_eq!(
            report.checked_capabilities,
            integration_capabilities().len()
        );
    }

    #[test]
    fn duplicate_keys_are_fatal() {
        let capabilities = [
            capability("drive", false, &[IntegrationSurface::AppApi], ""),
            capability("drive", false, &[IntegrationSurface::AppApi], ""),
        ];
        let report = inspect(&capabilities);
        assert!(!report.is_ready());
        assert_eq!(
            report.fatal_issues(),
            vec![&PreflightIssue::DuplicateCapabilityKey { key: "drive" }],
        );
    }

    #[test]
    fn empty_key_is_fatal() {
        let capabilities = [capability("  ", false, &[IntegrationSurface::AppApi], "")];
        let report = inspect(&capabilities);
        assert!(!report.is_ready());
        assert_eq!(report.fatal_issues().len(), 1);
        assert_eq!(report.fatal_issues()[0].key(), "");
    }

    #[test]
    fn required_capability_without_surface_is_fatal() {
        let capabilities = [capability("drive", true, &[], "")];
        let report = inspect(&capabilities);
        assert!(!report.is_ready());
        assert_eq!(
            report.fatal_issues(),
            vec![&PreflightIssue::RequiredCapabilityWithoutSurface { key: "drive" }],
        );
    }

    #[test]
    fn unwired_required_capability_is_a_warning_not_a_failure() {
        let capabilities = [
            capability(
                "drive",
                true,
                &[IntegrationSurface::ServicePort],
                "set APPSTORE_DRIVE_BASE_URL",
            ),
            capability(
                "optional_tool",
                false,
                &[IntegrationSurface::Event],
                "pending",
            ),
        ];
        let report = inspect(&capabilities);
        assert!(report.is_ready(), "warnings must not abort startup");
        assert_eq!(report.warnings().len(), 1);
        assert_eq!(report.warnings()[0].key(), "drive");
    }
}
