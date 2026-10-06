use crate::mapper;
use sdkwork_appstore_catalog_service::context::AppstoreRequestContext;
use sdkwork_appstore_catalog_service::domain::commands::{
    CategoryLocalizationInput, CollectionItemInput, CollectionLocalizationInput,
};
use sdkwork_appstore_catalog_service::domain::results::{
    CategoriesListResult, CategoryCreateResult, CategoryUpdateResult, CollectionCreateResult,
    CollectionItemsUpsertResult, CollectionUpdateResult, CollectionsListResult,
    FeaturedListResult, FeaturedUpsertResult,
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
        operation_id: "appstore.catalog.admin.categories.list",
        handler_name: "catalog_admin_categories_list",
        service_method: "admin_categories_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.admin.collections.list",
        handler_name: "catalog_admin_collections_list",
        service_method: "admin_collections_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.admin.featured.list",
        handler_name: "catalog_admin_featured_list",
        service_method: "admin_featured_list",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.collections.create",
        handler_name: "catalog_collections_create",
        service_method: "create_collection",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.collections.update",
        handler_name: "catalog_collections_update",
        service_method: "update_collection",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.collections.items.update",
        handler_name: "catalog_collections_items_upsert",
        service_method: "upsert_collection_items",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.featured.update",
        handler_name: "catalog_featured_upsert",
        service_method: "upsert_featured",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.categories.create",
        handler_name: "catalog_categories_create",
        service_method: "create_category",
    },
    RouteHandlerPlan {
        operation_id: "appstore.catalog.categories.update",
        handler_name: "catalog_categories_update",
        service_method: "update_category",
    },
];

pub fn route_handler_plans() -> &'static [RouteHandlerPlan] {
    ROUTE_HANDLER_PLANS
}

pub async fn catalog_collections_create<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    collection_code: String,
    collection_type: String,
    audience_scope: String,
    sort_order: Option<i32>,
    cover_media_resource_id: Option<String>,
    starts_at: Option<String>,
    ends_at: Option<String>,
    localizations: Vec<CollectionLocalizationInput>,
) -> Result<CollectionCreateResult, AppstoreServiceError> {
    let cmd = mapper::request::map_collection_create(
        collection_code,
        collection_type,
        audience_scope,
        sort_order,
        cover_media_resource_id,
        starts_at,
        ends_at,
        localizations,
    );
    service.collection_create(context, cmd).await
}

pub async fn catalog_collections_update<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    collection_id: String,
    collection_type: Option<String>,
    audience_scope: Option<String>,
    sort_order: Option<i32>,
    cover_media_resource_id: Option<String>,
    starts_at: Option<String>,
    ends_at: Option<String>,
    status: Option<String>,
    localizations: Option<Vec<CollectionLocalizationInput>>,
) -> Result<CollectionUpdateResult, AppstoreServiceError> {
    let cmd = mapper::request::map_collection_update(
        collection_id,
        collection_type,
        audience_scope,
        sort_order,
        cover_media_resource_id,
        starts_at,
        ends_at,
        status,
        localizations,
    );
    service.collection_update(context, cmd).await
}

pub async fn catalog_collections_items_upsert<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    collection_id: String,
    items: Vec<CollectionItemInput>,
) -> Result<CollectionItemsUpsertResult, AppstoreServiceError> {
    let cmd = mapper::request::map_collection_items_upsert(collection_id, items);
    service.collection_items_upsert(context, cmd).await
}

pub async fn catalog_featured_upsert<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    slot_code: String,
    listing_id: String,
    audience_scope: String,
    platform_scope: Option<String>,
    region_scope: Option<Vec<String>>,
    starts_at: String,
    ends_at: String,
) -> Result<FeaturedUpsertResult, AppstoreServiceError> {
    let cmd = mapper::request::map_featured_upsert(
        slot_code,
        listing_id,
        audience_scope,
        platform_scope,
        region_scope,
        starts_at,
        ends_at,
    );
    service.featured_upsert(context, cmd).await
}

pub async fn catalog_categories_create<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    category_code: String,
    parent_category_id: Option<String>,
    category_level: Option<i32>,
    sort_order: Option<i32>,
    icon_media_resource_id: Option<String>,
    localizations: Vec<CategoryLocalizationInput>,
) -> Result<CategoryCreateResult, AppstoreServiceError> {
    let cmd = mapper::request::map_category_create(
        category_code,
        parent_category_id,
        category_level,
        sort_order,
        icon_media_resource_id,
        localizations,
    );
    service.category_create(context, cmd).await
}

pub async fn catalog_categories_update<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    category_id: String,
    parent_category_id: Option<String>,
    category_level: Option<i32>,
    sort_order: Option<i32>,
    icon_media_resource_id: Option<String>,
    status: Option<String>,
    localizations: Option<Vec<CategoryLocalizationInput>>,
) -> Result<CategoryUpdateResult, AppstoreServiceError> {
    let cmd = mapper::request::map_category_update(
        category_id,
        parent_category_id,
        category_level,
        sort_order,
        icon_media_resource_id,
        status,
        localizations,
    );
    service.category_update(context, cmd).await
}

pub async fn catalog_admin_categories_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<CategoriesListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_admin_categories_list(cursor, page_size);
    service.admin_categories_list(context, cmd).await
}

pub async fn catalog_admin_collections_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<CollectionsListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_admin_collections_list(cursor, page_size);
    service.admin_collections_list(context, cmd).await
}

pub async fn catalog_admin_featured_list<S: CatalogOperations>(
    service: &S,
    context: &AppstoreRequestContext,
) -> Result<FeaturedListResult, AppstoreServiceError> {
    let cmd = mapper::request::map_admin_featured_list();
    service.admin_featured_list(context, cmd).await
}
