//! In-process sdkwork-drive port implementations (MODULE_SPEC.md §4.2).
//!
//! App Store stores release artifacts, listing media, and download targets in
//! sdkwork-drive. In every packaged deployment Drive runs inside the same
//! backend process against the same PostgreSQL, so this adapter calls Drive's
//! **existing public** service and repository APIs directly instead of Drive's
//! app-api.
//!
//! # Ports consumed (all pre-existing, no sibling change required)
//!
//! | Need | Drive API |
//! | --- | --- |
//! | active node by tenant + id | `DriveUploaderStore::find_active_node` (`SqlUploaderStore`) |
//! | node read authorization | `SqlDrivePermissionService::resolve_effective_node_access` |
//! | object locator for a node | `DriveStorageObjectStore::find_latest_active_by_node` (`SqlStorageObjectStore`) |
//! | presigned download URL | `DriveObjectStoreRuntime::{load_provider, resolve}` + `DriveObjectStore::presign_download` |
//! | artifact bytes | `DriveUploaderService::upload_bytes` (prepare → object write → part mark → completion) |
//! | tenant upload quota | `ensure_tenant_can_allocate_bytes` (`SqlQuotaStore`) |
//!
//! # What the previous HTTP adapter enforced, and what is reproduced here
//!
//! The app-api calls this adapter replaces resolved a Drive request context from
//! the App Store service credential and then:
//!
//! - resolved the node **within the caller's tenant** (`dr_drive_node.tenant_id`),
//! - required the resolved subject to hold the `reader` role on the node
//!   (`acl::ensure_ctx_node_role(..., "reader")`), and
//! - minted the download URL through Drive's own storage-provider runtime,
//!   refusing a provider that no longer addresses the object's bucket.
//!
//! Every one of those steps is still performed. The subject is
//! [`DriveServiceSubject::appstore_service`] — the application service identity
//! the Drive service credential represented, and the identity that owns the App
//! Store upload space. Authorization is therefore neither widened nor dropped:
//!
//! - `validate_drive_node` and the download signer require the `reader` role,
//! - the upload path requires the `writer` role that Drive's
//!   `parts.markUploaded` and `uploadSessions.complete` routes required, and
//! - the upload path enforces the tenant quota that `POST /uploader/uploads`
//!   enforced before it created any row.
//!
//! # Error mapping
//!
//! The port methods keep returning `Result<_, String>`, so the domain services
//! keep mapping failures to the same `AppstoreServiceError` kinds — and
//! therefore the same HTTP status codes — that the HTTP adapter produced.

use async_trait::async_trait;
use sqlx::PgPool;

use sdkwork_appstore_library_service::ports::provider::{
    DownloadUrlResult, EntitlementGrant, LibraryProviderPort, ReleaseInfo,
};
use sdkwork_appstore_listing_service::ports::provider::{
    AppReference, ListingProviderPort, MediaUploadResult,
};
use sdkwork_appstore_release_service::ports::provider::{
    ArtifactUploadResult, PlatformManifest, ReleaseProviderPort,
};
use sdkwork_drive_object_runtime::{
    provider_supports_s3_object_store, DriveObjectStoreRuntime, ProviderAccessIntent,
};
use sdkwork_drive_storage_contract::{DriveObjectLocator, PresignDownloadRequest};
use sdkwork_drive_workspace_service::application::permission_service::SqlDrivePermissionService;
use sdkwork_drive_workspace_service::application::quota_enforcement::ensure_tenant_can_allocate_bytes;
use sdkwork_drive_workspace_service::infrastructure::sql::quota_store::SqlQuotaStore;
use sdkwork_drive_workspace_service::infrastructure::sql::storage_object_store::SqlStorageObjectStore;
use sdkwork_drive_workspace_service::infrastructure::sql::uploader_store::SqlUploaderStore;
use sdkwork_drive_workspace_service::ports::permission_store::ResolveEffectiveNodeAccessCommand;
use sdkwork_drive_workspace_service::ports::storage_object_store::DriveStorageObjectStore;
use sdkwork_drive_workspace_service::ports::uploader_store::{
    DriveUploaderNodeRecord, DriveUploaderStore,
};
use sdkwork_drive_workspace_service::uploader::{
    DriveUploaderService, PrepareUploaderUploadCommand, UploadBytesCommand, UploaderActor,
    UploaderRetention, UploaderTarget,
};
use sdkwork_drive_workspace_service::DriveServiceError;
use sdkwork_utils_rust::sha256_hash;

