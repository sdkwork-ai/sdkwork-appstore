//! Anti-corruption port toward the listing domain.
//!
//! The user store domain persists `listing_id` references only; display cards
//! are resolved here so listing schema evolution never leaks into this domain.

use crate::domain::models::ListingCard;

#[async_trait::async_trait]
pub trait ListingCardProviderPort: Send + Sync {
    async fn resolve_listing_card(
        &self,
        tenant_id: &str,
        listing_id: &str,
    ) -> Result<Option<ListingCard>, String>;

    /// Batch resolution for list views; the implementation decides whether to
    /// fan out or use a batched source. Missing listings are omitted.
    async fn resolve_listing_cards(
        &self,
        tenant_id: &str,
        listing_ids: &[String],
    ) -> Result<Vec<ListingCard>, String>;
}
