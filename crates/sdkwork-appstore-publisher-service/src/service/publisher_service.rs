//! Publisher service entrypoint.

use chrono::Utc;
use uuid::Uuid;

use crate::context::AppstoreRequestContext;
use crate::domain::commands::{
    AdminVerifyPublisherRequest, CreatePublisherRequest, InvitePublisherMemberRequest,
    ListPublisherMembersRequest, RetrieveCurrentPublisherRequest,
    SubmitPublisherVerificationRequest, UpdatePublisherRequest,
};
use crate::domain::models::{
    ContactSnapshot, MemberRole, MemberStatus, ProfileSnapshot, Publisher, PublisherId,
    PublisherMember, PublisherStatus, PublisherType, PublisherVerification, VerificationStatus,
    VerificationType,
};
use crate::domain::results::{
    AdminVerifyPublisherResult, CreatePublisherResult, InvitePublisherMemberResult,
    ListPublisherMembersResult, RetrieveCurrentPublisherResult, SubmitPublisherVerificationResult,
    UpdatePublisherResult,
};
use crate::error::{AppstoreServiceError, AppstoreServiceResult};
use crate::ports::repository::PublisherRepositoryPort;

#[async_trait::async_trait]
pub trait PublisherOperations {
    async fn retrieve_current_publisher(
        &self,
        context: &AppstoreRequestContext,
        request: RetrieveCurrentPublisherRequest,
    ) -> AppstoreServiceResult<RetrieveCurrentPublisherResult>;

    async fn create_publisher(
        &self,
        context: &AppstoreRequestContext,
        request: CreatePublisherRequest,
    ) -> AppstoreServiceResult<CreatePublisherResult>;

    async fn update_publisher(
        &self,
        context: &AppstoreRequestContext,
        request: UpdatePublisherRequest,
    ) -> AppstoreServiceResult<UpdatePublisherResult>;

    async fn list_members(
        &self,
        context: &AppstoreRequestContext,
        request: ListPublisherMembersRequest,
    ) -> AppstoreServiceResult<ListPublisherMembersResult>;

    async fn invite_member(
        &self,
        context: &AppstoreRequestContext,
        request: InvitePublisherMemberRequest,
    ) -> AppstoreServiceResult<InvitePublisherMemberResult>;

    async fn submit_verification(
        &self,
        context: &AppstoreRequestContext,
        request: SubmitPublisherVerificationRequest,
    ) -> AppstoreServiceResult<SubmitPublisherVerificationResult>;

    async fn admin_verify(
        &self,
        context: &AppstoreRequestContext,
        request: AdminVerifyPublisherRequest,
    ) -> AppstoreServiceResult<AdminVerifyPublisherResult>;
}

#[derive(Debug, Clone)]
pub struct PublisherService<R> {
    repository: R,
}

impl<R> PublisherService<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }
}