/// App id App Store registers its Drive uploads under.
pub const APPSTORE_DRIVE_APP_ID: &str = "sdkwork-appstore";

/// Upload scene recorded on App Store drive nodes.
const APPSTORE_DRIVE_SCENE: &str = "appstore";

/// Upload source recorded on App Store drive nodes.
const APPSTORE_DRIVE_SOURCE: &str = "artifact-upload";

/// Upload chunk size recorded on the drive upload item.
const APPSTORE_DRIVE_CHUNK_SIZE_BYTES: i64 = 8 * 1024 * 1024;

/// Download URL lifetime window accepted by Drive, in seconds.
const MIN_DOWNLOAD_TTL_SECONDS: i64 = 30;
/// Download URL lifetime window accepted by Drive, in seconds.
const MAX_DOWNLOAD_TTL_SECONDS: i64 = 300;

/// The subject App Store reads and writes Drive as.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DriveServiceSubject {
    pub subject_type: String,
    pub subject_id: String,
}

impl DriveServiceSubject {
    /// The application service identity the App Store Drive credential stood
    /// for, and the owner of the App Store upload space.
    pub fn appstore_service() -> Self {
        Self {
            subject_type: "app".to_string(),
            subject_id: format!("app:{APPSTORE_DRIVE_APP_ID}:system"),
        }
    }

    fn operator_id(&self) -> &str {
        self.subject_id.as_str()
    }
}

impl Default for DriveServiceSubject {
    fn default() -> Self {
        Self::appstore_service()
    }
}

/// Drive ports backed by Drive's in-process service and repository APIs.
#[derive(Debug, Clone)]
pub struct InProcessDriveAdapter {
    pool: PgPool,
    object_runtime: DriveObjectStoreRuntime,
    subject: DriveServiceSubject,
}

impl InProcessDriveAdapter {
    /// Build the adapter over the process database pool.
    pub fn new(pool: PgPool) -> Self {
        Self::with_subject(pool, DriveServiceSubject::appstore_service())
    }

    /// Build the adapter with an explicit Drive subject.
    pub fn with_subject(pool: PgPool, subject: DriveServiceSubject) -> Self {
        Self {
            object_runtime: DriveObjectStoreRuntime::new(pool.clone()),
            pool,
            subject,
        }
    }

    /// Load an active node scoped to the tenant, failing with the same
    /// `NotFound` shape Drive's app-api produced.
    async fn load_active_node(
        &self,
        tenant_id: &str,
        drive_node_id: &str,
    ) -> Result<DriveUploaderNodeRecord, String> {
        let node_id = drive_node_id.trim();
        if node_id.is_empty() {
            return Err("drive node id is required".to_string());
        }
        SqlUploaderStore::new(self.pool.clone())
            .find_active_node(tenant_id, node_id)
            .await
            .map_err(|error| format!("drive node {node_id} lookup failed: {error:?}"))?
            .ok_or_else(|| format!("drive node {node_id} not found"))
    }

