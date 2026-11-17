//! Remix service behaviour: binding mapping, readiness projection, error split.

use std::collections::{BTreeSet, HashMap};
use std::sync::{Arc, Mutex};

use async_trait::async_trait;
use sdkwork_appstore_remix_service::domain::models::{
    RemixArchiveCoordinates, RemixBinding, RemixDownload, RemixGitCoordinates, RemixState,
    DEPLOY_BASE_URL_ENV,
};
use sdkwork_appstore_remix_service::error::RemixServiceError;
use sdkwork_appstore_remix_service::ports::deploy::{DeployRemixPort, RemixPortError};
use sdkwork_appstore_remix_service::ports::repository::RemixRepositoryPort;
use sdkwork_appstore_remix_service::RemixService;

#[derive(Default)]
struct FakeRepository {
    visible: HashMap<String, String>,
    bindings: Vec<RemixBinding>,
    error: Option<String>,
}

#[async_trait]
impl RemixRepositoryPort for FakeRepository {
    async fn find_visible_listing_app_id(
        &self,
        _tenant_id: &str,
        listing_id: &str,
    ) -> Result<Option<String>, String> {
        if let Some(error) = self.error.as_ref() {
            return Err(error.clone());
        }
        Ok(self.visible.get(listing_id).cloned())
    }

    async fn find_bindings(
        &self,
        _tenant_id: &str,
        app_ids: &[String],
    ) -> Result<Vec<RemixBinding>, String> {
        if let Some(error) = self.error.as_ref() {
            return Err(error.clone());
        }
        let requested: BTreeSet<&str> = app_ids.iter().map(String::as_str).collect();
        Ok(self
            .bindings
            .iter()
            .filter(|binding| requested.contains(binding.app_id.as_str()))
            .cloned()
            .collect())
    }
}

#[derive(Default)]
struct FakeDeploy {
    states: HashMap<String, Result<RemixState, RemixPortError>>,
}

#[async_trait]
impl DeployRemixPort for FakeDeploy {
    async fn remix_state(
        &self,
        _tenant_id: &str,
        deploy_app_uuid: &str,
    ) -> Result<RemixState, RemixPortError> {
        match self.states.get(deploy_app_uuid) {
            Some(state) => state.clone(),
            None => Err(RemixPortError::UnknownApplication),
        }
    }
}

fn binding(app_id: &str, deploy_app_id: &str, deploy_app_uuid: &str) -> RemixBinding {
    RemixBinding {
        app_id: app_id.to_string(),
        deploy_app_id: deploy_app_id.to_string(),
        deploy_app_uuid: deploy_app_uuid.to_string(),
    }
}

fn archive_download() -> RemixDownload {
    RemixDownload::archive(RemixArchiveCoordinates {
        artifact_id: "artifact-1".to_string(),
        drive_node_id: "node-1".to_string(),
        file_name: "source.zip".to_string(),
        content_length: Some("2048".to_string()),
        checksum_sha256: Some("a".repeat(64)),
    })
}

fn git_download() -> RemixDownload {
    RemixDownload::git(RemixGitCoordinates {
        repo_url: "https://git.example.test/acme/app.git".to_string(),
        repo_ref: "refs/heads/main".to_string(),
        sub_path: Some("apps/desktop".to_string()),
    })
}

fn ready(download: RemixDownload) -> RemixState {
    RemixState {
        remix_enabled: true,
        source_ready: true,
        download: Some(download),
    }
}

fn not_ready() -> RemixState {
    RemixState {
        remix_enabled: true,
        source_ready: false,
        download: None,
    }
}

fn service(repository: FakeRepository, deploy: FakeDeploy) -> RemixService<FakeRepository> {
    RemixService::new(repository).with_deploy_port(Arc::new(deploy))
}

