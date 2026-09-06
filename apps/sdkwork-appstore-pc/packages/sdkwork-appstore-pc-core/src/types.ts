export interface InAppPurchase {
  id: string;
  name: string;
  price: number;
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

export interface PluginItem {
  id: string;
  name: string;
  version: string;
  developer: string;
  category: string;
  description: string;
  icon: string;
  iconColor: string;
  downloadsCount: number;
  rating: number;
  enabled: boolean;
  apiSchemaType: 'OpenAPI' | 'GraphQL' | 'gRPC' | 'REST';
  capabilities: string[];
  docUrl?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  author: string;
  category: string;
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

export interface TemplateItem {
  id: string;
  title: string;
  author: string;
  framework: string;
  category: string;
  description: string;
  icon: string;
  iconColor: string;
  stars: number;
  forks: number;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  repoUrl?: string;
  previewUrl?: string;
  publishedAt: string;
  isOfficial?: boolean;
  previewImage?: string;
  screenshots?: string[];
  features?: string[];
  techStack?: string[];
  architecture?: string;
  usageCount?: number;
  rating?: number;
  license?: string;
  overviewMarkdown?: string;
  relatedAppId?: string;
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
