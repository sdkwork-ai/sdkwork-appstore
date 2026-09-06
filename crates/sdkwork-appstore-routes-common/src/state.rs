use sdkwork_appstore_catalog_service::service::catalog_service::CatalogService;
use sdkwork_appstore_compliance_service::service::compliance_service::ComplianceService;
use sdkwork_appstore_library_service::service::library_service::LibraryService;
use sdkwork_appstore_listing_service::service::listing_service::ListingService;
use sdkwork_appstore_market_service::service::market_service::MarketService;
use sdkwork_appstore_moderation_service::service::moderation_service::ModerationService;
use sdkwork_appstore_publisher_service::service::publisher_service::PublisherService;
use sdkwork_appstore_release_service::service::release_service::ReleaseService;
use sdkwork_appstore_repository_sqlx::repository::catalog_repository::SqlxCatalogRepository;
use sdkwork_appstore_repository_sqlx::repository::compliance_repository::SqlxComplianceRepository;
use sdkwork_appstore_repository_sqlx::repository::library_repository::SqlxLibraryRepository;
use sdkwork_appstore_repository_sqlx::repository::listing_repository::SqlxListingRepository;
use sdkwork_appstore_repository_sqlx::repository::market_repository::SqlxMarketRepository;
use sdkwork_appstore_repository_sqlx::repository::moderation_repository::SqlxModerationRepository;
use sdkwork_appstore_repository_sqlx::repository::publisher_repository::SqlxPublisherRepository;
use sdkwork_appstore_repository_sqlx::repository::release_repository::SqlxReleaseRepository;
use sdkwork_appstore_repository_sqlx::repository::user_store_repository::SqlxUserStoreRepository;
use sdkwork_appstore_user_store_service::service::user_store_service::UserStoreService;

#[derive(Clone)]
pub struct AppState {
    pub publisher_service: PublisherService<SqlxPublisherRepository>,
    pub listing_service: ListingService<SqlxListingRepository>,
    pub release_service: ReleaseService<SqlxReleaseRepository>,
    pub catalog_service: CatalogService<SqlxCatalogRepository>,
    pub library_service: LibraryService<SqlxLibraryRepository>,
    pub moderation_service: ModerationService<SqlxModerationRepository>,
    pub compliance_service: ComplianceService<SqlxComplianceRepository>,
    pub market_service: MarketService<SqlxMarketRepository>,
    pub user_store_service: UserStoreService<SqlxUserStoreRepository>,
}
