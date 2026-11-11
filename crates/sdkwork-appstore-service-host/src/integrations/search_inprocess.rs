//! In-process sdkwork-search port implementations (MODULE_SPEC.md §4.2).
//!
//! App Store federates catalog search to sdkwork-search and projects published
//! listings into sdkwork-search indexes. In every packaged deployment Search
//! runs inside the same backend process against the same PostgreSQL, so these
//! adapters call Search's provider SPI and PostgreSQL provider directly instead
//! of Search's app-api / backend-api.
//!
//! # What the previous HTTP adapters enforced, and what is reproduced here
//!
//! - The tenant the caller supplied is carried into
//!   [`SearchProviderContext::tenant_id`], which the provider binds as the
//!   `search_document.tenant_id` predicate. Search itself never derived a
//!   tenant from an HTTP header on these routes: its handlers build the
//!   provider context from the request context and overwrite the body's tenant
//!   fields with it, so the tenant is the one App Store passes in — the same
//!   value forwarded over HTTP before.
//! - Index documents are keyed by `(tenant, organization, index_key,
//!   document_id)` and written with an upsert, so re-projecting the same
//!   listing twice is idempotent, exactly like the route's `index_document`.
//! - Deletes are soft deletes scoped to the same key tuple.
//!
//! # Failure semantics
//!
//! Both ports already treat failures as non-fatal at their call sites: catalog
//! search falls back to the SQL query and the listing projection only logs a
//! warning. Keeping the `Result<_, String>` shape preserves that, so a
//! deployment without the Search tables degrades instead of failing.

use std::collections::HashMap;
use std::sync::Arc;

use async_trait::async_trait;
use sqlx::PgPool;

use sdkwork_appstore_catalog_service::ports::search_federation::CatalogSearchFederationPort;
use sdkwork_appstore_listing_service::ports::search_projection::{
    ListingSearchProjectionPort, PublishedListingSearchDocument,
};
use sdkwork_search_provider_spi::{
    DeleteDocument, IndexDocument, SearchProvider, SearchProviderContext, SearchProviderRegistry,
    SearchQuery,
};

/// Index key App Store projects published listings into by default.
pub const DEFAULT_APPSTORE_SEARCH_INDEX_KEY: &str = "appstore-listings";

/// Deployment override for the projection index key.
pub const APPSTORE_SEARCH_INDEX_KEY_ENV: &str = "APPSTORE_SEARCH_INDEX_KEY";

/// Upper bound Search accepts for one page.
const MAX_PAGE_SIZE: u32 = 200;

/// Resolve the projection index key.
///
/// Absent or blank means [`DEFAULT_APPSTORE_SEARCH_INDEX_KEY`]; this is tuning,
/// not an endpoint, so it never blocks startup.
pub fn appstore_search_index_key() -> String {
    std::env::var(APPSTORE_SEARCH_INDEX_KEY_ENV)
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| DEFAULT_APPSTORE_SEARCH_INDEX_KEY.to_string())
}

/// Build the provider registry App Store uses against the shared PostgreSQL.
///
/// The PostgreSQL provider owns the `search_document` table, so App Store can
/// read and write the same index sdkwork-search serves without a socket hop.
fn postgres_registry(pool: PgPool) -> Result<Arc<SearchProviderRegistry>, String> {
    let provider: Arc<dyn SearchProvider> =
        Arc::new(sdkwork_search_provider_postgresql::PostgresqlSearchProvider::new(
            "appstore-postgresql",
            pool,
        ));
    Ok(Arc::new(
        SearchProviderRegistry::builder()
            .register_provider(provider)
            .default_kind(sdkwork_search_provider_spi::SearchProviderKind::Postgresql)
            .build(),
    ))
}

/// Translate App Store's string tenant id into the numeric id Search keys on.
fn search_tenant_id(tenant_id: &str) -> Result<i64, String> {
    let trimmed = tenant_id.trim();
    if trimmed.is_empty() {
        return Err("tenant id is required for search".to_string());
    }
    trimmed
        .parse::<i64>()
        .map_err(|_| format!("tenant id {trimmed} is not a numeric search tenant id"))
}

