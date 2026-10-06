use sdkwork_appstore_catalog_service::domain::commands::{
    CategoriesListRequest, CategoryCreateRequest, CategoryLocalizationInput, CategoryUpdateRequest,
    CollectionCreateRequest, CollectionItemInput, CollectionItemsUpsertRequest,
    CollectionLocalizationInput, CollectionUpdateRequest, CollectionsListRequest,
    FeaturedListRequest, FeaturedUpsertRequest,
};

pub fn map_collection_create(
    collection_code: String,
    collection_type: String,
    audience_scope: String,
    sort_order: Option<i32>,
    cover_media_resource_id: Option<String>,
    starts_at: Option<String>,
    ends_at: Option<String>,
    localizations: Vec<CollectionLocalizationInput>,
) -> CollectionCreateRequest {
    let mut req = CollectionCreateRequest::new(collection_code, collection_type, audience_scope);
    if let Some(v) = sort_order {
        req = req.with_sort_order(v);
    }
    if let Some(v) = cover_media_resource_id {
        req = req.with_cover_media_resource_id(v);
    }
    if let Some(v) = starts_at {
        req = req.with_starts_at(v);
    }
    if let Some(v) = ends_at {
        req = req.with_ends_at(v);
    }
    req = req.with_localizations(localizations);
    req
}

pub fn map_collection_update(
    collection_id: String,
    collection_type: Option<String>,
    audience_scope: Option<String>,
    sort_order: Option<i32>,
    cover_media_resource_id: Option<String>,
    starts_at: Option<String>,
    ends_at: Option<String>,
    status: Option<String>,
    localizations: Option<Vec<CollectionLocalizationInput>>,
) -> CollectionUpdateRequest {
    let mut req = CollectionUpdateRequest::new(collection_id);
    if let Some(v) = collection_type {
        req = req.with_collection_type(v);
    }
    if let Some(v) = audience_scope {
        req = req.with_audience_scope(v);
    }
    if let Some(v) = sort_order {
        req = req.with_sort_order(v);
    }
    if let Some(v) = cover_media_resource_id {
        req = req.with_cover_media_resource_id(v);
    }
    if let Some(v) = starts_at {
        req = req.with_starts_at(v);
    }
    if let Some(v) = ends_at {
        req = req.with_ends_at(v);
    }
    if let Some(v) = status {
        req = req.with_status(v);
    }
    if let Some(v) = localizations {
        req = req.with_localizations(v);
    }
    req
}

pub fn map_collection_items_upsert(
    collection_id: String,
    items: Vec<CollectionItemInput>,
) -> CollectionItemsUpsertRequest {
    CollectionItemsUpsertRequest::new(collection_id, items)
}

pub fn map_featured_upsert(
    slot_code: String,
    listing_id: String,
    audience_scope: String,
    platform_scope: Option<String>,
    region_scope: Option<Vec<String>>,
    starts_at: String,
    ends_at: String,
) -> FeaturedUpsertRequest {
    let mut req =
        FeaturedUpsertRequest::new(slot_code, listing_id, audience_scope, starts_at, ends_at);
    if let Some(v) = platform_scope {
        req = req.with_platform_scope(v);
    }
    if let Some(v) = region_scope {
        req = req.with_region_scope(v);
    }
    req
}

pub fn map_category_create(
    category_code: String,
    parent_category_id: Option<String>,
    category_level: Option<i32>,
    sort_order: Option<i32>,
    icon_media_resource_id: Option<String>,
    localizations: Vec<CategoryLocalizationInput>,
) -> CategoryCreateRequest {
    let mut req = CategoryCreateRequest::new(category_code);
    if let Some(v) = parent_category_id {
        req = req.with_parent_category_id(v);
    }
    if let Some(v) = category_level {
        req = req.with_category_level(v);
    }
    if let Some(v) = sort_order {
        req = req.with_sort_order(v);
    }
    if let Some(v) = icon_media_resource_id {
        req = req.with_icon_media_resource_id(v);
    }
    req = req.with_localizations(localizations);
    req
}

pub fn map_category_update(
    category_id: String,
    parent_category_id: Option<String>,
    category_level: Option<i32>,
    sort_order: Option<i32>,
    icon_media_resource_id: Option<String>,
    status: Option<String>,
    localizations: Option<Vec<CategoryLocalizationInput>>,
) -> CategoryUpdateRequest {
    let mut req = CategoryUpdateRequest::new(category_id);
    if let Some(v) = parent_category_id {
        req = req.with_parent_category_id(v);
    }
    if let Some(v) = category_level {
        req = req.with_category_level(v);
    }
    if let Some(v) = sort_order {
        req = req.with_sort_order(v);
    }
    if let Some(v) = icon_media_resource_id {
        req = req.with_icon_media_resource_id(v);
    }
    if let Some(v) = status {
        req = req.with_status(v);
    }
    if let Some(v) = localizations {
        req = req.with_localizations(v);
    }
    req
}

pub fn map_admin_categories_list(
    cursor: Option<String>,
    page_size: Option<i32>,
) -> CategoriesListRequest {
    let mut req = CategoriesListRequest::new();
    if let Some(v) = cursor {
        req = req.with_cursor(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    req
}

pub fn map_admin_collections_list(
    cursor: Option<String>,
    page_size: Option<i32>,
) -> CollectionsListRequest {
    let mut req = CollectionsListRequest::new();
    if let Some(v) = cursor {
        req = req.with_cursor(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    req
}

pub fn map_admin_featured_list() -> FeaturedListRequest {
    FeaturedListRequest::new()
}