    /// Reproduce Drive's `ensure_ctx_node_role(..., required_role)` for the
    /// service subject: space ownership or an inherited/direct grant that
    /// satisfies the role.
    async fn ensure_node_role(
        &self,
        tenant_id: &str,
        space_id: &str,
        node_id: &str,
        required_role: &str,
    ) -> Result<(), String> {
        let access = SqlDrivePermissionService::new(self.pool.clone())
            .resolve_effective_node_access(ResolveEffectiveNodeAccessCommand {
                tenant_id: tenant_id.to_string(),
                space_id: space_id.to_string(),
                node_id: node_id.to_string(),
                subject_type: self.subject.subject_type.clone(),
                subject_id: self.subject.subject_id.clone(),
            })
            .await
            .map_err(|error| format!("drive permission resolution failed: {error:?}"))?;
        if !access.allows_role(required_role) {
            return Err(format!(
                "permission denied: subject does not have {required_role} access to drive node \
                 {node_id}"
            ));
        }
        Ok(())
    }

    /// Read authorization for a node resolved by id.
    async fn ensure_reader(
        &self,
        tenant_id: &str,
        node: &DriveUploaderNodeRecord,
    ) -> Result<(), String> {
        self.ensure_node_role(tenant_id, &node.space_id, &node.id, "reader")
            .await
    }

    async fn load_active_node_with_reader(
        &self,
        tenant_id: &str,
        drive_node_id: &str,
    ) -> Result<DriveUploaderNodeRecord, String> {
        let node = self.load_active_node(tenant_id, drive_node_id).await?;
        self.ensure_reader(tenant_id, &node).await?;
        Ok(node)
    }

    /// Sign a short-lived download URL through Drive's storage-provider
    /// runtime, exactly as Drive's own download signer does.
    async fn presign_download_url(
        &self,
        tenant_id: &str,
        node_id: &str,
        expires_in_seconds: i64,
    ) -> Result<String, String> {
        let ttl = expires_in_seconds.clamp(MIN_DOWNLOAD_TTL_SECONDS, MAX_DOWNLOAD_TTL_SECONDS);
        let ttl = u32::try_from(ttl)
            .map_err(|_| "requested download lifetime is out of range".to_string())?;

        let object = SqlStorageObjectStore::new(self.pool.clone())
            .find_latest_active_by_node(tenant_id, node_id)
            .await
            .map_err(|error| {
                format!("drive storage object lookup failed for node {node_id}: {error:?}")
            })?
            .ok_or_else(|| {
                format!("drive storage object for node {node_id} is not found or inactive")
            })?;

        let provider_id = object.storage_provider_id.clone();
        let bucket = object.bucket.clone();
        let provider = self
            .object_runtime
            .load_provider(&provider_id)
            .await
            .map_err(|error| {
                format!("drive storage provider {provider_id} lookup failed: {error}")
            })?;
        if provider.bucket != bucket {
            return Err(format!(
                "active storage provider is required for bucket {bucket} to sign object store URLs"
            ));
        }

        let store = self
            .object_runtime
            // Minting a URL is a write-path grant in Drive, so it resolves with
            // the write intent and requires an active provider.
            .resolve(&provider_id, ProviderAccessIntent::Write)
            .await
            .map_err(|error| {
                format!("drive storage provider {provider_id} is unavailable: {error}")
            })?;
        if !provider_supports_s3_object_store(&store.provider_kind()) {
            return Err(format!(
                "active storage provider for bucket {bucket} does not support object store URL signing"
            ));
        }

        let signed = store
            .presign_download(PresignDownloadRequest {
                locator: DriveObjectLocator {
                    bucket,
                    object_key: object.object_key,
                },
                expires_in_seconds: ttl,
            })
            .await
            .map_err(|error| {
                format!("drive presigned download failed for node {node_id}: {error}")
            })?;
        Ok(signed.url)
    }