#[async_trait::async_trait]
impl<R> PublisherOperations for PublisherService<R>
where
    R: PublisherRepositoryPort,
{
    async fn retrieve_current_publisher(
        &self,
        context: &AppstoreRequestContext,
        _request: RetrieveCurrentPublisherRequest,
    ) -> AppstoreServiceResult<RetrieveCurrentPublisherResult> {
        let publisher = self
            .repository
            .find_publisher_by_owner(context, &context.user_id)
            .await?;

        match publisher {
            Some(publisher) => Ok(RetrieveCurrentPublisherResult::found(
                "appstore.publishers.me.retrieve",
                publisher,
            )),
            None => Ok(RetrieveCurrentPublisherResult::not_found(
                "appstore.publishers.me.retrieve",
            )),
        }
    }

    async fn create_publisher(
        &self,
        context: &AppstoreRequestContext,
        request: CreatePublisherRequest,
    ) -> AppstoreServiceResult<CreatePublisherResult> {
        // Validate request
        if request.display_name.trim().is_empty() {
            return Err(AppstoreServiceError::ValidationFailed(
                "Display name is required".to_string(),
            ));
        }

        // Check if publisher already exists for this owner
        let existing = self
            .repository
            .find_publisher_by_owner(context, &context.user_id)
            .await?;
        if existing.is_some() {
            return Err(AppstoreServiceError::AlreadyExists(
                "Publisher already exists for this user".to_string(),
            ));
        }

        // Check if publisher already exists for this organization
        let existing_org = self
            .repository
            .find_publisher_by_organization(context, &context.organization_id)
            .await?;
        if existing_org.is_some() {
            return Err(AppstoreServiceError::AlreadyExists(
                "Publisher already exists for this organization".to_string(),
            ));
        }

        let now = Utc::now();
        let publisher_id = PublisherId::new(Uuid::new_v4().to_string());
        let publisher_no = format!(
            "PUB-{}",
            Uuid::new_v4()
                .to_string()
                .split('-')
                .next()
                .unwrap_or_default()
        );

        let publisher_type = request
            .publisher_type
            .and_then(|t| PublisherType::from_str(&t))
            .unwrap_or(PublisherType::Individual);

        let publisher = Publisher {
            id: publisher_id,
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            publisher_no,
            publisher_type,
            display_name: request.display_name,
            legal_name: request.legal_name,
            status: PublisherStatus::Active,
            verification_status: VerificationStatus::Unverified,
            contact_snapshot: ContactSnapshot {
                email: request.support_email.clone(),
                phone: None,
                address: None,
            },
            profile_snapshot: ProfileSnapshot {
                bio: None,
                website_url: request.website_url.clone(),
                social_links: Vec::new(),
            },
            website_url: request.website_url,
            support_email: request.support_email,
            logo_media_resource_id: None,
            owner_user_id: context.user_id.clone(),
            version: 1,
            verified_at: None,
            suspended_at: None,
            deleted_at: None,
            created_at: now,
            updated_at: now,
        };

        self.repository
            .insert_publisher(context, &publisher)
            .await?;

        Ok(CreatePublisherResult::created(
            "appstore.publishers.create",
            publisher,
        ))
    }

    async fn update_publisher(
        &self,
        context: &AppstoreRequestContext,
        request: UpdatePublisherRequest,
    ) -> AppstoreServiceResult<UpdatePublisherResult> {
        let publisher_id = PublisherId::new(&request.publisher_id);

        let mut publisher = self
            .repository
            .find_publisher_by_id(context, &publisher_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Publisher not found: {}",
                    request.publisher_id
                ))
            })?;

        // Verify ownership
        if publisher.owner_user_id != context.user_id {
            return Err(AppstoreServiceError::PermissionDenied(
                "Only the owner can update the publisher".to_string(),
            ));
        }

        if !publisher.is_active() {
            return Err(AppstoreServiceError::InvalidState(
                "Publisher is not active".to_string(),
            ));
        }

        let mut updated_fields = Vec::new();

        if let Some(display_name) = request.display_name {
            if display_name.trim().is_empty() {
                return Err(AppstoreServiceError::ValidationFailed(
                    "Display name cannot be empty".to_string(),
                ));
            }
            publisher.display_name = display_name;
            updated_fields.push("display_name".to_string());
        }

        if let Some(website_url) = request.website_url {
            publisher.website_url = Some(website_url.clone());
            publisher.profile_snapshot.website_url = Some(website_url);
            updated_fields.push("website_url".to_string());
        }

        if let Some(support_email) = request.support_email {
            publisher.support_email = Some(support_email.clone());
            publisher.contact_snapshot.email = Some(support_email);
            updated_fields.push("support_email".to_string());
        }

        if updated_fields.is_empty() {
            return Ok(UpdatePublisherResult::updated(
                "appstore.publishers.update",
                publisher,
            ));
        }

        publisher.version += 1;
        publisher.updated_at = Utc::now();

        self.repository
            .update_publisher(context, &publisher)
            .await?;

        Ok(UpdatePublisherResult::updated(
            "appstore.publishers.update",
            publisher,
        ))
    }

    async fn list_members(
        &self,
        context: &AppstoreRequestContext,
        request: ListPublisherMembersRequest,
    ) -> AppstoreServiceResult<ListPublisherMembersResult> {
        let publisher_id = PublisherId::new(&request.publisher_id);

        // Verify publisher exists
        let publisher = self
            .repository
            .find_publisher_by_id(context, &publisher_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Publisher not found: {}",
                    request.publisher_id
                ))
            })?;

        // Verify caller is a publisher member or owner
        let caller_is_member = self
            .repository
            .find_member_by_user(context, &publisher_id, &context.user_id)
            .await?
            .is_some();
        if !caller_is_member && publisher.owner_user_id != context.user_id {
            return Err(AppstoreServiceError::PermissionDenied(
                "Publisher membership is required to list members".to_string(),
            ));
        }

        let limit = request.page_size.unwrap_or(20).clamp(1, 200);
        let members = self
            .repository
            .find_members_by_publisher(context, &publisher_id, request.cursor.as_deref(), limit + 1)
            .await?;

        let has_more = members.len() > limit as usize;
        let members: Vec<PublisherMember> = members.into_iter().take(limit as usize).collect();
        let next_cursor = if has_more {
            members.last().map(|m| m.user_id.clone())
        } else {
            None
        };

        Ok(ListPublisherMembersResult::new(
            "appstore.publishers.members.list",
            members,
            next_cursor,
            has_more,
        ))
    }

    async fn invite_member(
        &self,
        context: &AppstoreRequestContext,
        request: InvitePublisherMemberRequest,
    ) -> AppstoreServiceResult<InvitePublisherMemberResult> {
        let publisher_id = PublisherId::new(&request.publisher_id);

        // Verify publisher exists and is active
        let publisher = self
            .repository
            .find_publisher_by_id(context, &publisher_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Publisher not found: {}",
                    request.publisher_id
                ))
            })?;

        if !publisher.is_active() {
            return Err(AppstoreServiceError::InvalidState(
                "Publisher is not active".to_string(),
            ));
        }

        // Verify the requester is owner or admin
        let requester_member = self
            .repository
            .find_member_by_user(context, &publisher_id, &context.user_id)
            .await?;

        match requester_member {
            Some(member) => {
                if !matches!(member.member_role, MemberRole::Owner | MemberRole::Admin) {
                    return Err(AppstoreServiceError::PermissionDenied(
                        "Only owners and admins can invite members".to_string(),
                    ));
                }
            }
            None => {
                // Check if requester is the owner
                if publisher.owner_user_id != context.user_id {
                    return Err(AppstoreServiceError::PermissionDenied(
                        "Only owners and admins can invite members".to_string(),
                    ));
                }
            }
        }

        // Check if user is already a member
        let existing_member = self
            .repository
            .find_member_by_user(context, &publisher_id, &request.user_id)
            .await?;

        if existing_member.is_some() {
            return Err(AppstoreServiceError::AlreadyExists(
                "User is already a member".to_string(),
            ));
        }

        let member_role = MemberRole::from_str(&request.member_role).ok_or_else(|| {
            AppstoreServiceError::ValidationFailed(format!(
                "Invalid member role: {}",
                request.member_role
            ))
        })?;

        let now = Utc::now();
        let member = PublisherMember {
            id: Uuid::new_v4().to_string(),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            publisher_id: publisher_id.clone(),
            user_id: request.user_id,
            member_role,
            member_status: MemberStatus::Invited,
            invited_by: Some(context.user_id.clone()),
            joined_at: None,
            created_at: now,
            updated_at: now,
        };

        self.repository.insert_member(context, &member).await?;

        Ok(InvitePublisherMemberResult::invited(
            "appstore.publishers.members.create",
            member,
        ))
    }

    async fn submit_verification(
        &self,
        context: &AppstoreRequestContext,
        request: SubmitPublisherVerificationRequest,
    ) -> AppstoreServiceResult<SubmitPublisherVerificationResult> {
        let publisher_id = PublisherId::new(&request.publisher_id);

        // Verify publisher exists and is active
        let publisher = self
            .repository
            .find_publisher_by_id(context, &publisher_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Publisher not found: {}",
                    request.publisher_id
                ))
            })?;

        if !publisher.is_active() {
            return Err(AppstoreServiceError::InvalidState(
                "Publisher is not active".to_string(),
            ));
        }

        // Verify ownership
        if publisher.owner_user_id != context.user_id {
            return Err(AppstoreServiceError::PermissionDenied(
                "Only the owner can submit verification".to_string(),
            ));
        }

        if !publisher.can_submit_verification() {
            return Err(AppstoreServiceError::InvalidState(
                "Publisher cannot submit verification in current state".to_string(),
            ));
        }

        let verification_type =
            VerificationType::from_str(&request.verification_type).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid verification type: {}",
                    request.verification_type
                ))
            })?;

        // Check if verification already exists
        let existing_verification = self
            .repository
            .find_verification(context, &publisher_id, &verification_type)
            .await?;

        if let Some(ref verification) = existing_verification {
            if verification.verification_status == VerificationStatus::Pending {
                return Err(AppstoreServiceError::Conflict(
                    "Verification already pending".to_string(),
                ));
            }
        }

        let now = Utc::now();
        let existing_id = existing_verification.as_ref().map(|v| v.id.clone());
        let existing_created_at = existing_verification.as_ref().map(|v| v.created_at);
        let is_update = existing_verification.is_some();

        let verification = PublisherVerification {
            id: existing_id.unwrap_or_else(|| Uuid::new_v4().to_string()),
            tenant_id: context.tenant_id.clone(),
            organization_id: context.organization_id.clone(),
            publisher_id: publisher_id.clone(),
            verification_type,
            verification_status: VerificationStatus::Pending,
            credential_snapshot: request
                .credential_snapshot
                .unwrap_or(serde_json::Value::Object(serde_json::Map::new())),
            evidence_media_resource_id: request.evidence_media_resource_id,
            reviewed_by: None,
            reviewed_at: None,
            expires_at: None,
            created_at: existing_created_at.unwrap_or(now),
            updated_at: now,
        };

        if is_update {
            self.repository
                .update_verification(context, &verification)
                .await?;
        } else {
            self.repository
                .insert_verification(context, &verification)
                .await?;
        }

        Ok(SubmitPublisherVerificationResult::submitted(
            "appstore.publishers.verifications.create",
            verification,
        ))
    }

    async fn admin_verify(
        &self,
        context: &AppstoreRequestContext,
        request: AdminVerifyPublisherRequest,
    ) -> AppstoreServiceResult<AdminVerifyPublisherResult> {
        if !sdkwork_appstore_authorization::scope_granted(
            &context.permission_scopes,
            "appstore.publishers.admin",
        ) {
            return Err(AppstoreServiceError::PermissionDenied(
                sdkwork_appstore_authorization::missing_scope_message("appstore.publishers.admin"),
            ));
        }

        let publisher_id = PublisherId::new(&request.publisher_id);

        // Verify publisher exists
        let mut publisher = self
            .repository
            .find_publisher_by_id(context, &publisher_id)
            .await?
            .ok_or_else(|| {
                AppstoreServiceError::NotFound(format!(
                    "Publisher not found: {}",
                    request.publisher_id
                ))
            })?;

        let verification_type =
            VerificationType::from_str(&request.verification_type).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "Invalid verification type: {}",
                    request.verification_type
                ))
            })?;

        let mut verification = self
            .repository
            .find_verification(context, &publisher_id, &verification_type)
            .await?
            .ok_or_else(|| AppstoreServiceError::NotFound("Verification not found".to_string()))?;

        if verification.verification_status != VerificationStatus::Pending {
            return Err(AppstoreServiceError::InvalidState(
                "Verification is not in pending state".to_string(),
            ));
        }

        let now = Utc::now();
        let decision = request.decision.to_lowercase();

        match decision.as_str() {
            "approve" => {
                verification.verification_status = VerificationStatus::Verified;
                verification.reviewed_by = Some(context.user_id.clone());
                verification.reviewed_at = Some(now);
                verification.updated_at = now;

                publisher.verification_status = VerificationStatus::Verified;
                publisher.verified_at = Some(now);
                publisher.version += 1;
                publisher.updated_at = now;

                self.repository
                    .update_verification(context, &verification)
                    .await?;
                if let Err(e) = self.repository.update_publisher(context, &publisher).await {
                    verification.verification_status = VerificationStatus::Pending;
                    verification.reviewed_by = None;
                    verification.reviewed_at = None;
                    self.repository
                        .update_verification(context, &verification)
                        .await
                        .ok();
                    return Err(e);
                }
            }
            "reject" => {
                verification.verification_status = VerificationStatus::Rejected;
                verification.reviewed_by = Some(context.user_id.clone());
                verification.reviewed_at = Some(now);
                verification.updated_at = now;

                self.repository
                    .update_verification(context, &verification)
                    .await?;
            }
            _ => {
                return Err(AppstoreServiceError::ValidationFailed(format!(
                    "Invalid decision: {}",
                    request.decision
                )));
            }
        }

        Ok(AdminVerifyPublisherResult::verified(
            "appstore.publishers.admin.verify",
            verification,
        ))
    }
}
