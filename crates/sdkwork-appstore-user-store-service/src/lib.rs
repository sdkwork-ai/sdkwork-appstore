//! User store service boundary.
//!
//! Owns user-defined custom categories, their listing bindings, and the
//! shareable personal appstore views (capability: `userStore`). Deliberately
//! isolated from the platform catalog category domain: it stores `listing_id`
//! references only and resolves display cards through the
//! [`ports::provider::ListingCardProviderPort`] anti-corruption layer.

pub mod context;
pub mod domain;
pub mod error;
pub mod ports;
pub mod service;

pub use context::AppstoreRequestContext;
pub use domain::commands::{
    AddCategoryItemRequest, CreateCategoryRequest, CreateShareRequest, DeleteCategoryRequest,
    ListCategoriesRequest, ListCategoryItemsRequest, PublicCategoryItemsRequest,
    PublicUserStoreViewRequest, RegenerateShareTokenRequest, RemoveCategoryItemRequest,
    ReorderCategoryItemsRequest, RetrieveCategoryRequest, RevokeShareRequest,
    UpdateCategoryRequest, UpdateShareRequest,
};
pub use domain::models::{
    ListingCard, ShareScope, ShareStatus, ShareVisibility, UserCategory, UserCategoryId,
    UserCategoryItem, UserCategoryItemId, UserCategoryStatus, UserStoreShare, UserStoreShareId,
};
pub use domain::results::{
    AddCategoryItemResult, CategoriesListResult, CategoryCreateResult, CategoryDeleteResult,
    CategoryItemsListResult, CategoryRetrieveResult, CategoryUpdateResult, ItemRemoveResult,
    ItemsReorderResult, PublicCategoryItemsResult, PublicUserStoreViewResult,
    RegenerateShareTokenResult, ShareCreateResult, ShareRevokeResult, ShareUpdateResult,
    SharesListResult,
};
pub use error::{AppstoreServiceError, AppstoreServiceResult};
pub use ports::provider::ListingCardProviderPort;
pub use ports::repository::UserStoreRepositoryPort;
pub use service::user_store_service::{UserStoreOperations, UserStoreService};

pub const CAPABILITY: &str = "userStore";

pub fn capability_name() -> &'static str {
    CAPABILITY
}
