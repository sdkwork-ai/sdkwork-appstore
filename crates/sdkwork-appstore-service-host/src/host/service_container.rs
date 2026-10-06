use crate::integrations::registry::{integration_capabilities, IntegrationCapability};

pub struct ServiceContainer {
    capabilities: &'static [IntegrationCapability],
}

impl ServiceContainer {
    pub fn build() -> Self {
        Self {
            capabilities: integration_capabilities(),
        }
    }

    pub fn capabilities(&self) -> &'static [IntegrationCapability] {
        self.capabilities
    }
}
