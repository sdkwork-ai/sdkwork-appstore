use chrono::Utc;
use uuid::Uuid;

use crate::context::AppstoreRequestContext;
use crate::domain::commands::{
    ListIapItemsRequest, RetrieveComplianceProfileRequest, UpdateComplianceProfileRequest,
    UpsertPermissionDisclosuresRequest,
};
use crate::domain::models::{
    CompliancePermissionDisclosure, ComplianceProfile, ComplianceProfileId, ComplianceStatus,
    DisclosureStatus,
};
use crate::domain::results::{
    ListIapItemsResult, RetrieveComplianceProfileResult, UpdateComplianceProfileResult,
    UpsertPermissionDisclosuresResult,
};
use crate::error::{AppstoreServiceError, AppstoreServiceResult};
use crate::ports::repository::ComplianceRepositoryPort;

#[async_trait::async_trait]
pub trait ComplianceOperations {
    async fn retrieve_compliance_profile(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveComplianceProfileRequest,
    ) -> AppstoreServiceResult<RetrieveComplianceProfileResult>;

    async fn update_compliance_profile(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateComplianceProfileRequest,
    ) -> AppstoreServiceResult<UpdateComplianceProfileResult>;

    async fn upsert_permission_disclosures(
        &self,
        context: &AppstoreRequestContext,
        request: UpsertPermissionDisclosuresRequest,
    ) -> AppstoreServiceResult<UpsertPermissionDisclosuresResult>;

    async fn list_iap_items(
        &self,
        context: &AppstoreRequestContext,
        request: ListIapItemsRequest,
    ) -> AppstoreServiceResult<ListIapItemsResult>;
}

#[derive(Debug, Clone)]
pub struct ComplianceService<R> {
    repository: R,
}

impl<R> ComplianceService<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }
}

impl<R> ComplianceService<R>
where
    R: ComplianceRepositoryPort,
{
    fn require_scope(
        context: &AppstoreRequestContext,
        required: &str,
    ) -> AppstoreServiceResult<()> {
        if sdkwork_appstore_authorization::scope_granted(&context.permission_scopes, required) {
            Ok(())
        } else {
            Err(AppstoreServiceError::PermissionDenied(
                sdkwork_appstore_authorization::missing_scope_message(required),
            ))
        }
    }

    fn require_user_id(context: &AppstoreRequestContext) -> AppstoreServiceResult<String> {
        let user_id = context.user_id.as_deref().unwrap_or("").trim();
        if user_id.is_empty() || user_id == "system" {
            return Err(AppstoreServiceError::PermissionDenied(
                "Authenticated user is required".to_string(),
            ));
        }
        Ok(user_id.to_string())
    }

    /// Requires the caller to own the listing's publisher or hold an admin scope.
    async fn ensure_listing_publisher_access(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<()> {
        if Self::require_scope(context, "appstore.listings.admin").is_ok() {
            return Ok(());
        }
        let user_id = Self::require_user_id(context)?;
        let publisher_id = self
            .repository
            .find_listing_publisher_id(context, listing_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!("Listing not found: {}", listing_id))
            })?;
        let role = self
            .repository
            .find_publisher_member_role(context, &publisher_id, &user_id)
            .await?;
        if role.is_none() {
            return Err(AppstoreServiceError::PermissionDenied(
                "Publisher membership is required".to_string(),
            ));
        }
        Ok(())
    }

    /// Read gate: public listings are readable by everyone; non-public only
    /// by the owning publisher or admins.
    async fn ensure_listing_read_access(
        &self,
        context: &AppstoreRequestContext,
        listing_id: &str,
    ) -> AppstoreServiceResult<()> {
        let visible = self
            .repository
            .find_listing_visibility(context, listing_id)
            .await?;
        match visible {
            Some(true) => Ok(()),
            Some(false) => {
                self.ensure_listing_publisher_access(context, listing_id)
                    .await
            }
            None => Err(AppstoreServiceError::NotFound(format!(
                "Listing not found: {}",
                listing_id
            ))),
        }
    }
}

