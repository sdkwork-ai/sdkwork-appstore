use sdkwork_appstore_user_store_service::domain::models::ListingCard;
use sdkwork_appstore_user_store_service::domain::models::{
    UserCategory, UserCategoryItem, UserStoreShare,
};
use sdkwork_appstore_user_store_service::domain::results::{
    AddCategoryItemResult, CategoriesListResult, CategoryCreateResult, CategoryRetrieveResult,
    CategoryUpdateResult, PublicUserStoreViewResult, RegenerateShareTokenResult, ShareCreateResult,
    ShareUpdateResult, SharesListResult,
};

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UserCategoryResponse {
    pub(crate) id: String,
    pub(crate) name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) icon_media_resource_id: Option<String>,
    pub(crate) sort_order: i32,
    pub(crate) status: String,
    pub(crate) item_count: i64,
    pub(crate) created_at: String,
    pub(crate) updated_at: String,
}

impl From<(&UserCategory, i64)> for UserCategoryResponse {
    fn from((category, item_count): (&UserCategory, i64)) -> Self {
        let mut response = Self::from(category);
        response.item_count = item_count;
        response
    }
}

impl From<&UserCategory> for UserCategoryResponse {
    fn from(category: &UserCategory) -> Self {
        Self {
            id: category.id.clone(),
            name: category.name.clone(),
            description: category.description.clone(),
            icon_media_resource_id: category.icon_media_resource_id.clone(),
            sort_order: category.sort_order,
            status: category.status.as_str().to_string(),
            item_count: 0,
            created_at: category.created_at.to_rfc3339(),
            updated_at: category.updated_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ListingCardResponse {
    pub(crate) listing_id: String,
    pub(crate) display_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) subtitle: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) icon_media_resource_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) average_rating: Option<String>,
    pub(crate) download_count: i64,
}

