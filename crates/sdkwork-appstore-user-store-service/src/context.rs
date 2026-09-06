//! Typed request context accepted by the user store service.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AppstoreRequestContext {
    pub tenant_id: String,
    pub organization_id: String,
    pub user_id: String,
    pub request_id: String,
    pub trace_id: Option<String>,
    pub permission_scopes: Vec<String>,
}

impl AppstoreRequestContext {
    pub fn tenant_scoped(tenant_id: impl Into<String>, request_id: impl Into<String>) -> Self {
        Self {
            tenant_id: tenant_id.into(),
            organization_id: "0".to_string(),
            user_id: String::new(),
            request_id: request_id.into(),
            trace_id: None,
            permission_scopes: Vec::new(),
        }
    }

    /// Public (anonymous visitor) context: the share token, not the principal,
    /// identifies the accessed resource.
    pub fn public_visitor(tenant_id: impl Into<String>, request_id: impl Into<String>) -> Self {
        Self::tenant_scoped(tenant_id, request_id)
    }
}
