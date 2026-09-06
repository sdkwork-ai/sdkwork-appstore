use sdkwork_appstore_user_store_service::domain::models::ListingCard;
use sdkwork_appstore_user_store_service::domain::results::PublicUserStoreViewResult;

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
pub(crate) struct PublicCategorySummaryResponse {
    pub(crate) user_category_id: String,
    pub(crate) name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) icon_media_resource_id: Option<String>,
    pub(crate) sort_order: i32,
    pub(crate) item_count: i64,
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

pub(crate) fn map_listing_cards(cards: &[ListingCard]) -> Vec<ListingCardResponse> {
    cards.iter().map(ListingCardResponse::from).collect()
}