#[tokio::test]
async fn remixable_app_ids_projects_only_ready_deploy_applications() {
    let repository = FakeRepository {
        visible: HashMap::new(),
        bindings: vec![
            binding("app-ready", "101", "uuid-ready"),
            binding("app-pending", "102", "uuid-pending"),
        ],
        error: None,
    };
    let mut deploy = FakeDeploy::default();
    deploy
        .states
        .insert("uuid-ready".to_string(), Ok(ready(archive_download())));
    deploy
        .states
        .insert("uuid-pending".to_string(), Ok(not_ready()));

    let remixable = service(repository, deploy)
        .remixable_app_ids(
            "tenant-1",
            &[
                "app-ready".to_string(),
                "app-pending".to_string(),
                "app-unbound".to_string(),
            ],
        )
        .await;

    assert_eq!(
        remixable,
        BTreeSet::from(["app-ready".to_string()]),
        "only the bound and ready application is remixable"
    );
}

#[tokio::test]
async fn remixable_app_ids_never_crosses_applications() {
    // Two applications bound to two deploy applications: readiness of one must
    // not leak onto the other, and a binding for a different application must
    // not make an unbound one remixable.
    let repository = FakeRepository {
        visible: HashMap::new(),
        bindings: vec![
            binding("app-a", "201", "uuid-a"),
            binding("app-b", "202", "uuid-b"),
        ],
        error: None,
    };
    let mut deploy = FakeDeploy::default();
    deploy
        .states
        .insert("uuid-a".to_string(), Ok(ready(git_download())));
    deploy.states.insert("uuid-b".to_string(), Ok(not_ready()));

    let remixable = service(repository, deploy)
        .remixable_app_ids(
            "tenant-1",
            &[
                "app-a".to_string(),
                "app-b".to_string(),
                "app-c".to_string(),
            ],
        )
        .await;

    assert!(remixable.contains("app-a"));
    assert!(!remixable.contains("app-b"));
    assert!(!remixable.contains("app-c"));
}

#[tokio::test]
async fn remixable_app_ids_resolves_a_shared_deploy_application_once() {
    let repository = FakeRepository {
        visible: HashMap::new(),
        bindings: vec![
            binding("app-a", "301", "uuid-shared"),
            binding("app-b", "301", "uuid-shared"),
        ],
        error: None,
    };
    let mut deploy = FakeDeploy::default();
    deploy
        .states
        .insert("uuid-shared".to_string(), Ok(ready(archive_download())));
    let calls = Arc::new(Mutex::new(0usize));
    let deploy = Arc::new(TrackedDeploy {
        inner: deploy,
        calls: calls.clone(),
    });

    let remixable = RemixService::new(repository)
        .with_deploy_port(deploy)
        .remixable_app_ids("tenant-1", &["app-a".to_string(), "app-b".to_string()])
        .await;

    assert_eq!(remixable.len(), 2);
    assert_eq!(
        *calls.lock().expect("calls lock"),
        1,
        "a shared deploy application is read once per page"
    );
}

struct TrackedDeploy {
    inner: FakeDeploy,
    calls: Arc<Mutex<usize>>,
}

#[async_trait]
impl DeployRemixPort for TrackedDeploy {
    async fn remix_state(
        &self,
        tenant_id: &str,
        deploy_app_uuid: &str,
    ) -> Result<RemixState, RemixPortError> {
        *self.calls.lock().expect("calls lock") += 1;
        self.inner.remix_state(tenant_id, deploy_app_uuid).await
    }
}

#[tokio::test]
async fn remixable_app_ids_degrades_to_false_when_deploy_is_unconfigured() {
    let repository = FakeRepository {
        visible: HashMap::new(),
        bindings: vec![binding("app-a", "401", "uuid-a")],
        error: None,
    };
    let mut deploy = FakeDeploy::default();
    deploy.states.insert(
        "uuid-a".to_string(),
        Err(RemixPortError::Unconfigured(DEPLOY_BASE_URL_ENV)),
    );

    let remixable = service(repository, deploy)
        .remixable_app_ids("tenant-1", &["app-a".to_string()])
        .await;

    assert!(remixable.is_empty());
}

