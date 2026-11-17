//! Deployment-binding reads behind the remix service port.

use crate::db::rows::RemixBindingRow;
use crate::pool::AppstoreSqlxDb;
use sdkwork_appstore_remix_service::domain::models::RemixBinding;
use sdkwork_appstore_remix_service::ports::repository::RemixRepositoryPort;

/// Reads of `appstore_application_deployment_binding` plus the storefront
/// visibility check a remix read must pass.
#[derive(Debug, Clone)]
pub struct SqlxRemixRepository {
    db: AppstoreSqlxDb,
}

impl SqlxRemixRepository {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self { db }
    }
}

#[async_trait::async_trait]
impl RemixRepositoryPort for SqlxRemixRepository {
    async fn find_visible_listing_app_id(
        &self,
        tenant_id: &str,
        listing_id: &str,
    ) -> Result<Option<String>, String> {
        // Same predicate the catalog storefront reads use: only an active,
        // visible, non-deleted listing is a storefront product. A draft or
        // hidden listing must never leak a remix download.
        let sql = r#"SELECT app_id FROM appstore_application_listing
            WHERE id = ? AND tenant_id = ?
              AND listing_status = 'active'
              AND storefront_visibility = 'visible'
              AND deleted_at IS NULL"#;
        let row = self
            .db
            .query_as::<(String,)>(&self.db.adapt_sql(sql))
            .bind(listing_id)
            .bind(tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|error| format!("listing visibility lookup failed: {error}"))?;
        Ok(row.map(|(app_id,)| app_id))
    }

    async fn find_bindings(
        &self,
        tenant_id: &str,
        app_ids: &[String],
    ) -> Result<Vec<RemixBinding>, String> {
        if app_ids.is_empty() {
            return Ok(Vec::new());
        }
        let placeholders = app_ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
        // Revoked and invalid bindings are not a deployment relationship any
        // more. Among the remaining rows the active, default, production one
        // wins, and the id keeps the choice deterministic across environments.
        let sql = format!(
            r#"SELECT app_id,
                      CAST(deploy_app_id AS TEXT) AS deploy_app_id,
                      deploy_app_uuid
               FROM appstore_application_deployment_binding
               WHERE tenant_id = ?
                 AND app_id IN ({placeholders})
                 AND deleted_at IS NULL
                 AND binding_status IN ('pending', 'active', 'degraded')
               ORDER BY app_id ASC,
                        (binding_status = 'active') DESC,
                        is_default DESC,
                        (environment = 'production') DESC,
                        id ASC"#
        );
        let mut query = self
            .db
            .query_as::<RemixBindingRow>(&self.db.adapt_sql(&sql))
            .bind(tenant_id);
        for app_id in app_ids {
            query = query.bind(app_id);
        }
        let rows = query
            .fetch_all(&self.db)
            .await
            .map_err(|error| format!("deployment binding lookup failed: {error}"))?;

        // One binding per application: the ORDER BY above already ranked them.
        let mut bindings: Vec<RemixBinding> = Vec::new();
        for row in rows {
            if bindings.iter().any(|binding| binding.app_id == row.app_id) {
                continue;
            }
            bindings.push(RemixBinding {
                app_id: row.app_id,
                deploy_app_id: row.deploy_app_id,
                deploy_app_uuid: row.deploy_app_uuid.unwrap_or_default(),
            });
        }
        Ok(bindings)
    }
}
