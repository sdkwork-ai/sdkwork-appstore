# SDKWork App Store API Operation Catalog

Canonical operationId registry. Every HTTP operation in authored OpenAPI must appear here.

Prefix lock:

- App API: `/app/v3/api`
- Backend API: `/backend/v3/api`
- Open API: `/store/v3/api`

## App API �?Catalog

| operationId | Method | Path | Permission |
| --- | --- | --- | --- |
| `appstore.catalog.home.retrieve` | GET | `/app/v3/api/appstore/catalog/home` | — (tier 0 public) |
| `appstore.catalog.categories.list` | GET | `/app/v3/api/appstore/catalog/categories` | — (tier 0 public) |
| `appstore.catalog.categories.retrieve` | GET | `/app/v3/api/appstore/catalog/categories/{categoryId}` | — (tier 0 public) |
| `appstore.catalog.collections.list` | GET | `/app/v3/api/appstore/catalog/collections` | — (tier 0 public) |
| `appstore.catalog.collections.retrieve` | GET | `/app/v3/api/appstore/catalog/collections/{collectionId}` | — (tier 0 public) |
| `appstore.catalog.featured.list` | GET | `/app/v3/api/appstore/catalog/featured` | — (tier 0 public) |
| `appstore.catalog.charts.retrieve` | GET | `/app/v3/api/appstore/catalog/charts/{chartCode}` | — (tier 0 public) |
| `appstore.catalog.listings.list` | GET | `/app/v3/api/appstore/catalog/listings/search` | — (tier 0 public) |
| `appstore.catalog.templates.list` | GET | `/app/v3/api/appstore/catalog/templates` | — (tier 0 public) |
| `appstore.catalog.templates.create` | POST | `/app/v3/api/appstore/catalog/templates` | `appstore.catalog.write` |
| `appstore.catalog.templates.retrieve` | GET | `/app/v3/api/appstore/catalog/templates/{templateId}` | — (tier 0 public) |
| `appstore.catalog.templates.usage.create` | POST | `/app/v3/api/appstore/catalog/templates/{templateId}/usage` | `appstore.catalog.write` |
| `appstore.catalog.feedback.create` | POST | `/app/v3/api/appstore/catalog/feedback` | `appstore.catalog.write` |
| `appstore.listings.ratings.list` | GET | `/app/v3/api/listings/{listingId}/ratings` | `appstore.listings.read` |
| `appstore.listings.ratings.update` | PUT | `/app/v3/api/listings/{listingId}/ratings/me` | `appstore.listings.write` |
| `appstore.catalog.recommendations.list` | GET | `/app/v3/api/appstore/catalog/recommendations` | — (tier 0 public) |
| `appstore.catalog.recentlyUpdated.list` | GET | `/app/v3/api/appstore/catalog/recently_updated` | — (tier 0 public) |
| `appstore.catalog.events.list` | GET | `/app/v3/api/appstore/catalog/events` | — (tier 0 public) |
| `appstore.catalog.events.retrieve` | GET | `/app/v3/api/appstore/catalog/events/{eventId}` | — (tier 0 public) |
| `appstore.catalog.search.suggestions.list` | GET | `/app/v3/api/appstore/catalog/search/suggestions` | — (tier 0 public) |
| `appstore.catalog.search.trending.list` | GET | `/app/v3/api/appstore/catalog/search/trending` | — (tier 0 public) |
| `appstore.catalog.search.history.list` | GET | `/app/v3/api/appstore/catalog/search/history` | — (tier 2 ownership) |
| `appstore.catalog.search.history.update` | PUT | `/app/v3/api/appstore/catalog/search/history` | — (tier 2 ownership) |
| `appstore.catalog.search.history.delete` | DELETE | `/app/v3/api/appstore/catalog/search/history` | — (tier 2 ownership) |

## App API �?Listings