/// Build the provider context for one tenant.
fn provider_context(tenant_id: &str) -> Result<SearchProviderContext, String> {
    let tenant_id = search_tenant_id(tenant_id)?;
    Ok(SearchProviderContext::builder().tenant_id(tenant_id).build())
}

/// Catalog search federation backed by the in-process Search provider.
#[derive(Clone)]
pub struct InProcessSearchFederationAdapter {
    registry: Arc<SearchProviderRegistry>,
    index_key: String,
}

impl std::fmt::Debug for InProcessSearchFederationAdapter {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_struct("InProcessSearchFederationAdapter")
            .field("index_key", &self.index_key)
            .finish_non_exhaustive()
    }
}

impl InProcessSearchFederationAdapter {
    /// Build the federation adapter over the shared database pool.
    pub fn new(pool: PgPool) -> Result<Self, String> {
        Ok(Self {
            registry: postgres_registry(pool)?,
            index_key: appstore_search_index_key(),
        })
    }

    /// Build the federation adapter against an explicit index key.
    pub fn with_index_key(pool: PgPool, index_key: impl Into<String>) -> Result<Self, String> {
        Ok(Self {
            registry: postgres_registry(pool)?,
            index_key: index_key.into(),
        })
    }
}

#[async_trait]
impl CatalogSearchFederationPort for InProcessSearchFederationAdapter {
    async fn resolve_listing_ids(
        &self,
        tenant_id: &str,
        query: &str,
        category_id: Option<&str>,
        limit: i32,
    ) -> Result<Vec<String>, String> {
        let ctx = provider_context(tenant_id)?;
        let page_size = u32::try_from(limit.max(1))
            .unwrap_or(MAX_PAGE_SIZE)
            .min(MAX_PAGE_SIZE);

        let mut filters: HashMap<String, Vec<String>> = HashMap::new();
        if let Some(category_id) = category_id.map(str::trim).filter(|v| !v.is_empty()) {
            // The projection stores the primary category under `group`, which is
            // the field the previous HTTP projection wrote as well.
            filters.insert("group".to_string(), vec![category_id.to_string()]);
        }

        let response = self
            .registry
            .search(
                &ctx,
                &SearchQuery {
                    tenant_id: ctx.tenant_id,
                    organization_id: ctx.organization_id,
                    index_key: self.index_key.clone(),
                    query_text: query.to_string(),
                    page: 1,
                    page_size,
                    filters,
                    facets: Vec::new(),
                    sort: Vec::new(),
                    highlight: None,
                    min_score: None,
                    // Bounded: a slow index must not stall the catalog request;
                    // the caller falls back to the SQL query on failure.
                    timeout_ms: Some(3_000),
                },
            )
            .await
            .map_err(|error| format!("sdkwork-search query failed: {error}"))?;

        Ok(response
            .hits
            .into_iter()
            .map(|hit| hit.document_id)
            .filter(|id| !id.trim().is_empty())
            .collect())
    }
}

/// Listing search projection backed by the in-process Search provider.
#[derive(Clone)]
pub struct InProcessSearchProjectionAdapter {
    registry: Arc<SearchProviderRegistry>,
    index_key: String,
}

impl std::fmt::Debug for InProcessSearchProjectionAdapter {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_struct("InProcessSearchProjectionAdapter")
            .field("index_key", &self.index_key)
            .finish_non_exhaustive()
    }
}

impl InProcessSearchProjectionAdapter {
    /// Build the projection adapter over the shared database pool.
    pub fn new(pool: PgPool) -> Result<Self, String> {
        Ok(Self {
            registry: postgres_registry(pool)?,
            index_key: appstore_search_index_key(),
        })
    }

    /// Build the projection adapter against an explicit index key.
    pub fn with_index_key(pool: PgPool, index_key: impl Into<String>) -> Result<Self, String> {
        Ok(Self {
            registry: postgres_registry(pool)?,
            index_key: index_key.into(),
        })
    }

