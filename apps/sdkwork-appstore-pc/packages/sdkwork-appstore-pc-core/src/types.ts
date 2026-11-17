export interface InAppPurchase {
  id: string;
  name: string;
  price: number;
}

/** Verified installer artifact of a release (storefront-facing projection). */
export interface ListingArtifact {
  id: string;
  platform: string;
  architecture: string;
  packageFormat: string;
  fileSizeBytes?: string;
  /** Published SHA-256 (hex) of the installer, when the release carries one. */
  checksumSha256?: string;
}

export interface AppItem {
  id: string;
  name: string;
  developer: string;
  category: string;
  price: number; // 0 for free
  rating: number;
  reviewsCount: number;
  ratingBreakdown?: [number, number, number, number, number]; // [5 star, 4 star, 3, 2, 1] percentages
  description: string;
  /** Raw platform codes this listing ships for (see platforms.ts display groups). */
  platforms?: string[];
  /** Store pricing model (FREE/FREEMIUM/PAID) driving the acquisition gate. */
  pricingModel?: string;
  /** Commerce product id used to begin the paid checkout session. */
  commerceProductId?: string;
  /** Direct-open URL for web/H5 distributions; the QR scan target otherwise. */
  accessUrl?: string;
  /** Verified installer artifacts of the current release (desktop download flow). */
  artifacts?: ListingArtifact[];
  /** Per-platform scan/delivery links (platform code -> URL), preferred by QR actions. */
  platformLinks?: Record<string, string>;
  whatsNew?: { version: string; date: string; notes: string };
  screenshots: string[];
  icon: string; // Lucide icon name or emoji
  iconColor: string; // Tailwind gradient class
  version: string;
  size: string;
  ageRating: string;
  chartRank?: number;
  inAppPurchases?: InAppPurchase[];
  privacyLinked?: string[];
  privacyNotLinked?: string[];
  seller?: string;
  language?: string;
}

export interface Review {
  id: string;
  appId: string;
  user: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  likes?: number;
  /** Evaluation spec the review targets; absent for listing-level reviews. */
  specId?: string;
}

/** Kind of an AI-evaluation spec: the evaluated candidate family. */
export type AppSpecKind = 'model' | 'agent';

/**
 * One evaluation candidate of a multi-spec AI evaluation app (a model or an
 * agent such as BirdCoder, Codex, Claude Code). Ratings and comment threads
 * are scoped per spec.
 */
export interface AppSpec {
  /** Stable spec id; unique within its app and the comments-thread owner key. */
  id: string;
  kind: AppSpecKind;
  /** Display name of the evaluated candidate (e.g. `DeepSeek-V3.2`, `BirdCoder`). */
  name: string;
  /** Vendor or team behind the candidate. */
  publisher?: string;
  /** One-line evaluation focus of this candidate. */
  summary?: string;
}

/** Aggregate star rating of one spec, folded from its spec-scoped reviews. */
export interface SpecRatingSummary {
  /** Mean of submitted spec ratings, 0 when no reviews exist yet. */
  rating: number;
  reviewsCount: number;
}

export interface EditorialCollection {
  id: string;
  title: string;
  subtitle: string;
  apps: string[]; // array of app ids
  bannerColor: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface CategoryDetail {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  appCount?: number;
}

export interface EventItem {
  id: string;
  title: string;
  subtitle?: string;
  bannerColor: string;
  startsAt?: string;
  endsAt?: string;
  status?: string;
  apps: string[]; // array of app ids
  ctaText?: string;
  ctaLink?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  author: string;
  category: string;
  /**
   * Every registry category code this skill is filed under.
   *
   * A skill may bind several categories, so the catalog's category chips must
   * filter by membership rather than by the first category alone.
   */
  categoryCodes?: string[];
  description: string;
  icon: string;
  iconColor: string;
  triggers: string[];
  promptTemplate: string;
  skillMarkdown: string;
  version: string;
  activeCount: number;
  isInstalled?: boolean;
}

export interface McpServerItem {
  id: string;
  name: string;
  /** Registry category code the connector is filed under, when it has one. */
  categoryCode?: string;
  protocolVersion: string;
  transportType: 'stdio' | 'SSE' | 'WebSocket' | 'sse' | 'http';
  publisher: string;
  description: string;
  icon: string;
  iconColor: string;
  connected: boolean;
  toolsProvided: string[];
  resourcesProvided: string[];
  configSnippet: string;
  commandOrUrl?: string;
  status: 'active' | 'idle' | 'disconnected' | 'error';
}

export interface ExpertItem {
  id: string;
  name: string;
  nickname: string;
  avatarBg: string;
  avatarIcon?: string;
  scenarioCategory: string;
  filterTag: string;
  description: string;
  systemPrompt?: string;
  tags: string[];
  popularity: number;
  rating: number;
  isFeatured?: boolean;
  isOfficial?: boolean;
  badge?: string;
}

export interface ExpertScenario {
  id: string;
  title: string;
  icon: string;
  color: string;
  expertCount?: number;
  featuredExperts: { name: string; nickname?: string }[];
}
