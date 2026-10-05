use crate::mapper;
use sdkwork_appstore_catalog_service::context::AppstoreRequestContext;
use sdkwork_appstore_catalog_service::domain::results::{
    CategoriesListResult, CategoryRetrieveResult, ChartsRetrieveResult, CollectionRetrieveResult,
    CollectionsListResult, EventRetrieveResult, EventsListResult, FeaturedListResult,
    FeedbackCreateResult, HomeRetrieveResult, ListingsSearchResult, RecentlyUpdatedListResult,
    RecommendationsListResult, SearchHistoryClearResult, SearchHistoryListResult,
    SearchHistoryUpsertResult, SearchSuggestionsListResult, SearchTrendingListResult,
    TemplateCreateResult, TemplateRetrieveResult, TemplateUsageCreateResult, TemplatesListResult,
};
use sdkwork_appstore_catalog_service::error::AppstoreServiceError;
use sdkwork_appstore_catalog_service::CatalogOperations;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RouteHandlerPlan {
    pub operation_id: &'static str,
    pub handler_name: &'static str,
    pub service_method: &'static str,
}

pub const ROUTE_HANDLER_PLANS: &[RouteHandlerPlan] = &[
    RouteHandlerPlan {
        operation_id: "appstore.catalog.home.retrieve",
        handler_name: "catalog_home_retrieve",
        service_method: "retrieve_home",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.categories.list",
        handler_name: "catalog_categories_list",
        service_method: "list_categories",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.categories.retrieve",
        handler_name: "catalog_categories_retrieve",
        service_method: "retrieve_category",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.collections.list",
        handler_name: "catalog_collections_list",
        service_method: "list_collections",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.collections.retrieve",
        handler_name: "catalog_collections_retrieve",
        service_method: "retrieve_collection",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.featured.list",
        handler_name: "catalog_featured_list",
        service_method: "list_featured",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.charts.retrieve",
        handler_name: "catalog_charts_retrieve",
        service_method: "retrieve_charts",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.listings.list",
        handler_name: "catalog_listings_search",
        service_method: "search_listings",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.recommendations.list",
        handler_name: "catalog_recommendations_list",
        service_method: "recommendations_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.recentlyUpdated.list",
        handler_name: "catalog_recently_updated_list",
        service_method: "recently_updated_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.events.list",
        handler_name: "catalog_events_list",
        service_method: "events_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.events.retrieve",
        handler_name: "catalog_events_retrieve",
        service_method: "event_retrieve",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.search.suggestions.list",
        handler_name: "catalog_search_suggestions_list",
        service_method: "search_suggestions_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.search.trending.list",
        handler_name: "catalog_search_trending_list",
        service_method: "search_trending_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.search.history.list",
        handler_name: "catalog_search_history_list",
        service_method: "search_history_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.search.history.update",
        handler_name: "catalog_search_history_upsert",
        service_method: "search_history_upsert",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.search.history.delete",
        handler_name: "catalog_search_history_clear",
        service_method: "search_history_clear",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.templates.list",
        handler_name: "catalog_templates_list",
        service_method: "list_templates",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.templates.retrieve",
        handler_name: "catalog_template_retrieve",
        service_method: "retrieve_template",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.templates.create",
        handler_name: "catalog_template_create",
        service_method: "create_template",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.templates.usage.create",
        handler_name: "catalog_template_usage_create",
        service_method: "create_template_usage",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.feedback.create",
        handler_name: "catalog_feedback_create",
        service_method: "create_feedback",
    },
];

pub fn route_handler_plans() -> &'static [RouteHandlerPlan] {
    ROUTE_HANDLER_PLANS
}

pub async fn catalog_home_retrieve<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    locale: Option<String>,
    platform: Option<String>,
) -> Result<HomeRetrieveResult, AppstoreServiceError> {
    let cmd = mapper::request::map_home_retrieve(locale, platform);
    service.home_retrieve(context, cmd).await
}

pub async fn catalog_categories_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    locale: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<CategoriesListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_categories_list(locale, cursor, page_size);
    service.categories_list(context, cmd).await
}

pub async fn catalog_categories_retrieve<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    category_id: String,
    locale: Option<String>,
) -> Result<CategoryRetrieveResult, AppstoreServiceError> {
    let cmd = mapper::request::map_category_retrieve(category_id, locale);
    service.category_retrieve(context, cmd).await
}

pub async fn catalog_collections_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    cursor: Option<String>,
    page_size: Option<i32>,
    audience_scope: Option<String>,
) -> Result<CollectionsListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_collections_list(cursor, page_size, audience_scope);
    service.collections_list(context, cmd).await
}

pub async fn catalog_collections_retrieve<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    collection_id: String,
    locale: Option<String>,
) -> Result<CollectionRetrieveResult, AppstoreServiceError> {
    let cmd = mapper::request::map_collection_retrieve(collection_id, locale);
    service.collection_retrieve(context, cmd).await
}

