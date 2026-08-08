//! Catalog service entrypoint.

use chrono::Utc;
use sdkwork_appstore_authorization::{missing_scope_message, scope_granted};
use uuid::Uuid;

use crate::context::AppstoreRequestContext;
use crate::domain::commands::{
    AnalyticsOperatorDashboardRequest, AnalyticsOperatorSearchRequest,
    AnalyticsPublisherListingRetrieveRequest, AnalyticsPublisherListingsListRequest,
    AnalyticsPublisherOverviewRequest, CategoriesListRequest, CategoryCreateRequest,
    CategoryRetrieveRequest, CategoryUpdateRequest, ChartsRetrieveRequest, CollectionCreateRequest,
    CollectionItemsUpsertRequest, CollectionRetrieveRequest, CollectionUpdateRequest,
    CollectionsListRequest, EventRetrieveRequest, EventsListRequest, FeaturedListRequest,
    FeaturedUpsertRequest, FeedbackCreateRequest, HomeRetrieveRequest, ListingsSearchRequest,
    MetricsRetrieveRequest, PublicFeaturedListRequest, RecentlyUpdatedListRequest,
    RecommendationsListRequest, SearchHistoryClearRequest, SearchHistoryListRequest,
    SearchHistoryUpsertRequest, SearchSuggestionsListRequest, SearchTrendingListRequest,
    TemplateCreateRequest, TemplateRetrieveRequest, TemplateUsageCreateRequest,
    TemplatesListRequest,
};
use crate::domain::models::{
    AppTemplate, AppTemplateUsage, AppTemplateUsageKind, AudienceScope, CatalogCollection,
    CatalogCollectionItem, CatalogCollectionLocalization, CatalogFeaturedSlot, Category,
    CategoryId, CategoryLocalization, CategoryStatus, CategoryWithLocalizations, CollectionId,
    CollectionStatus, CollectionType, CollectionWithItems, FeaturedSlotId, FeaturedSlotStatus,
    Feedback, ListingSummary, PlatformScope, SearchHistoryEntry,
};
use crate::domain::results::{
    AnalyticsOperatorDashboardResult, AnalyticsOperatorSearchResult,
    AnalyticsPublisherListingRetrieveResult, AnalyticsPublisherListingsListResult,
    AnalyticsPublisherOverviewResult, CategoriesListResult, CategoryCreateResult,
    CategoryRetrieveResult, CategoryUpdateResult, ChartsRetrieveResult, CollectionCreateResult,
    CollectionItemsUpsertResult, CollectionRetrieveResult, CollectionUpdateResult,
    CollectionsListResult, EventRetrieveResult, EventsListResult, FeaturedListResult,
    FeaturedUpsertResult, FeedbackCreateResult, HomeRetrieveResult, ListingsSearchResult,
    MetricsRetrieveResult, PublicFeaturedListResult, RecentlyUpdatedListResult,
    RecommendationsListResult, SearchHistoryClearResult, SearchHistoryListResult,
    SearchHistoryUpsertResult, SearchSuggestionsListResult, SearchTrendingListResult,
    TemplateCreateResult, TemplateRetrieveResult, TemplateUsageCreateResult, TemplatesListResult,
};
use crate::error::{AppstoreServiceError, AppstoreServiceResult};
use crate::ports::repository::CatalogRepositoryPort;
use crate::ports::search_federation::CatalogSearchFederationPort;
use std::sync::Arc;

#[async_trait::async_trait]
pub trait CatalogOperations {
    async fn home_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: HomeRetrieveRequest,
    ) -> AppstoreServiceResult<HomeRetrieveResult>;

    async fn categories_list(
        &self,
        context: &AppstoreRequestContext,
        request: CategoriesListRequest,
    ) -> AppstoreServiceResult<CategoriesListResult>;

    async fn category_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: CategoryRetrieveRequest,
    ) -> AppstoreServiceResult<CategoryRetrieveResult>;

    async fn category_create(
        &self,
        context: &AppstoreRequestContext,
        request: CategoryCreateRequest,
    ) -> AppstoreServiceResult<CategoryCreateResult>;

    async fn category_update(
        &self,
        context: &AppstoreRequestContext,
        request: CategoryUpdateRequest,
    ) -> AppstoreServiceResult<CategoryUpdateResult>;

    async fn collections_list(
        &self,
        context: &AppstoreRequestContext,
        request: CollectionsListRequest,
    ) -> AppstoreServiceResult<CollectionsListResult>;

    async fn collection_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: CollectionRetrieveRequest,
    ) -> AppstoreServiceResult<CollectionRetrieveResult>;

    async fn collection_create(
        &self,
        context: &AppstoreRequestContext,
        request: CollectionCreateRequest,
    ) -> AppstoreServiceResult<CollectionCreateResult>;

    async fn collection_update(
        &self,
        context: &AppstoreRequestContext,
        request: CollectionUpdateRequest,
    ) -> AppstoreServiceResult<CollectionUpdateResult>;

    async fn collection_items_upsert(
        &self,
        context: &AppstoreRequestContext,
        request: CollectionItemsUpsertRequest,
    ) -> AppstoreServiceResult<CollectionItemsUpsertResult>;

    async fn featured_list(
        &self,
        context: &AppstoreRequestContext,
        request: FeaturedListRequest,
    ) -> AppstoreServiceResult<FeaturedListResult>;

    async fn featured_upsert(
        &self,
        context: &AppstoreRequestContext,
        request: FeaturedUpsertRequest,
    ) -> AppstoreServiceResult<FeaturedUpsertResult>;

    async fn charts_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: ChartsRetrieveRequest,
    ) -> AppstoreServiceResult<ChartsRetrieveResult>;

    async fn listings_search(
        &self,
        context: &AppstoreRequestContext,
        request: ListingsSearchRequest,
    ) -> AppstoreServiceResult<ListingsSearchResult>;

    async fn metrics_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: MetricsRetrieveRequest,
    ) -> AppstoreServiceResult<MetricsRetrieveResult>;

    async fn public_featured_list(
        &self,
        context: &AppstoreRequestContext,
        request: PublicFeaturedListRequest,
    ) -> AppstoreServiceResult<PublicFeaturedListResult>;

    async fn recommendations_list(
        &self,
        context: &AppstoreRequestContext,
        request: RecommendationsListRequest,
    ) -> AppstoreServiceResult<RecommendationsListResult>;

    async fn recently_updated_list(
        &self,
        context: &AppstoreRequestContext,
        request: RecentlyUpdatedListRequest,
    ) -> AppstoreServiceResult<RecentlyUpdatedListResult>;

    async fn events_list(
        &self,
        context: &AppstoreRequestContext,
        request: EventsListRequest,
    ) -> AppstoreServiceResult<EventsListResult>;

    async fn event_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: EventRetrieveRequest,
    ) -> AppstoreServiceResult<EventRetrieveResult>;

    async fn search_suggestions_list(
        &self,
        context: &AppstoreRequestContext,
        request: SearchSuggestionsListRequest,
    ) -> AppstoreServiceResult<SearchSuggestionsListResult>;

    async fn search_trending_list(
        &self,
        context: &AppstoreRequestContext,
        request: SearchTrendingListRequest,
    ) -> AppstoreServiceResult<SearchTrendingListResult>;

    async fn search_history_list(
        &self,
        context: &AppstoreRequestContext,
        request: SearchHistoryListRequest,
    ) -> AppstoreServiceResult<SearchHistoryListResult>;

    async fn search_history_upsert(
        &self,
        context: &AppstoreRequestContext,
        request: SearchHistoryUpsertRequest,
    ) -> AppstoreServiceResult<SearchHistoryUpsertResult>;

    async fn search_history_clear(
        &self,
        context: &AppstoreRequestContext,
        request: SearchHistoryClearRequest,
    ) -> AppstoreServiceResult<SearchHistoryClearResult>;

    async fn analytics_publisher_overview_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: AnalyticsPublisherOverviewRequest,
    ) -> AppstoreServiceResult<AnalyticsPublisherOverviewResult>;

    async fn analytics_publisher_listings_list(
        &self,
        context: &AppstoreRequestContext,
        request: AnalyticsPublisherListingsListRequest,
    ) -> AppstoreServiceResult<AnalyticsPublisherListingsListResult>;

    async fn analytics_publisher_listings_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: AnalyticsPublisherListingRetrieveRequest,
    ) -> AppstoreServiceResult<AnalyticsPublisherListingRetrieveResult>;

    async fn analytics_operator_dashboard_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: AnalyticsOperatorDashboardRequest,
    ) -> AppstoreServiceResult<AnalyticsOperatorDashboardResult>;

    async fn analytics_operator_search_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: AnalyticsOperatorSearchRequest,
    ) -> AppstoreServiceResult<AnalyticsOperatorSearchResult>;

    async fn templates_list(
        &self,
        context: &AppstoreRequestContext,
        request: TemplatesListRequest,
    ) -> AppstoreServiceResult<TemplatesListResult>;

    async fn template_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: TemplateRetrieveRequest,
    ) -> AppstoreServiceResult<TemplateRetrieveResult>;

    async fn template_create(
        &self,
        context: &AppstoreRequestContext,
        request: TemplateCreateRequest,
    ) -> AppstoreServiceResult<TemplateCreateResult>;

    async fn template_usage_create(
        &self,
        context: &AppstoreRequestContext,
        request: TemplateUsageCreateRequest,
    ) -> AppstoreServiceResult<TemplateUsageCreateResult>;

    async fn feedback_create(
        &self,
        context: &AppstoreRequestContext,
        request: FeedbackCreateRequest,
    ) -> AppstoreServiceResult<FeedbackCreateResult>;
}

