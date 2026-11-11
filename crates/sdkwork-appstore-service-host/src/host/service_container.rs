//! Composition host container.
//!
//! The container describes the integration capabilities this process declares.
//! It deliberately does **not** build sibling-module ports: `MODULE_SPEC.md`
//! §4.2 wants exactly one place that decides how App Store reaches
//! sdkwork-drive / sdkwork-search, and that place is
//! [`crate::integrations::ports::integration_ports_from_env`]. A second
//! constructor here would be a second transport decision.

use crate::integrations::registry::{integration_capabilities, IntegrationCapability};

/// Composition container: the declared capability registry.
pub struct ServiceContainer {
    capabilities: &'static [IntegrationCapability],
}

impl ServiceContainer {
    /// Build the container.
    pub fn build() -> Self {
        Self {
            capabilities: integration_capabilities(),
        }
    }

    /// Declared integration capabilities.
    pub fn capabilities(&self) -> &'static [IntegrationCapability] {
        self.capabilities
    }
}

#[cfg(test)]
mod tests {
    use super::ServiceContainer;

    #[test]
    fn the_container_declares_the_capability_registry() {
        let container = ServiceContainer::build();
        assert!(!container.capabilities().is_empty());
    }

    #[test]
    fn the_container_never_decides_the_sibling_transport() {
        // Regression guard: transport selection (and its environment contract)
        // lives only in `integrations::ports`, so a deployment cannot end up with
        // two different answers to "in-process or HTTP?".
        let source = include_str!("service_container.rs");
        let production = source
            .split("#[cfg(test)]")
            .next()
            .expect("the module has a production section");
        assert!(!production.contains("integration_ports_from_env("));
        assert!(!production.contains("integration_mode("));
    }
}
