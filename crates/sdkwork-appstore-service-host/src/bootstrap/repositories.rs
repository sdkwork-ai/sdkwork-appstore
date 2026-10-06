use sdkwork_appstore_repository_sqlx::repository::catalog_repository::SqlxCatalogRepository;
use sdkwork_appstore_repository_sqlx::repository::compliance_repository::SqlxComplianceRepository;
use sdkwork_appstore_repository_sqlx::repository::library_repository::SqlxLibraryRepository;
use sdkwork_appstore_repository_sqlx::repository::listing_repository::SqlxListingRepository;
use sdkwork_appstore_repository_sqlx::repository::market_repository::SqlxMarketRepository;
use sdkwork_appstore_repository_sqlx::repository::moderation_repository::SqlxModerationRepository;
use sdkwork_appstore_repository_sqlx::repository::publisher_repository::SqlxPublisherRepository;
use sdkwork_appstore_repository_sqlx::repository::release_repository::SqlxReleaseRepository;
use sdkwork_appstore_repository_sqlx::AppstoreSqlxDb;

#[derive(Debug, Clone)]
pub struct AppstoreRepositories {
    pub db: AppstoreSqlxDb,
    pub publisher_repository: SqlxPublisherRepository,
    pub listing_repository: SqlxListingRepository,
    pub release_repository: SqlxReleaseRepository,
    pub catalog_repository: SqlxCatalogRepository,
    pub library_repository: SqlxLibraryRepository,
    pub moderation_repository: SqlxModerationRepository,
    pub compliance_repository: SqlxComplianceRepository,
    pub market_repository: SqlxMarketRepository,
}

impl AppstoreRepositories {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self {
            publisher_repository: SqlxPublisherRepository::new(db.clone()),
            listing_repository: SqlxListingRepository::new(db.clone()),
            release_repository: SqlxReleaseRepository::new(db.clone()),
            catalog_repository: SqlxCatalogRepository::new(db.clone()),
            library_repository: SqlxLibraryRepository::new(db.clone()),
            moderation_repository: SqlxModerationRepository::new(db.clone()),
            compliance_repository: SqlxComplianceRepository::new(db.clone()),
            market_repository: SqlxMarketRepository::new(db.clone()),
            db,
        }
    }
}
