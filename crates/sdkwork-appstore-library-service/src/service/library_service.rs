use chrono::Utc;
use uuid::Uuid;

use crate::context::AppstoreRequestContext;
use crate::domain::commands::{
    AddWishlistItemRequest, ConsumeDownloadGrantRequest, CreateDownloadGrantRequest,
    LibraryInstallRequest, LibraryUninstallRequest, LibraryUpdatesCheckRequest,
    ListLibraryItemsRequest, ListWishlistItemsRequest, RemoveWishlistItemRequest,
    RetrieveLibraryItemRequest,
};
use crate::domain::models::{
    DownloadGrant, DownloadGrantReason, DownloadGrantStatus, InstallEvent, InstallEventStatus,
    InstallEventType, InstallSource, LibraryItemId, LibraryStatus, UpdateAvailable,
    UserLibraryItem, UserWishlistItem, WishlistStatus,
};
use crate::domain::results::{
    AddWishlistItemResult, ConsumeDownloadGrantResult, CreateDownloadGrantResult,
    LibraryInstallResult, LibraryUninstallResult, LibraryUpdatesCheckResult,
    ListLibraryItemsResult, ListWishlistItemsResult, RemoveWishlistItemResult,
    RetrieveLibraryItemResult,
};
use crate::error::{AppstoreServiceError, AppstoreServiceResult};
use crate::ports::repository::LibraryRepositoryPort;

#[async_trait::async_trait]
pub trait LibraryOperations {
    async fn library_items_list(
        &self,
        context: &AppstoreRequestContext,
        request: ListLibraryItemsRequest,
    ) -> AppstoreServiceResult<ListLibraryItemsResult>;

    async fn library_items_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveLibraryItemRequest,
    ) -> AppstoreServiceResult<RetrieveLibraryItemResult>;

    async fn library_install(
        &self,
        context: &AppstoreRequestContext,
        request: LibraryInstallRequest,
    ) -> AppstoreServiceResult<LibraryInstallResult>;

    async fn library_uninstall(
        &self,
        context: &AppstoreRequestContext,
        request: LibraryUninstallRequest,
    ) -> AppstoreServiceResult<LibraryUninstallResult>;

    async fn library_updates_check(
        &self,
        context: &AppstoreRequestContext,
        request: LibraryUpdatesCheckRequest,
    ) -> AppstoreServiceResult<LibraryUpdatesCheckResult>;

    async fn wishlist_items_list(
        &self,
        context: &AppstoreRequestContext,
        request: ListWishlistItemsRequest,
    ) -> AppstoreServiceResult<ListWishlistItemsResult>;

    async fn wishlist_items_add(
        &self,
        context: &AppstoreRequestContext,
        request: AddWishlistItemRequest,
    ) -> AppstoreServiceResult<AddWishlistItemResult>;

    async fn wishlist_items_remove(
        &self,
        context: &AppstoreRequestContext,
        request: RemoveWishlistItemRequest,
    ) -> AppstoreServiceResult<RemoveWishlistItemResult>;

    async fn download_grants_create(
        &self,
        context: &AppstoreRequestContext,
        request: CreateDownloadGrantRequest,
    ) -> AppstoreServiceResult<CreateDownloadGrantResult>;

    async fn download_grants_consume(
        &self,
        context: &AppstoreRequestContext,
        request: ConsumeDownloadGrantRequest,
    ) -> AppstoreServiceResult<ConsumeDownloadGrantResult>;
}

#[derive(Debug, Clone)]
pub struct LibraryService<R> {
    repository: R,
}

impl<R> LibraryService<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }
}