#[derive(Clone)]
pub struct CatalogService<R> {
    repository: R,
    search_federation: Option<Arc<dyn CatalogSearchFederationPort>>,
}

impl<R: std::fmt::Debug> std::fmt::Debug for CatalogService<R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CatalogService")
            .field("repository", &self.repository)
            .field("search_federation", &self.search_federation.is_some())
            .finish()
    }
}

impl<R> CatalogService<R> {
    pub fn new(repository: R) -> Self {
        Self {
            repository,
            search_federation: None,
        }
    }

    pub fn with_search_federation(mut self, port: Arc<dyn CatalogSearchFederationPort>) -> Self {
        self.search_federation = Some(port);
        self
    }
}

fn require_scope(context: &AppstoreRequestContext, required: &str) -> AppstoreServiceResult<()> {
    if scope_granted(&context.permission_scopes, required) {
        Ok(())
    } else {
        Err(AppstoreServiceError::PermissionDenied(
            missing_scope_message(required),
        ))
    }
}

fn require_user_id(context: &AppstoreRequestContext) -> AppstoreServiceResult<String> {
    context
        .user_id
        .as_ref()
        .filter(|id| !id.trim().is_empty())
        .cloned()
        .ok_or_else(|| {
            AppstoreServiceError::PermissionDenied("Authenticated user is required".to_string())
        })
}

async fn resolve_publisher_id<R: CatalogRepositoryPort>(
    repository: &R,
    context: &AppstoreRequestContext,
) -> AppstoreServiceResult<String> {
    let user_id = require_user_id(context)?;
    repository
        .find_publisher_id_by_owner(context, &user_id)
        .await?
        .ok_or_else(|| {
            AppstoreServiceError::NotFound(
                "Publisher profile not found for current user".to_string(),
            )
        })
}

fn listing_ids_from_chart_ranking(ranking: &serde_json::Value) -> Vec<String> {
    match ranking {
        serde_json::Value::Array(items) => items
            .iter()
            .filter_map(|item| match item {
                serde_json::Value::String(id) => Some(id.clone()),
                serde_json::Value::Object(obj) => obj
                    .get("listing_id")
                    .or_else(|| obj.get("listingId"))
                    .and_then(|value| value.as_str())
                    .map(str::to_owned),
                _ => None,
            })
            .collect(),
        serde_json::Value::Object(obj) => ["entries", "listings", "items", "ranking"]
            .iter()
            .find_map(|key| obj.get(*key))
            .map(|value| listing_ids_from_chart_ranking(value))
            .unwrap_or_default(),
        _ => Vec::new(),
    }
}

fn merge_recommendation_listing_ids(
    featured_slots: &[CatalogFeaturedSlot],
    chart_ids: &[String],
) -> Vec<String> {
    let mut merged = Vec::new();
    let mut seen = std::collections::HashSet::new();

    for slot in featured_slots {
        if seen.insert(slot.listing_id.clone()) {
            merged.push(slot.listing_id.clone());
        }
    }
    for id in chart_ids {
        if seen.insert(id.clone()) {
            merged.push(id.clone());
        }
    }

    merged
}

fn paginate_id_list(
    ids: &[String],
    cursor: Option<&str>,
    limit: i32,
) -> (Vec<String>, Option<String>, bool) {
    let start = cursor
        .and_then(|cursor_id| ids.iter().position(|id| id == cursor_id))
        .map(|index| index + 1)
        .unwrap_or(0);
    let page_ids: Vec<String> = ids
        .iter()
        .skip(start)
        .take(limit as usize)
        .cloned()
        .collect();
    let has_more = start + page_ids.len() < ids.len();
    let next_cursor = if has_more {
        page_ids.last().cloned()
    } else {
        None
    };
    (page_ids, next_cursor, has_more)
}

fn order_listings_by_ids(listings: Vec<ListingSummary>, ids: &[String]) -> Vec<ListingSummary> {
    let mut by_id = listings
        .into_iter()
        .map(|listing| (listing.id.clone(), listing))
        .collect::<std::collections::HashMap<_, _>>();
    ids.iter().filter_map(|id| by_id.remove(id)).collect()
}

fn is_event_collection(collection: &CatalogCollection) -> bool {
    collection.status == CollectionStatus::Published
        && collection.starts_at.is_some()
        && collection.ends_at.is_some()
}

