//! Router assembly for the standalone gateway.

use sdkwork_api_appstore_assembly::ApiAssembly;

/// Assemble the full appstore business router (database + repositories +
/// services + route crates) from environment configuration.
///
/// # Errors
///
/// Fails when the database cannot be assembled, or when an explicit
/// `APPSTORE_INTEGRATION_MODE=http` split deployment has an incomplete
/// endpoint/credential contract. Both are startup failures by design: the
/// process must never start and fail on the first business request instead.
pub async fn assemble_router() -> Result<ApiAssembly, String> {
    sdkwork_api_appstore_assembly::assemble_api_router().await
}