impl From<&ListingCard> for ListingCardResponse {
    fn from(card: &ListingCard) -> Self {
        Self {
            listing_id: card.listing_id.clone(),
            display_name: card.display_name.clone(),
            subtitle: card.subtitle.clone(),
            icon_media_resource_id: card.icon_media_resource_id.clone(),
            average_rating: card.average_rating.clone(),
            download_count: card.download_count,
        }
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UserCategoryItemResponse {
    pub(crate) id: String,
    pub(crate) user_category_id: String,
    pub(crate) listing_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) note: Option<String>,
    pub(crate) sort_order: i32,
    pub(crate) created_at: String,
    pub(crate) updated_at: String,
}

impl From<&UserCategoryItem> for UserCategoryItemResponse {
    fn from(item: &UserCategoryItem) -> Self {
        Self {
            id: item.id.clone(),
            user_category_id: item.user_category_id.clone(),
            listing_id: item.listing_id.clone(),
            note: item.note.clone(),
            sort_order: item.sort_order,
            created_at: item.created_at.to_rfc3339(),
            updated_at: item.updated_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CategoryItemWithCardResponse {
    pub(crate) item: UserCategoryItemResponse,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) listing_card: Option<ListingCardResponse>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CategoryItemCountResponse {
    pub(crate) user_category_id: String,
    pub(crate) count: i64,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UserStoreShareResponse {
    pub(crate) id: String,
    pub(crate) share_token: String,
    pub(crate) title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) description: Option<String>,
    pub(crate) scope: String,
    pub(crate) selected_category_ids: Vec<String>,
    pub(crate) visibility: String,
    pub(crate) status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) expires_at: Option<String>,
    pub(crate) view_count: i64,
    pub(crate) created_at: String,
    pub(crate) updated_at: String,
}

impl From<&UserStoreShare> for UserStoreShareResponse {
    fn from(share: &UserStoreShare) -> Self {
        Self {
            id: share.id.clone(),
            share_token: share.share_token.clone(),
            title: share.title.clone(),
            description: share.description.clone(),
            scope: share.scope.as_str().to_string(),
            selected_category_ids: share.selected_category_ids.clone(),
            visibility: share.visibility.as_str().to_string(),
            status: share.status.as_str().to_string(),
            expires_at: share.expires_at.map(|t| t.to_rfc3339()),
            view_count: share.view_count,
            created_at: share.created_at.to_rfc3339(),
            updated_at: share.updated_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PublicCategorySummaryResponse {
    pub(crate) user_category_id: String,
    pub(crate) name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) icon_media_resource_id: Option<String>,
    pub(crate) sort_order: i32,
    pub(crate) item_count: i64,
}

pub(crate) fn map_category(category: &UserCategory) -> UserCategoryResponse {
    UserCategoryResponse::from(category)
}

pub(crate) fn map_category_created(result: CategoryCreateResult) -> UserCategoryResponse {
    UserCategoryResponse::from(&result.category)
}

pub(crate) fn map_categories_page(
    result: CategoriesListResult,
) -> (Vec<UserCategoryResponse>, Option<String>, bool) {
    let items = result
        .items
        .iter()
        .map(|category| {
            let item_count = result
                .item_counts
                .iter()
                .find(|count| count.user_category_id == category.id)
                .map(|count| count.count)
                .unwrap_or(0);
            UserCategoryResponse::from((category, item_count))
        })
        .collect();
    (items, result.next_cursor, result.has_more)
}

pub(crate) fn map_item_with_card(
    item: &sdkwork_appstore_user_store_service::domain::results::CategoryItemWithCard,
) -> CategoryItemWithCardResponse {
    CategoryItemWithCardResponse {
        item: UserCategoryItemResponse::from(&item.item),
        listing_card: item.listing_card.as_ref().map(ListingCardResponse::from),
    }
}

pub(crate) fn map_item_added(result: AddCategoryItemResult) -> CategoryItemWithCardResponse {
    CategoryItemWithCardResponse {
        item: UserCategoryItemResponse::from(&result.item),
        listing_card: result.listing_card.as_ref().map(ListingCardResponse::from),
    }
}

pub(crate) fn map_share(share: &UserStoreShare) -> UserStoreShareResponse {
    UserStoreShareResponse::from(share)
}

pub(crate) fn map_share_created(result: ShareCreateResult) -> UserStoreShareResponse {
    UserStoreShareResponse::from(&result.share)
}

pub(crate) fn map_shares_page(
    result: SharesListResult,
) -> (Vec<UserStoreShareResponse>, Option<String>, bool) {
    let items = result
        .items
        .iter()
        .map(UserStoreShareResponse::from)
        .collect();
    (items, result.next_cursor, result.has_more)
}

pub(crate) fn map_public_view(result: PublicUserStoreViewResult) -> PublicUserStoreViewResponse {
    PublicUserStoreViewResponse {
        share_token: result.share_token,
        title: result.title,
        description: result.description,
        owner_user_id: result.owner_user_id,
        categories: result
            .categories
            .iter()
            .map(|category| PublicCategorySummaryResponse {
                user_category_id: category.user_category_id.clone(),
                name: category.name.clone(),
                icon_media_resource_id: category.icon_media_resource_id.clone(),
                sort_order: category.sort_order,
                item_count: category.item_count,
            })
            .collect(),
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PublicUserStoreViewResponse {
    pub(crate) share_token: String,
    pub(crate) title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) description: Option<String>,
    pub(crate) owner_user_id: String,
    pub(crate) categories: Vec<PublicCategorySummaryResponse>,
}

pub(crate) fn map_share_updated(result: ShareUpdateResult) -> UserStoreShareResponse {
    UserStoreShareResponse::from(&result.share)
}

pub(crate) fn map_share_regenerated(result: RegenerateShareTokenResult) -> UserStoreShareResponse {
    UserStoreShareResponse::from(&result.share)
}

pub(crate) fn map_category_updated(result: CategoryUpdateResult) -> UserCategoryResponse {
    UserCategoryResponse::from(&result.category)
}

pub(crate) fn map_category_retrieved(result: CategoryRetrieveResult) -> UserCategoryResponse {
    UserCategoryResponse::from(&result.category)
}
