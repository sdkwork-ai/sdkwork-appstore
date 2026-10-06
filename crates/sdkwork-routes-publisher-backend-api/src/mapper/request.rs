use sdkwork_appstore_publisher_service::domain::commands::{
    AdminListPublishersRequest, AdminVerifyPublisherRequest,
};

pub fn map_admin_verify_publisher(
    publisher_id: String,
    verification_type: String,
    decision: String,
    reason: Option<String>,
) -> AdminVerifyPublisherRequest {
    let mut req = AdminVerifyPublisherRequest::new(publisher_id, verification_type, decision);
    if let Some(v) = reason {
        req = req.with_reason(v);
    }
    req
}

pub fn map_admin_list_publishers(
    cursor: Option<String>,
    page_size: Option<i32>,
) -> AdminListPublishersRequest {
    let mut req = AdminListPublishersRequest::new();
    if let Some(v) = cursor {
        req = req.with_cursor(v);
    }
    if let Some(v) = page_size {
        req = req.with_page_size(v);
    }
    req
}
