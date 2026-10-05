export interface ManagedApp {
  id: string;
  name: string;
  version: string;
  status: '已上架' | '审核中' | '已提交上架' | '已下架';
  downloads: string;
  updatedAt?: string;
}

export interface PublisherProfile {
  id: string;
  displayName: string;
  legalName?: string;
  supportEmail?: string;
  websiteUrl?: string;
  verificationStatus?: string;
  memberRole?: string;
}

export interface ReleaseItem {
  id: string;
  versionName: string;
  versionCode: string;
  buildNumber?: string;
  channelCode: string;
  status: string;
  rolloutStrategy?: string;
  targetPercentage?: number;
  createdAt?: string;
  publishedAt?: string;
}

export interface ManagedAppDetail extends ManagedApp {
  slug: string;
  description: string;
  category: string;
  pricingModel: string;
  appKey: string;
  listingStatus: string;
  releaseCount?: number;
}

export interface PublisherMember {
  id: string;
  userId: string;
  role: string;
  joinedAt?: string;
}

export interface ApiCredential {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey?: string;
  createdAt: string;
  status: 'active' | 'revoked';
}

export interface SecurityPolicy {
  mfaRequired: boolean;
  ipWhitelistEnabled: boolean;
  rateLimitPerMin: number;
  dataIsolationMode: 'Strict Domain Isolation' | 'Shared Tenant' | 'VPC Peering';
}

export interface ConsoleAuditLog {
  id: string;
  action: string;
  operator: string;
  timestamp: string;
  ip: string;
}

export interface IConsoleSDK {
  getManagedApps(): Promise<ManagedApp[]>;
  publishApp(appData: {
    name: string;
    category: string;
    version: string;
    description: string;
    /** Store application type preset (`APP` | `WEBSITE` | `PROMO`); defaults to APP. */
    appType?: string;
  }): Promise<ManagedApp>;
  getPublisherProfile(): Promise<PublisherProfile | undefined>;
  registerPublisher(data: { displayName: string; legalName?: string; supportEmail?: string; websiteUrl?: string }): Promise<PublisherProfile>;
  submitVerification(data: { verificationType: string; evidenceMediaResourceId?: string }): Promise<boolean>;
  getListingById(id: string): Promise<ManagedAppDetail | undefined>;
  updateListing(id: string, patch: { pricingModel?: string; officialWebsiteUrl?: string; supportUrl?: string; privacyPolicyUrl?: string }): Promise<void>;
  getReleases(listingId: string): Promise<ReleaseItem[]>;
  createRelease(listingId: string, data: { channelCode: string; versionName: string; versionCode: string; buildNumber?: string }): Promise<ReleaseItem>;
  updateReleaseRollout(releaseId: string, targetPercentage: number, strategy?: 'FULL' | 'STAGED' | 'PAUSE'): Promise<void>;
  submitListingForReview(listingId: string, releaseId?: string): Promise<boolean>;
  listMembers(publisherId: string): Promise<PublisherMember[]>;
  inviteMember(publisherId: string, data: { userId: string; role: string }): Promise<boolean>;
  getApiCredentials(): Promise<ApiCredential[]>;
  generateApiKey(name: string): Promise<ApiCredential>;
  revokeApiKey(id: string): Promise<boolean>;
  getSecurityPolicy(): Promise<SecurityPolicy>;
  updateSecurityPolicy(policy: Partial<SecurityPolicy>): Promise<SecurityPolicy>;
  getConsoleAuditLogs(): Promise<ConsoleAuditLog[]>;
}

export type ConsoleServicePort = IConsoleSDK;

let consolePort: ConsoleServicePort = createUnconfiguredConsolePort();

/** Bind the real SDK-backed implementation during app bootstrap. */
export function configureConsoleServicePort(port: ConsoleServicePort): void {
  consolePort = port;
}

export const ConsoleService: IConsoleSDK = {
  getManagedApps: () => consolePort.getManagedApps(),
  publishApp: (appData) => consolePort.publishApp(appData),
  getPublisherProfile: () => consolePort.getPublisherProfile(),
  registerPublisher: (data) => consolePort.registerPublisher(data),
  submitVerification: (data) => consolePort.submitVerification(data),
  getListingById: (id) => consolePort.getListingById(id),
  updateListing: (id, patch) => consolePort.updateListing(id, patch),
  getReleases: (listingId) => consolePort.getReleases(listingId),
  createRelease: (listingId, data) => consolePort.createRelease(listingId, data),
  updateReleaseRollout: (releaseId, targetPercentage, strategy) =>
    consolePort.updateReleaseRollout(releaseId, targetPercentage, strategy),
  submitListingForReview: (listingId, releaseId) => consolePort.submitListingForReview(listingId, releaseId),
  listMembers: (publisherId) => consolePort.listMembers(publisherId),
  inviteMember: (publisherId, data) => consolePort.inviteMember(publisherId, data),
  getApiCredentials: () => consolePort.getApiCredentials(),
  generateApiKey: (name) => consolePort.generateApiKey(name),
  revokeApiKey: (id) => consolePort.revokeApiKey(id),
  getSecurityPolicy: () => consolePort.getSecurityPolicy(),
  updateSecurityPolicy: (policy) => consolePort.updateSecurityPolicy(policy),
  getConsoleAuditLogs: () => consolePort.getConsoleAuditLogs(),
};

function createUnconfiguredConsolePort(): ConsoleServicePort {
  const unavailable = (): never => {
    throw new Error('The App Store console runtime is not configured.');
  };
  return {
    getManagedApps: async () => unavailable(),
    publishApp: async () => unavailable(),
    getPublisherProfile: async () => unavailable(),
    registerPublisher: async () => unavailable(),
    submitVerification: async () => unavailable(),
    getListingById: async () => unavailable(),
    updateListing: async () => unavailable(),
    getReleases: async () => unavailable(),
    createRelease: async () => unavailable(),
    updateReleaseRollout: async () => unavailable(),
    submitListingForReview: async () => unavailable(),
    listMembers: async () => unavailable(),
    inviteMember: async () => unavailable(),
    getApiCredentials: async () => unavailable(),
    generateApiKey: async () => unavailable(),
    revokeApiKey: async () => unavailable(),
    getSecurityPolicy: async () => unavailable(),
    updateSecurityPolicy: async () => unavailable(),
    getConsoleAuditLogs: async () => unavailable(),
  };
}