| operationId | Method | Path | Permission |
| --- | --- | --- | --- |
| `appstore.listings.retrieve` | GET | `/app/v3/api/listings/{listingId}` | `appstore.listings.read` |
| `appstore.listings.media.list` | GET | `/app/v3/api/listings/{listingId}/media` | `appstore.listings.read` |
| `appstore.listings.releases.list` | GET | `/app/v3/api/listings/{listingId}/releases` | `appstore.listings.read` |
| `appstore.listings.create` | POST | `/app/v3/api/listings` | `appstore.listings.write` |
| `appstore.listings.update` | PATCH | `/app/v3/api/listings/{listingId}` | `appstore.listings.write` |
| `appstore.listings.localization.update` | PUT | `/app/v3/api/listings/{listingId}/localizations/{locale}` | `appstore.listings.write` |
| `appstore.listings.media.create` | POST | `/app/v3/api/listings/{listingId}/media` | `appstore.listings.write` |
| `appstore.listings.media.delete` | DELETE | `/app/v3/api/listings/{listingId}/media/{mediaId}` | `appstore.listings.write` |
| `appstore.listings.categories.update` | PUT | `/app/v3/api/listings/{listingId}/categories` | `appstore.listings.write` |
| `appstore.listings.regions.update` | PUT | `/app/v3/api/listings/{listingId}/regions` | `appstore.listings.write` |
| `appstore.listings.submissions.create` | POST | `/app/v3/api/listings/{listingId}/submissions` | `appstore.listings.submit` |
| `appstore.listings.releases.history.list` | GET | `/app/v3/api/listings/{listingId}/releases/history` | `appstore.listings.read` |
| `appstore.listings.similar.list` | GET | `/app/v3/api/listings/{listingId}/similar` | `appstore.listings.read` |
| `appstore.listings.developerOther.list` | GET | `/app/v3/api/listings/{listingId}/developer_other` | `appstore.listings.read` |
| `appstore.listings.editorial.retrieve` | GET | `/app/v3/api/listings/{listingId}/editorial` | `appstore.listings.read` |

## App API �?Publishers

| operationId | Method | Path | Permission |
| --- | --- | --- | --- |
| `appstore.publishers.me.retrieve` | GET | `/app/v3/api/publishers/me` | `appstore.publishers.read` |
| `appstore.publishers.me.listings.list` | GET | `/app/v3/api/publishers/me/listings` | `appstore.publishers.read` |
| `appstore.publishers.me.apps.create` | POST | `/app/v3/api/publishers/me/apps` | `appstore.publishers.write` |
| `appstore.publishers.create` | POST | `/app/v3/api/publishers` | `appstore.publishers.write` |
| `appstore.publishers.update` | PATCH | `/app/v3/api/publishers/{publisherId}` | `appstore.publishers.write` |
| `appstore.publishers.members.list` | GET | `/app/v3/api/publishers/{publisherId}/members` | `appstore.publishers.read` |
| `appstore.publishers.members.create` | POST | `/app/v3/api/publishers/{publisherId}/members` | `appstore.publishers.admin` |
| `appstore.publishers.verifications.create` | POST | `/app/v3/api/publishers/{publisherId}/verifications` | `appstore.publishers.verify` |

## App API �?Releases

| operationId | Method | Path | Permission |
| --- | --- | --- | --- |
| `appstore.releases.create` | POST | `/app/v3/api/listings/{listingId}/releases` | `appstore.releases.write` |
| `appstore.releases.retrieve` | GET | `/app/v3/api/releases/{releaseId}` | `appstore.releases.read` |
| `appstore.releases.update` | PATCH | `/app/v3/api/releases/{releaseId}` | `appstore.releases.write` |
| `appstore.releases.notes.update` | PUT | `/app/v3/api/releases/{releaseId}/notes/{locale}` | `appstore.releases.write` |
| `appstore.releases.artifacts.create` | POST | `/app/v3/api/releases/{releaseId}/artifacts` | `appstore.releases.write` |
| `appstore.releases.rollout.update` | PUT | `/app/v3/api/releases/{releaseId}/rollout` | `appstore.releases.rollout` |
| `appstore.releases.retire` | POST | `/app/v3/api/releases/{releaseId}/retire` | `appstore.releases.write` |

## App API �?Compliance

