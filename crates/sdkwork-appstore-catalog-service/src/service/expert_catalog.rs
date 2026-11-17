//! Read rules for the public AI expert roster.
//!
//! The expert page no longer reads the template shelf: experts live in
//! `appstore_expert_catalog` (migration 0009), so the list call owns its own
//! filter, ordering and keyset window. Keeping the normalization here — rather
//! than inline in [`crate::service::catalog_service`] — makes the request
//! parameters the page actually sends (filter, sort, page size, cursor)
//! directly unit-testable without a database.

use crate::domain::commands::ExpertsListRequest;
use crate::domain::models::ExpertCatalogEntry;
use crate::error::{AppstoreServiceError, AppstoreServiceResult};
use crate::ports::repository::{ExpertCatalogQuery, ExpertSortOrder};

/// Default number of experts returned by one roster page.
pub const EXPERT_PAGE_SIZE_DEFAULT: i32 = 20;
/// Largest page the roster will serve; a bigger request is clamped, not
/// rejected, so a stale client never breaks the expert page.
pub const EXPERT_PAGE_SIZE_MAX: i32 = 200;

/// The filter, ordering and page window that reach the repository.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExpertListQuery {
    pub category_code: Option<String>,
    pub order: ExpertSortOrder,
    pub cursor: Option<String>,
    /// Visible page size (never the over-fetch size).
    pub limit: i32,
}

impl ExpertListQuery {
    /// Normalizes an inbound list request.
    ///
    /// Blank values are treated as absent (a `?category_code=` from an empty
    /// filter control must mean "no filter", not "match the empty code"), the
    /// page size is clamped to the roster bounds, and an unknown `sort` is a
    /// validation failure rather than a silent fallback: falling back would
    /// return a differently ordered page than the client asked for.
    pub fn from_request(request: &ExpertsListRequest) -> AppstoreServiceResult<Self> {
        let order = match trimmed(request.sort.as_deref()) {
            None => ExpertSortOrder::SortWeightAsc,
            Some(value) => ExpertSortOrder::from_str(value).ok_or_else(|| {
                AppstoreServiceError::ValidationFailed(format!(
                    "sort must be {} or {} (got {})",
                    ExpertSortOrder::SORT_WEIGHT_ASC,
                    ExpertSortOrder::SORT_WEIGHT_DESC,
                    value
                ))
            })?,
        };

        Ok(Self {
            category_code: trimmed(request.category_code.as_deref()).map(ToOwned::to_owned),
            order,
            cursor: trimmed(request.cursor.as_deref()).map(ToOwned::to_owned),
            limit: request
                .page_size
                .unwrap_or(EXPERT_PAGE_SIZE_DEFAULT)
                .clamp(1, EXPERT_PAGE_SIZE_MAX),
        })
    }

    /// Repository lookup, over-fetching by one row so the caller can tell
    /// whether a next page exists without a second count query.
    pub fn as_repository_query(&self) -> ExpertCatalogQuery<'_> {
        ExpertCatalogQuery {
            category_code: self.category_code.as_deref(),
            order: self.order,
            cursor: self.cursor.as_deref(),
            limit: self.limit.saturating_add(1),
        }
    }
}

/// Keyset cursor of the page that continues after `expert`.
pub fn expert_cursor(expert: &ExpertCatalogEntry) -> String {
    format!("{}:{}", expert.sort_weight, expert.id)
}

/// Trims an over-fetched roster page down to its visible window and derives the
/// next page's cursor.
///
/// `rows` must have been fetched with `limit + 1`; the extra row is what proves
/// `has_more`. Cursor and flag are always consistent: `has_more` is true only
/// when a cursor exists, so a client that follows `next_cursor` never loops on
/// the same page.
pub fn paginate_experts(
    mut rows: Vec<ExpertCatalogEntry>,
    limit: i32,
) -> (Vec<ExpertCatalogEntry>, Option<String>, bool) {
    let over_fetched = rows.len() > limit.max(0) as usize;
    rows.truncate(limit.max(0) as usize);
    let next_cursor = if over_fetched {
        rows.last().map(expert_cursor)
    } else {
        None
    };
    let has_more = next_cursor.is_some();
    (rows, next_cursor, has_more)
}

fn trimmed(value: Option<&str>) -> Option<&str> {
    value.map(str::trim).filter(|value| !value.is_empty())
}
