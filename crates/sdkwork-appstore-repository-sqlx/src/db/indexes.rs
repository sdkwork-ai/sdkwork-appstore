pub const APPSTORE_INDEXES: &[(&str, &str, &[&str])] = &[
    (
        "idx_appstore_listing_catalog",
        "appstore_listing",
        &[
            "tenant_id",
            "listing_status",
            "storefront_visibility",
            "published_at",
        ],
    ),
    (
        "idx_appstore_app_status",
        "appstore_app",
        &[
            "tenant_id",
            "organization_id",
            "distribution_status",
            "review_status",
            "updated_at",
        ],
    ),
    (
        "idx_appstore_listing_publisher",
        "appstore_listing",
        &["tenant_id", "publisher_id", "listing_status", "updated_at"],
    ),
    (
        "idx_appstore_release_update_check",
        "appstore_release",
        &["tenant_id", "listing_id", "release_status", "published_at"],
    ),
    (
        "idx_appstore_release_artifact_lookup",
        "appstore_release_artifact",
        &[
            "tenant_id",
            "release_id",
            "platform",
            "architecture",
            "artifact_status",
        ],
    ),
    (
        "idx_appstore_market_release_status",
        "appstore_market_release",
        &["tenant_id", "channel_id", "market_status", "updated_at"],
    ),
    (
        "idx_appstore_user_library",
        "appstore_user_library_item",
        &["tenant_id", "user_id", "library_status", "updated_at"],
    ),
    (
        "idx_appstore_entitlement_subject",
        "appstore_entitlement",
        &[
            "tenant_id",
            "subject_type",
            "subject_id",
            "entitlement_status",
            "expires_at",
        ],
    ),
    (
        "idx_appstore_moderation_queue",
        "appstore_moderation_review",
        &["tenant_id", "review_status", "priority", "created_at"],
    ),
    (
        "idx_appstore_download_grant_active",
        "appstore_download_grant",
        &["tenant_id", "artifact_id", "grant_status", "expires_at"],
    ),
    (
        "idx_appstore_install_event_listing",
        "appstore_install_event",
        &["tenant_id", "listing_id", "occurred_at"],
    ),
    (
        "idx_appstore_user_category_owner",
        "appstore_user_category",
        &[
            "tenant_id",
            "owner_user_id",
            "category_status",
            "sort_order",
        ],
    ),
    (
        "idx_appstore_user_category_item_category",
        "appstore_user_category_item",
        &["tenant_id", "user_category_id", "sort_order"],
    ),
    (
        "idx_appstore_user_category_item_listing",
        "appstore_user_category_item",
        &["tenant_id", "listing_id"],
    ),
];
