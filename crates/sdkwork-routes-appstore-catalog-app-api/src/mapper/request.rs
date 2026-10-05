use sdkwork_appstore_catalog_service::domain::commands::{
    CategoriesListRequest, CategoryRetrieveRequest, ChartsRetrieveRequest,
    CollectionRetrieveRequest, CollectionsListRequest, EventRetrieveRequest, EventsListRequest,
    FeaturedListRequest, FeedbackCreateRequest, HomeRetrieveRequest, ListingsSearchRequest,
    RecentlyUpdatedListRequest, RecommendationsListRequest, SearchHistoryClearRequest,
    SearchHistoryListRequest, SearchHistoryUpsertRequest, SearchSuggestionsListRequest,
    SearchTrendingListRequest, TemplateCreateRequest, TemplateRetrieveRequest,
    TemplateUsageCreateRequest, TemplatesListRequest,
};

pub fn map_home_retrieve(locale: Option<String>, platform: Option<String>) -> HomeRetrieveRequest {
    let mut req = HomeRetrieveRequest::new();
    if let Some(v) = locale {
        req = req.with_locale(v);
    }
    if let Some(v) = platform {
        req = req.with_platform(v);
    }
    req
}

pub fn map_categories_list(
    locale: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> CategoriesListRequest {
    let mut req = CategoriesListRequest::new();
    if let Some(v) = locale {
        req = req.with_locale(v);
    }
    if let Some(v) = cursor {
        req = req.with_cursor(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    req
}

pub fn map_category_retrieve(
    category_id: String,
    locale: Option<String>,
) -> CategoryRetrieveRequest {
    let mut req = CategoryRetrieveRequest::new(category_id);
    if let Some(v) = locale {
        req = req.with_locale(v);
    }
    req
}

pub fn map_collections_list(
    cursor: Option<String>,
    page_size: Option<i32>,
    audience_scope: Option<String>,
) -> CollectionsListRequest {
    let mut req = CollectionsListRequest::new();
    if let Some(v) = cursor {
        req = req.with_cursor(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    if let Some(v) = audience_scope {
        req = req.with_audience_scope(v);
    }
    req
}

pub fn map_collection_retrieve(
    collection_id: String,
    locale: Option<String>,
) -> CollectionRetrieveRequest {
    let mut req = CollectionRetrieveRequest::new(collection_id);
    if let Some(v) = locale {
        req = req.with_locale(v);
    }
    req
}

pub fn map_featured_list(
    audience_scope: Option<String>,
    platform_scope: Option<String>,
) -> FeaturedListRequest {
    let mut req = FeaturedListRequest::new();
    if let Some(v) = audience_scope {
        req = req.with_audience_scope(v);
    }
    if let Some(v) = platform_scope {
        req = req.with_platform_scope(v);
    }
    req
}

pub fn map_charts_retrieve(
    chart_code: String,
    locale: Option<String>,
    platform_scope: Option<String>,
    snapshot_date: Option<String>,
) -> ChartsRetrieveRequest {
    let mut req = ChartsRetrieveRequest::new(chart_code);
    if let Some(v) = locale {
        req = req.with_locale(v);
    }
    if let Some(v) = platform_scope {
        req = req.with_platform_scope(v);
    }
    if let Some(v) = snapshot_date {
        req = req.with_snapshot_date(v);
    }
    req
}

pub fn map_listings_search(
    query: Option<String>,
    category_id: Option<String>,
    ids: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> ListingsSearchRequest {
    let mut req = ListingsSearchRequest::new();
    if let Some(v) = query {
        req = req.with_query(v);
    }
    if let Some(v) = category_id {
        req = req.with_category_id(v);
    }
    if let Some(v) = ids {
        let parsed: Vec<String> = v
            .split(',')
            .map(str::trim)
            .filter(|part| !part.is_empty())
            .map(ToOwned::to_owned)
            .collect();
        if !parsed.is_empty() {
            req.ids = Some(parsed);
        }
    }
    if let Some(v) = cursor {
        req = req.with_cursor(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    req
}

pub fn map_recommendations_list(
    locale: Option<String>,
    platform: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> RecommendationsListRequest {
    let mut req = RecommendationsListRequest::new();
    if let Some(v) = locale {
        req = req.with_locale(v);
    }
    if let Some(v) = platform {
        req = req.with_platform(v);
    }
    if let Some(v) = cursor {
        req = req.with_cursor(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    req
}

pub fn map_recently_updated_list(
    locale: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> RecentlyUpdatedListRequest {
    let mut req = RecentlyUpdatedListRequest::new();
    if let Some(v) = locale {
        req = req.with_locale(v);
    }
    if let Some(v) = cursor {
        req = req.with_cursor(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    req
}

pub fn map_events_list(
    cursor: Option<String>,
    page_size: Option<i32>,
    status: Option<String>,
) -> EventsListRequest {
    let mut req = EventsListRequest::new();
    if let Some(v) = cursor {
        req = req.with_cursor(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    if let Some(v) = status {
        req = req.with_status(v);
    }
    req
}

pub fn map_event_retrieve(event_id: String, locale: Option<String>) -> EventRetrieveRequest {
    let mut req = EventRetrieveRequest::new(event_id);
    if let Some(v) = locale {
        req = req.with_locale(v);
    }
    req
}

pub fn map_search_suggestions_list(
    query: String,
    locale: Option<String>,
) -> SearchSuggestionsListRequest {
    let mut req = SearchSuggestionsListRequest::new(query);
    if let Some(v) = locale {
        req = req.with_locale(v);
    }
    req
}

pub fn map_search_trending_list(
    locale: Option<String>,
    page_size: Option<i32>,
) -> SearchTrendingListRequest {
    let mut req = SearchTrendingListRequest::new();
    if let Some(v) = locale {
        req = req.with_locale(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    req
}

pub fn map_search_history_list(
    cursor: Option<String>,
    page_size: Option<i32>,
) -> SearchHistoryListRequest {
    let mut req = SearchHistoryListRequest::new();
    if let Some(v) = cursor {
        req = req.with_cursor(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    req
}

pub fn map_search_history_upsert(
    query_text: String,
    filters_json: Option<String>,
) -> SearchHistoryUpsertRequest {
    let mut req = SearchHistoryUpsertRequest::new(query_text);
    if let Some(v) = filters_json {
        req = req.with_filters_json(v);
    }
    req
}

pub fn map_search_history_clear() -> SearchHistoryClearRequest {
    SearchHistoryClearRequest::new()
}

pub fn map_templates_list(
    query: Option<String>,
    category_code: Option<String>,
    template_type: Option<String>,
    template_platform: Option<String>,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> TemplatesListRequest {
    let mut req = TemplatesListRequest::new();
    if let Some(v) = query {
        req = req.with_query(v);
    }
    if let Some(v) = category_code {
        req = req.with_category_code(v);
    }
    if let Some(v) = template_type {
        req = req.with_template_type(v);
    }
    if let Some(v) = template_platform {
        req = req.with_template_platform(v);
    }
    if let Some(v) = cursor {
        req = req.with_cursor(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    req
}

pub fn map_template_retrieve(template_id: String) -> TemplateRetrieveRequest {
    TemplateRetrieveRequest::new(template_id)
}

pub fn map_template_create(
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
) -> TemplateCreateRequest {
    let mut req = TemplateCreateRequest::new(template_name, template_type);
    req.template_code = template_code;
    req.description = description;
    req.template_platform = template_platform;
    req.category_code = category_code;
    req.framework = framework;
    req.language = language;
    req.icon_media_resource_id = icon_media_resource_id;
    req.git_repo_url = git_repo_url;
    if let Some(v) = capability_manifest {
        req.capability_manifest = v;
    }
    if let Some(v) = metadata {
        req.metadata = v;
    }
    req
}

pub fn map_template_usage_create(
    template_id: String,
    usage_type: String,
    metadata: Option<serde_json::Value>,
) -> TemplateUsageCreateRequest {
    let mut req = TemplateUsageCreateRequest::new(template_id, usage_type);
    if let Some(v) = metadata {
        req.metadata = v;
    }
    req
}

pub fn map_feedback_create(
    feedback_type: String,
    content: String,
    contact: Option<String>,
    listing_id: Option<String>,
    app_key: Option<String>,
) -> FeedbackCreateRequest {
    let mut req = FeedbackCreateRequest::new(feedback_type, content);
    req.contact = contact;
    req.listing_id = listing_id;
    req.app_key = app_key;
    req
}