#[tokio::test]
async fn remixable_app_ids_degrades_to_false_when_the_binding_store_fails() {
    let repository = FakeRepository {
        visible: HashMap::new(),
        bindings: vec![binding("app-a", "501", "uuid-a")],
        error: Some("database exploded".to_string()),
    };

    let remixable = service(repository, FakeDeploy::default())
        .remixable_app_ids("tenant-1", &["app-a".to_string()])
        .await;

    assert!(remixable.is_empty());
}

#[tokio::test]
async fn resolve_listing_remix_projects_archive_coordinates() {
    let repository = FakeRepository {
        visible: HashMap::from([("listing-1".to_string(), "app-a".to_string())]),
        bindings: vec![binding("app-a", "601", "uuid-a")],
        error: None,
    };
    let mut deploy = FakeDeploy::default();
    deploy
        .states
        .insert("uuid-a".to_string(), Ok(ready(archive_download())));

    let download = service(repository, deploy)
        .resolve_listing_remix("tenant-1", "listing-1")
        .await
        .expect("archive remix resolves");

    assert_eq!(download.mode.as_str(), "ARCHIVE");
    let archive = download.archive.expect("archive coordinates");
    assert_eq!(archive.drive_node_id, "node-1");
    assert_eq!(archive.checksum_sha256, Some("a".repeat(64)));
    assert!(download.git.is_none());
}

#[tokio::test]
async fn resolve_listing_remix_projects_git_coordinates() {
    let repository = FakeRepository {
        visible: HashMap::from([("listing-2".to_string(), "app-b".to_string())]),
        bindings: vec![binding("app-b", "602", "uuid-b")],
        error: None,
    };
    let mut deploy = FakeDeploy::default();
    deploy
        .states
        .insert("uuid-b".to_string(), Ok(ready(git_download())));

    let download = service(repository, deploy)
        .resolve_listing_remix("tenant-1", "listing-2")
        .await
        .expect("git remix resolves");

    assert_eq!(download.mode.as_str(), "GIT");
    let git = download.git.expect("git coordinates");
    assert_eq!(git.repo_ref, "refs/heads/main");
    assert_eq!(git.sub_path.as_deref(), Some("apps/desktop"));
}

#[tokio::test]
async fn resolve_listing_remix_is_not_found_for_an_unpublished_listing() {
    let repository = FakeRepository {
        visible: HashMap::new(),
        bindings: vec![binding("app-a", "701", "uuid-a")],
        error: None,
    };

    let error = service(repository, FakeDeploy::default())
        .resolve_listing_remix("tenant-1", "listing-hidden")
        .await
        .expect_err("a hidden listing has no remix");

    assert!(matches!(error, RemixServiceError::NotFound(_)));
}

#[tokio::test]
async fn resolve_listing_remix_is_not_found_without_a_binding() {
    let repository = FakeRepository {
        visible: HashMap::from([("listing-3".to_string(), "app-c".to_string())]),
        bindings: Vec::new(),
        error: None,
    };

    let error = service(repository, FakeDeploy::default())
        .resolve_listing_remix("tenant-1", "listing-3")
        .await
        .expect_err("an unbound listing has no remix");

    assert!(matches!(error, RemixServiceError::NotFound(_)));
}

#[tokio::test]
async fn resolve_listing_remix_is_not_found_when_the_source_is_not_ready() {
    let repository = FakeRepository {
        visible: HashMap::from([("listing-4".to_string(), "app-d".to_string())]),
        bindings: vec![binding("app-d", "704", "uuid-d")],
        error: None,
    };
    let mut deploy = FakeDeploy::default();
    deploy.states.insert("uuid-d".to_string(), Ok(not_ready()));

    let error = service(repository, deploy)
        .resolve_listing_remix("tenant-1", "listing-4")
        .await
        .expect_err("a not-ready source is not remixable");

    assert!(matches!(error, RemixServiceError::NotFound(_)));
}