    /// Upload artifact bytes into the App Store upload space through Drive's own
    /// uploader service.
    ///
    /// The whole sequence — prepare, object write, part mark, completion — is
    /// `DriveUploaderService::upload_bytes`, together with the object metadata
    /// Drive records for it. This adapter must not keep a second copy of those
    /// rules (MODULE_SPEC.md §4.2.7 "the adapter only translates and delegates").
    async fn upload_artifact_in_process(
        &self,
        tenant_id: &str,
        organization_id: &str,
        file_name: &str,
        content_type: &str,
        data: &[u8],
    ) -> Result<ArtifactUploadResult, String> {
        if data.is_empty() {
            return Err("drive upload requires non-empty payload".to_string());
        }
        let content_length = i64::try_from(data.len())
            .map_err(|_| "drive upload payload exceeds i64 size limit".to_string())?;

        // Drive's `POST /uploader/uploads` route enforces the tenant quota before
        // it creates an upload item. An in-process port that skipped this would be
        // the one path able to overrun the tenant's Drive quota.
        ensure_tenant_can_allocate_bytes(
            &SqlQuotaStore::new(self.pool.clone()),
            tenant_id,
            content_length,
        )
        .await
        .map_err(map_drive_service_error("drive tenant quota check failed"))?;

        let now_epoch_ms = current_epoch_ms();
        let request_id = uuid::Uuid::new_v4().to_string();
        let file_fingerprint = format!(
            "name:{}:size:{content_length}:type:{}",
            sanitize_fingerprint_token(file_name),
            sanitize_fingerprint_token(content_type)
        );
        let prepare = PrepareUploaderUploadCommand {
            id: format!("appstore-upload-{request_id}"),
            task_id: format!("appstore-task-{request_id}"),
            tenant_id: tenant_id.to_string(),
            organization_id: Some(organization_id.to_string())
                .filter(|value| !value.trim().is_empty()),
            // The App Store publishes artifacts as the application, not as
            // the publishing user: the artifact outlives any one account.
            actor: UploaderActor::System {
                operator_id: self.subject.operator_id().to_string(),
            },
            app_id: APPSTORE_DRIVE_APP_ID.to_string(),
            app_resource_type: "appstore.artifact".to_string(),
            app_resource_id: file_fingerprint.clone(),
            scene: Some(APPSTORE_DRIVE_SCENE.to_string()),
            source: Some(APPSTORE_DRIVE_SOURCE.to_string()),
            upload_profile_code: "archive".to_string(),
            file_fingerprint,
            original_file_name: file_name.to_string(),
            content_type: content_type.to_string(),
            content_length,
            chunk_size_bytes: APPSTORE_DRIVE_CHUNK_SIZE_BYTES,
            target: UploaderTarget::AutoUploadSpace {
                parent_node_id: None,
            },
            retention: UploaderRetention::LongTerm,
            operator_id: self.subject.operator_id().to_string(),
            now_epoch_ms,
        };

        let service = DriveUploaderService::new(SqlUploaderStore::new(self.pool.clone()));
        // Prepare once to learn the provider this upload was routed to: the object
        // store is resolved from that provider under the write intent, exactly as
        // Drive's own upload path does. `upload_bytes` repeats the prepare
        // idempotently (task-id lookup, no second upload item).
        let prepared = service
            .prepare_upload(prepare.clone())
            .await
            .map_err(map_drive_service_error("drive uploader.prepare failed"))?;

        // Drive's `parts.markUploaded` and `uploadSessions.complete` routes both
        // required the `writer` role on the upload node; enforce it before any
        // byte is written rather than after.
        self.ensure_node_role(tenant_id, &prepared.space_id, &prepared.node_id, "writer")
            .await?;

        let storage_provider_id = prepared
            .storage_provider_id
            .clone()
            .ok_or_else(|| "prepared upload is missing storage_provider_id".to_string())?;
        let store = self
            .object_runtime
            // Writing bytes is a write-path grant in Drive, so it resolves with
            // the write intent and requires an active provider.
            .resolve(&storage_provider_id, ProviderAccessIntent::Write)
            .await
            .map_err(|error| {
                format!("drive storage provider {storage_provider_id} is unavailable: {error}")
            })?;

        let completed = service
            .upload_bytes(
                &*store,
                UploadBytesCommand {
                    prepare,
                    body: data.to_vec(),
                    uploaded_at_epoch_ms: now_epoch_ms,
                },
            )
            .await
            .map_err(map_drive_service_error("drive uploader upload failed"))?;

        let node_id = completed.node_id.trim().to_string();
        if node_id.is_empty() {
            return Err("drive upload completed without a node id".to_string());
        }
        let checksum_sha256 = completed
            .checksum_sha256_hex
            .clone()
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| format!("sha256:{}", sha256_hash(data)));

