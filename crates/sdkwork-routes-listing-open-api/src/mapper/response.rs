use sdkwork_appstore_listing_service::domain::models::Listing;

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PublicListingResponse {
    id: String,
    publisher_id: String,
    app_id: String,
    app_key: String,
    listing_slug: String,
    listing_type: String,
    pricing_model: String,
    listing_status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    primary_category_id: Option<String>,
    default_locale: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    age_rating_code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    official_website_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    support_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    privacy_policy_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    comments_thread_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    commerce_product_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    current_release_id: Option<String>,
    download_count: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    average_rating: Option<String>,
    rating_count: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    published_at: Option<String>,
}

pub(crate) fn map_public_listing(listing: Listing) -> PublicListingResponse {
    PublicListingResponse {
        id: listing.id.0,
        publisher_id: listing.publisher_id,
        app_id: listing.app_id,
        app_key: listing.app_key,
        listing_slug: listing.listing_slug,
        listing_type: listing.listing_type.as_str().to_string(),
        pricing_model: listing.pricing_model.as_str().to_string(),
        listing_status: listing.listing_status.as_str().to_string(),
        primary_category_id: listing.primary_category_id,
        default_locale: listing.default_locale,
        age_rating_code: listing.age_rating_code,
        official_website_url: listing.official_website_url,
        support_url: listing.support_url,
        privacy_policy_url: listing.privacy_policy_url,
        comments_thread_id: listing.comments_thread_id,
        commerce_product_id: listing.commerce_product_id,
        current_release_id: listing.current_release_id,
        download_count: listing.download_count,
        average_rating: listing.average_rating,
        rating_count: listing.rating_count,
        published_at: listing.published_at.map(|value| value.to_rfc3339()),
    }
}
