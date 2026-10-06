//! SDKWork App Store service host.

pub mod bootstrap;
pub mod host;
pub mod integrations;
pub mod preflight;
pub mod runtime_env;

#[cfg(test)]
pub mod test_support;

pub fn service_host_name() -> &'static str {
    "sdkwork-appstore-service-host"
}