        Ok(ArtifactUploadResult {
            media_resource_id: node_id.clone(),
            drive_node_id: node_id,
            file_size_bytes: completed.content_length,
            checksum_sha256,
            content_type: completed.content_type,
        })
    }
}

fn map_drive_service_error(context: &'static str) -> impl Fn(DriveServiceError) -> String {
    move |error| format!("{context}: {error:?}")
}

fn sanitize_fingerprint_token(value: &str) -> String {
    value
        .trim()
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || matches!(ch, '.' | '_' | ':' | '@' | '-') {
                ch
            } else {
                '-'
            }
        })
        .collect::<String>()
}

fn current_epoch_ms() -> i64 {
    chrono::Utc::now().timestamp_millis()
}

#[async_trait]
impl ReleaseProviderPort for InProcessDriveAdapter {
    async fn upload_artifact(
        &self,
        tenant_id: &str,
        organization_id: &str,
        file_name: &str,
        content_type: &str,
        data: &[u8],
    ) -> Result<ArtifactUploadResult, String> {
        self.upload_artifact_in_process(tenant_id, organization_id, file_name, content_type, data)
            .await
    }

    async fn resolve_platform_manifest(
        &self,
        _tenant_id: &str,
        app_id: &str,
    ) -> Result<PlatformManifest, String> {
        Err(format!(
            "platform manifest resolution is owned by platform adapter; requested app_id={app_id}"
        ))
    }

    async fn generate_download_url(
        &self,
        tenant_id: &str,
        drive_node_id: &str,
        expires_in_seconds: i64,
    ) -> Result<String, String> {
        let node = self
            .load_active_node_with_reader(tenant_id, drive_node_id)
            .await?;
        self.presign_download_url(tenant_id, &node.id, expires_in_seconds)
            .await
    }

    async fn validate_drive_node(
        &self,
        tenant_id: &str,
        drive_node_id: &str,
    ) -> Result<(), String> {
        self.load_active_node_with_reader(tenant_id, drive_node_id)
            .await
            .map(|_| ())
    }
}

#[async_trait]
impl ListingProviderPort for InProcessDriveAdapter {
    async fn resolve_app(&self, _tenant_id: &str, app_id: &str) -> Result<AppReference, String> {
        Err(format!(
            "app resolution is owned by platform adapter; requested app_id={app_id}"
        ))
    }

    async fn resolve_media_resource(
        &self,
        tenant_id: &str,
        media_resource_id: &str,
    ) -> Result<MediaUploadResult, String> {
        let media_resource_id = media_resource_id.trim();
        if media_resource_id.is_empty() {
            return Err("media resource id is required".to_string());
        }
        // Drive's `GET /app/v3/api/assets/{id}` resolves the asset id as a node
        // id, rejects non-file node types, then applies the reader ACL.
        let node = self
            .load_active_node_with_reader(tenant_id, media_resource_id)
            .await?;
        if !matches!(node.node_type.as_str(), "file" | "virtual_reference") {
            return Err("node type is not eligible for global assets".to_string());
        }
        let object = SqlStorageObjectStore::new(self.pool.clone())
            .find_latest_active_by_node(tenant_id, &node.id)
            .await
            .map_err(|error| format!("drive asset lookup failed for {}: {error:?}", node.id))?
            .ok_or_else(|| "asset not found".to_string())?;

        Ok(MediaUploadResult {
            media_resource_id: node.id.clone(),
            drive_node_id: node.id,
            content_type: object.content_type,
            file_size_bytes: object.content_length,
        })
    }
}

#[async_trait]
impl LibraryProviderPort for InProcessDriveAdapter {
    async fn check_entitlement(
        &self,
        _tenant_id: &str,
        _app_id: &str,
        _user_id: &str,
    ) -> Result<Option<EntitlementGrant>, String> {
        // Commerce entitlement reads are owned by the compliance adapter.
        Err("commerce entitlement checks are not part of the drive integration".to_string())
    }