| operationId | Method | Path | Permission |
| --- | --- | --- | --- |
| `appstore.compliance.profile.retrieve` | GET | `/app/v3/api/listings/{listingId}/compliance` | `appstore.compliance.read` |
| `appstore.compliance.profile.update` | PUT | `/app/v3/api/listings/{listingId}/compliance` | `appstore.compliance.write` |
| `appstore.compliance.permissions.update` | PUT | `/app/v3/api/listings/{listingId}/compliance/permissions` | `appstore.compliance.write` |
| `appstore.compliance.iapItems.list` | GET | `/app/v3/api/listings/{listingId}/compliance/iap_items` | `appstore.compliance.read` |

## App API �?Library

| operationId | Method | Path | Permission |
| --- | --- | --- | --- |
| `appstore.library.items.list` | GET | `/app/v3/api/library/items` | `appstore.library.read` |
| `appstore.library.items.retrieve` | GET | `/app/v3/api/library/items/{libraryItemId}` | `appstore.library.read` |
| `appstore.library.install` | POST | `/app/v3/api/library/install` | `appstore.library.write` |
| `appstore.library.uninstall` | POST | `/app/v3/api/library/uninstall` | `appstore.library.write` |
| `appstore.library.updates.check` | POST | `/app/v3/api/library/updates/check` | `appstore.library.read` |
| `appstore.wishlist.items.list` | GET | `/app/v3/api/wishlist/items` | `appstore.wishlist.read` |
| `appstore.wishlist.items.create` | POST | `/app/v3/api/wishlist/items` | `appstore.wishlist.write` |
| `appstore.wishlist.items.delete` | DELETE | `/app/v3/api/wishlist/items/{listingId}` | `appstore.wishlist.write` |
| `appstore.downloadGrants.create` | POST | `/app/v3/api/download_grants` | `appstore.downloads.request` |
| `appstore.downloadGrants.consume` | POST | `/app/v3/api/download_grants/{grantId}/consume` | `appstore.downloads.consume` |

## Backend API �?Moderation

| operationId | Method | Path | Permission |
| --- | --- | --- | --- |
| `appstore.moderation.queue.list` | GET | `/backend/v3/api/moderation/queue` | `appstore.moderation.read` |
| `appstore.moderation.reviews.retrieve` | GET | `/backend/v3/api/moderation/reviews/{reviewId}` | `appstore.moderation.read` |
| `appstore.moderation.reviews.assign` | POST | `/backend/v3/api/moderation/reviews/{reviewId}/assign` | `appstore.moderation.assign` |
| `appstore.moderation.decisions.create` | POST | `/backend/v3/api/moderation/reviews/{reviewId}/decisions` | `appstore.moderation.decide` |
| `appstore.moderation.appeals.create` | POST | `/backend/v3/api/moderation/appeals` | `appstore.moderation.appeal` |
| `appstore.moderation.appeals.list` | GET | `/backend/v3/api/moderation/appeals` | `appstore.moderation.read` |
| `appstore.moderation.appeals.retrieve` | GET | `/backend/v3/api/moderation/appeals/{appealId}` | `appstore.moderation.read` |
| `appstore.moderation.appeals.decide` | POST | `/backend/v3/api/moderation/appeals/{appealId}/decide` | `appstore.moderation.decide` |

## Backend API �?Catalog admin

| operationId | Method | Path | Permission |
| --- | --- | --- | --- |
| `appstore.catalog.collections.create` | POST | `/backend/v3/api/appstore/catalog/collections` | `appstore.catalog.admin` |
| `appstore.catalog.collections.update` | PATCH | `/backend/v3/api/appstore/catalog/collections/{collectionId}` | `appstore.catalog.admin` |
| `appstore.catalog.collections.items.update` | PUT | `/backend/v3/api/appstore/catalog/collections/{collectionId}/items` | `appstore.catalog.admin` |
| `appstore.catalog.featured.update` | PUT | `/backend/v3/api/appstore/catalog/featured/{slotCode}` | `appstore.catalog.admin` |
| `appstore.catalog.categories.create` | POST | `/backend/v3/api/appstore/catalog/categories` | `appstore.catalog.admin` |
| `appstore.catalog.categories.update` | PATCH | `/backend/v3/api/appstore/catalog/categories/{categoryId}` | `appstore.catalog.admin` |

