use crate::mapper;
use sdkwork_appstore_publisher_service::context::AppstoreRequestContext;
use sdkwork_appstore_publisher_service::domain::results::{
    AdminListPublishersResult, AdminVerifyPublisherResult,
};
use sdkwork_appstore_publisher_service::error::AppstoreServiceError;
use sdkwork_appstore_publisher_service::PublisherOperations;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RouteHandlerPlan {
    pub operation_id: &'static str,
    pub handler_name: &'static str,
    pub service_method: &'static str,
}

pub const ROUTE_HANDLER_PLANS: &[RouteHandlerPlan] = &[
    RouteHandlerPlan {
        operation_id: "appstore.publishers.admin.list",
        handler_name: "publishers_admin_list",
        service_method: "admin_list_publishers",
    },
    RouteHandlerPlan {
        operation_id: "appstore.publishers.admin.verify",
        handler_name: "publishers_admin_verify",
        service_method: "admin_verify_publisher",
    },
];

pub fn route_handler_plans() -> &'static [RouteHandlerPlan] {
    ROUTE_HANDLER_PLANS
}

pub async fn publishers_admin_verify<S: PublisherOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    publisher_id: String,
    verification_type: String,
    decision: String,
    reason: Option<String>,
) -> Result<AdminVerifyPublisherResult, AppstoreServiceError> {
    let cmd = mapper::request::map_admin_verify_publisher(
        publisher_id,
        verification_type,
        decision,
        reason,
    );
    service.admin_verify(context, cmd).await
}

pub async fn publishers_admin_list<S: PublisherOperations>(
    service: &S,
    context: &AppstoreRequestContext,
    cursor: Option<String>,
    page_size: Option<i32>,
) -> Result<AdminListPublishersResult, AppstoreServiceError> {
    let cmd = mapper::request::map_admin_list_publishers(cursor, page_size);
    service.admin_list_publishers(context, cmd).await
}