    async fn generate_download_url(
        &self,
        tenant_id: &str,
        drive_node_id: &str,
        expires_in_seconds: i64,
    ) -> Result<DownloadUrlResult, String> {
        let node = self
            .load_active_node_with_reader(tenant_id, drive_node_id)
            .await?;
        let url = self
            .presign_download_url(tenant_id, &node.id, expires_in_seconds)
            .await?;
        // Drive clamps the signed lifetime server-side (30..300s); report the
        // same clamp so consumers do not treat the link as longer-lived.
        let ttl = expires_in_seconds.clamp(MIN_DOWNLOAD_TTL_SECONDS, MAX_DOWNLOAD_TTL_SECONDS);
        Ok(DownloadUrlResult {
            url,
            expires_at: chrono::Utc::now() + chrono::Duration::seconds(ttl),
        })
    }

    async fn resolve_latest_release(
        &self,
        _tenant_id: &str,
        _listing_id: &str,
        _platform: &str,
    ) -> Result<Option<ReleaseInfo>, String> {
        // Release resolution is owned by the release service adapter.
        Err("latest-release resolution is not part of the drive integration".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_service_subject_is_the_app_owned_drive_identity() {
        let subject = DriveServiceSubject::appstore_service();
        assert_eq!(subject.subject_type, "app");
        assert_eq!(subject.subject_id, "app:sdkwork-appstore:system");
        assert_eq!(subject, DriveServiceSubject::default());
    }

    #[test]
    fn fingerprint_tokens_are_restricted_to_identifier_characters() {
        assert_eq!(
            sanitize_fingerprint_token("my app/1.0 (beta).zip"),
            "my-app-1.0--beta-.zip"
        );
    }

    #[test]
    fn download_ttl_is_clamped_to_the_drive_window() {
        let clamp = |value: i64| value.clamp(MIN_DOWNLOAD_TTL_SECONDS, MAX_DOWNLOAD_TTL_SECONDS);
        assert_eq!(clamp(0), 30);
        assert_eq!(clamp(120), 120);
        assert_eq!(clamp(9_999), 300);
    }

    #[test]
    fn the_upload_path_delegates_to_drive_and_keeps_the_route_checks() {
        // Regression guard for MODULE_SPEC.md §4.2.7: the upload path must call
        // Drive's own uploader sequence instead of re-implementing object
        // metadata/part bookkeeping, and it must keep the two checks Drive's
        // `POST /uploader/uploads` and `parts.markUploaded` routes performed.
        let source = include_str!("drive_inprocess.rs");
        let production = source
            .split("#[cfg(test)]")
            .next()
            .expect("the module has a production section");
        assert!(
            production.contains("upload_bytes("),
            "the upload path must delegate to DriveUploaderService::upload_bytes"
        );
        assert!(
            !production.contains("put_object("),
            "the adapter must not write Drive objects itself"
        );
        assert!(
            production.contains("ensure_tenant_can_allocate_bytes"),
            "the upload path must enforce the tenant quota Drive's route enforced"
        );
        assert!(
            production.contains("\"writer\""),
            "the upload path must keep the writer ACL Drive's part/complete routes enforced"
        );
    }

    #[test]
    fn the_adapter_never_reads_a_sibling_http_endpoint() {
        // Regression guard for MODULE_SPEC.md §4.2: the in-process adapter must
        // not regress into addressing Drive over HTTP.
        let source = include_str!("drive_inprocess.rs");
        let production = source
            .split("#[cfg(test)]")
            .next()
            .expect("the module has a production section");
        assert!(
            !production.contains("reqwest"),
            "the in-process drive adapter must not depend on reqwest"
        );
        assert!(
            !production.contains("_BASE_URL\""),
            "the in-process drive adapter must not read an endpoint variable"
        );
    }
}