#[async_trait::async_trait]
impl<R> ComplianceOperations for ComplianceService<R>
where
    R: ComplianceRepositoryPort,
{
    async fn retrieve_compliance_profile(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveComplianceProfileRequest,
    ) -> AppstoreServiceResult<RetrieveComplianceProfileResult> {
        if request.listing_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Listing ID is required".to_string(),
            ));
        }
        self.ensure_listing_read_access(context, &request.listing_id)
            .await?;

        let profile = self
            .repository
            .find_compliance_profile_by_listing(context, &request.listing_id)
            .await?;

        match profile {
            Some(profile) => Ok(RetrieveComplianceProfileResult::found(
                "appstore.compliance.profile.retrieve",
                profile,
            )),
            None => Ok(RetrieveComplianceProfileResult::not_found(
                "appstore.compliance.profile.retrieve",
            )),
        }
    }

    async fn update_compliance_profile(
        &self,
        context: &AppstoreRequestContext,
        request: UpdateComplianceProfileRequest,
    ) -> AppstoreServiceResult<UpdateComplianceProfileResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        if request.listing_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Listing ID is required".to_string(),
            ));
        }
        self.ensure_listing_publisher_access(context, &request.listing_id)
            .await?;

        let existing = self
            .repository
            .find_compliance_profile_by_listing(context, &request.listing_id)
            .await?;

        match existing {
            Some(mut profile) => {
                if !profile.is_editable() {
                    return Err(AppstoreServiceError::InvalidState(
                        "Compliance profile is not editable in current state".to_string(),
                    ));
                }

                let mut updated_fields = Vec::new();

                if let Some(privacy_nutrition) = request.privacy_nutrition {
                    profile.privacy_nutrition_json = privacy_nutrition;
                    updated_fields.push("privacy_nutrition_json".to_string());
                }

                if let Some(content_rating) = request.content_rating_questionnaire {
                    profile.content_rating_questionnaire_json = content_rating;
                    updated_fields.push("content_rating_questionnaire_json".to_string());
                }

                if let Some(data_safety) = request.data_safety {
                    profile.data_safety_json = data_safety;
                    updated_fields.push("data_safety_json".to_string());
                }

                if let Some(target_audience) = request.target_audience {
                    profile.target_audience_json = target_audience;
                    updated_fields.push("target_audience_json".to_string());
                }

                if updated_fields.is_empty() {
                    return Ok(UpdateComplianceProfileResult::updated(
                        "appstore.compliance.profile.update",
                        profile,
                    ));
                }

                profile.updated_at = Utc::now();

                self.repository
                    .update_compliance_profile(context, &profile)
                    .await?;

                Ok(UpdateComplianceProfileResult::updated(
                    "appstore.compliance.profile.update",
                    profile,
                ))
            }
            None => {
                let now = Utc::now();
                let profile = ComplianceProfile {
                    id: ComplianceProfileId::new(Uuid::new_v4().to_string()),
                    tenant_id: context.tenant_id.clone(),
                    organization_id: context.organization_id.clone().unwrap_or_default(),
                    listing_id: request.listing_id,
                    compliance_version: 1,
                    privacy_nutrition_json: request
                        .privacy_nutrition
                        .unwrap_or(serde_json::Value::Object(serde_json::Map::new())),
                    content_rating_questionnaire_json: request
                        .content_rating_questionnaire
                        .unwrap_or(serde_json::Value::Object(serde_json::Map::new())),
                    data_safety_json: request
                        .data_safety
                        .unwrap_or(serde_json::Value::Object(serde_json::Map::new())),
                    target_audience_json: request
                        .target_audience
                        .unwrap_or(serde_json::Value::Object(serde_json::Map::new())),
                    compliance_status: ComplianceStatus::Draft,
                    reviewed_by: None,
                    reviewed_at: None,
                    created_at: now,
                    updated_at: now,
                };

                self.repository
                    .insert_compliance_profile(context, &profile)
                    .await?;

                Ok(UpdateComplianceProfileResult::created(
                    "appstore.compliance.profile.update",
                    profile,
                ))
            }
        }
    }

    async fn upsert_permission_disclosures(
        &self,
        context: &AppstoreRequestContext,
        request: UpsertPermissionDisclosuresRequest,
    ) -> AppstoreServiceResult<UpsertPermissionDisclosuresResult> {
        Self::require_scope(context, "appstore.listings.write")?;
        if request.listing_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Listing ID is required".to_string(),
            ));
        }
        self.ensure_listing_publisher_access(context, &request.listing_id)
            .await?;

        if request.permissions.is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "At least one permission disclosure is required".to_string(),
            ));
        }

        for item in &request.permissions {
            if item.permission_code.trim().is_empty() {
                return Err(AppstoreServiceError::ValidationFailed(
                    "Permission code cannot be empty".to_string(),
                ));
            }
            if item.usage_purpose.trim().is_empty() {
                return Err(AppstoreServiceError::ValidationFailed(
                    "Usage purpose cannot be empty".to_string(),
                ));
            }
        }

        let now = Utc::now();
        let mut disclosures = Vec::new();

        for item in &request.permissions {
            let existing = self
                .repository
                .find_permission_disclosure(context, &request.listing_id, &item.permission_code)
                .await?;

            match existing {
                Some(mut disclosure) => {
                    disclosure.usage_purpose = item.usage_purpose.clone();
                    disclosure.is_required = item.is_required;
                    disclosure.disclosure_status = DisclosureStatus::Published;
                    disclosure.updated_at = now;

                    self.repository
                        .update_permission_disclosure(context, &disclosure)
                        .await?;

                    disclosures.push(disclosure);
                }
                None => {
                    let disclosure = CompliancePermissionDisclosure {
                        id: Uuid::new_v4().to_string(),
                        tenant_id: context.tenant_id.clone(),
                        organization_id: context.organization_id.clone().unwrap_or_default(),
                        listing_id: request.listing_id.clone(),
                        permission_code: item.permission_code.clone(),
                        usage_purpose: item.usage_purpose.clone(),
                        is_required: item.is_required,
                        disclosure_status: DisclosureStatus::Published,
                        created_at: now,
                        updated_at: now,
                    };

                    self.repository
                        .insert_permission_disclosure(context, &disclosure)
                        .await?;

                    disclosures.push(disclosure);
                }
            }
        }

        Ok(UpsertPermissionDisclosuresResult::upserted(
            "appstore.compliance.permissions.update",
            disclosures,
        ))
    }

    async fn list_iap_items(
        &self,
        context: &AppstoreRequestContext,
        request: ListIapItemsRequest,
    ) -> AppstoreServiceResult<ListIapItemsResult> {
        if request.listing_id.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Listing ID is required".to_string(),
            ));
        }
        self.ensure_listing_read_access(context, &request.listing_id)
            .await?;

        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let items = self
            .repository
            .find_iap_items_by_listing(
                context,
                request.listing_id.trim(),
                request.cursor.as_deref(),
                limit + 1,
            )
            .await?;

        let has_more = items.len() > limit as usize;
        let items: Vec<_> = items.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            items.last().map(|item| item.id.clone())
        } else {
            None
        };

        Ok(ListIapItemsResult::new(
            "appstore.compliance.iapItems.list",
            items,
            next_cursor,
            has_more,
        ))
    }
}
