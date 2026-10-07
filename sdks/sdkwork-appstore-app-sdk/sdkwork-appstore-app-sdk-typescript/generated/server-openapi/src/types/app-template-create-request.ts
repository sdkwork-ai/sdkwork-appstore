export interface AppTemplateCreateRequest {
  templateCode?: string;
  templateName: string;
  description?: string;
  templateType: 'APP' | 'PLUGIN' | 'AGENT' | 'EXPERT';
  templatePlatform?: 'H5' | 'PC' | 'FLUTTER' | 'MINIPROGRAM';
  categoryCode?: string;
  framework?: string;
  language?: string;
  iconMediaResourceId?: string;
  gitRepoUrl?: string;
  capabilityManifest?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
