/**
 * Locale fragment: dashboard domain (`adminDashboard`).
 *
 * Owned by `@sdkwork/appstore-pc-admin-dashboard`
 * (`I18N_SPEC.md` §6.1: `src/i18n/<locale>/appstore/admin/<fragment>.ts`).
 */
export const adminDashboard = {
  title: 'Dashboard',
  range: {
    from: 'From date',
    to: 'To date',
  },
  overview: {
    title: 'Overview',
    description: 'Track listings, downloads, reviews, and governance backlog across the storefront.',
    noSnapshot: 'The backend returned no dashboard snapshot for this range. Adjust the dates and retry.',
    kpi: {
      totalListings: 'Total listings',
      totalDownloads: 'Total downloads',
      totalReviews: 'Total reviews',
      pendingModeration: 'Pending moderation',
      activePublishers: 'Active publishers',
      dailyInstalls: 'Installs today',
    },
  },
  search: {
    title: 'Search analytics',
    description: 'Inspect search volume, result coverage, and click-through by storefront search term.',
    filterQuery: 'Search term',
    filterQueryPlaceholder: 'Filter by search term',
    columns: {
      term: 'Term',
      searchCount: 'Searches',
      resultCount: 'Results',
      zeroResultRatio: 'Zero-result share',
      clickThroughRatio: 'Click-through',
      topListing: 'Top listing',
    },
    empty: 'No search terms match the current filter.',
  },
};
