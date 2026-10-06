export interface ManagedApp {
  id: string;
  name: string;
  version: string;
  status: '已上架' | '审核中' | '已提交上架' | '已下架' | '草稿' | '已通过' | '未通过';
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

/** One storefront category option resolved from the live catalog. */
export interface ConsoleCategoryOption {
  categoryId: string;
  categoryCode: string;
  displayName: string;
}

export interface IConsoleSDK {
  getManagedApps(): Promise<ManagedApp[]>;
  listCategories(): Promise<ConsoleCategoryOption[]>;
  publishApp(appData: {
    name: string;
    /** Live catalog category id picked by the publisher; optional. */
    categoryId?: string;
    /** Initial release version; persisted as a draft release when present. */
    version?: string;
    description?: string;
    /** Store application type preset (`APP` | `WEBSITE` | `PROMO`); defaults to APP. */
    appType?: string;
    /** Storefront pricing model (`FREE` | `FREEMIUM` | `PAID`); defaults to FREE. */
    pricingModel?: string;
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
}

export type ConsoleServicePort = IConsoleSDK;

let consolePort: ConsoleServicePort = createUnconfiguredConsolePort();

/** Bind the real SDK-backed implementation during app bootstrap. */
export function configureConsoleServicePort(port: ConsoleServicePort): void {
  consolePort = port;
}

export const ConsoleService: IConsoleSDK = {
  getManagedApps: () => consolePort.getManagedApps(),
  listCategories: () => consolePort.listCategories(),
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
};

function createUnconfiguredConsolePort(): ConsoleServicePort {
  const unavailable = (): never => {
    throw new Error('The App Store console runtime is not configured.');
  };
  return {
    getManagedApps: async () => unavailable(),
    listCategories: async () => unavailable(),
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
  };
}
