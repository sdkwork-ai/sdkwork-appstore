//! Gateway assembly for sdkwork-appstore.
//! Application bootstrap lives in `bootstrap.rs`; route inventory is in `assembly-manifest.json`.
// SDKWORK-ASSEMBLY-LIB-CUSTOM: preserve application-owned HTTP modules and state exports.

mod bootstrap;
mod generated;
pub mod http_route_manifest;
pub mod web_bootstrap;

pub use bootstrap::{
    assemble_api_router, assemble_api_router_with_pool, assemble_contribution_with_pool,
    web_module, web_module_with_pool, ApiAssembly, ApiAssemblyContribution,
};

pub fn assembly_route_count() -> usize {
    generated::ROUTE_CRATE_COUNT
}
