use sdkwork_appstore_library_service::domain::models::{
    DownloadGrant, InstallEvent, UpdateAvailable, UserLibraryItem, UserWishlistItem,
};
use sdkwork_appstore_library_service::domain::results::{
    ConsumeDownloadGrantResult, LibraryInstallResult,
};

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct LibraryItemResponse {
    id: String,
    listing_id: String,
    app_key: String,
    library_status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    installed_release_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    installed_version_code: Option<String>,
    install_source: String,
    platform: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    architecture: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    device_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    installed_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    removed_at: Option<String>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct InstallEventResponse {
    id: String,
    event_no: String,
    listing_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    release_id: Option<String>,
    event_type: String,
    platform: String,
    occurred_at: String,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct LibraryInstallResponse {
    library_item: LibraryItemResponse,
    install_event: InstallEventResponse,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UpdateAvailableResponse {
    app_key: String,
    platform: String,
    installed_version_code: String,
    latest_version_code: String,
    latest_version_name: String,
    release_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    artifact_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    file_size_bytes: Option<String>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WishlistItemResponse {
    id: String,
    listing_id: String,
    wishlist_status: String,
    created_at: String,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DownloadGrantResponse {
    id: String,
    grant_no: String,
    listing_id: String,
    release_id: String,
    artifact_id: String,
    grant_status: String,
    grant_reason: String,
    expires_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    consumed_at: Option<String>,
    download_count: i32,
    max_download_count: i32,
}

pub(crate) fn map_library_item(item: UserLibraryItem) -> LibraryItemResponse {
    LibraryItemResponse {
        id: item.id.0,
        listing_id: item.listing_id,
        app_key: item.app_key,
        library_status: item.library_status.as_str().to_string(),
        installed_release_id: item.installed_release_id,
        installed_version_code: item.installed_version_code,
        install_source: item.install_source.as_str().to_string(),
        platform: item.platform,
        architecture: item.architecture,
        device_id: item.device_id,
        installed_at: item.installed_at.map(|value| value.to_rfc3339()),
        removed_at: item.removed_at.map(|value| value.to_rfc3339()),
    }
}

fn map_install_event(event: InstallEvent) -> InstallEventResponse {
    InstallEventResponse {
        id: event.id,
        event_no: event.event_no,
        listing_id: event.listing_id,
        release_id: event.release_id,
        event_type: event.event_type.as_str().to_string(),
        platform: event.platform,
        occurred_at: event.occurred_at.to_rfc3339(),
    }
}

pub(crate) fn map_library_install(result: LibraryInstallResult) -> LibraryInstallResponse {
    LibraryInstallResponse {
        library_item: map_library_item(result.library_item),
        install_event: map_install_event(result.install_event),
    }
}

pub(crate) fn map_update_available(update: UpdateAvailable) -> UpdateAvailableResponse {
    UpdateAvailableResponse {
        app_key: update.app_key,
        platform: update.platform,
        installed_version_code: update.installed_version_code,
        latest_version_code: update.latest_version_code,
        latest_version_name: update.latest_version_name,
        release_id: update.release_id,
        artifact_id: update.artifact_id,
        file_size_bytes: update.file_size_bytes,
    }
}

pub(crate) fn map_wishlist_item(item: UserWishlistItem) -> WishlistItemResponse {
    WishlistItemResponse {
        id: item.id,
        listing_id: item.listing_id,
        wishlist_status: item.wishlist_status.as_str().to_string(),
        created_at: item.created_at.to_rfc3339(),
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DownloadDeliveryResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    download_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    download_url_expires_at: Option<String>,
    platform: String,
    architecture: String,
    package_format: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    file_size_bytes: Option<String>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ConsumedDownloadGrantResponse {
    #[serde(flatten)]
    grant: DownloadGrantResponse,
    #[serde(skip_serializing_if = "Option::is_none")]
    delivery: Option<DownloadDeliveryResponse>,
}

pub(crate) fn map_consumed_download_grant(
    result: ConsumeDownloadGrantResult,
) -> ConsumedDownloadGrantResponse {
    ConsumedDownloadGrantResponse {
        grant: map_download_grant(result.grant),
        delivery: result.delivery.map(|delivery| DownloadDeliveryResponse {
            download_url: delivery.download_url,
            download_url_expires_at: delivery.download_url_expires_at,
            platform: delivery.platform,
            architecture: delivery.architecture,
            package_format: delivery.package_format,
            file_size_bytes: delivery.file_size_bytes,
        }),
    }
}

pub(crate) fn map_download_grant(grant: DownloadGrant) -> DownloadGrantResponse {
    DownloadGrantResponse {
        id: grant.id,
        grant_no: grant.grant_no,
        listing_id: grant.listing_id,
        release_id: grant.release_id,
        artifact_id: grant.artifact_id,
        grant_status: grant.grant_status.as_str().to_string(),
        grant_reason: grant.grant_reason.as_str().to_string(),
        expires_at: grant.expires_at.to_rfc3339(),
        consumed_at: grant.consumed_at.map(|value| value.to_rfc3339()),
        download_count: grant.download_count,
        max_download_count: grant.max_download_count,
    }
}
