# App Store Service Interface Map

This document maps each route operation to its generated handler and service method. All operations listed below are implemented in the service layer and wired through the standalone gateway.

## sdkwork-appstore-catalog-service

| operationId | routeCrate | handler | serviceCrate | serviceMethod | Status |
| --- | --- | --- | --- | --- | --- |
| `appstore.catalog.home.retrieve` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_home_retrieve` | `sdkwork-appstore-catalog-service` | `catalog_home_retrieve` | Implemented |
| `appstore.catalog.categories.list` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_categories_list` | `sdkwork-appstore-catalog-service` | `catalog_categories_list` | Implemented |
| `appstore.catalog.categories.retrieve` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_categories_retrieve` | `sdkwork-appstore-catalog-service` | `catalog_categories_retrieve` | Implemented |
| `appstore.catalog.collections.list` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_collections_list` | `sdkwork-appstore-catalog-service` | `catalog_collections_list` | Implemented |
| `appstore.catalog.collections.retrieve` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_collections_retrieve` | `sdkwork-appstore-catalog-service` | `catalog_collections_retrieve` | Implemented |
| `appstore.catalog.featured.list` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_featured_list` | `sdkwork-appstore-catalog-service` | `catalog_featured_list` | Implemented |
| `appstore.catalog.charts.retrieve` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_charts_retrieve` | `sdkwork-appstore-catalog-service` | `catalog_charts_retrieve` | Implemented |
| `appstore.catalog.listings.list` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_listings_search` | `sdkwork-appstore-catalog-service` | `catalog_listings_search` | Implemented |
| `appstore.catalog.templates.list` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_templates_list` | `sdkwork-appstore-catalog-service` | `templates_list` | Implemented |
| `appstore.catalog.templates.create` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_template_create` | `sdkwork-appstore-catalog-service` | `template_create` | Implemented |
| `appstore.catalog.templates.retrieve` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_template_retrieve` | `sdkwork-appstore-catalog-service` | `template_retrieve` | Implemented |
| `appstore.catalog.templates.usage.create` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_template_usage_create` | `sdkwork-appstore-catalog-service` | `template_usage_create` | Implemented |
| `appstore.catalog.feedback.create` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_feedback_create` | `sdkwork-appstore-catalog-service` | `feedback_create` | Implemented |
| `appstore.catalog.collections.create` | `sdkwork-routes-appstore-catalog-backend-api` | `catalog_collections_create` | `sdkwork-appstore-catalog-service` | `catalog_collections_create` | Implemented |
| `appstore.catalog.collections.update` | `sdkwork-routes-appstore-catalog-backend-api` | `catalog_collections_update` | `sdkwork-appstore-catalog-service` | `catalog_collections_update` | Implemented |
| `appstore.catalog.collections.items.update` | `sdkwork-routes-appstore-catalog-backend-api` | `catalog_collections_items_upsert` | `sdkwork-appstore-catalog-service` | `catalog_collections_items_upsert` | Implemented |
| `appstore.catalog.featured.update` | `sdkwork-routes-appstore-catalog-backend-api` | `catalog_featured_upsert` | `sdkwork-appstore-catalog-service` | `catalog_featured_upsert` | Implemented |
| `appstore.catalog.admin.categories.list` | `sdkwork-routes-appstore-catalog-backend-api` | `catalog_admin_categories_list` | `sdkwork-appstore-catalog-service` | `admin_categories_list` | Implemented |
| `appstore.catalog.admin.collections.list` | `sdkwork-routes-appstore-catalog-backend-api` | `catalog_admin_collections_list` | `sdkwork-appstore-catalog-service` | `admin_collections_list` | Implemented |
| `appstore.catalog.admin.featured.list` | `sdkwork-routes-appstore-catalog-backend-api` | `catalog_admin_featured_list` | `sdkwork-appstore-catalog-service` | `admin_featured_list` | Implemented |
| `appstore.catalog.categories.create` | `sdkwork-routes-appstore-catalog-backend-api` | `catalog_categories_create` | `sdkwork-appstore-catalog-service` | `catalog_categories_create` | Implemented |
| `appstore.catalog.categories.update` | `sdkwork-routes-appstore-catalog-backend-api` | `catalog_categories_update` | `sdkwork-appstore-catalog-service` | `catalog_categories_update` | Implemented |
| `appstore.metrics.listings.retrieve` | `sdkwork-routes-metrics-backend-api` | `metrics_listings_retrieve` | `sdkwork-appstore-catalog-service` | `metrics_listings_retrieve` | Implemented |
| `appstore.catalog.public.featured.list` | `sdkwork-routes-appstore-catalog-open-api` | `catalog_public_featured_list` | `sdkwork-appstore-catalog-service` | `catalog_public_featured_list` | Implemented |
| `appstore.catalog.recommendations.list` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_recommendations_list` | `sdkwork-appstore-catalog-service` | `catalog_recommendations_list` | Implemented |
| `appstore.catalog.recentlyUpdated.list` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_recently_updated_list` | `sdkwork-appstore-catalog-service` | `catalog_recently_updated_list` | Implemented |
| `appstore.catalog.events.list` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_events_list` | `sdkwork-appstore-catalog-service` | `catalog_events_list` | Implemented |
| `appstore.catalog.events.retrieve` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_events_retrieve` | `sdkwork-appstore-catalog-service` | `catalog_events_retrieve` | Implemented |
| `appstore.catalog.search.suggestions.list` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_search_suggestions_list` | `sdkwork-appstore-catalog-service` | `catalog_search_suggestions_list` | Implemented |
| `appstore.catalog.search.trending.list` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_search_trending_list` | `sdkwork-appstore-catalog-service` | `catalog_search_trending_list` | Implemented |
| `appstore.catalog.search.history.list` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_search_history_list` | `sdkwork-appstore-catalog-service` | `catalog_search_history_list` | Implemented |
| `appstore.catalog.search.history.update` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_search_history_upsert` | `sdkwork-appstore-catalog-service` | `catalog_search_history_upsert` | Implemented |
| `appstore.catalog.search.history.delete` | `sdkwork-routes-appstore-catalog-app-api` | `catalog_search_history_clear` | `sdkwork-appstore-catalog-service` | `catalog_search_history_clear` | Implemented |
| `appstore.analytics.publisher.overview.retrieve` | `sdkwork-routes-metrics-backend-api` | `analytics_publisher_overview_retrieve` | `sdkwork-appstore-catalog-service` | `analytics_publisher_overview_retrieve` | Implemented |
| `appstore.analytics.publisher.listings.list` | `sdkwork-routes-metrics-backend-api` | `analytics_publisher_listings_list` | `sdkwork-appstore-catalog-service` | `analytics_publisher_listings_list` | Implemented |
| `appstore.analytics.publisher.listings.retrieve` | `sdkwork-routes-metrics-backend-api` | `analytics_publisher_listings_retrieve` | `sdkwork-appstore-catalog-service` | `analytics_publisher_listings_retrieve` | Implemented |
| `appstore.analytics.operator.dashboard.retrieve` | `sdkwork-routes-metrics-backend-api` | `analytics_operator_dashboard_retrieve` | `sdkwork-appstore-catalog-service` | `analytics_operator_dashboard_retrieve` | Implemented |
| `appstore.analytics.operator.search.retrieve` | `sdkwork-routes-metrics-backend-api` | `analytics_operator_search_retrieve` | `sdkwork-appstore-catalog-service` | `analytics_operator_search_retrieve` | Implemented |

## sdkwork-appstore-compliance-service

| operationId | routeCrate | handler | serviceCrate | serviceMethod | Status |
| --- | --- | --- | --- | --- | --- |
| `appstore.compliance.profile.retrieve` | `sdkwork-routes-compliance-app-api` | `compliance_profile_retrieve` | `sdkwork-appstore-compliance-service` | `compliance_profile_retrieve` | Implemented |
| `appstore.compliance.profile.update` | `sdkwork-routes-compliance-app-api` | `compliance_profile_update` | `sdkwork-appstore-compliance-service` | `compliance_profile_update` | Implemented |
| `appstore.compliance.permissions.update` | `sdkwork-routes-compliance-app-api` | `compliance_permissions_update` | `sdkwork-appstore-compliance-service` | `compliance_permissions_update` | Implemented |
| `appstore.compliance.iapItems.list` | `sdkwork-routes-compliance-app-api` | `compliance_iap_items_list` | `sdkwork-appstore-compliance-service` | `compliance_iap_items_list` | Implemented |

## sdkwork-appstore-library-service

| operationId | routeCrate | handler | serviceCrate | serviceMethod | Status |
| --- | --- | --- | --- | --- | --- |
| `appstore.library.items.list` | `sdkwork-routes-library-app-api` | `library_items_list` | `sdkwork-appstore-library-service` | `library_items_list` | Implemented |
| `appstore.library.items.retrieve` | `sdkwork-routes-library-app-api` | `library_items_retrieve` | `sdkwork-appstore-library-service` | `library_items_retrieve` | Implemented |
| `appstore.library.install` | `sdkwork-routes-library-app-api` | `library_install` | `sdkwork-appstore-library-service` | `library_install` | Implemented |
| `appstore.library.uninstall` | `sdkwork-routes-library-app-api` | `library_uninstall` | `sdkwork-appstore-library-service` | `library_uninstall` | Implemented |
| `appstore.library.updates.check` | `sdkwork-routes-library-app-api` | `library_updates_check` | `sdkwork-appstore-library-service` | `library_updates_check` | Implemented |
| `appstore.wishlist.items.list` | `sdkwork-routes-library-app-api` | `wishlist_items_list` | `sdkwork-appstore-library-service` | `wishlist_items_list` | Implemented |
| `appstore.wishlist.items.create` | `sdkwork-routes-library-app-api` | `wishlist_items_add` | `sdkwork-appstore-library-service` | `wishlist_items_add` | Implemented |
| `appstore.wishlist.items.delete` | `sdkwork-routes-library-app-api` | `wishlist_items_remove` | `sdkwork-appstore-library-service` | `wishlist_items_remove` | Implemented |
| `appstore.downloadGrants.create` | `sdkwork-routes-library-app-api` | `download_grants_create` | `sdkwork-appstore-library-service` | `download_grants_create` | Implemented |
| `appstore.downloadGrants.consume` | `sdkwork-routes-library-app-api` | `download_grants_consume` | `sdkwork-appstore-library-service` | `download_grants_consume` | Implemented |

## sdkwork-appstore-user-store-service

| operationId | routeCrate | handler | serviceCrate | serviceMethod | Status |
| --- | --- | --- | --- | --- | --- |
| `appstore.userStore.category.list` | `sdkwork-routes-user-store-app-api` | `user_store_categories_list` | `sdkwork-appstore-user-store-service` | `categories_list` | Implemented |
| `appstore.userStore.category.create` | `sdkwork-routes-user-store-app-api` | `user_store_category_create` | `sdkwork-appstore-user-store-service` | `category_create` | Implemented |
| `appstore.userStore.category.retrieve` | `sdkwork-routes-user-store-app-api` | `user_store_category_retrieve` | `sdkwork-appstore-user-store-service` | `category_retrieve` | Implemented |
| `appstore.userStore.category.update` | `sdkwork-routes-user-store-app-api` | `user_store_category_update` | `sdkwork-appstore-user-store-service` | `category_update` | Implemented |
| `appstore.userStore.category.delete` | `sdkwork-routes-user-store-app-api` | `user_store_category_delete` | `sdkwork-appstore-user-store-service` | `category_delete` | Implemented |
| `appstore.userStore.item.list` | `sdkwork-routes-user-store-app-api` | `user_store_items_list` | `sdkwork-appstore-user-store-service` | `items_list` | Implemented |
| `appstore.userStore.item.create` | `sdkwork-routes-user-store-app-api` | `user_store_item_create` | `sdkwork-appstore-user-store-service` | `item_create` | Implemented |
| `appstore.userStore.item.update` | `sdkwork-routes-user-store-app-api` | `user_store_items_update` | `sdkwork-appstore-user-store-service` | `items_update` | Implemented |
| `appstore.userStore.item.delete` | `sdkwork-routes-user-store-app-api` | `user_store_item_delete` | `sdkwork-appstore-user-store-service` | `item_delete` | Implemented |
| `appstore.userStore.share.list` | `sdkwork-routes-user-store-app-api` | `user_store_shares_list` | `sdkwork-appstore-user-store-service` | `shares_list` | Implemented |
| `appstore.userStore.share.create` | `sdkwork-routes-user-store-app-api` | `user_store_share_create` | `sdkwork-appstore-user-store-service` | `share_create` | Implemented |
| `appstore.userStore.share.update` | `sdkwork-routes-user-store-app-api` | `user_store_share_update` | `sdkwork-appstore-user-store-service` | `share_update` | Implemented |
| `appstore.userStore.share.delete` | `sdkwork-routes-user-store-app-api` | `user_store_share_delete` | `sdkwork-appstore-user-store-service` | `share_delete` | Implemented |
| `appstore.userStore.share.refresh` | `sdkwork-routes-user-store-app-api` | `user_store_share_refresh` | `sdkwork-appstore-user-store-service` | `share_refresh` | Implemented |
| `appstore.userStores.public.retrieve` | `sdkwork-routes-user-store-open-api` | `user_stores_public_retrieve` | `sdkwork-appstore-user-store-service` | `public_user_store_view` | Implemented |
| `appstore.userStores.public.items.list` | `sdkwork-routes-user-store-open-api` | `user_stores_public_items_list` | `sdkwork-appstore-user-store-service` | `public_category_items` | Implemented |

## sdkwork-appstore-listing-service

| operationId | routeCrate | handler | serviceCrate | serviceMethod | Status |
| --- | --- | --- | --- | --- | --- |
| `appstore.listings.retrieve` | `sdkwork-routes-listing-app-api` | `listings_retrieve` | `sdkwork-appstore-listing-service` | `listings_retrieve` | Implemented |
| `appstore.listings.media.list` | `sdkwork-routes-listing-app-api` | `listings_media_list` | `sdkwork-appstore-listing-service` | `listings_media_list` | Implemented |
| `appstore.listings.releases.list` | `sdkwork-routes-listing-app-api` | `listings_releases_list` | `sdkwork-appstore-listing-service` | `listings_releases_list` | Implemented |
| `appstore.listings.create` | `sdkwork-routes-listing-app-api` | `listings_create` | `sdkwork-appstore-listing-service` | `listings_create` | Implemented |
| `appstore.listings.update` | `sdkwork-routes-listing-app-api` | `listings_update` | `sdkwork-appstore-listing-service` | `listings_update` | Implemented |
| `appstore.listings.localization.update` | `sdkwork-routes-listing-app-api` | `listings_localization_upsert` | `sdkwork-appstore-listing-service` | `listings_localization_upsert` | Implemented |
| `appstore.listings.media.create` | `sdkwork-routes-listing-app-api` | `listings_media_attach` | `sdkwork-appstore-listing-service` | `listings_media_attach` | Implemented |
| `appstore.listings.media.delete` | `sdkwork-routes-listing-app-api` | `listings_media_remove` | `sdkwork-appstore-listing-service` | `listings_media_remove` | Implemented |
| `appstore.listings.ratings.list` | `sdkwork-routes-listing-app-api` | `listings_ratings_list` | `sdkwork-appstore-listing-service` | `ratings_list` | Implemented |
| `appstore.listings.ratings.update` | `sdkwork-routes-listing-app-api` | `listings_rating_update` | `sdkwork-appstore-listing-service` | `rating_update` | Implemented |
| `appstore.listings.categories.update` | `sdkwork-routes-listing-app-api` | `listings_categories_bind` | `sdkwork-appstore-listing-service` | `listings_categories_bind` | Implemented |
| `appstore.listings.regions.update` | `sdkwork-routes-listing-app-api` | `listings_regions_update` | `sdkwork-appstore-listing-service` | `listings_regions_update` | Implemented |
| `appstore.listings.submissions.create` | `sdkwork-routes-listing-app-api` | `listings_submissions_create` | `sdkwork-appstore-listing-service` | `listings_submissions_create` | Implemented |
| `appstore.listings.admin.list` | `sdkwork-routes-listing-backend-api` | `listings_admin_list` | `sdkwork-appstore-listing-service` | `listings_admin_list` | Implemented |
| `appstore.listings.admin.retrieve` | `sdkwork-routes-listing-backend-api` | `listings_admin_retrieve` | `sdkwork-appstore-listing-service` | `listings_admin_retrieve` | Implemented |
| `appstore.listings.admin.visibility.update` | `sdkwork-routes-listing-backend-api` | `listings_admin_visibility_update` | `sdkwork-appstore-listing-service` | `listings_admin_visibility_update` | Implemented |
| `appstore.listings.public.retrieve` | `sdkwork-routes-listing-open-api` | `listings_public_retrieve` | `sdkwork-appstore-listing-service` | `listings_public_retrieve` | Implemented |
| `appstore.listings.releases.history.list` | `sdkwork-routes-listing-app-api` | `listings_releases_history_list` | `sdkwork-appstore-listing-service` | `listings_releases_history_list` | Implemented |
| `appstore.listings.similar.list` | `sdkwork-routes-listing-app-api` | `listings_similar_list` | `sdkwork-appstore-listing-service` | `listings_similar_list` | Implemented |
| `appstore.listings.developerOther.list` | `sdkwork-routes-listing-app-api` | `listings_developer_other_list` | `sdkwork-appstore-listing-service` | `listings_developer_other_list` | Implemented |
| `appstore.listings.editorial.retrieve` | `sdkwork-routes-listing-app-api` | `listings_editorial_retrieve` | `sdkwork-appstore-listing-service` | `listings_editorial_retrieve` | Implemented |

## sdkwork-appstore-market-service

| operationId | routeCrate | handler | serviceCrate | serviceMethod | Status |
| --- | --- | --- | --- | --- | --- |
| `appstore.marketChannels.list` | `sdkwork-routes-market-backend-api` | `market_channels_list` | `sdkwork-appstore-market-service` | `market_channels_list` | Implemented |
| `appstore.marketChannels.create` | `sdkwork-routes-market-backend-api` | `market_channels_create` | `sdkwork-appstore-market-service` | `market_channels_create` | Implemented |
| `appstore.marketChannels.update` | `sdkwork-routes-market-backend-api` | `market_channels_update` | `sdkwork-appstore-market-service` | `market_channels_update` | Implemented |
| `appstore.marketReleases.list` | `sdkwork-routes-market-backend-api` | `market_releases_list` | `sdkwork-appstore-market-service` | `market_releases_list` | Implemented |
| `appstore.marketReleases.sync` | `sdkwork-routes-market-backend-api` | `market_releases_sync` | `sdkwork-appstore-market-service` | `market_releases_sync` | Implemented |

## sdkwork-appstore-moderation-service

| operationId | routeCrate | handler | serviceCrate | serviceMethod | Status |
| --- | --- | --- | --- | --- | --- |
| `appstore.moderation.queue.list` | `sdkwork-routes-moderation-backend-api` | `moderation_queue_list` | `sdkwork-appstore-moderation-service` | `moderation_queue_list` | Implemented |
| `appstore.moderation.reviews.retrieve` | `sdkwork-routes-moderation-backend-api` | `moderation_reviews_retrieve` | `sdkwork-appstore-moderation-service` | `moderation_reviews_retrieve` | Implemented |
| `appstore.moderation.reviews.assign` | `sdkwork-routes-moderation-backend-api` | `moderation_reviews_assign` | `sdkwork-appstore-moderation-service` | `moderation_reviews_assign` | Implemented |
| `appstore.moderation.decisions.create` | `sdkwork-routes-moderation-backend-api` | `moderation_decisions_create` | `sdkwork-appstore-moderation-service` | `moderation_decisions_create` | Implemented |
| `appstore.moderation.appeals.create` | `sdkwork-routes-moderation-backend-api` | `moderation_appeals_create` | `sdkwork-appstore-moderation-service` | `moderation_appeals_create` | Implemented |
| `appstore.moderation.appeals.list` | `sdkwork-routes-moderation-backend-api` | `moderation_appeals_list` | `sdkwork-appstore-moderation-service` | `moderation_appeals_list` | Implemented |
| `appstore.moderation.appeals.retrieve` | `sdkwork-routes-moderation-backend-api` | `moderation_appeals_retrieve` | `sdkwork-appstore-moderation-service` | `moderation_appeals_retrieve` | Implemented |
| `appstore.moderation.appeals.decide` | `sdkwork-routes-moderation-backend-api` | `moderation_appeals_decide` | `sdkwork-appstore-moderation-service` | `moderation_appeals_decide` | Implemented |

## sdkwork-appstore-publisher-service

| operationId | routeCrate | handler | serviceCrate | serviceMethod | Status |
| --- | --- | --- | --- | --- | --- |
| `appstore.publishers.me.retrieve` | `sdkwork-routes-publisher-app-api` | `publishers_me_retrieve` | `sdkwork-appstore-publisher-service` | `publishers_me_retrieve` | Implemented |
| `appstore.publishers.me.listings.list` | `sdkwork-routes-listing-app-api` | `listings_publisher_list` | `sdkwork-appstore-listing-service` | `list_publisher_listings` | Implemented |
| `appstore.publishers.me.apps.create` | `sdkwork-routes-listing-app-api` | `publishers_me_apps_bootstrap` | `sdkwork-appstore-listing-service` | `bootstrap_publisher_app` | Implemented |
| `appstore.publishers.create` | `sdkwork-routes-publisher-app-api` | `publishers_create` | `sdkwork-appstore-publisher-service` | `publishers_create` | Implemented |
| `appstore.publishers.update` | `sdkwork-routes-publisher-app-api` | `publishers_update` | `sdkwork-appstore-publisher-service` | `publishers_update` | Implemented |
| `appstore.publishers.members.list` | `sdkwork-routes-publisher-app-api` | `publishers_members_list` | `sdkwork-appstore-publisher-service` | `publishers_members_list` | Implemented |
| `appstore.publishers.members.create` | `sdkwork-routes-publisher-app-api` | `publishers_members_invite` | `sdkwork-appstore-publisher-service` | `publishers_members_invite` | Implemented |
| `appstore.publishers.verifications.create` | `sdkwork-routes-publisher-app-api` | `publishers_verifications_submit` | `sdkwork-appstore-publisher-service` | `publishers_verifications_submit` | Implemented |
| `appstore.publishers.admin.list` | `sdkwork-routes-publisher-backend-api` | `publishers_admin_list` | `sdkwork-appstore-publisher-service` | `admin_list_publishers` | Implemented |
| `appstore.publishers.admin.verify` | `sdkwork-routes-publisher-backend-api` | `publishers_admin_verify` | `sdkwork-appstore-publisher-service` | `publishers_admin_verify` | Implemented |

## sdkwork-appstore-release-service

| operationId | routeCrate | handler | serviceCrate | serviceMethod | Status |
| --- | --- | --- | --- | --- | --- |
| `appstore.releases.create` | `sdkwork-routes-release-app-api` | `releases_create` | `sdkwork-appstore-release-service` | `releases_create` | Implemented |
| `appstore.releases.retrieve` | `sdkwork-routes-release-app-api` | `releases_retrieve` | `sdkwork-appstore-release-service` | `releases_retrieve` | Implemented |
| `appstore.releases.update` | `sdkwork-routes-release-app-api` | `releases_update` | `sdkwork-appstore-release-service` | `releases_update` | Implemented |
| `appstore.releases.notes.update` | `sdkwork-routes-release-app-api` | `releases_notes_upsert` | `sdkwork-appstore-release-service` | `releases_notes_upsert` | Implemented |
| `appstore.releases.artifacts.create` | `sdkwork-routes-release-app-api` | `releases_artifacts_attach` | `sdkwork-appstore-release-service` | `releases_artifacts_attach` | Implemented |
| `appstore.releases.rollout.update` | `sdkwork-routes-release-app-api` | `releases_rollout_update` | `sdkwork-appstore-release-service` | `releases_rollout_update` | Implemented |
| `appstore.releases.retire` | `sdkwork-routes-release-app-api` | `releases_retire` | `sdkwork-appstore-release-service` | `releases_retire` | Implemented |
| `appstore.releases.checkUpdate` | `sdkwork-routes-release-open-api` | `releases_check_update` | `sdkwork-appstore-release-service` | `releases_check_update` | Implemented |
| `appstore.artifacts.resolveDownload` | `sdkwork-routes-release-open-api` | `artifacts_resolve_download` | `sdkwork-appstore-release-service` | `artifacts_resolve_download` | Implemented |
| `appstore.releases.public.retrieve` | `sdkwork-routes-release-open-api` | `releases_public_retrieve` | `sdkwork-appstore-release-service` | `releases_public_retrieve` | Implemented |
| `appstore.publish.automation.submissions.create` | `sdkwork-routes-automation-open-api` | `publish_automation_submissions_create` | `sdkwork-appstore-release-service` | `publish_automation_submissions_create` | Implemented |

