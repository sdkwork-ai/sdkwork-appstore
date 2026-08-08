//! Repository port for catalog use cases.

use crate::context::AppstoreRequestContext;
use crate::domain::models::{
    CatalogChartSnapshot, CatalogCollection, CatalogCollectionItem, CatalogCollectionLocalization,
    CatalogFeaturedSlot, Category, CategoryId, CategoryLocalization, CollectionId,
    ListingMetricSnapshot, ListingSummary, SearchHistoryEntry, SearchSuggestion, TrendingTerm,
};
use crate::error::AppstoreServiceResult;

#[async_trait::async_trait]
pub trait CatalogRepositoryPort: Send + Sync {
    async fn find_categories(
        &self,
        context: &AppstoreRequestContext,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<Category>>;

    async fn find_category_by_id(
        &self,
        context: &AppstoreRequestContext,
        category_id: &CategoryId,
    ) -> AppstoreServiceResult<Option<Category>>;

    async fn find_category_by_code(
        &self,
        context: &AppstoreRequestContext,
        category_code: &str,
    ) -> AppstoreServiceResult<Option<Category>>;

    async fn find_category_localizations(
        &self,
        context: &AppstoreRequestContext,
        category_id: &CategoryId,
    ) -> AppstoreServiceResult<Vec<CategoryLocalization>>;

    async fn insert_category(
        &self,
        context: &AppstoreRequestContext,
        category: &Category,
    ) -> AppstoreServiceResult<()>;

    async fn update_category(
        &self,
        context: &AppstoreRequestContext,
        category: &Category,
    ) -> AppstoreServiceResult<()>;

    async fn upsert_category_localization(
        &self,
        context: &AppstoreRequestContext,
        localization: &CategoryLocalization,
    ) -> AppstoreServiceResult<()>;

    async fn find_collections(
        &self,
        context: &AppstoreRequestContext,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<CatalogCollection>>;

    async fn find_collection_by_id(
        &self,
        context: &AppstoreRequestContext,
        collection_id: &CollectionId,
    ) -> AppstoreServiceResult<Option<CatalogCollection>>;

    async fn find_collection_by_code(
        &self,
        context: &AppstoreRequestContext,
        collection_code: &str,
    ) -> AppstoreServiceResult<Option<CatalogCollection>>;

    async fn find_collection_localizations(
        &self,
        context: &AppstoreRequestContext,
        collection_id: &CollectionId,
    ) -> AppstoreServiceResult<Vec<CatalogCollectionLocalization>>;

    async fn find_collection_items(
        &self,
        context: &AppstoreRequestContext,
        collection_id: &CollectionId,
    ) -> AppstoreServiceResult<Vec<CatalogCollectionItem>>;

    async fn insert_collection(
        &self,
        context: &AppstoreRequestContext,
        collection: &CatalogCollection,
    ) -> AppstoreServiceResult<()>;

    async fn update_collection(
        &self,
        context: &AppstoreRequestContext,
        collection: &CatalogCollection,
    ) -> AppstoreServiceResult<()>;

    async fn upsert_collection_localization(
        &self,
        context: &AppstoreRequestContext,
        localization: &CatalogCollectionLocalization,
    ) -> AppstoreServiceResult<()>;

    async fn delete_collection_items(
        &self,
        context: &AppstoreRequestContext,
        collection_id: &CollectionId,
    ) -> AppstoreServiceResult<()>;

    /// Atomically replaces all items of a collection (delete + insert in one
    /// transaction) so a failed update never leaves the collection empty.
    async fn replace_collection_items(
        &self,
        context: &AppstoreRequestContext,
        collection_id: &CollectionId,
        items: &[CatalogCollectionItem],
    ) -> AppstoreServiceResult<()>;

    async fn insert_collection_item(
        &self,
        context: &AppstoreRequestContext,
        item: &CatalogCollectionItem,
    ) -> AppstoreServiceResult<()>;

    async fn find_featured_slots(
        &self,
        context: &AppstoreRequestContext,
    ) -> AppstoreServiceResult<Vec<CatalogFeaturedSlot>>;

    async fn find_featured_slot_by_code(
        &self,
        context: &AppstoreRequestContext,
        slot_code: &str,
    ) -> AppstoreServiceResult<Option<CatalogFeaturedSlot>>;

    async fn upsert_featured_slot(
        &self,
        context: &AppstoreRequestContext,
        slot: &CatalogFeaturedSlot,
    ) -> AppstoreServiceResult<()>;

    async fn find_chart_snapshot(
        &self,
        context: &AppstoreRequestContext,
        chart_code: &str,
        snapshot_date: &str,
        locale: &str,
        platform_scope: &str,
    ) -> AppstoreServiceResult<Option<CatalogChartSnapshot>>;

    async fn find_latest_chart_snapshot(
        &self,
        context: &AppstoreRequestContext,
        chart_code: &str,
        locale: &str,
        platform_scope: &str,
    ) -> AppstoreServiceResult<Option<CatalogChartSnapshot>>;

    async fn search_listings(
        &self,
        context: &AppstoreRequestContext,
        query: Option<&str>,
        category_id: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
        listing_ids: Option<&[String]>,
    ) -> AppstoreServiceResult<Vec<ListingSummary>>;

    async fn find_metric_snapshots(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        start_date: Option<&str>,
        end_date: Option<&str>,
    ) -> AppstoreServiceResult<Vec<ListingMetricSnapshot>>;

    async fn find_listings_by_ids(
        &self,
        context: &AppstoreRequestContext,
        listing_ids: &[String],
        locale: Option<&str>,
    ) -> AppstoreServiceResult<Vec<ListingSummary>>;

    async fn find_recently_updated_listings(
        &self,
        context: &AppstoreRequestContext,
        locale: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<ListingSummary>>;

    async fn find_event_collections(
        &self,
        context: &AppstoreRequestContext,
        status: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<CatalogCollection>>;

    async fn find_listing_name_suggestions(
        &self,
        context: &AppstoreRequestContext,
        prefix: &str,
        locale: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<SearchSuggestion>>;

    async fn find_trending_term_suggestions(
        &self,
        context: &AppstoreRequestContext,
        prefix: &str,
        locale: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<SearchSuggestion>>;

    async fn find_trending_terms(
        &self,
        context: &AppstoreRequestContext,
        locale: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<TrendingTerm>>;

    async fn find_search_history(
        &self,
        context: &AppstoreRequestContext,
        user_id: &str,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<SearchHistoryEntry>>;

    async fn insert_search_history(
        &self,
        context: &AppstoreRequestContext,
        entry: &SearchHistoryEntry,
    ) -> AppstoreServiceResult<()>;

    async fn clear_search_history(
        &self,
        context: &AppstoreRequestContext,
        user_id: &str,
    ) -> AppstoreServiceResult<()>;

    async fn find_publisher_id_by_owner(
        &self,
        context: &AppstoreRequestContext,
        owner_user_id: &str,
    ) -> AppstoreServiceResult<Option<String>>;

    async fn aggregate_publisher_metrics(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &str,
        date_from: Option<&str>,
        date_to: Option<&str>,
    ) -> AppstoreServiceResult<crate::domain::models::PublisherAnalyticsOverview>;

    async fn list_publisher_listing_metrics(
        &self,
        context: &AppstoreRequestContext,
        publisher_id: &str,
        date_from: Option<&str>,
        date_to: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<Vec<crate::domain::models::PublisherListingMetricsSummary>>;

    async fn listing_belongs_to_publisher(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
        publisher_id: &str,
    ) -> AppstoreServiceResult<bool>;

    async fn count_operator_dashboard_stats(
        &self,
        context: &AppstoreRequestContext,
    ) -> AppstoreServiceResult<crate::domain::models::OperatorDashboardStats>;

    async fn find_operator_search_analytics(
        &self,
        context: &AppstoreRequestContext,
        query: Option<&str>,
        date_from: Option<&str>,
        date_to: Option<&str>,
        limit: i32,
    ) -> AppstoreServiceResult<crate::domain::models::OperatorSearchAnalytics>;

    async fn find_templates(
        &self,
        context: &AppstoreRequestContext,
        query: Option<&str>,
        category_code: Option<&str>,
        template_type: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
        user_id: Option<&str>,
    ) -> AppstoreServiceResult<Vec<crate::domain::models::AppTemplate>>;

    async fn find_template_by_id(
        &self,
        context: &AppstoreRequestContext,
        template_id: &str,
        user_id: Option<&str>,
    ) -> AppstoreServiceResult<Option<crate::domain::models::AppTemplate>>;

    async fn insert_template(
        &self,
        context: &AppstoreRequestContext,
        template: &crate::domain::models::AppTemplate,
    ) -> AppstoreServiceResult<()>;

    async fn insert_template_usage(
        &self,
        context: &AppstoreRequestContext,
        usage: &crate::domain::models::AppTemplateUsage,
    ) -> AppstoreServiceResult<()>;

    async fn find_template_usage_counts(
        &self,
        context: &AppstoreRequestContext,
        template_id: &str,
    ) -> AppstoreServiceResult<crate::domain::models::AppTemplateUsageCounts>;

    async fn find_latest_template_usage_state(
        &self,
        context: &AppstoreRequestContext,
        template_id: &str,
        user_id: &str,
        usage_kind: &crate::domain::models::AppTemplateUsageKind,
    ) -> AppstoreServiceResult<Option<crate::domain::models::AppTemplateUsage>>;

    async fn insert_feedback(
        &self,
        context: &AppstoreRequestContext,
        feedback: &crate::domain::models::Feedback,
    ) -> AppstoreServiceResult<()>;
}
