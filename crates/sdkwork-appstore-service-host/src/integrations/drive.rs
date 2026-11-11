use super::registry::{IntegrationCapability, IntegrationOwner, IntegrationSurface};

pub const INTEGRATION_NAME: &str = "drive";

pub fn required_scopes() -> &'static [&'static str] {
    &["media_resource", "upload", "download_grant"]
}

pub const CAPABILITY: IntegrationCapability = IntegrationCapability {
    key: "drive",
    owner: IntegrationOwner::Dependency("sdkwork-drive"),
    purpose: "icons, screenshots, binaries, release artifacts",
    surfaces: &[IntegrationSurface::ServicePort],
    required: true,
    // Delivered by `integrations::drive_inprocess` over Drive's service crates.
    // No deployment-time endpoint or service credential is required
    // (MODULE_SPEC.md §4.2); the HTTP transport is an explicit split-deployment
    // opt-in.
    todo: "",
};