pub async fn catalog_featured_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    audience_scope: Option<String>,
    platform_scope: Option<String>,
) -> Result<FeaturedListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_featured_list(audience_scope, platform_scope);
    service.featured_list(context, cmd).await
}

pub async fn catalog_charts_retrieve<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    chart_code: String,
    locale: Option<String>,
    platform_scope: Option<String>,
    snapshot_date: Option<String>,
) -> Result<ChartsRetrieveResult, AppstoreServiceError> {
    let cmd =
        mapper::request::map_charts_retrieve(chart_code, locale, platform_scope, snapshot_date);
    service.charts_retrieve(context, cmd).await
}

pub async fn catalog_listings_search<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    query: Option<String>,
    category_id: Option<String>,
    ids: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<ListingsSearchResult, AppstoreServiceError> {
    let cmd = mapper::request::map_listings_search(query, category_id, ids, cursor, page_size);
    service.listings_search(context, cmd).await
}

pub async fn catalog_recommendations_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    locale: Option<String>,
    platform: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<RecommendationsListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_recommendations_list(locale, platform, cursor, page_size);
    service.recommendations_list(context, cmd).await
}

pub async fn catalog_recently_updated_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    locale: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<RecentlyUpdatedListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_recently_updated_list(locale, cursor, page_size);
    service.recently_updated_list(context, cmd).await
}

pub async fn catalog_events_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    cursor: Option<String>,
    page_size: Option<i32>,
    status: Option<String>,
) -> Result<EventsListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_events_list(cursor, page_size, status);
    service.events_list(context, cmd).await
}

pub async fn catalog_events_retrieve<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    event_id: String,
    locale: Option<String>,
) -> Result<EventRetrieveResult, AppstoreServiceError> {
    let cmd = mapper::request::map_event_retrieve(event_id, locale);
    service.event_retrieve(context, cmd).await
}

pub async fn catalog_search_suggestions_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    query: String,
    locale: Option<String>,
) -> Result<SearchSuggestionsListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_search_suggestions_list(query, locale);
    service.search_suggestions_list(context, cmd).await
}

pub async fn catalog_search_trending_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    locale: Option<String>,
    page_size: Option<i32>,
) -> Result<SearchTrendingListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_search_trending_list(locale, page_size);
    service.search_trending_list(context, cmd).await
}

pub async fn catalog_search_history_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<SearchHistoryListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_search_history_list(cursor, page_size);
    service.search_history_list(context, cmd).await
}

pub async fn catalog_search_history_upsert<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    query_text: String,
    filters_json: Option<String>,
) -> Result<SearchHistoryUpsertResult, AppstoreServiceError> {
    let cmd = mapper::request::map_search_history_upsert(query_text, filters_json);
    service.search_history_upsert(context, cmd).await
}

pub async fn catalog_search_history_clear<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
) -> Result<SearchHistoryClearResult, AppstoreServiceError> {
    let cmd = mapper::request::map_search_history_clear();
    service.search_history_clear(context, cmd).await
}

pub async fn catalog_templates_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    query: Option<String>,
    category_code: Option<String>,
    template_type: Option<String>,
    template_platform: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<TemplatesListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_templates_list(
        query,
        category_code,
        template_type,
        template_platform,
        cursor,
        page_size,
    );
    service.templates_list(context, cmd).await
}

pub async fn catalog_template_retrieve<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    template_id: String,
) -> Result<TemplateRetrieveResult, AppstoreServiceError> {
    let cmd = mapper::request::map_template_retrieve(template_id);
    service.template_retrieve(context, cmd).await
}

pub async fn catalog_template_create<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    template_code: Option<String>,
    template_name: String,
    description: Option<String>,
    template_type: String,
    template_platform: Option<String>,
    category_code: Option<String>,
    framework: Option<String>,
    language: Option<String>,
    icon_media_resource_id: Option<String>,
    git_repo_url: Option<String>,
    capability_manifest: Option<serde_json::Value>,
    metadata: Option<serde_json::Value>,
) -> Result<TemplateCreateResult, AppstoreServiceError> {
    let cmd = mapper::request::map_template_create(
        template_code,
        template_name,
        description,
        template_type,
        template_platform,
        category_code,
        framework,
        language,
        icon_media_resource_id,
        git_repo_url,
        capability_manifest,
        metadata,
    );
    service.template_create(context, cmd).await
}

pub async fn catalog_template_usage_create<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    template_id: String,
    usage_type: String,
    metadata: Option<serde_json::Value>,
) -> Result<TemplateUsageCreateResult, AppstoreServiceError> {
    let cmd = mapper::request::map_template_usage_create(template_id, usage_type, metadata);
    service.template_usage_create(context, cmd).await
}

pub async fn catalog_feedback_create<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    feedback_type: String,
    content: String,
    contact: Option<String>,
    listing_id: Option<String>,
    app_key: Option<String>,
) -> Result<FeedbackCreateResult, AppstoreServiceError> {
    let cmd =
        mapper::request::map_feedback_create(feedback_type, content, contact, listing_id, app_key);
    service.feedback_create(context, cmd).await
}