    fn indexing_provider(
        &self,
    ) -> Result<Arc<dyn SearchProvider>, String> {
        self.registry
            .select_for_capability(sdkwork_search_provider_spi::SearchProviderCapability::Indexing)
            .or_else(|_| self.registry.select_default())
            .map_err(|error| format!("sdkwork-search has no indexing provider: {error}"))
    }
}

#[async_trait]
impl ListingSearchProjectionPort for InProcessSearchProjectionAdapter {
    async fn upsert_published_listing(
        &self,
        document: &PublishedListingSearchDocument,
    ) -> Result<(), String> {
        let ctx = provider_context(&document.tenant_id)?;
        let provider = self.indexing_provider()?;

        provider
            .index_document(
                &ctx,
                &IndexDocument {
                    index_key: self.index_key.clone(),
                    document_id: document.listing_id.clone(),
                    source: serde_json::json!({
                        "title": document.title,
                        "description": document.description,
                        "enabled": true,
                        "group": document.category_id,
                        "scope": document.tenant_id,
                        "source": "sdkwork-appstore",
                        "metadata": {
                            "listingSlug": document.listing_slug,
                            "tenantId": document.tenant_id,
                        },
                    }),
                    title: Some(document.title.clone()),
                    content: Some(document.description.clone()),
                    tags: Vec::new(),
                    drive_space_id: None,
                    drive_node_id: None,
                    embedding: Vec::new(),
                },
            )
            .await
            .map_err(|error| format!("search document upsert failed: {error}"))
    }

    async fn remove_listing(&self, tenant_id: &str, listing_id: &str) -> Result<(), String> {
        let ctx = provider_context(tenant_id)?;
        let provider = self.indexing_provider()?;

        provider
            .delete_document(
                &ctx,
                &DeleteDocument {
                    index_key: self.index_key.clone(),
                    document_id: listing_id.to_string(),
                },
            )
            .await
            .map_err(|error| format!("search document delete failed: {error}"))
    }
}

#[cfg(test)]
mod tests {
    use super::{
        appstore_search_index_key, search_tenant_id, DEFAULT_APPSTORE_SEARCH_INDEX_KEY,
        APPSTORE_SEARCH_INDEX_KEY_ENV,
    };
    use crate::test_support::{env_lock, with_env};

    #[test]
    fn a_numeric_tenant_id_is_accepted() {
        assert_eq!(search_tenant_id("100001"), Ok(100001));
        assert_eq!(search_tenant_id(" 42 "), Ok(42));
    }

    #[test]
    fn an_empty_or_non_numeric_tenant_id_is_rejected() {
        assert!(search_tenant_id("").is_err());
        assert!(search_tenant_id("tenant-a").is_err());
    }

    #[test]
    fn the_index_key_defaults_and_can_be_overridden() {
        let _guard = env_lock();
        with_env(APPSTORE_SEARCH_INDEX_KEY_ENV, None, || {
            assert_eq!(
                appstore_search_index_key(),
                DEFAULT_APPSTORE_SEARCH_INDEX_KEY
            );
        });
        with_env(
            APPSTORE_SEARCH_INDEX_KEY_ENV,
            Some("  custom-index "),
            || {
                assert_eq!(appstore_search_index_key(), "custom-index");
            },
        );
        with_env(APPSTORE_SEARCH_INDEX_KEY_ENV, Some("   "), || {
            assert_eq!(
                appstore_search_index_key(),
                DEFAULT_APPSTORE_SEARCH_INDEX_KEY
            );
        });
    }

    #[test]
    fn the_adapters_never_read_a_sibling_http_endpoint() {
        let source = include_str!("search_inprocess.rs");
        let production = source
            .split("#[cfg(test)]")
            .next()
            .expect("the module has a production section");
        assert!(
            !production.contains("reqwest"),
            "search must stay in-process"
        );
        assert!(
            !production.contains("_BASE_URL\""),
            "the in-process search adapters must not read an endpoint variable"
        );
    }
}
