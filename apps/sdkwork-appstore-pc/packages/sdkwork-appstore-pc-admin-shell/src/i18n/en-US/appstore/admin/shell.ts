/**
 * Shell locale fragment: operator console chrome.
 *
 * Owned by `@sdkwork/appstore-pc-admin-shell`; key prefix `adminShell` matches
 * the fragment namespace (`I18N_SPEC.md` §5/§6).
 */
export const adminShell = {
  brand: {
    title: 'Operations Console',
    subtitle: 'SDKWork App Store',
  },
  nav: {
    group: {
      insight: 'Analytics',
      governance: 'Platform Governance',
      operations: 'Catalog Operations',
      distribution: 'Distribution',
    },
    collapse: 'Collapse navigation',
    expand: 'Expand navigation',
  },
  topbar: {
    operator: 'Operator',
    tenant: 'Tenant',
    role: {
      platformAdministrator: 'Platform administrator',
      operator: 'Operator',
    },
  },
  breadcrumb: {
    home: 'Console',
  },
  accessDenied: {
    title: 'Operations console access denied',
    description:
      'This account has not been granted App Store backend permissions. Ask a platform administrator to grant access and retry.',
    requiredPermission: 'Required permission',
  },
  pageDenied: {
    title: 'Insufficient permission',
    description:
      'This account is missing the permission required for this page. Ask a platform administrator to grant access.',
  },
  notFound: {
    title: 'Page not found',
    description: 'The requested operations page does not exist or has been retired.',
    back: 'Back to console',
  },
  state: {
    loading: 'Loading…',
    empty: 'No data',
    retry: 'Retry',
    error: {
      title: 'Failed to load',
      description:
        'Retry shortly. If the failure persists, contact a platform administrator and quote the trace id.',
    },
    unauthorized: {
      title: 'Session expired',
      description: 'Sign in again to continue.',
    },
    forbidden: {
      title: 'Insufficient permission',
      description: 'This account is not allowed to read this data.',
    },
    notFound: {
      title: 'Not found',
      description: 'The requested resource does not exist or has been removed.',
    },
    runtimeUnconfigured: {
      title: 'Backend runtime not ready',
      description: 'The operations console finished mounting before bootstrap. Reload the page.',
    },
  },
  errorDetail: {
    code: 'Error code',
    operation: 'Operation',
    traceId: 'Trace id',
    field: 'Field',
  },
  common: {
    refresh: 'Refresh',
    cancel: 'Cancel',
    confirm: 'Confirm',
    submit: 'Submit',
    close: 'Close',
    search: 'Search',
    reset: 'Reset',
    save: 'Save',
    detail: 'Details',
    back: 'Back',
    actions: 'Actions',
    all: 'All',
    none: 'None',
    notAvailable: '—',
    totalItems: '{{total}} total',
    page: 'Page {{page}} of {{totalPages}}',
    nextPage: 'Next page',
    previousPage: 'Previous page',
    lastUpdated: 'Last updated: {{time}}',
    paginationPrevHint: 'Go to the previous page',
    paginationNextHint: 'Go to the next page',
  },
};
