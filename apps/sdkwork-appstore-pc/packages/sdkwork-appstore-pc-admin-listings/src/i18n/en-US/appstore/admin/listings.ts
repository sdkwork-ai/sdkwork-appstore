/**
 * Locale fragment: listings domain (`adminListings`).
 *
 * Owned by `@sdkwork/appstore-pc-admin-listings`
 * (`I18N_SPEC.md` §6.1: `src/i18n/<locale>/appstore/admin/<fragment>.ts`).
 */
export const adminListings = {
  title: 'Listings',
  list: {
    title: 'Listing catalog',
    description: 'Filter listings by lifecycle status, inspect a listing, and adjust storefront visibility.',
    filterStatus: 'Listing status',
    filterStatusAll: 'All statuses',
    columns: {
      listing: 'Listing',
      listingCode: 'Listing code',
      status: 'Status',
      visibility: 'Visibility',
      publisher: 'Publisher',
      updatedAt: 'Updated',
      actions: 'Actions',
    },
    empty: 'No listings match the current filter.',
    loadFailed: 'Failed to load listings.',
    detail: 'View details',
  },
  detail: {
    title: 'Listing detail',
    description: 'Inspect listing metadata, storefront visibility, and operational metrics.',
    back: 'Back to listings',
    notFound: 'This listing was not found; it may already be removed.',
    fields: {
      listingId: 'Listing id',
      listingCode: 'Listing code',
      displayName: 'Listing',
      publisherName: 'Publisher',
      publisherId: 'Publisher id',
      categoryCode: 'Category code',
      platform: 'Platform',
      latestReleaseVersion: 'Latest release',
      updatedAt: 'Updated at',
    },
    actions: { changeVisibility: 'Change visibility' },
  },
  metrics: {
    title: 'Listing metrics',
    description: 'Storefront exposure and conversion for the range returned by the backend.',
    empty: 'No metric data was reported for this range.',
    loadFailed: 'Failed to load listing metrics.',
    series: 'Daily breakdown',
    kpi: {
      impressions: 'Impressions',
      pageViews: 'Page views',
      installs: 'Installs',
      uninstalls: 'Uninstalls',
      conversionRatio: 'Conversion',
      averageRating: 'Average rating',
    },
    columns: {
      date: 'Date',
      impressions: 'Impressions',
      pageViews: 'Page views',
      installs: 'Installs',
      uninstalls: 'Uninstalls',
    },
  },
  visibilityChange: {
    title: 'Change storefront visibility',
    description: 'The visibility change takes effect on the storefront immediately.',
    storefrontVisibility: 'Storefront visibility',
    reason: 'Reason',
    reasonHint: 'Record the basis for the change so the transition stays auditable.',
    submit: 'Submit change',
    submitting: 'Submitting…',
    success: 'Storefront visibility updated.',
    failed: 'Failed to change storefront visibility.',
  },
  status: {
    DRAFT: 'Draft',
    IN_REVIEW: 'In review',
    PUBLISHED: 'Published',
    UNPUBLISHED: 'Unpublished',
    DELISTED: 'Delisted',
    SUSPENDED: 'Suspended',
    REJECTED: 'Rejected',
  },
  visibilityStatus: {
    VISIBLE: 'Visible',
    HIDDEN: 'Hidden',
    DELISTED: 'Delisted',
    REGION_RESTRICTED: 'Region restricted',
  },
  unknownToken: 'Unknown status ({{token}})',
};
