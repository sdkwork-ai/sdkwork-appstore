//! Service-level rules for the expert roster list: the category filter, the
//! `sortWeight` ordering and the keyset page window.
//!
//! These tests target the normalization the service hands to the repository,
//! so they pin the contract a route handler relies on without needing a
//! database or a full `CatalogRepositoryPort` double.

use chrono::{TimeZone, Utc};
use sdkwork_appstore_catalog_service::domain::commands::ExpertsListRequest;
use sdkwork_appstore_catalog_service::domain::models::ExpertCatalogEntry;
use sdkwork_appstore_catalog_service::error::AppstoreServiceError;
use sdkwork_appstore_catalog_service::ports::repository::ExpertSortOrder;
use sdkwork_appstore_catalog_service::service::expert_catalog::{
    expert_cursor, paginate_experts, ExpertListQuery, EXPERT_PAGE_SIZE_DEFAULT,
    EXPERT_PAGE_SIZE_MAX,
};

fn expert(id: &str, sort_weight: i32, category_code: Option<&str>) -> ExpertCatalogEntry {
    ExpertCatalogEntry {
        id: id.to_string(),
        tenant_id: "100001".to_string(),
        organization_id: "0".to_string(),
        expert_code: format!("exp-{id}"),
        expert_name: format!("Expert {id}"),
        description: None,
        category_code: category_code.map(ToOwned::to_owned),
        profile: serde_json::json!({ "rating": 4.9 }),
        expert_status: "published".to_string(),
        featured: false,
        sort_weight,
        published_at: Some(Utc.with_ymd_and_hms(2026, 1, 1, 0, 0, 0).unwrap()),
        created_at: Utc.with_ymd_and_hms(2026, 1, 1, 0, 0, 0).unwrap(),
        updated_at: Utc.with_ymd_and_hms(2026, 1, 1, 0, 0, 0).unwrap(),
    }
}

#[test]
fn list_query_defaults_to_editorial_order_and_first_page() {
    let request = ExpertsListRequest::new();
    let query = ExpertListQuery::from_request(&request).expect("defaults must resolve");

    assert_eq!(query.category_code, None);
    assert_eq!(query.order, ExpertSortOrder::SortWeightAsc);
    assert_eq!(query.cursor, None);
    assert_eq!(query.limit, EXPERT_PAGE_SIZE_DEFAULT);
}

#[test]
fn list_query_normalizes_the_category_filter() {
    let request = ExpertsListRequest::new().with_category_code("  工程开发  ");
    let query = ExpertListQuery::from_request(&request).expect("filter must resolve");
    assert_eq!(query.category_code.as_deref(), Some("工程开发"));

    let repository_query = query.as_repository_query();
    assert_eq!(repository_query.category_code, Some("工程开发"));
}

#[test]
fn blank_category_filter_means_no_filter() {
    for blank in ["", "   ", "\t"] {
        let request = ExpertsListRequest::new().with_category_code(blank);
        let query = ExpertListQuery::from_request(&request).expect("blank filter must resolve");
        assert_eq!(query.category_code, None, "category_code={blank:?}");
    }
}

#[test]
fn list_query_parses_both_sort_weight_directions() {
    let ascending = ExpertsListRequest::new().with_sort("sort_weight_asc");
    assert_eq!(
        ExpertListQuery::from_request(&ascending).unwrap().order,
        ExpertSortOrder::SortWeightAsc
    );

    let descending = ExpertsListRequest::new().with_sort("sort_weight_desc");
    assert_eq!(
        ExpertListQuery::from_request(&descending).unwrap().order,
        ExpertSortOrder::SortWeightDesc
    );

    // A blank sort control falls back to the curated order.
    let blank = ExpertsListRequest::new().with_sort("  ");
    assert_eq!(
        ExpertListQuery::from_request(&blank).unwrap().order,
        ExpertSortOrder::SortWeightAsc
    );
}

#[test]
fn unknown_sort_is_a_validation_failure() {
    let request = ExpertsListRequest::new().with_sort("sort_weight");
    let error = ExpertListQuery::from_request(&request).expect_err("unknown sort must fail");
    match error {
        AppstoreServiceError::ValidationFailed(message) => {
            assert!(message.contains("sort_weight_asc"), "{message}");
            assert!(message.contains("sort_weight_desc"), "{message}");
        }
        other => panic!("expected ValidationFailed, got {other:?}"),
    }
}

#[test]
fn list_query_clamps_the_page_size() {
    let too_small = ExpertsListRequest::new().with_page_size(0);
    assert_eq!(ExpertListQuery::from_request(&too_small).unwrap().limit, 1);

    let too_large = ExpertsListRequest::new().with_page_size(EXPERT_PAGE_SIZE_MAX + 1);
    assert_eq!(
        ExpertListQuery::from_request(&too_large).unwrap().limit,
        EXPERT_PAGE_SIZE_MAX
    );

    let explicit = ExpertsListRequest::new().with_page_size(40);
    assert_eq!(ExpertListQuery::from_request(&explicit).unwrap().limit, 40);
}

#[test]
fn repository_lookup_over_fetches_one_row_to_detect_the_next_page() {
    let request = ExpertsListRequest::new()
        .with_category_code("内容创作")
        .with_sort("sort_weight_desc")
        .with_cursor("7:531000000000000007")
        .with_page_size(30);
    let query = ExpertListQuery::from_request(&request).expect("explicit page must resolve");
    let repository_query = query.as_repository_query();

    assert_eq!(repository_query.limit, 31);
    assert_eq!(repository_query.order, ExpertSortOrder::SortWeightDesc);
    assert_eq!(repository_query.category_code, Some("内容创作"));
    assert_eq!(repository_query.cursor, Some("7:531000000000000007"));
}

#[test]
fn a_full_page_without_over_fetch_has_no_cursor() {
    let rows = vec![expert("1", 1, None), expert("2", 2, None)];
    let (page, next_cursor, has_more) = paginate_experts(rows, 2);

    assert_eq!(page.len(), 2);
    assert_eq!(next_cursor, None);
    assert!(!has_more);
}

#[test]
fn an_over_fetched_page_emits_the_last_visible_cursor() {
    let rows = vec![
        expert("531000000000000001", 1, None),
        expert("531000000000000002", 2, None),
        expert("531000000000000003", 3, None),
    ];
    let (page, next_cursor, has_more) = paginate_experts(rows, 2);

    assert_eq!(page.len(), 2);
    assert_eq!(next_cursor.as_deref(), Some("2:531000000000000002"));
    assert!(has_more);
    assert_eq!(
        expert_cursor(&page[1]),
        "2:531000000000000002",
        "the cursor must address the last visible row, not the over-fetched one"
    );
}

#[test]
fn an_empty_page_has_no_cursor() {
    let (page, next_cursor, has_more) = paginate_experts(Vec::new(), 20);
    assert!(page.is_empty());
    assert_eq!(next_cursor, None);
    assert!(!has_more);
}
