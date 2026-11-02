export interface AppTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  description?: string;
  templateType: 'APP' | 'PLUGIN' | 'AGENT' | 'EXPERT';
  /** Client application architecture code the template scaffolds, per APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC section 2. */
  templatePlatform?: 'PC' | 'PAD' | 'H5' | 'STATIC_WEB' | 'FLUTTER' | 'MINIPROGRAM' | 'ANDROID' | 'IOS' | 'HARMONY' | 'UNIAPP' | 'UNITY';
  categoryCode?: string;
  framework?: string;
  language?: string;
  iconMediaResourceId?: string;
  gitRepoUrl?: string;
  authorName?: string;
  capabilityManifest?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  starCount?: number;
  forkCount?: number;
  cloneCount?: number;
  publishedAt: string;
  createdAt: string;
}
