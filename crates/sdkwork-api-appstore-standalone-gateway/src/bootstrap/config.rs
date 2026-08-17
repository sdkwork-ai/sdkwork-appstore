//! Gateway runtime configuration resolved from the process environment.

const DEFAULT_BIND_ADDRESS: &str = "0.0.0.0:18090";

#[derive(Debug, Clone)]
pub struct AppstoreGatewayConfig {
    pub bind_address: String,
}

impl AppstoreGatewayConfig {
    pub fn from_env() -> Self {
        let bind_address = std::env::var("SDKWORK_APPSTORE_APPLICATION_PUBLIC_INGRESS_BIND")
            .ok()
            .map(|value| value.trim().to_owned())
            .filter(|value| !value.is_empty())
            .or_else(|| {
                std::env::var("PORT")
                    .ok()
                    .map(|port| format!("127.0.0.1:{port}"))
            })
            .unwrap_or_else(|| DEFAULT_BIND_ADDRESS.to_owned());
        Self { bind_address }
    }

    pub fn addr(&self) -> std::net::SocketAddr {
        self.bind_address
            .parse()
            .unwrap_or_else(|error| {
                panic!(
                    "invalid SDKWORK_APPSTORE_APPLICATION_PUBLIC_INGRESS_BIND `{}`: {error}",
                    self.bind_address
                )
            })
    }
}
