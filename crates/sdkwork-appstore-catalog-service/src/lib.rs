//! App Store catalog service boundary.

pub mod context;
pub mod domain;
pub mod error;
pub mod ports;
pub mod service;

pub use context::AppstoreRequestContext;
pub use domain::commands::{
    CategoriesListRequest, CategoryCreateRequest, CategoryLocalizationInput,
    CategoryRetrieveRequest, CategoryUpdateRequest, ChartsRetrieveRequest, CollectionCreateRequest,
    CollectionItemInput, CollectionItemsUpsertRequest, CollectionLocalizationInput,
    CollectionRetrieveRequest, CollectionUpdateRequest, CollectionsListRequest,
    EventRetrieveRequest, EventsListRequest, ExpertRetrieveRequest, ExpertsListRequest,
    FeaturedListRequest, FeaturedUpsertRequest, HomeRetrieveRequest, ListingsSearchRequest,
    MetricsRetrieveRequest, PublicFeaturedListRequest, RecentlyUpdatedListRequest,
    RecommendationsListRequest, SearchHistoryClearRequest, SearchHistoryListRequest,
    SearchHistoryUpsertRequest, SearchSuggestionsListRequest, SearchTrendingListRequest,
};
pub use domain::models::{
    AudienceScope, CatalogChartSnapshot, CatalogCollection, CatalogCollectionItem,
    CatalogCollectionLocalization, CatalogFeaturedSlot, Category, CategoryId, CategoryLocalization,
    CategoryStatus, CategoryWithLocalizations, CollectionId, CollectionStatus, CollectionType,
    CollectionWithItems, ExpertCatalogEntry, FeaturedSlotId, FeaturedSlotStatus,
    ListingMetricSnapshot, ListingSummary, PlatformScope, SearchHistoryEntry, SearchSuggestion,
    TrendingTerm,
};
pub use domain::results::{
    CategoriesListResult, CategoryCreateResult, CategoryRetrieveResult, CategoryUpdateResult,
    ChartsRetrieveResult, CollectionCreateResult, CollectionItemsUpsertResult,
    CollectionRetrieveResult, CollectionUpdateResult, CollectionsListResult, EventRetrieveResult,
    EventsListResult, ExpertRetrieveResult, ExpertsListResult, FeaturedListResult,
    FeaturedUpsertResult, HomeRetrieveResult, ListingsSearchResult, MetricsRetrieveResult,
    PublicFeaturedListResult, RecentlyUpdatedListResult, RecommendationsListResult,
    SearchHistoryClearResult, SearchHistoryListResult, SearchHistoryUpsertResult,
    SearchSuggestionsListResult, SearchTrendingListResult,
};
pub use error::{AppstoreServiceError, AppstoreServiceResult};
pub use ports::repository::{CatalogRepositoryPort, ExpertCatalogQuery, ExpertSortOrder};
pub use service::catalog_service::{CatalogOperations, CatalogService};

pub const CAPABILITY: &str = "catalog";

pub fn capability_name() -> &'static str {
    CAPABILITY
}
