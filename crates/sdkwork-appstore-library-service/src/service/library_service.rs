use chrono::Utc;
use uuid::Uuid;

use crate::context::AppstoreRequestContext;
use crate::domain::commands::{
    AddWishlistItemRequest, CommerceEntitlementCheckRequest, CommerceEntitlementRevokeRequest,
    CommerceEntitlementSyncRequest, ConsumeDownloadGrantRequest, CreateDownloadGrantRequest,
    LibraryInstallRequest, LibraryUninstallRequest, LibraryUpdatesCheckRequest,
    ListLibraryItemsRequest, ListWishlistItemsRequest, RemoveWishlistItemRequest,
    RetrieveLibraryItemRequest,
};
use crate::domain::models::{
    CommerceEntitlement, DownloadGrant, DownloadGrantReason, DownloadGrantStatus,
    EntitlementStatus, EntitlementSubjectType, InstallEvent, InstallEventStatus, InstallEventType,
    InstallSource, LibraryItemId, LibraryStatus, UpdateAvailable, UserLibraryItem,
    UserWishlistItem, WishlistStatus,
};
use crate::domain::results::{
    AddWishlistItemResult, CommerceEntitlementCheckResult, CommerceEntitlementRevokeResult,
    CommerceEntitlementSyncResult, ConsumeDownloadGrantResult, CreateDownloadGrantResult,
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

    /// Commerce-side receiver: idempotently upserts an entitlement snapshot
    /// pushed by the Order/Payment domain. The store never settles payment.
    async fn commerce_entitlement_sync(
        &self,
        context: &AppstoreRequestContext,
        request: CommerceEntitlementSyncRequest,
    ) -> AppstoreServiceResult<CommerceEntitlementSyncResult>;

    /// Answers whether a subject currently holds an active entitlement for
    /// one app (used by paid install/download gating).
    async fn commerce_entitlement_check(
        &self,
        context: &AppstoreRequestContext,
        request: CommerceEntitlementCheckRequest,
    ) -> AppstoreServiceResult<CommerceEntitlementCheckResult>;

    /// Revokes an entitlement (refund/chargeback path).
    async fn commerce_entitlement_revoke(
        &self,
        context: &AppstoreRequestContext,
        request: CommerceEntitlementRevokeRequest,
    ) -> AppstoreServiceResult<CommerceEntitlementRevokeResult>;
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
        let artifact_id = request.artifact_id.trim();
        if artifact_id.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Artifact ID is required".to_string(),
            ));
        }
        let user_id = context.user_id.trim();
        if user_id.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Authenticated user id is required to create download grants".to_string(),
            ));
        }

        let (listing_id, release_id, artifact_status) = self
            .repository
            .find_artifact_context(context, artifact_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Artifact not found: {}", artifact_id))
            })?;

        if artifact_status != "verified" {
            return Err(AppstoreServiceError::InvalidState(format!(
                "Artifact is not verified: {}",
                artifact_id
            )));
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
            listing_id,
            release_id,
            artifact_id: artifact_id.to_string(),
            user_id: Some(user_id.to_string()),
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
        let user_id = context.user_id.trim();
        if user_id.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Authenticated user id is required to consume download grants".to_string(),
            ));
        }
        let grant_id = request.grant_id.trim();
        if grant_id.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Grant ID is required".to_string(),
            ));
        }

        // Single-statement CAS: guards on owner, active status, remaining
        // quota, and expiry, so concurrent consumers cannot double-spend.
        if let Some(grant) = self
            .repository
            .consume_download_grant_atomically(context, grant_id, user_id)
            .await?
        {
            return Ok(ConsumeDownloadGrantResult::consumed(
                "appstore.downloadGrants.consume",
                grant,
            ));
        }

        // The atomic guard rejected the consumption; classify the reason for
        // the caller. The lookup is owner-scoped, so foreign grants surface
        // as not found instead of leaking their existence.
        let grant = self
            .repository
            .find_download_grant_by_id(context, grant_id)
            .await?
            .filter(|grant| grant.user_id.as_deref() == Some(user_id));

        match grant {
            None => Err(AppstoreServiceError::NotFound(format!(
                "Download grant not found: {}",
                grant_id
            ))),
            Some(grant) if grant.grant_status != DownloadGrantStatus::Active => {
                Err(AppstoreServiceError::InvalidState(format!(
                    "Download grant is not active: {}",
                    grant.grant_status.as_str()
                )))
            }
            Some(grant) if grant.expires_at <= Utc::now() => Err(
                AppstoreServiceError::InvalidState("Download grant has expired".to_string()),
            ),
            Some(_) => Err(AppstoreServiceError::InvalidState(
                "Download grant already fully consumed".to_string(),
            )),
        }
    }

    async fn commerce_entitlement_sync(
        &self,
        context: &AppstoreRequestContext,
        request: CommerceEntitlementSyncRequest,
    ) -> AppstoreServiceResult<CommerceEntitlementSyncResult> {
        let status = EntitlementStatus::from_str(&request.entitlement_status).ok_or_else(|| {
            AppstoreServiceError::ValidationFailed(format!(
                "Unknown entitlement status: {}",
                request.entitlement_status
            ))
        })?;
        let subject_type = EntitlementSubjectType::User;
        let now = Utc::now();
        let entitlement = CommerceEntitlement {
            id: Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            app_id: request.app_id,
            listing_id: request.listing_id,
            subject_type,
            subject_id: request.subject_id,
            entitlement_type: request.entitlement_type,
            source_type: request.source_type,
            entitlement_status: status,
            starts_at: request.starts_at,
            expires_at: request.expires_at,
            grant_snapshot_json: request.grant_snapshot_json,
            revoked_at: None,
            created_at: now,
            updated_at: now,
        };
        self.repository
            .upsert_entitlement(context, &entitlement)
            .await?;
        Ok(CommerceEntitlementSyncResult::accepted(
            "appstore.commerce.entitlement.sync",
        ))
    }

    async fn commerce_entitlement_check(
        &self,
        context: &AppstoreRequestContext,
        request: CommerceEntitlementCheckRequest,
    ) -> AppstoreServiceResult<CommerceEntitlementCheckResult> {
        let entitlement = self
            .repository
            .find_active_entitlement(context, &request.app_id, &request.subject_id)
            .await?;
        match entitlement {
            Some(entitlement) if entitlement.is_active(Utc::now()) => {
                Ok(CommerceEntitlementCheckResult::granted(
                    "appstore.commerce.entitlement.check",
                    Some(entitlement.entitlement_type),
                    entitlement.expires_at,
                ))
            }
            _ => Ok(CommerceEntitlementCheckResult::denied(
                "appstore.commerce.entitlement.check",
            )),
        }
    }

    async fn commerce_entitlement_revoke(
        &self,
        context: &AppstoreRequestContext,
        request: CommerceEntitlementRevokeRequest,
    ) -> AppstoreServiceResult<CommerceEntitlementRevokeResult> {
        let revoked = self
            .repository
            .revoke_entitlement(
                context,
                &request.app_id,
                &request.subject_id,
                &request.entitlement_type,
                Utc::now(),
            )
            .await?;
        Ok(CommerceEntitlementRevokeResult::revoked(
            "appstore.commerce.entitlement.revoke",
            revoked,
        ))
    }
}
