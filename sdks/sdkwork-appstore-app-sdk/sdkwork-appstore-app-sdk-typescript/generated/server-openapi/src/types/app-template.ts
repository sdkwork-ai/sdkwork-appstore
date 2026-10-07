export interface AppTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  description?: string;
  templateType: 'APP' | 'PLUGIN' | 'AGENT' | 'EXPERT';
  templatePlatform?: 'H5' | 'PC' | 'FLUTTER' | 'MINIPROGRAM';
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
