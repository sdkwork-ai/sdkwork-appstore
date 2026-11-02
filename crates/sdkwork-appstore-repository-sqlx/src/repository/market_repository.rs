use crate::pool::AppstoreSqlxDb;

use crate::db::columns::{
    columns_csv, APPSTORE_MARKET_CHANNEL_COLUMNS, APPSTORE_MARKET_RELEASE_COLUMNS,
};
use crate::db::rows::{MarketChannelRow, MarketReleaseRow};
use crate::mapper::row_mapper::{
    map_market_channel_domain_to_row, map_market_channel_row_to_domain,
    map_market_release_domain_to_row, map_market_release_row_to_domain,
};

use sdkwork_appstore_market_service::context::AppstoreRequestContext;
use sdkwork_appstore_market_service::domain::models::{
    MarketChannel, MarketChannelId, MarketRelease, MarketReleaseId,
};
use sdkwork_appstore_market_service::error::AppstoreServiceError;

#[derive(Debug, Clone)]
pub struct SqlxMarketRepository {
    db: AppstoreSqlxDb,
}

impl SqlxMarketRepository {
    pub fn new(db: AppstoreSqlxDb) -> Self {
        Self { db }
    }
}

#[async_trait::async_trait]
impl sdkwork_appstore_market_service::ports::repository::MarketRepositoryPort
    for SqlxMarketRepository
{
    async fn find_channel_by_id(
        &self,
        context: &AppstoreRequestContext,
        channel_id: &MarketChannelId,
    ) -> Result<Option<MarketChannel>, sdkwork_appstore_market_service::error::AppstoreServiceError>
    {
        let row = self
            .db
            .query_as::<MarketChannelRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_market_channel
            WHERE id = ? AND tenant_id = ?
            "#,
                columns_csv(APPSTORE_MARKET_CHANNEL_COLUMNS)
            ))
            .bind(channel_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_market_channel_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn find_channel_by_code(
        &self,
        context: &AppstoreRequestContext,
        channel_code: &str,
    ) -> Result<Option<MarketChannel>, sdkwork_appstore_market_service::error::AppstoreServiceError>
    {
        let row = self
            .db
            .query_as::<MarketChannelRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_market_channel
            WHERE channel_code = ? AND tenant_id = ?
            "#,
                columns_csv(APPSTORE_MARKET_CHANNEL_COLUMNS)
            ))
            .bind(channel_code)
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_market_channel_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn list_channels(
        &self,
        context: &AppstoreRequestContext,
        channel_status: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<MarketChannel>, sdkwork_appstore_market_service::error::AppstoreServiceError>
    {
        let rows = if let Some(cursor_id) = cursor {
            if let Some(status) = channel_status {
                self.db
                    .query_as::<MarketChannelRow>(&format!(
                        r#"
                    SELECT {}
                    FROM appstore_market_channel
                    WHERE tenant_id = ? AND channel_status = ? AND id > ?
                    ORDER BY id ASC
                    LIMIT ?
                    "#,
                        columns_csv(APPSTORE_MARKET_CHANNEL_COLUMNS)
                    ))
                    .bind(&context.tenant_id)
                    .bind(status)
                    .bind(cursor_id)
                    .bind(limit)
                    .fetch_all(&self.db)
                    .await
            } else {
                self.db
                    .query_as::<MarketChannelRow>(&format!(
                        r#"
                    SELECT {}
                    FROM appstore_market_channel
                    WHERE tenant_id = ? AND id > ?
                    ORDER BY id ASC
                    LIMIT ?
                    "#,
                        columns_csv(APPSTORE_MARKET_CHANNEL_COLUMNS)
                    ))
                    .bind(&context.tenant_id)
                    .bind(cursor_id)
                    .bind(limit)
                    .fetch_all(&self.db)
                    .await
            }
        } else if let Some(status) = channel_status {
            self.db
                .query_as::<MarketChannelRow>(&format!(
                    r#"
                SELECT {}
                FROM appstore_market_channel
                WHERE tenant_id = ? AND channel_status = ?
                ORDER BY id ASC
                LIMIT ?
                "#,
                    columns_csv(APPSTORE_MARKET_CHANNEL_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(status)
                .bind(limit)
                .fetch_all(&self.db)
                .await
        } else {
            self.db
                .query_as::<MarketChannelRow>(&format!(
                    r#"
                SELECT {}
                FROM appstore_market_channel
                WHERE tenant_id = ?
                ORDER BY id ASC
                LIMIT ?
                "#,
                    columns_csv(APPSTORE_MARKET_CHANNEL_COLUMNS)
                ))
                .bind(&context.tenant_id)
                .bind(limit)
                .fetch_all(&self.db)
                .await
        }
        .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_market_channel_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn insert_channel(
        &self,
        context: &AppstoreRequestContext,
        channel: &MarketChannel,
    ) -> Result<(), sdkwork_appstore_market_service::error::AppstoreServiceError> {
        let (channel_type, channel_status, api_capability_json, config_json) =
            map_market_channel_domain_to_row(channel);

        self.db
            .query(
                r#"
            INSERT INTO appstore_market_channel (
                id, tenant_id, organization_id, channel_code, channel_type, provider,
                channel_status, external_store_code, api_capability_json, config_json,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(channel.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .bind(&channel.channel_code)
            .bind(&channel_type)
            .bind(&channel.provider)
            .bind(&channel_status)
            .bind(&channel.external_store_code)
            .bind(&api_capability_json)
            .bind(&config_json)
            .bind(channel.created_at)
            .bind(channel.updated_at)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn update_channel(
        &self,
        context: &AppstoreRequestContext,
        channel: &MarketChannel,
    ) -> Result<(), sdkwork_appstore_market_service::error::AppstoreServiceError> {
        let (channel_type, channel_status, api_capability_json, config_json) =
            map_market_channel_domain_to_row(channel);

        self.db
            .query(
                r#"
            UPDATE appstore_market_channel
            SET channel_type = ?, provider = ?, channel_status = ?, external_store_code = ?,
                api_capability_json = ?, config_json = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ? AND organization_id = ?
            "#,
            )
            .bind(&channel_type)
            .bind(&channel.provider)
            .bind(&channel_status)
            .bind(&channel.external_store_code)
            .bind(&api_capability_json)
            .bind(&config_json)
            .bind(channel.updated_at)
            .bind(channel.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }

    async fn find_release_by_id(
        &self,
        context: &AppstoreRequestContext,
        release_id: &MarketReleaseId,
    ) -> Result<Option<MarketRelease>, sdkwork_appstore_market_service::error::AppstoreServiceError>
    {
        let row = self
            .db
            .query_as::<MarketReleaseRow>(&format!(
                r#"
            SELECT {}
            FROM appstore_market_release
            WHERE id = ? AND tenant_id = ?
            "#,
                columns_csv(APPSTORE_MARKET_RELEASE_COLUMNS)
            ))
            .bind(release_id.as_str())
            .bind(&context.tenant_id)
            .fetch_optional(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        row.map(map_market_release_row_to_domain)
            .transpose()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn list_releases(
        &self,
        context: &AppstoreRequestContext,
        release_id: Option<&str>,
        channel_id: Option<&str>,
        market_status: Option<&str>,
        cursor: Option<&str>,
        limit: i32,
    ) -> Result<Vec<MarketRelease>, sdkwork_appstore_market_service::error::AppstoreServiceError>
    {
        let mut conditions = vec!["tenant_id = ?".to_string()];

        if release_id.is_some() {
            conditions.push("release_id = ?".to_string());
        }
        if channel_id.is_some() {
            conditions.push("channel_id = ?".to_string());
        }
        if market_status.is_some() {
            conditions.push("market_status = ?".to_string());
        }
        if cursor.is_some() {
            conditions.push("id > ?".to_string());
        }

        let where_clause = conditions.join(" AND ");
        let sql = format!(
            r#"
            SELECT {}
            FROM appstore_market_release
            WHERE {}
            ORDER BY id ASC
            LIMIT ?
            "#,
            columns_csv(APPSTORE_MARKET_RELEASE_COLUMNS),
            where_clause
        );

        let mut query = self.db.query_as::<MarketReleaseRow>(&sql);
        query = query.bind(&context.tenant_id);
        if let Some(rid) = release_id {
            query = query.bind(rid);
        }
        if let Some(cid) = channel_id {
            query = query.bind(cid);
        }
        if let Some(status) = market_status {
            query = query.bind(status);
        }
        if let Some(cursor_id) = cursor {
            query = query.bind(cursor_id);
        }
        query = query.bind(limit);

        let rows = query
            .fetch_all(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        rows.into_iter()
            .map(map_market_release_row_to_domain)
            .collect::<Result<Vec<_>, _>>()
            .map_err(AppstoreServiceError::Internal)
    }

    async fn update_release(
        &self,
        context: &AppstoreRequestContext,
        release: &MarketRelease,
    ) -> Result<(), sdkwork_appstore_market_service::error::AppstoreServiceError> {
        let (market_status, countries_json, external_status_json) =
            map_market_release_domain_to_row(release);

        self.db
            .query(
                r#"
            UPDATE appstore_market_release
            SET market_status = ?, rollout_percent = ?, countries_json = ?, store_url = ?,
                external_status_json = ?, submitted_at = ?, approved_at = ?, released_at = ?,
                rejected_at = ?, last_synced_at = ?, updated_at = ?
            WHERE id = ? AND tenant_id = ? AND organization_id = ?
            "#,
            )
            .bind(&market_status)
            .bind(release.rollout_percent)
            .bind(&countries_json)
            .bind(&release.store_url)
            .bind(&external_status_json)
            .bind(release.submitted_at)
            .bind(release.approved_at)
            .bind(release.released_at)
            .bind(release.rejected_at)
            .bind(release.last_synced_at)
            .bind(release.updated_at)
            .bind(release.id.as_str())
            .bind(&context.tenant_id)
            .bind(&context.organization_id)
            .execute_unified(&self.db)
            .await
            .map_err(|e| AppstoreServiceError::Internal(format!("Database error: {}", e)))?;

        Ok(())
    }
}