#[async_trait::async_trait]
impl<R> CatalogOperations for CatalogService<R>
where
    R: CatalogRepositoryPort,
{
    async fn home_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: HomeRetrieveRequest,
    ) -> AppstoreServiceResult<HomeRetrieveResult> {
        let featured_slots = self.repository.find_featured_slots(context).await?;
        let collections = self.repository.find_collections(context, None, 20).await?;
        let chart_locale = request.locale.as_deref().unwrap_or("en-US");
        let latest_chart = self
            .repository
            .find_latest_chart_snapshot(context, "top", chart_locale, "ALL")
            .await?;
        let charts = latest_chart.into_iter().collect();

        Ok(HomeRetrieveResult::new(
            "appstore.catalog.home.retrieve",
            featured_slots,
            collections,
            charts,
        ))
    }

    async fn categories_list(
        &self,
        context: &AppstoreRequestContext,
        request: CategoriesListRequest,
    ) -> AppstoreServiceResult<CategoriesListResult> {
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let categories = self
            .repository
            .find_categories(context, request.cursor.as_deref(), limit + 1)
            .await?;

        let has_more = categories.len() > limit as usize;
        let categories: Vec<Category> = categories.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            categories.last().map(|c| c.id.as_str().to_string())
        } else {
            None
        };

        let mut result_categories = Vec::new();
        for category in categories {
            let localizations = self
                .repository
                .find_category_localizations(context, &category.id)
                .await?;
            result_categories.push(CategoryWithLocalizations {
                category,
                localizations,
            });
        }

        Ok(CategoriesListResult::new(
            "appstore.catalog.categories.list",
            result_categories,
            next_cursor,
            has_more,
        ))
    }

    async fn category_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: CategoryRetrieveRequest,
    ) -> AppstoreServiceResult<CategoryRetrieveResult> {
        let category_id = CategoryId::new(&request.category_id);
        let category = self
            .repository
            .find_category_by_id(context, &category_id)
            .await?;

        match category {
            Some(category) => {
                let localizations = self
                    .repository
                    .find_category_localizations(context, &category_id)
                    .await?;
                Ok(CategoryRetrieveResult::found(
                    "appstore.catalog.categories.retrieve",
                    CategoryWithLocalizations {
                        category,
                        localizations,
                    },
                ))
            }
            None => Ok(CategoryRetrieveResult::not_found(
                "appstore.catalog.categories.retrieve",
            )),
        }
    }

    async fn category_create(
        &self,
        context: &AppstoreRequestContext,
        request: CategoryCreateRequest,
    ) -> AppstoreServiceResult<CategoryCreateResult> {
        require_scope(context, "appstore.catalog.admin")?;
        if request.category_code.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Category code is required".to_string(),
            ));
        }

        let existing = self
            .repository
            .find_category_by_code(context, &request.category_code)
            .await?;
        if existing.is_some() {
            return Err(AppstoreServiceError::AlreadyExists(format!(
                "Category code already exists: {}",
                request.category_code
            )));
        }

        let now = Utc::now();
        let category_id = CategoryId::new(Uuid::new_v4().to_string());

        let category = Category {
            id: category_id.clone(),
            tenant_id: context.tenant_id.clone(),
            category_code: request.category_code,
            parent_category_id: request.parent_category_id,
            category_level: request.category_level.unwrap_or(1),
            status: CategoryStatus::Active,
            sort_order: request.sort_order.unwrap_or(0),
            icon_media_resource_id: request.icon_media_resource_id,
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_category(context, &category).await?;

        let mut localizations = Vec::new();
        for loc_input in request.localizations {
            let loc = CategoryLocalization {
                id: Uuid::new_v4().to_string(),
                tenant_id: context.tenant_id.clone(),
                category_id: category_id.clone(),
                locale: loc_input.locale,
                display_name: loc_input.display_name,
                description: loc_input.description,
                created_at: now,
                updated_at: now,
            };
            self.repository
                .upsert_category_localization(context, &loc)
                .await?;
            localizations.push(loc);
        }

        Ok(CategoryCreateResult::created(
            "appstore.catalog.categories.create",
            category,
            localizations,
        ))
    }

    async fn category_update(
        &self,
        context: &AppstoreRequestContext,
        request: CategoryUpdateRequest,
    ) -> AppstoreServiceResult<CategoryUpdateResult> {
        require_scope(context, "appstore.catalog.admin")?;
        let category_id = CategoryId::new(&request.category_id);

        let mut category = self
            .repository
            .find_category_by_id(context, &category_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Category not found: {}",
                    request.category_id
                ))
            })?;

        let mut updated_fields = Vec::new();

        if let Some(parent_category_id) = request.parent_category_id {
            category.parent_category_id = Some(parent_category_id);
            updated_fields.push("parent_category_id".to_string());
        }

        if let Some(level) = request.category_level {
            category.category_level = level;
            updated_fields.push("category_level".to_string());
        }

        if let Some(order) = request.sort_order {
            category.sort_order = order;
            updated_fields.push("sort_order".to_string());
        }

        if let Some(icon) = request.icon_media_resource_id {
            category.icon_media_resource_id = Some(icon);
            updated_fields.push("icon_media_resource_id".to_string());
        }

        if let Some(status_str) = request.status {
            let status = CategoryStatus::from_str(&status_str).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid category status: {}",
                    status_str
                ))
            })?;
            category.status = status;
            updated_fields.push("status".to_string());
        }

        if !updated_fields.is_empty() {
            category.updated_at = Utc::now();
            self.repository.update_category(context, &category).await?;
        }

        let mut localizations = Vec::new();
        if let Some(loc_inputs) = request.localizations {
            for loc_input in loc_inputs {
                let loc = CategoryLocalization {
                    id: Uuid::new_v4().to_string(),
                    tenant_id: context.tenant_id.clone(),
                    category_id: category_id.clone(),
                    locale: loc_input.locale,
                    display_name: loc_input.display_name,
                    description: loc_input.description,
                    created_at: Utc::now(),
                    updated_at: Utc::now(),
                };
                self.repository
                    .upsert_category_localization(context, &loc)
                    .await?;
                localizations.push(loc);
            }
        } else {
            localizations = self
                .repository
                .find_category_localizations(context, &category_id)
                .await?;
        }

        Ok(CategoryUpdateResult::updated(
            "appstore.catalog.categories.update",
            category,
            localizations,
        ))
    }

    async fn collections_list(
        &self,
        context: &AppstoreRequestContext,
        request: CollectionsListRequest,
    ) -> AppstoreServiceResult<CollectionsListResult> {
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let collections = self
            .repository
            .find_collections(context, request.cursor.as_deref(), limit + 1)
            .await?;

        let has_more = collections.len() > limit as usize;
        let collections: Vec<CatalogCollection> =
            collections.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            collections.last().map(|c| c.id.as_str().to_string())
        } else {
            None
        };

        let mut result_collections = Vec::new();
        for collection in collections {
            let localizations = self
                .repository
                .find_collection_localizations(context, &collection.id)
                .await?;
            let items = self
                .repository
                .find_collection_items(context, &collection.id)
                .await?;
            result_collections.push(CollectionWithItems {
                collection,
                localizations,
                items,
            });
        }

        Ok(CollectionsListResult::new(
            "appstore.catalog.collections.list",
            result_collections,
            next_cursor,
            has_more,
        ))
    }

    async fn collection_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: CollectionRetrieveRequest,
    ) -> AppstoreServiceResult<CollectionRetrieveResult> {
        let collection_id = CollectionId::new(&request.collection_id);
        let collection = self
            .repository
            .find_collection_by_id(context, &collection_id)
            .await?;

        match collection {
            Some(collection) => {
                let localizations = self
                    .repository
                    .find_collection_localizations(context, &collection_id)
                    .await?;
                let items = self
                    .repository
                    .find_collection_items(context, &collection_id)
                    .await?;
                Ok(CollectionRetrieveResult::found(
                    "appstore.catalog.collections.retrieve",
                    CollectionWithItems {
                        collection,
                        localizations,
                        items,
                    },
                ))
            }
            None => Ok(CollectionRetrieveResult::not_found(
                "appstore.catalog.collections.retrieve",
            )),
        }
    }

    async fn collection_create(
        &self,
        context: &AppstoreRequestContext,
        request: CollectionCreateRequest,
    ) -> AppstoreServiceResult<CollectionCreateResult> {
        require_scope(context, "appstore.catalog.admin")?;
        if request.collection_code.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Collection code is required".to_string(),
            ));
        }

        let existing = self
            .repository
            .find_collection_by_code(context, &request.collection_code)
            .await?;
        if existing.is_some() {
            return Err(AppstoreServiceError::AlreadyExists(format!(
                "Collection code already exists: {}",
                request.collection_code
            )));
        }

        let collection_type =
            CollectionType::from_str(&request.collection_type).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid collection type: {}",
                    request.collection_type
                ))
            })?;

        let audience_scope = AudienceScope::from_str(&request.audience_scope).ok_or_else(|| {
            AppstoreServiceError::ValidationFailed(format!(
                "Invalid audience scope: {}",
                request.audience_scope
            ))
        })?;

        let now = Utc::now();
        let collection_id = CollectionId::new(Uuid::new_v4().to_string());

        let starts_at = request.starts_at.as_deref().and_then(|s| s.parse().ok());
        let ends_at = request.ends_at.as_deref().and_then(|s| s.parse().ok());

        let collection = CatalogCollection {
            id: collection_id.clone(),
            tenant_id: context.tenant_id.clone(),
            collection_code: request.collection_code,
            collection_type,
            status: CollectionStatus::Draft,
            audience_scope,
            sort_order: request.sort_order.unwrap_or(0),
            cover_media_resource_id: request.cover_media_resource_id,
            starts_at,
            ends_at,
            created_at: now,
            updated_at: now,
        };

        self.repository
            .insert_collection(context, &collection)
            .await?;

        let mut localizations = Vec::new();
        for loc_input in request.localizations {
            let loc = CatalogCollectionLocalization {
                id: Uuid::new_v4().to_string(),
                tenant_id: context.tenant_id.clone(),
                collection_id: collection_id.clone(),
                locale: loc_input.locale,
                display_name: loc_input.display_name,
                description: loc_input.description,
                created_at: now,
                updated_at: now,
            };
            self.repository
                .upsert_collection_localization(context, &loc)
                .await?;
            localizations.push(loc);
        }

        Ok(CollectionCreateResult::created(
            "appstore.catalog.collections.create",
            collection,
            localizations,
        ))
    }

    async fn collection_update(
        &self,
        context: &AppstoreRequestContext,
        request: CollectionUpdateRequest,
    ) -> AppstoreServiceResult<CollectionUpdateResult> {
        require_scope(context, "appstore.catalog.admin")?;
        let collection_id = CollectionId::new(&request.collection_id);

        let mut collection = self
            .repository
            .find_collection_by_id(context, &collection_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Collection not found: {}",
                    request.collection_id
                ))
            })?;

        let mut updated_fields = Vec::new();

        if let Some(type_str) = request.collection_type {
            let collection_type = CollectionType::from_str(&type_str).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid collection type: {}",
                    type_str
                ))
            })?;
            collection.collection_type = collection_type;
            updated_fields.push("collection_type".to_string());
        }

        if let Some(scope_str) = request.audience_scope {
            let audience_scope = AudienceScope::from_str(&scope_str).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid audience scope: {}",
                    scope_str
                ))
            })?;
            collection.audience_scope = audience_scope;
            updated_fields.push("audience_scope".to_string());
        }

        if let Some(order) = request.sort_order {
            collection.sort_order = order;
            updated_fields.push("sort_order".to_string());
        }

        if let Some(cover) = request.cover_media_resource_id {
            collection.cover_media_resource_id = Some(cover);
            updated_fields.push("cover_media_resource_id".to_string());
        }

        if let Some(starts) = request.starts_at {
            collection.starts_at = starts.parse().ok();
            updated_fields.push("starts_at".to_string());
        }

        if let Some(ends) = request.ends_at {
            collection.ends_at = ends.parse().ok();
            updated_fields.push("ends_at".to_string());
        }

        if let Some(status_str) = request.status {
            let status = CollectionStatus::from_str(&status_str).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid collection status: {}",
                    status_str
                ))
            })?;
            collection.status = status;
            updated_fields.push("status".to_string());
        }

        if !updated_fields.is_empty() {
            collection.updated_at = Utc::now();
            self.repository
                .update_collection(context, &collection)
                .await?;
        }

        let mut localizations = Vec::new();
        if let Some(loc_inputs) = request.localizations {
            for loc_input in loc_inputs {
                let loc = CatalogCollectionLocalization {
                    id: Uuid::new_v4().to_string(),
                    tenant_id: context.tenant_id.clone(),
                    collection_id: collection_id.clone(),
                    locale: loc_input.locale,
                    display_name: loc_input.display_name,
                    description: loc_input.description,
                    created_at: Utc::now(),
                    updated_at: Utc::now(),
                };
                self.repository
                    .upsert_collection_localization(context, &loc)
                    .await?;
                localizations.push(loc);
            }
        } else {
            localizations = self
                .repository
                .find_collection_localizations(context, &collection_id)
                .await?;
        }

        Ok(CollectionUpdateResult::updated(
            "appstore.catalog.collections.update",
            collection,
            localizations,
        ))
    }

    async fn collection_items_upsert(
        &self,
        context: &AppstoreRequestContext,
        request: CollectionItemsUpsertRequest,
    ) -> AppstoreServiceResult<CollectionItemsUpsertResult> {
        require_scope(context, "appstore.catalog.admin")?;
        let collection_id = CollectionId::new(&request.collection_id);

        let _collection = self
            .repository
            .find_collection_by_id(context, &collection_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Collection not found: {}",
                    request.collection_id
                ))
            })?;

        let now = Utc::now();
        let items: Vec<CatalogCollectionItem> = request
            .items
            .into_iter()
            .enumerate()
            .map(|(index, item_input)| {
                let starts_at = item_input.starts_at.as_deref().and_then(|s| s.parse().ok());
                let ends_at = item_input.ends_at.as_deref().and_then(|s| s.parse().ok());
                CatalogCollectionItem {
                    id: Uuid::new_v4().to_string(),
                    tenant_id: context.tenant_id.clone(),
                    collection_id: collection_id.clone(),
                    listing_id: item_input.listing_id,
                    sort_order: item_input.sort_order.unwrap_or(index as i32),
                    highlight: item_input
                        .highlight
                        .unwrap_or(serde_json::Value::Object(serde_json::Map::new())),
                    starts_at,
                    ends_at,
                    created_at: now,
                }
            })
            .collect();

        self.repository
            .replace_collection_items(context, &collection_id, &items)
            .await?;

        Ok(CollectionItemsUpsertResult::upserted(
            "appstore.catalog.collections.items.update",
            items,
        ))
    }

    async fn featured_list(
        &self,
        context: &AppstoreRequestContext,
        _request: FeaturedListRequest,
    ) -> AppstoreServiceResult<FeaturedListResult> {
        let slots = self.repository.find_featured_slots(context).await?;

        Ok(FeaturedListResult::new(
            "appstore.catalog.featured.list",
            slots,
        ))
    }

    async fn featured_upsert(
        &self,
        context: &AppstoreRequestContext,
        request: FeaturedUpsertRequest,
    ) -> AppstoreServiceResult<FeaturedUpsertResult> {
        require_scope(context, "appstore.catalog.admin")?;
        if request.slot_code.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Slot code is required".to_string(),
            ));
        }

        if request.listing_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Listing ID is required".to_string(),
            ));
        }

        let audience_scope = AudienceScope::from_str(&request.audience_scope).ok_or_else(|| {
            AppstoreServiceError::ValidationFailed(format!(
                "Invalid audience scope: {}",
                request.audience_scope
            ))
        })?;

        let platform_scope = request
            .platform_scope
            .as_deref()
            .and_then(PlatformScope::from_str)
            .unwrap_or(PlatformScope::All);

        let starts_at = request.starts_at.parse().map_err(|_| {
            AppstoreServiceError::ValidationFailed("Invalid starts_at format".to_string())
        })?;
        let ends_at = request.ends_at.parse().map_err(|_| {
            AppstoreServiceError::ValidationFailed("Invalid ends_at format".to_string())
        })?;

        let now = Utc::now();
        let existing = self
            .repository
            .find_featured_slot_by_code(context, &request.slot_code)
            .await?;

        let slot_id = existing
            .as_ref()
            .map(|s| s.id.clone())
            .unwrap_or_else(|| FeaturedSlotId::new(Uuid::new_v4().to_string()));
        let existing_created_at = existing.as_ref().map(|s| s.created_at);

        let slot = CatalogFeaturedSlot {
            id: slot_id,
            tenant_id: context.tenant_id.clone(),
            slot_code: request.slot_code,
            listing_id: request.listing_id,
            status: FeaturedSlotStatus::Active,
            audience_scope,
            platform_scope,
            region_scope: request.region_scope.unwrap_or_default(),
            starts_at,
            ends_at,
            created_at: existing_created_at.unwrap_or(now),
            updated_at: now,
        };

        self.repository.upsert_featured_slot(context, &slot).await?;

        Ok(FeaturedUpsertResult::upserted(
            "appstore.catalog.featured.update",
            slot,
        ))
    }

    async fn charts_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: ChartsRetrieveRequest,
    ) -> AppstoreServiceResult<ChartsRetrieveResult> {
        let locale = request.locale.as_deref().unwrap_or("en-US");
        let platform_scope = request.platform_scope.as_deref().unwrap_or("ALL");

        let chart = if let Some(date) = request.snapshot_date.as_deref() {
            self.repository
                .find_chart_snapshot(context, &request.chart_code, date, locale, platform_scope)
                .await?
        } else {
            self.repository
                .find_latest_chart_snapshot(context, &request.chart_code, locale, platform_scope)
                .await?
        };

        match chart {
            Some(chart) => Ok(ChartsRetrieveResult::found(
                "appstore.catalog.charts.retrieve",
                chart,
            )),
            None => Ok(ChartsRetrieveResult::not_found(
                "appstore.catalog.charts.retrieve",
            )),
        }
    }

    async fn listings_search(
        &self,
        context: &AppstoreRequestContext,
        request: ListingsSearchRequest,
    ) -> AppstoreServiceResult<ListingsSearchResult> {
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        if let Some(ids) = request.ids.as_deref() {
            if ids.len() > 100 {
                return Err(AppstoreServiceError::ValidationFailed(
                    "ids filter exceeds the maximum of 100 entries".to_string(),
                ));
            }
        }

        let mut listings = if let (Some(port), Some(query)) =
            (&self.search_federation, request.query.as_deref())
        {
            let trimmed = query.trim();
            if trimmed.is_empty() {
                Vec::new()
            } else {
                match port
                    .resolve_listing_ids(
                        &context.tenant_id,
                        trimmed,
                        request.category_id.as_deref(),
                        limit + 1,
                    )
                    .await
                {
                    Ok(listing_ids) if !listing_ids.is_empty() => {
                        let mut hydrated = self
                            .repository
                            .find_listings_by_ids(context, &listing_ids, None)
                            .await?;
                        let order: std::collections::HashMap<&str, usize> = listing_ids
                            .iter()
                            .enumerate()
                            .map(|(index, id)| (id.as_str(), index))
                            .collect();
                        hydrated.sort_by_key(|listing| {
                            order
                                .get(listing.id.as_str())
                                .copied()
                                .unwrap_or(usize::MAX)
                        });
                        hydrated
                    }
                    Ok(_) => Vec::new(),
                    Err(error) => {
                        tracing::warn!(
                            "federated search unavailable, falling back to SQL: {error}"
                        );
                        self.repository
                            .search_listings(
                                context,
                                request.query.as_deref(),
                                request.category_id.as_deref(),
                                request.cursor.as_deref(),
                                limit + 1,
                                request.ids.as_deref(),
                            )
                            .await?
                    }
                }
            }
        } else {
            self.repository
                .search_listings(
                    context,
                    request.query.as_deref(),
                    request.category_id.as_deref(),
                    request.cursor.as_deref(),
                    limit + 1,
                    request.ids.as_deref(),
                )
                .await?
        };

        if listings.is_empty()
            && request
                .query
                .as_deref()
                .map(str::trim)
                .is_some_and(|value| !value.is_empty())
            && self.search_federation.is_some()
        {
            listings = self
                .repository
                .search_listings(
                    context,
                    request.query.as_deref(),
                    request.category_id.as_deref(),
                    request.cursor.as_deref(),
                    limit + 1,
                    request.ids.as_deref(),
                )
                .await?;
        }

        let has_more = listings.len() > limit as usize;
        let listings: Vec<ListingSummary> = listings.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            listings.last().map(|l| l.id.clone())
        } else {
            None
        };

        Ok(ListingsSearchResult::new(
            "appstore.catalog.listings.list",
            listings,
            next_cursor,
            has_more,
        ))
    }

    async fn metrics_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: MetricsRetrieveRequest,
    ) -> AppstoreServiceResult<MetricsRetrieveResult> {
        require_scope(context, "appstore.metrics.read")?;
        if request.listing_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Listing ID is required".to_string(),
            ));
        }

        let metrics = self
            .repository
            .find_metric_snapshots(
                context,
                &request.listing_id,
                request.start_date.as_deref(),
                request.end_date.as_deref(),
            )
            .await?;

        Ok(MetricsRetrieveResult::new(
            "appstore.metrics.listings.retrieve",
            metrics,
        ))
    }

    async fn public_featured_list(
        &self,
        context: &AppstoreRequestContext,
        request: PublicFeaturedListRequest,
    ) -> AppstoreServiceResult<PublicFeaturedListResult> {
        let all_slots = self.repository.find_featured_slots(context).await?;

        let now = Utc::now();
        let filtered: Vec<CatalogFeaturedSlot> = all_slots
            .into_iter()
            .filter(|slot| {
                slot.status == FeaturedSlotStatus::Active
                    && slot.audience_scope == AudienceScope::Public
                    && slot.starts_at <= now
                    && slot.ends_at >= now
            })
            .collect();

        let limit = request.page_size.unwrap_or(20).clamp(1, 200) as usize;
        let slots: Vec<CatalogFeaturedSlot> = filtered.into_iter().take(limit).collect();

        Ok(PublicFeaturedListResult::new(
            "appstore.catalog.public.featured.list",
            slots,
        ))
    }

    async fn recommendations_list(
        &self,
        context: &AppstoreRequestContext,
        request: RecommendationsListRequest,
    ) -> AppstoreServiceResult<RecommendationsListResult> {
        require_scope(context, "appstore.catalog.read")?;
        let locale = request.locale.as_deref().unwrap_or("en-US");
        let platform_scope = request
            .platform
            .as_deref()
            .and_then(PlatformScope::from_str)
            .unwrap_or(PlatformScope::All);
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);

        let chart = self
            .repository
            .find_latest_chart_snapshot(context, "top", locale, platform_scope.as_str())
            .await?;
        let chart_ids = chart
            .as_ref()
            .map(|snapshot| listing_ids_from_chart_ranking(&snapshot.ranking))
            .unwrap_or_default();

        let now = Utc::now();
        let featured_slots: Vec<CatalogFeaturedSlot> = self
            .repository
            .find_featured_slots(context)
            .await?
            .into_iter()
            .filter(|slot| {
                slot.status == FeaturedSlotStatus::Active
                    && slot.starts_at <= now
                    && slot.ends_at >= now
                    && (slot.platform_scope == PlatformScope::All
                        || slot.platform_scope == platform_scope)
            })
            .collect();

        let merged_ids = merge_recommendation_listing_ids(&featured_slots, &chart_ids);
        let (page_ids, next_cursor, has_more) =
            paginate_id_list(&merged_ids, request.cursor.as_deref(), limit);

        let listings = if page_ids.is_empty() {
            Vec::new()
        } else {
            let fetched = self
                .repository
                .find_listings_by_ids(context, &page_ids, Some(locale))
                .await?;
            order_listings_by_ids(fetched, &page_ids)
        };

        Ok(RecommendationsListResult::new(
            "appstore.catalog.recommendations.list",
            listings,
            next_cursor,
            has_more,
        ))
    }

    async fn recently_updated_list(
        &self,
        context: &AppstoreRequestContext,
        request: RecentlyUpdatedListRequest,
    ) -> AppstoreServiceResult<RecentlyUpdatedListResult> {
        require_scope(context, "appstore.catalog.read")?;
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let listings = self
            .repository
            .find_recently_updated_listings(
                context,
                request.locale.as_deref(),
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = listings.len() > limit as usize;
        let listings: Vec<ListingSummary> = listings.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            listings.last().map(|listing| listing.id.clone())
        } else {
            None
        };

        Ok(RecentlyUpdatedListResult::new(
            "appstore.catalog.recentlyUpdated.list",
            listings,
            next_cursor,
            has_more,
        ))
    }

    async fn events_list(
        &self,
        context: &AppstoreRequestContext,
        request: EventsListRequest,
    ) -> AppstoreServiceResult<EventsListResult> {
        require_scope(context, "appstore.catalog.read")?;
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let collections = self
            .repository
            .find_event_collections(
                context,
                request.status.as_deref(),
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = collections.len() > limit as usize;
        let collections: Vec<CatalogCollection> =
            collections.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            collections
                .last()
                .map(|collection| collection.id.as_str().to_string())
        } else {
            None
        };

        let mut events = Vec::new();
        for collection in collections {
            let localizations = self
                .repository
                .find_collection_localizations(context, &collection.id)
                .await?;
            let items = self
                .repository
                .find_collection_items(context, &collection.id)
                .await?;
            events.push(CollectionWithItems {
                collection,
                localizations,
                items,
            });
        }

        Ok(EventsListResult::new(
            "appstore.catalog.events.list",
            events,
            next_cursor,
            has_more,
        ))
    }

    async fn event_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: EventRetrieveRequest,
    ) -> AppstoreServiceResult<EventRetrieveResult> {
        require_scope(context, "appstore.catalog.read")?;
        let collection_id = CollectionId::new(&request.event_id);
        let collection = self
            .repository
            .find_collection_by_id(context, &collection_id)
            .await?;

        match collection {
            Some(collection) if is_event_collection(&collection) => {
                let localizations = self
                    .repository
                    .find_collection_localizations(context, &collection_id)
                    .await?;
                let items = self
                    .repository
                    .find_collection_items(context, &collection_id)
                    .await?;
                Ok(EventRetrieveResult::found(
                    "appstore.catalog.events.retrieve",
                    CollectionWithItems {
                        collection,
                        localizations,
                        items,
                    },
                ))
            }
            _ => Ok(EventRetrieveResult::not_found(
                "appstore.catalog.events.retrieve",
            )),
        }
    }

    async fn search_suggestions_list(
        &self,
        context: &AppstoreRequestContext,
        request: SearchSuggestionsListRequest,
    ) -> AppstoreServiceResult<SearchSuggestionsListResult> {
        require_scope(context, "appstore.catalog.read")?;
        if request.query.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Query parameter q is required".to_string(),
            ));
        }

        let limit = 10;
        let prefix = request.query.trim();
        let locale = request.locale.as_deref();

        let mut listing_suggestions = self
            .repository
            .find_listing_name_suggestions(context, prefix, locale, limit)
            .await?;
        let remaining = limit.saturating_sub(listing_suggestions.len() as i32);
        if remaining > 0 {
            let mut trending_suggestions = self
                .repository
                .find_trending_term_suggestions(context, prefix, locale, remaining)
                .await?;
            listing_suggestions.append(&mut trending_suggestions);
        }

        Ok(SearchSuggestionsListResult::new(
            "appstore.catalog.search.suggestions.list",
            listing_suggestions,
        ))
    }

    async fn search_trending_list(
        &self,
        context: &AppstoreRequestContext,
        request: SearchTrendingListRequest,
    ) -> AppstoreServiceResult<SearchTrendingListResult> {
        require_scope(context, "appstore.catalog.read")?;
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let terms = self
            .repository
            .find_trending_terms(context, request.locale.as_deref(), limit)
            .await?;

        Ok(SearchTrendingListResult::new(
            "appstore.catalog.search.trending.list",
            terms,
        ))
    }

    async fn search_history_list(
        &self,
        context: &AppstoreRequestContext,
        request: SearchHistoryListRequest,
    ) -> AppstoreServiceResult<SearchHistoryListResult> {
        require_scope(context, "appstore.catalog.read")?;
        let user_id = require_user_id(context)?;
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let entries = self
            .repository
            .find_search_history(context, &user_id, request.cursor.as_deref(), limit + 1)
            .await?;

        let has_more = entries.len() > limit as usize;
        let entries: Vec<SearchHistoryEntry> = entries.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            entries.last().map(|entry| entry.id.clone())
        } else {
            None
        };

        Ok(SearchHistoryListResult::new(
            "appstore.catalog.search.history.list",
            entries,
            next_cursor,
            has_more,
        ))
    }

    async fn search_history_upsert(
        &self,
        context: &AppstoreRequestContext,
        request: SearchHistoryUpsertRequest,
    ) -> AppstoreServiceResult<SearchHistoryUpsertResult> {
        require_scope(context, "appstore.catalog.read")?;
        let user_id = require_user_id(context)?;
        if request.query_text.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "query_text is required".to_string(),
            ));
        }

        let now = Utc::now();
        let entry = SearchHistoryEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            user_id,
            query_text: request.query_text,
            filters_json: request.filters_json.unwrap_or_else(|| "{}".to_string()),
            result_count: request.result_count.unwrap_or(0),
            created_at: now,
        };

        self.repository
            .insert_search_history(context, &entry)
            .await?;

        Ok(SearchHistoryUpsertResult::upserted(
            "appstore.catalog.search.history.update",
            entry,
        ))
    }

    async fn search_history_clear(
        &self,
        context: &AppstoreRequestContext,
        _request: SearchHistoryClearRequest,
    ) -> AppstoreServiceResult<SearchHistoryClearResult> {
        require_scope(context, "appstore.catalog.read")?;
        let user_id = require_user_id(context)?;
        self.repository
            .clear_search_history(context, &user_id)
            .await?;

        Ok(SearchHistoryClearResult::cleared(
            "appstore.catalog.search.history.delete",
        ))
    }

    async fn analytics_publisher_overview_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: AnalyticsPublisherOverviewRequest,
    ) -> AppstoreServiceResult<AnalyticsPublisherOverviewResult> {
        require_scope(context, "appstore.analytics.publisher")?;
        let publisher_id = resolve_publisher_id(&self.repository, context).await?;
        let overview = self
            .repository
            .aggregate_publisher_metrics(
                context,
                &publisher_id,
                request.date_from.as_deref(),
                request.date_to.as_deref(),
            )
            .await?;

        Ok(AnalyticsPublisherOverviewResult::new(
            "appstore.analytics.publisher.overview.retrieve",
            overview,
        ))
    }

    async fn analytics_publisher_listings_list(
        &self,
        context: &AppstoreRequestContext,
        request: AnalyticsPublisherListingsListRequest,
    ) -> AppstoreServiceResult<AnalyticsPublisherListingsListResult> {
        require_scope(context, "appstore.analytics.publisher")?;
        let publisher_id = resolve_publisher_id(&self.repository, context).await?;
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let listings = self
            .repository
            .list_publisher_listing_metrics(
                context,
                &publisher_id,
                request.date_from.as_deref(),
                request.date_to.as_deref(),
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = listings.len() > limit as usize;
        let listings: Vec<_> = listings.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            listings.last().map(|item| item.listing_id.clone())
        } else {
            None
        };

        Ok(AnalyticsPublisherListingsListResult::new(
            "appstore.analytics.publisher.listings.list",
            listings,
            next_cursor,
            has_more,
        ))
    }

    async fn analytics_publisher_listings_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: AnalyticsPublisherListingRetrieveRequest,
    ) -> AppstoreServiceResult<AnalyticsPublisherListingRetrieveResult> {
        require_scope(context, "appstore.analytics.publisher")?;
        if request.listing_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Listing ID is required".to_string(),
            ));
        }

        let publisher_id = resolve_publisher_id(&self.repository, context).await?;
        let belongs = self
            .repository
            .listing_belongs_to_publisher(context, request.listing_id.trim(), &publisher_id)
            .await?;
        if !belongs {
            return Err(AppstoreServiceError::NotFound(format!(
                "Listing not found: {}",
                request.listing_id
            )));
        }

        let metrics = self
            .repository
            .find_metric_snapshots(
                context,
                request.listing_id.trim(),
                request.date_from.as_deref(),
                request.date_to.as_deref(),
            )
            .await?;

        Ok(AnalyticsPublisherListingRetrieveResult::new(
            "appstore.analytics.publisher.listings.retrieve",
            request.listing_id,
            metrics,
        ))
    }

    async fn analytics_operator_dashboard_retrieve(
        &self,
        context: &AppstoreRequestContext,
        _request: AnalyticsOperatorDashboardRequest,
    ) -> AppstoreServiceResult<AnalyticsOperatorDashboardResult> {
        require_scope(context, "appstore.analytics.operator")?;
        let dashboard = self
            .repository
            .count_operator_dashboard_stats(context)
            .await?;

        Ok(AnalyticsOperatorDashboardResult::new(
            "appstore.analytics.operator.dashboard.retrieve",
            dashboard,
        ))
    }

    async fn analytics_operator_search_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: AnalyticsOperatorSearchRequest,
    ) -> AppstoreServiceResult<AnalyticsOperatorSearchResult> {
        require_scope(context, "appstore.analytics.operator")?;
        let analytics = self
            .repository
            .find_operator_search_analytics(
                context,
                request.query.as_deref(),
                request.date_from.as_deref(),
                request.date_to.as_deref(),
                50,
            )
            .await?;

        Ok(AnalyticsOperatorSearchResult::new(
            "appstore.analytics.operator.search.retrieve",
            analytics,
        ))
    }

    async fn templates_list(
        &self,
        context: &AppstoreRequestContext,
        request: TemplatesListRequest,
    ) -> AppstoreServiceResult<TemplatesListResult> {
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let templates = self
            .repository
            .find_templates(
                context,
                request.query.as_deref(),
                request.category_code.as_deref(),
                request.template_type.as_deref(),
                request.cursor.as_deref(),
                limit + 1,
                context.user_id.as_deref(),
            )
            .await?;

        let has_more = templates.len() > limit as usize;
        let templates: Vec<AppTemplate> = templates.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            templates.last().map(|template| template.id.clone())
        } else {
            None
        };

        Ok(TemplatesListResult::new(
            "appstore.catalog.templates.list",
            templates,
            next_cursor,
            has_more,
        ))
    }

    async fn template_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: TemplateRetrieveRequest,
    ) -> AppstoreServiceResult<TemplateRetrieveResult> {
        match self
            .repository
            .find_template_by_id(context, &request.template_id, context.user_id.as_deref())
            .await?
        {
            Some(template) => Ok(TemplateRetrieveResult::found(
                "appstore.catalog.templates.retrieve",
                template,
            )),
            None => Ok(TemplateRetrieveResult::not_found(
                "appstore.catalog.templates.retrieve",
            )),
        }
    }

    async fn template_create(
        &self,
        context: &AppstoreRequestContext,
        request: TemplateCreateRequest,
    ) -> AppstoreServiceResult<TemplateCreateResult> {
        let publisher_id = resolve_publisher_id(&self.repository, context).await?;
        let now = Utc::now();
        let template_type = request.template_type.to_ascii_uppercase();
        let template_code = request.template_code.clone().or_else(|| {
            let base = slugify_template_name(&request.template_name);
            Some(format!(
                "tpl-{}-{}",
                base,
                Uuid::new_v4()
                    .simple()
                    .to_string()
                    .chars()
                    .take(8)
                    .collect::<String>()
            ))
        });

        let metadata = enrich_template_metadata(&request.metadata, &publisher_id);
        let template = AppTemplate {
            id: Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            organization_id: context
                .organization_id
                .clone()
                .unwrap_or_else(|| "0".to_string()),
            template_code: template_code.unwrap_or_else(|| Uuid::new_v4().to_string()),
            template_name: request.template_name.clone(),
            description: request.description.clone(),
            template_type,
            category_code: request.category_code.clone(),
            framework: request.framework.clone(),
            language: request.language.clone(),
            icon_media_resource_id: request.icon_media_resource_id.clone(),
            git_repo_url: request.git_repo_url.clone(),
            author_name: metadata
                .get("authorName")
                .and_then(|value| value.as_str())
                .map(ToOwned::to_owned),
            capability_manifest: request.capability_manifest.clone(),
            metadata,
            star_count: 0,
            fork_count: 0,
            clone_count: 0,
            is_enabled: false,
            published_at: Some(now),
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_template(context, &template).await?;

        Ok(TemplateCreateResult::new(
            "appstore.catalog.templates.create",
            template,
        ))
    }

    async fn template_usage_create(
        &self,
        context: &AppstoreRequestContext,
        request: TemplateUsageCreateRequest,
    ) -> AppstoreServiceResult<TemplateUsageCreateResult> {
        let template = self
            .repository
            .find_template_by_id(context, &request.template_id, context.user_id.as_deref())
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "App template {} not found",
                    request.template_id
                ))
            })?;

        let usage_kind = AppTemplateUsageKind::from_str(&request.usage_type.to_ascii_uppercase())
            .ok_or_else(|| {
            AppstoreServiceError::ValidationFailed(format!(
                "Unsupported template usage type {}",
                request.usage_type
            ))
        })?;

        let user_id = context.user_id.clone();
        let usage = AppTemplateUsage {
            id: Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            organization_id: context
                .organization_id
                .clone()
                .unwrap_or_else(|| "0".to_string()),
            template_id: template.id.clone(),
            user_id: user_id.clone(),
            usage_kind,
            metadata: request.metadata.clone(),
            created_at: Utc::now(),
        };
        self.repository
            .insert_template_usage(context, &usage)
            .await?;

        let counts = self
            .repository
            .find_template_usage_counts(context, &template.id)
            .await?;

        let is_starred = if let Some(user) = user_id.as_deref() {
            self.repository
                .find_latest_template_usage_state(
                    context,
                    &template.id,
                    user,
                    &AppTemplateUsageKind::Star,
                )
                .await?
                .map(|entry| {
                    entry
                        .metadata
                        .get("action")
                        .and_then(|value| value.as_str())
                        .map(|action| action != "unstar")
                        .unwrap_or(true)
                })
                .unwrap_or(false)
        } else {
            false
        };

        let is_enabled = if let Some(user) = user_id.as_deref() {
            self.repository
                .find_latest_template_usage_state(
                    context,
                    &template.id,
                    user,
                    &AppTemplateUsageKind::Enable,
                )
                .await?
                .map(|entry| {
                    entry
                        .metadata
                        .get("action")
                        .and_then(|value| value.as_str())
                        .map(|action| action == "enable")
                        .unwrap_or(true)
                })
                .unwrap_or(false)
        } else {
            false
        };

        Ok(TemplateUsageCreateResult::new(
            "appstore.catalog.templates.usage.create",
            template.id,
            usage_kind.as_str().to_string(),
            counts.star_count,
            counts.fork_count,
            counts.clone_count,
            is_starred,
            is_enabled,
        ))
    }

    async fn feedback_create(
        &self,
        context: &AppstoreRequestContext,
        request: FeedbackCreateRequest,
    ) -> AppstoreServiceResult<FeedbackCreateResult> {
        if request.content.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Feedback content is required".to_string(),
            ));
        }

        let feedback = Feedback {
            id: Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            user_id: context.user_id.clone(),
            feedback_type: request.feedback_type.clone(),
            content: request.content.clone(),
            contact: request.contact.clone(),
            listing_id: request.listing_id.clone(),
            app_key: request.app_key.clone(),
            status: "submitted".to_string(),
            created_at: Utc::now(),
        };
        self.repository.insert_feedback(context, &feedback).await?;

        Ok(FeedbackCreateResult::new(
            "appstore.catalog.feedback.create",
            feedback,
        ))
    }
}

fn slugify_template_name(name: &str) -> String {
    let slug: String = name
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() {
                ch.to_ascii_lowercase()
            } else if ch.is_whitespace() || ch == '-' || ch == '_' {
                '-'
            } else {
                '-'
            }
        })
        .collect();
    let slug = slug
        .split('-')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    if slug.is_empty() {
        "template".to_string()
    } else {
        slug.chars().take(48).collect()
    }
}

fn enrich_template_metadata(metadata: &serde_json::Value, publisher_id: &str) -> serde_json::Value {
    let mut merged = match metadata {
        serde_json::Value::Object(map) => map.clone(),
        _ => serde_json::Map::new(),
    };
    merged
        .entry("publisherId".to_string())
        .or_insert_with(|| serde_json::Value::String(publisher_id.to_string()));
    serde_json::Value::Object(merged)
}