## Backend API �?Operator listing admin

| operationId | Method | Path | Permission |
| --- | --- | --- | --- |
| `appstore.listings.admin.list` | GET | `/backend/v3/api/listings` | `appstore.listings.admin.read` |
| `appstore.listings.admin.retrieve` | GET | `/backend/v3/api/listings/{listingId}` | `appstore.listings.admin.read` |
| `appstore.listings.admin.visibility.update` | PATCH | `/backend/v3/api/listings/{listingId}/visibility` | `appstore.listings.admin` |
| `appstore.publishers.admin.verify` | POST | `/backend/v3/api/publishers/{publisherId}/verify` | `appstore.publishers.admin` |
| `appstore.metrics.listings.retrieve` | GET | `/backend/v3/api/metrics/listings/{listingId}` | `appstore.metrics.read` |
| `appstore.analytics.publisher.overview.retrieve` | GET | `/backend/v3/api/analytics/publisher/overview` | `appstore.analytics.publisher` |
| `appstore.analytics.publisher.listings.list` | GET | `/backend/v3/api/analytics/publisher/listings` | `appstore.analytics.publisher` |
| `appstore.analytics.publisher.listings.retrieve` | GET | `/backend/v3/api/analytics/publisher/listings/{listingId}` | `appstore.analytics.publisher` |
| `appstore.analytics.operator.dashboard.retrieve` | GET | `/backend/v3/api/analytics/operator/dashboard` | `appstore.analytics.operator` |
| `appstore.analytics.operator.search.retrieve` | GET | `/backend/v3/api/analytics/operator/search` | `appstore.analytics.operator` |


## Backend API - Market channels

| operationId | Method | Path | Permission |
| --- | --- | --- | --- |
| `appstore.marketChannels.list` | GET | `/backend/v3/api/market_channels` | `appstore.market_channels.read` |
| `appstore.marketChannels.create` | POST | `/backend/v3/api/market_channels` | `appstore.market_channels.write` |
| `appstore.marketChannels.update` | PATCH | `/backend/v3/api/market_channels/{marketChannelId}` | `appstore.market_channels.write` |
| `appstore.marketReleases.list` | GET | `/backend/v3/api/market_releases` | `appstore.market_releases.read` |
| `appstore.marketReleases.sync` | POST | `/backend/v3/api/market_releases/{marketReleaseId}/sync` | `appstore.market_releases.sync` |

## Open API �?Distribution

| operationId | Method | Path | Auth |
| --- | --- | --- | --- |
| `appstore.releases.checkUpdate` | POST | `/store/v3/api/releases/check_update` | API key |
| `appstore.artifacts.resolveDownload` | POST | `/store/v3/api/artifacts/resolve_download` | API key |
| `appstore.listings.public.retrieve` | GET | `/store/v3/api/listings/{listingSlug}` | API key optional |
| `appstore.releases.public.retrieve` | GET | `/store/v3/api/releases/{releaseId}` | API key optional |
| `appstore.catalog.public.featured.list` | GET | `/store/v3/api/catalog/featured` | none |
| `appstore.publish.automation.submissions.create` | POST | `/store/v3/api/automation/submissions` | API key |

## Comments integration (not owned �?client calls comments SDK)

| Concern | Owner operation | Notes |
| --- | --- | --- |
| Reviews thread | `comments.threads.*` | Bind via `comments_thread_id` on listing |
| Star rating aggregate | `comments.summary.*` | Cached into listing read model |
| Favorites | `comments.favorites.*` | Optional wishlist overlap |

## Idempotency

Mutating operations accept header `Idempotency-Key`. Scopes:

- `appstore.listing.submit`
- `appstore.release.create`
- `appstore.library.install`
- `appstore.downloadGrants.create`
- `appstore.moderation.decisions.create`