#[tokio::test]
async fn resolve_listing_remix_is_not_found_when_deploy_forgot_the_application() {
    let repository = FakeRepository {
        visible: HashMap::from([("listing-5".to_string(), "app-e".to_string())]),
        bindings: vec![binding("app-e", "705", "uuid-missing")],
        error: None,
    };

    let error = service(repository, FakeDeploy::default())
        .resolve_listing_remix("tenant-1", "listing-5")
        .await
        .expect_err("a stale binding is not remixable");

    assert!(matches!(error, RemixServiceError::NotFound(_)));
}

#[tokio::test]
async fn resolve_listing_remix_is_unavailable_and_names_the_missing_variable() {
    let repository = FakeRepository {
        visible: HashMap::from([("listing-6".to_string(), "app-f".to_string())]),
        bindings: vec![binding("app-f", "706", "uuid-f")],
        error: None,
    };
    let mut deploy = FakeDeploy::default();
    deploy.states.insert(
        "uuid-f".to_string(),
        Err(RemixPortError::Unconfigured(DEPLOY_BASE_URL_ENV)),
    );

    let error = service(repository, deploy)
        .resolve_listing_remix("tenant-1", "listing-6")
        .await
        .expect_err("an unconfigured deploy integration is unavailable");

    match error {
        RemixServiceError::Unavailable(message) => {
            assert!(
                message.contains(DEPLOY_BASE_URL_ENV),
                "the 503 detail must name the variable, got: {message}"
            );
        }
        other => panic!("expected unavailable, got {other:?}"),
    }
}

#[tokio::test]
async fn resolve_listing_remix_is_unavailable_when_deploy_is_unreachable() {
    let repository = FakeRepository {
        visible: HashMap::from([("listing-7".to_string(), "app-g".to_string())]),
        bindings: vec![binding("app-g", "707", "uuid-g")],
        error: None,
    };
    let mut deploy = FakeDeploy::default();
    deploy.states.insert(
        "uuid-g".to_string(),
        Err(RemixPortError::Unavailable(
            "connection refused".to_string(),
        )),
    );

    let error = service(repository, deploy)
        .resolve_listing_remix("tenant-1", "listing-7")
        .await
        .expect_err("an unreachable deploy integration is unavailable");

    assert!(matches!(error, RemixServiceError::Unavailable(_)));
}

#[tokio::test]
async fn a_binding_without_a_deploy_uuid_is_not_remixable() {
    let repository = FakeRepository {
        visible: HashMap::new(),
        bindings: vec![RemixBinding {
            app_id: "app-h".to_string(),
            deploy_app_id: "808".to_string(),
            deploy_app_uuid: "  ".to_string(),
        }],
        error: None,
    };

    let remixable = service(repository, FakeDeploy::default())
        .remixable_app_ids("tenant-1", &["app-h".to_string()])
        .await;

    assert!(remixable.is_empty());
}

#[test]
fn deploy_target_trims_and_rejects_a_blank_uuid() {
    let trimmed_binding = binding("app", "1", " uuid ");
    assert_eq!(
        sdkwork_appstore_remix_service::deploy_target(&trimmed_binding),
        Some("uuid")
    );
    let blank_binding = binding("app", "1", "   ");
    assert_eq!(
        sdkwork_appstore_remix_service::deploy_target(&blank_binding),
        None
    );
}

#[test]
fn remix_state_requires_enabled_ready_and_complete_coordinates() {
    let complete = ready(archive_download());
    assert!(complete.is_ready());

    let disabled = RemixState {
        remix_enabled: false,
        source_ready: true,
        download: Some(archive_download()),
    };
    assert!(!disabled.is_ready());

    let no_download = RemixState {
        remix_enabled: true,
        source_ready: true,
        download: None,
    };
    assert!(!no_download.is_ready());

    let blank_node = RemixState {
        remix_enabled: true,
        source_ready: true,
        download: Some(RemixDownload::archive(RemixArchiveCoordinates {
            artifact_id: "artifact".to_string(),
            drive_node_id: "  ".to_string(),
            file_name: "source.zip".to_string(),
            content_length: None,
            checksum_sha256: None,
        })),
    };
    assert!(
        !blank_node.is_ready(),
        "incomplete coordinates are unusable"
    );
}
