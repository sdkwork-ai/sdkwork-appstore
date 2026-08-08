//! Catalog operation results.

use serde::{Deserialize, Serialize};

use super::models::{
    AppTemplate, CatalogChartSnapshot, CatalogCollection, CatalogCollectionItem,
    CatalogCollectionLocalization, CatalogFeaturedSlot, Category, CategoryLocalization,
    CategoryWithLocalizations, CollectionWithItems, Feedback, ListingMetricSnapshot,
    ListingSummary, SearchHistoryEntry, SearchSuggestion, TrendingTerm,
};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CatalogOperationResult {
    pub operation_id: &'static str,
    pub accepted: bool,
}

impl CatalogOperationResult {
    pub fn accepted(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: true,
        }
    }

    pub fn rejected(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: false,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HomeRetrieveResult {
    pub operation_id: &'static str,
    pub featured_slots: Vec<CatalogFeaturedSlot>,
    pub collections: Vec<CatalogCollection>,
    pub charts: Vec<CatalogChartSnapshot>,
}

impl HomeRetrieveResult {
    pub fn new(
        operation_id: &'static str,
        featured_slots: Vec<CatalogFeaturedSlot>,
        collections: Vec<CatalogCollection>,
        charts: Vec<CatalogChartSnapshot>,
    ) -> Self {
        Self {
            operation_id,
            featured_slots,
            collections,
            charts,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoriesListResult {
    pub operation_id: &'static str,
    pub categories: Vec<CategoryWithLocalizations>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl CategoriesListResult {
    pub fn new(
        operation_id: &'static str,
        categories: Vec<CategoryWithLocalizations>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            categories,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryRetrieveResult {
    pub operation_id: &'static str,
    pub category: Option<CategoryWithLocalizations>,
}

impl CategoryRetrieveResult {
    pub fn found(operation_id: &'static str, category: CategoryWithLocalizations) -> Self {
        Self {
            operation_id,
            category: Some(category),
        }
    }

    pub fn not_found(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            category: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryCreateResult {
    pub operation_id: &'static str,
    pub category: Category,
    pub localizations: Vec<CategoryLocalization>,
}

impl CategoryCreateResult {
    pub fn created(
        operation_id: &'static str,
        category: Category,
        localizations: Vec<CategoryLocalization>,
    ) -> Self {
        Self {
            operation_id,
            category,
            localizations,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CategoryUpdateResult {
    pub operation_id: &'static str,
    pub category: Category,
    pub localizations: Vec<CategoryLocalization>,
}

impl CategoryUpdateResult {
    pub fn updated(
        operation_id: &'static str,
        category: Category,
        localizations: Vec<CategoryLocalization>,
    ) -> Self {
        Self {
            operation_id,
            category,
            localizations,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CollectionsListResult {
    pub operation_id: &'static str,
    pub collections: Vec<CollectionWithItems>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl CollectionsListResult {
    pub fn new(
        operation_id: &'static str,
        collections: Vec<CollectionWithItems>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            collections,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CollectionRetrieveResult {
    pub operation_id: &'static str,
    pub collection: Option<CollectionWithItems>,
}

impl CollectionRetrieveResult {
    pub fn found(operation_id: &'static str, collection: CollectionWithItems) -> Self {
        Self {
            operation_id,
            collection: Some(collection),
        }
    }

    pub fn not_found(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            collection: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CollectionCreateResult {
    pub operation_id: &'static str,
    pub collection: CatalogCollection,
    pub localizations: Vec<CatalogCollectionLocalization>,
}

impl CollectionCreateResult {
    pub fn created(
        operation_id: &'static str,
        collection: CatalogCollection,
        localizations: Vec<CatalogCollectionLocalization>,
    ) -> Self {
        Self {
            operation_id,
            collection,
            localizations,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CollectionUpdateResult {
    pub operation_id: &'static str,
    pub collection: CatalogCollection,
    pub localizations: Vec<CatalogCollectionLocalization>,
}

impl CollectionUpdateResult {
    pub fn updated(
        operation_id: &'static str,
        collection: CatalogCollection,
        localizations: Vec<CatalogCollectionLocalization>,
    ) -> Self {
        Self {
            operation_id,
            collection,
            localizations,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CollectionItemsUpsertResult {
    pub operation_id: &'static str,
    pub items: Vec<CatalogCollectionItem>,
}

impl CollectionItemsUpsertResult {
    pub fn upserted(operation_id: &'static str, items: Vec<CatalogCollectionItem>) -> Self {
        Self {
            operation_id,
            items,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FeaturedListResult {
    pub operation_id: &'static str,
    pub slots: Vec<CatalogFeaturedSlot>,
}

impl FeaturedListResult {
    pub fn new(operation_id: &'static str, slots: Vec<CatalogFeaturedSlot>) -> Self {
        Self {
            operation_id,
            slots,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FeaturedUpsertResult {
    pub operation_id: &'static str,
    pub slot: CatalogFeaturedSlot,
}

impl FeaturedUpsertResult {
    pub fn upserted(operation_id: &'static str, slot: CatalogFeaturedSlot) -> Self {
        Self { operation_id, slot }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ChartsRetrieveResult {
    pub operation_id: &'static str,
    pub chart: Option<CatalogChartSnapshot>,
}

impl ChartsRetrieveResult {
    pub fn found(operation_id: &'static str, chart: CatalogChartSnapshot) -> Self {
        Self {
            operation_id,
            chart: Some(chart),
        }
    }

    pub fn not_found(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            chart: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListingsSearchResult {
    pub operation_id: &'static str,
    pub listings: Vec<ListingSummary>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl ListingsSearchResult {
    pub fn new(
        operation_id: &'static str,
        listings: Vec<ListingSummary>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            listings,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MetricsRetrieveResult {
    pub operation_id: &'static str,
    pub metrics: Vec<ListingMetricSnapshot>,
}

impl MetricsRetrieveResult {
    pub fn new(operation_id: &'static str, metrics: Vec<ListingMetricSnapshot>) -> Self {
        Self {
            operation_id,
            metrics,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PublicFeaturedListResult {
    pub operation_id: &'static str,
    pub slots: Vec<CatalogFeaturedSlot>,
}

impl PublicFeaturedListResult {
    pub fn new(operation_id: &'static str, slots: Vec<CatalogFeaturedSlot>) -> Self {
        Self {
            operation_id,
            slots,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RecommendationsListResult {
    pub operation_id: &'static str,
    pub listings: Vec<ListingSummary>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl RecommendationsListResult {
    pub fn new(
        operation_id: &'static str,
        listings: Vec<ListingSummary>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            listings,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RecentlyUpdatedListResult {
    pub operation_id: &'static str,
    pub listings: Vec<ListingSummary>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl RecentlyUpdatedListResult {
    pub fn new(
        operation_id: &'static str,
        listings: Vec<ListingSummary>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            listings,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EventsListResult {
    pub operation_id: &'static str,
    pub events: Vec<CollectionWithItems>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl EventsListResult {
    pub fn new(
        operation_id: &'static str,
        events: Vec<CollectionWithItems>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            events,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EventRetrieveResult {
    pub operation_id: &'static str,
    pub event: Option<CollectionWithItems>,
}

impl EventRetrieveResult {
    pub fn found(operation_id: &'static str, event: CollectionWithItems) -> Self {
        Self {
            operation_id,
            event: Some(event),
        }
    }

    pub fn not_found(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            event: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SearchSuggestionsListResult {
    pub operation_id: &'static str,
    pub suggestions: Vec<SearchSuggestion>,
}

impl SearchSuggestionsListResult {
    pub fn new(operation_id: &'static str, suggestions: Vec<SearchSuggestion>) -> Self {
        Self {
            operation_id,
            suggestions,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SearchTrendingListResult {
    pub operation_id: &'static str,
    pub terms: Vec<TrendingTerm>,
}

impl SearchTrendingListResult {
    pub fn new(operation_id: &'static str, terms: Vec<TrendingTerm>) -> Self {
        Self {
            operation_id,
            terms,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SearchHistoryListResult {
    pub operation_id: &'static str,
    pub entries: Vec<SearchHistoryEntry>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl SearchHistoryListResult {
    pub fn new(
        operation_id: &'static str,
        entries: Vec<SearchHistoryEntry>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            entries,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SearchHistoryUpsertResult {
    pub operation_id: &'static str,
    pub entry: SearchHistoryEntry,
}

impl SearchHistoryUpsertResult {
    pub fn upserted(operation_id: &'static str, entry: SearchHistoryEntry) -> Self {
        Self {
            operation_id,
            entry,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SearchHistoryClearResult {
    pub operation_id: &'static str,
    pub accepted: bool,
}

impl SearchHistoryClearResult {
    pub fn cleared(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            accepted: true,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AnalyticsPublisherOverviewResult {
    pub operation_id: &'static str,
    pub overview: super::models::PublisherAnalyticsOverview,
}

impl AnalyticsPublisherOverviewResult {
    pub fn new(
        operation_id: &'static str,
        overview: super::models::PublisherAnalyticsOverview,
    ) -> Self {
        Self {
            operation_id,
            overview,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AnalyticsPublisherListingsListResult {
    pub operation_id: &'static str,
    pub listings: Vec<super::models::PublisherListingMetricsSummary>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl AnalyticsPublisherListingsListResult {
    pub fn new(
        operation_id: &'static str,
        listings: Vec<super::models::PublisherListingMetricsSummary>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            listings,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AnalyticsPublisherListingRetrieveResult {
    pub operation_id: &'static str,
    pub listing_id: String,
    pub metrics: Vec<super::models::ListingMetricSnapshot>,
}

impl AnalyticsPublisherListingRetrieveResult {
    pub fn new(
        operation_id: &'static str,
        listing_id: String,
        metrics: Vec<super::models::ListingMetricSnapshot>,
    ) -> Self {
        Self {
            operation_id,
            listing_id,
            metrics,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AnalyticsOperatorDashboardResult {
    pub operation_id: &'static str,
    pub dashboard: super::models::OperatorDashboardStats,
}

impl AnalyticsOperatorDashboardResult {
    pub fn new(
        operation_id: &'static str,
        dashboard: super::models::OperatorDashboardStats,
    ) -> Self {
        Self {
            operation_id,
            dashboard,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AnalyticsOperatorSearchResult {
    pub operation_id: &'static str,
    pub analytics: super::models::OperatorSearchAnalytics,
}

impl AnalyticsOperatorSearchResult {
    pub fn new(
        operation_id: &'static str,
        analytics: super::models::OperatorSearchAnalytics,
    ) -> Self {
        Self {
            operation_id,
            analytics,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TemplatesListResult {
    pub operation_id: &'static str,
    pub templates: Vec<AppTemplate>,
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

impl TemplatesListResult {
    pub fn new(
        operation_id: &'static str,
        templates: Vec<AppTemplate>,
        next_cursor: Option<String>,
        has_more: bool,
    ) -> Self {
        Self {
            operation_id,
            templates,
            next_cursor,
            has_more,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TemplateRetrieveResult {
    pub operation_id: &'static str,
    pub template: Option<AppTemplate>,
}

impl TemplateRetrieveResult {
    pub fn found(operation_id: &'static str, template: AppTemplate) -> Self {
        Self {
            operation_id,
            template: Some(template),
        }
    }

    pub fn not_found(operation_id: &'static str) -> Self {
        Self {
            operation_id,
            template: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TemplateCreateResult {
    pub operation_id: &'static str,
    pub template: AppTemplate,
}

impl TemplateCreateResult {
    pub fn new(operation_id: &'static str, template: AppTemplate) -> Self {
        Self {
            operation_id,
            template,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TemplateUsageCreateResult {
    pub operation_id: &'static str,
    pub template_id: String,
    pub usage_type: String,
    pub star_count: i64,
    pub fork_count: i64,
    pub clone_count: i64,
    pub is_starred: bool,
    pub is_enabled: bool,
}

impl TemplateUsageCreateResult {
    pub fn new(
        operation_id: &'static str,
        template_id: String,
        usage_type: String,
        star_count: i64,
        fork_count: i64,
        clone_count: i64,
        is_starred: bool,
        is_enabled: bool,
    ) -> Self {
        Self {
            operation_id,
            template_id,
            usage_type,
            star_count,
            fork_count,
            clone_count,
            is_starred,
            is_enabled,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FeedbackCreateResult {
    pub operation_id: &'static str,
    pub feedback: Feedback,
}

impl FeedbackCreateResult {
    pub fn new(operation_id: &'static str, feedback: Feedback) -> Self {
        Self {
            operation_id,
            feedback,
        }
    }
}