#[async_trait::async_trait]
impl<R> LibraryOperations for LibraryService<R>
where
    R: LibraryRepositoryPort,
{
    async fn library_items_list(
        &self,
        context: &AppstoreRequestContext,
        request: ListLibraryItemsRequest,
    ) -> AppstoreServiceResult<ListLibraryItemsResult> {
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let items = self
            .repository
            .find_library_items_by_user(context, request.cursor.as_deref(), limit + 1)
            .await?;

        let has_more = items.len() > limit as usize;
        let items: Vec<UserLibraryItem> = items.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            items.last().map(|i| i.id.0.clone())
        } else {
            None
        };

        Ok(ListLibraryItemsResult::new(
            "appstore.library.items.list",
            items,
            next_cursor,
            has_more,
        ))
    }

    async fn library_items_retrieve(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveLibraryItemRequest,
    ) -> AppstoreServiceResult<RetrieveLibraryItemResult> {
        if context.user_id.trim().is_empty() {
            return Err(AppstoreServiceError::PermissionDenied(
                "Authenticated user is required".to_string(),
            ));
        }

        let library_item_id = LibraryItemId::new(&request.library_item_id);

        let item = self
            .repository
            .find_library_item_by_id(context, &library_item_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Library item not found: {}",
                    request.library_item_id
                ))
            })?;

        if item.user_id != context.user_id {
            return Err(AppstoreServiceError::PermissionDenied(
                "Library item access denied".to_string(),
            ));
        }

        Ok(RetrieveLibraryItemResult::found(
            "appstore.library.items.retrieve",
            item,
        ))
    }

    async fn library_install(
        &self,
        context: &AppstoreRequestContext,
        request: LibraryInstallRequest,
    ) -> AppstoreServiceResult<LibraryInstallResult> {
        if request.listing_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Listing ID is required".to_string(),
            ));
        }

        if request.platform.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Platform is required".to_string(),
            ));
        }

        let now = Utc::now();

        let existing = self
            .repository
            .find_library_item_by_listing(context, &request.listing_id)
            .await?;

        let (library_item, is_new_install) = if let Some(mut existing_item) = existing {
            if existing_item.library_status == LibraryStatus::Installed {
                return Err(AppstoreServiceError::AlreadyExists(
                    "App already installed".to_string(),
                ));
            }

            existing_item.library_status = LibraryStatus::Installed;
            existing_item.install_source = InstallSource::Store;
            existing_item.platform = request.platform.clone();
            existing_item.architecture = request.architecture.clone();
            existing_item.device_id = request.device_id.clone();
            existing_item.installed_at = Some(now);
            existing_item.removed_at = None;
            existing_item.updated_at = now;
            self.repository
                .update_library_item(context, &existing_item)
                .await?;
            (existing_item, false)
        } else {
            let app_key = self
                .repository
                .find_listing_info(context, &request.listing_id)
                .await?
                .unwrap_or_default();

            let item = UserLibraryItem {
                id: LibraryItemId::new(Uuid::new_v4().to_string()),
                tenant_id: context.tenant_id.clone(),
                user_id: context.user_id.clone(),
                listing_id: request.listing_id.clone(),
                app_key,
                library_status: LibraryStatus::Installed,
                installed_release_id: None,
                installed_version_code: None,
                install_source: InstallSource::Store,
                platform: request.platform.clone(),
                architecture: request.architecture.clone(),
                device_id: request.device_id.clone(),
                last_checked_at: None,
                installed_at: Some(now),
                updated_at: now,
                removed_at: None,
                created_at: now,
            };
            self.repository.insert_library_item(context, &item).await?;
            (item, true)
        };

        let event_type = if is_new_install {
            InstallEventType::Install
        } else {
            InstallEventType::Reinstall
        };

        let install_event = InstallEvent {
            id: Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            event_no: format!(
                "IE-{}",
                Uuid::new_v4()
                    .to_string()
                    .split('-')
                    .next()
                    .unwrap_or_default()
            ),
            listing_id: request.listing_id.clone(),
            release_id: library_item.installed_release_id.clone(),
            artifact_id: None,
            user_id: Some(context.user_id.clone()),
            device_id: request.device_id.clone(),
            event_type,
            platform: request.platform.clone(),
            architecture: request.architecture.clone(),
            event_status: InstallEventStatus::Recorded,
            source_channel: Some("store".to_string()),
            client_version: None,
            region_code: None,
            payload_snapshot: serde_json::Value::Object(serde_json::Map::new()),
            occurred_at: now,
            created_at: now,
        };

        self.repository
            .insert_install_event(context, &install_event)
            .await?;

        Ok(LibraryInstallResult::installed(
            "appstore.library.install",
            library_item,
            install_event,
        ))
    }

    async fn library_uninstall(
        &self,
        context: &AppstoreRequestContext,
        request: LibraryUninstallRequest,
    ) -> AppstoreServiceResult<LibraryUninstallResult> {
        let library_item_id = LibraryItemId::new(&request.library_item_id);

        let mut item = self
            .repository
            .find_library_item_by_id(context, &library_item_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Library item not found: {}",
                    request.library_item_id
                ))
            })?;

        if item.library_status != LibraryStatus::Installed {
            return Err(AppstoreServiceError::InvalidState(
                "Library item is not installed".to_string(),
            ));
        }

        let now = Utc::now();
        item.library_status = LibraryStatus::Uninstalled;
        item.removed_at = Some(now);
        item.updated_at = now;

        self.repository.update_library_item(context, &item).await?;

        let install_event = InstallEvent {
            id: Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            event_no: format!(
                "IE-{}",
                Uuid::new_v4()
                    .to_string()
                    .split('-')
                    .next()
                    .unwrap_or_default()
            ),
            listing_id: item.listing_id.clone(),
            release_id: item.installed_release_id.clone(),
            artifact_id: None,
            user_id: Some(context.user_id.clone()),
            device_id: item.device_id.clone(),
            event_type: InstallEventType::Uninstall,
            platform: item.platform.clone(),
            architecture: item.architecture.clone(),
            event_status: InstallEventStatus::Recorded,
            source_channel: Some("store".to_string()),
            client_version: None,
            region_code: None,
            payload_snapshot: serde_json::Value::Object(serde_json::Map::new()),
            occurred_at: now,
            created_at: now,
        };

        self.repository
            .insert_install_event(context, &install_event)
            .await?;

        Ok(LibraryUninstallResult::uninstalled(
            "appstore.library.uninstall",
        ))
    }

    async fn library_updates_check(
        &self,
        context: &AppstoreRequestContext,
        request: LibraryUpdatesCheckRequest,
    ) -> AppstoreServiceResult<LibraryUpdatesCheckResult> {
        if request.items.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "At least one item is required".to_string(),
            ));
        }

        let mut updates = Vec::new();

        for check_item in &request.items {
            let library_item = self
                .repository
                .find_library_item_by_app_key_and_platform(
                    context,
                    &check_item.app_key,
                    &check_item.platform,
                )
                .await?;

            if library_item.is_none() {
                continue;
            }

            let library_item = library_item.unwrap();
            if library_item.library_status != LibraryStatus::Installed {
                continue;
            }

            if let Some((release_id, version_code, version_name, published_at)) = self
                .repository
                .find_latest_release_for_listing(context, &library_item.listing_id)
                .await?
            {
                if version_code != check_item.installed_version_code {
                    let artifact_result = self
                        .repository
                        .find_latest_artifact_for_release(
                            context,
                            &release_id,
                            &check_item.platform,
                            None,
                        )
                        .await?;
                    let release_notes = self
                        .repository
                        .find_release_notes(context, &release_id, Some("zh-CN"))
                        .await?;

                    updates.push(UpdateAvailable {
                        app_key: check_item.app_key.clone(),
                        platform: check_item.platform.clone(),
                        installed_version_code: check_item.installed_version_code.clone(),
                        latest_version_code: version_code,
                        latest_version_name: version_name,
                        release_id,
                        artifact_id: artifact_result.as_ref().map(|(id, _)| id.clone()),
                        file_size_bytes: artifact_result.map(|(_, size)| size),
                        release_notes,
                        released_at: published_at
                            .as_deref()
                            .and_then(|value| chrono::DateTime::parse_from_rfc3339(value).ok())
                            .map(|value| value.with_timezone(&chrono::Utc)),
                    });
                }
            }
        }

        Ok(LibraryUpdatesCheckResult::new(
            "appstore.library.updates.check",
            updates,
        ))
    }

    async fn wishlist_items_list(
        &self,
        context: &AppstoreRequestContext,
        request: ListWishlistItemsRequest,
    ) -> AppstoreServiceResult<ListWishlistItemsResult> {
        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let items = self
            .repository
            .find_wishlist_items_by_user(context, request.cursor.as_deref(), limit + 1)
            .await?;

        let has_more = items.len() > limit as usize;
        let items: Vec<UserWishlistItem> = items.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            items.last().map(|i| i.id.clone())
        } else {
            None
        };

        Ok(ListWishlistItemsResult::new(
            "appstore.wishlist.items.list",
            items,
            next_cursor,
            has_more,
        ))
    }

    async fn wishlist_items_add(
        &self,
        context: &AppstoreRequestContext,
        request: AddWishlistItemRequest,
    ) -> AppstoreServiceResult<AddWishlistItemResult> {
        if request.listing_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Listing ID is required".to_string(),
            ));
        }

        let existing = self
            .repository
            .find_wishlist_item_by_listing(context, &request.listing_id)
            .await?;

        if let Some(existing_item) = existing {
            if existing_item.wishlist_status == WishlistStatus::Active {
                return Err(AppstoreServiceError::AlreadyExists(
                    "Item already in wishlist".to_string(),
                ));
            }

            let mut item = existing_item;
            let now = Utc::now();
            item.wishlist_status = WishlistStatus::Active;
            item.updated_at = now;

            self.repository.update_wishlist_item(context, &item).await?;

            return Ok(AddWishlistItemResult::added(
                "appstore.wishlist.items.create",
                item,
            ));
        }

        let now = Utc::now();
        let item = UserWishlistItem {
            id: Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            user_id: context.user_id.clone(),
            listing_id: request.listing_id,
            wishlist_status: WishlistStatus::Active,
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_wishlist_item(context, &item).await?;

        Ok(AddWishlistItemResult::added(
            "appstore.wishlist.items.create",
            item,
        ))
    }

    async fn wishlist_items_remove(
        &self,
        context: &AppstoreRequestContext,
        request: RemoveWishlistItemRequest,
    ) -> AppstoreServiceResult<RemoveWishlistItemResult> {
        let item = self
            .repository
            .find_wishlist_item_by_listing(context, &request.listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Wishlist item not found for listing: {}",
                    request.listing_id
                ))
            })?;

        if item.wishlist_status != WishlistStatus::Active {
            return Err(AppstoreServiceError::InvalidState(
                "Wishlist item is not active".to_string(),
            ));
        }

        let mut item = item;
        let now = Utc::now();
        item.wishlist_status = WishlistStatus::Removed;
        item.updated_at = now;

        self.repository.update_wishlist_item(context, &item).await?;

        Ok(RemoveWishlistItemResult::removed(
            "appstore.wishlist.items.delete",
        ))
    }

    async fn download_grants_create(
        &self,
        context: &AppstoreRequestContext,
        request: CreateDownloadGrantRequest,
    ) -> AppstoreServiceResult<CreateDownloadGrantResult> {
        if request.artifact_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Artifact ID is required".to_string(),
            ));
        }

        let now = Utc::now();
        let grant = DownloadGrant {
            id: Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            grant_no: format!(
                "DG-{}",
                Uuid::new_v4()
                    .to_string()
                    .split('-')
                    .next()
                    .unwrap_or_default()
            ),
            listing_id: String::new(),
            release_id: String::new(),
            artifact_id: request.artifact_id,
            user_id: Some(context.user_id.clone()),
            grant_status: DownloadGrantStatus::Active,
            grant_reason: DownloadGrantReason::FreeDownload,
            expires_at: now + chrono::Duration::hours(24),
            consumed_at: None,
            download_count: 0,
            max_download_count: 1,
            created_at: now,
            updated_at: now,
        };

        self.repository
            .insert_download_grant(context, &grant)
            .await?;

        Ok(CreateDownloadGrantResult::created(
            "appstore.downloadGrants.create",
            grant,
        ))
    }

    async fn download_grants_consume(
        &self,
        context: &AppstoreRequestContext,
        request: ConsumeDownloadGrantRequest,
    ) -> AppstoreServiceResult<ConsumeDownloadGrantResult> {
        let mut grant = self
            .repository
            .find_download_grant_by_id(context, &request.grant_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Download grant not found: {}",
                    request.grant_id
                ))
            })?;

        if grant.grant_status != DownloadGrantStatus::Active {
            return Err(AppstoreServiceError::InvalidState(format!(
                "Download grant is not active: {}",
                grant.grant_status.as_str()
            )));
        }

        if grant.expires_at < Utc::now() {
            grant.grant_status = DownloadGrantStatus::Expired;
            grant.updated_at = Utc::now();
            self.repository
                .update_download_grant(context, &grant)
                .await?;
            return Err(AppstoreServiceError::InvalidState(
                "Download grant has expired".to_string(),
            ));
        }

        if grant.download_count >= grant.max_download_count {
            grant.grant_status = DownloadGrantStatus::Consumed;
            grant.updated_at = Utc::now();
            self.repository
                .update_download_grant(context, &grant)
                .await?;
            return Err(AppstoreServiceError::InvalidState(
                "Download grant already fully consumed".to_string(),
            ));
        }

        let now = Utc::now();
        grant.download_count += 1;
        if grant.download_count >= grant.max_download_count {
            grant.grant_status = DownloadGrantStatus::Consumed;
            grant.consumed_at = Some(now);
        }
        grant.updated_at = now;

        self.repository
            .update_download_grant(context, &grant)
            .await?;

        Ok(ConsumeDownloadGrantResult::consumed(
            "appstore.downloadGrants.consume",
            grant,
        ))
    }
}
