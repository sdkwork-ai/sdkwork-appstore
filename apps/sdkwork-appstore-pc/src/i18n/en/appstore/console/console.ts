export const consoleLocales = {
  header: {
    badge: 'Developer Portal',
    title: 'Developer Console',
    subtitle: 'Manage published apps, generate API credential keys, configure security policies, and deploy new releases.'
  },
  tabs: {
    publish: 'Publish New App',
    managed: 'Managed Apps',
    apiKeys: 'API Credentials & SDK Keys',
    security: 'Security Policies'
  },
  alert: {
    success: 'App [{{appName}}] submitted successfully! Key generated and automated compliance checks initiated.'
  },
  form: {
    title: 'Application Publishing Details',
    appName: 'Application Name',
    appNamePlaceholder: 'e.g. SDKWork Code Master',
    category: 'Primary Category',
    version: 'Version Number',
    versionPlaceholder: '1.0.0',
    price: 'Pricing Tier',
    pricePlaceholder: 'Enter 0 for Free or specify price',
    iconUrl: 'Application Icon URL',
    iconUrlPlaceholder: 'https://...',
    downloadUrl: 'Package Download URL',
    downloadUrlPlaceholder: 'https://...',
    summary: 'Tagline / Summary',
    summaryPlaceholder: 'Describe core features and highlights...',
    description: 'Detailed Description & Release Notes',
    descriptionPlaceholder: 'Detail technical architecture, release notes, and prerequisites...',
    submit: 'Submit for Review',
    success: 'Application published successfully! Submitted to platform review queue.'
  },
  categories: {
    productivity: 'Productivity',
    utilities: 'Utilities & Tools',
    entertainment: 'Entertainment & Audio',
    ai: 'AI Intelligence',
    games: 'Games'
  },
  managed: {
    title: 'Managed & Published Applications ({{count}})',
    titleCount: 'Managed Applications ({{count}})',
    empty: 'No managed application records found',
    category: 'Category:',
    status: 'Status:',
    version: 'Version',
    downloads: 'Downloads',
    statusPublished: 'Published',
    statusReviewing: 'In Review'
  },
  apiKeys: {
    title: 'API Credentials & SDK Keys',
    cardTitle: 'API Credentials & SDK Secrets',
    createBtn: 'Create Key',
    subtitle: 'Client secret credentials for integrating SDKWork API in Node.js / Python backend:',
    namePlaceholder: 'Key identifier (e.g. Production Server Key)',
    submitBtn: 'Generate API Secret',
    generateBtn: 'Generate New API Key',
    keyName: 'Key Name',
    secretKey: 'Secret Key',
    createdDate: 'Created Date',
    status: 'Status',
    actions: 'Actions',
    revoke: 'Revoke Key',
    active: 'Active',
    revoked: 'Revoked',
    envProd: 'Production',
    envDev: 'Development / Testing',
    lastUsed: 'Last Used',
    neverUsed: 'Never Used',
    copyKey: 'Copy Key',
    copied: 'Copied'
  },
  security: {
    title: 'Client Security & Sandbox Policies',
    crossOrigin: 'Cross-Origin Isolation & Sandbox',
    ipWhitelist: 'IP Access Whitelist',
    mfa: 'Two-Factor Authentication',
    corsTitle: 'Cross-Origin Isolation & Sandbox (CORS & CSP)',
    corsDesc: 'Strict same-origin policy enabled by default, supporting API key header verification to prevent illegal hotlinking.',
    ipTitle: 'IP Access Whitelist (IP Whitelist)',
    ipDesc: 'Restrict high-privilege backend management API calls strictly to pre-configured safe IP ranges.',
    mfaTitle: 'Two-Factor Authentication (MFA Protection)',
    mfaDesc: 'Enforce two-factor authentication during sensitive key regeneration, revocation, or version unpublishing.',
    enabledStatus: 'Protection Active',
    unavailable: 'Security policy management is not yet available from the App Store backend. Safe defaults remain in effect.',
    mfaSubtitle: 'MFA Protection',
    ipSubtitle: 'IP Whitelist',
    complianceBadge: 'DJCP Level 3 Compliant'
  },
  loading: 'Loading developer console data...'
};

