import type { TemplateItem } from '../types';

export interface ITemplatesSDK {
  getTemplates(category?: string, query?: string, platform?: string): Promise<TemplateItem[]>;
  getTemplateById(id: string): Promise<TemplateItem | null>;
  publishTemplate(templateData: Partial<TemplateItem>): Promise<TemplateItem>;
  starTemplate(id: string): Promise<{ stars: number; isStarred: boolean }>;
  forkTemplate(id: string): Promise<{ forks: number }>;
  getTemplateCliCommand(id: string): Promise<string>;
}

export type TemplatesServicePort = ITemplatesSDK;

let templatesPort: TemplatesServicePort = createUnconfiguredTemplatesPort();

/** Bind the real SDK-backed implementation during app bootstrap. */
export function configureTemplatesServicePort(port: TemplatesServicePort): void {
  templatesPort = port;
}

export const TemplatesService: ITemplatesSDK = {
  getTemplates: (category = '全部', query = '', platform = '') =>
    templatesPort.getTemplates(category, query, platform),
  getTemplateById: (id) => templatesPort.getTemplateById(id),
  publishTemplate: (templateData) => templatesPort.publishTemplate(templateData),
  starTemplate: (id) => templatesPort.starTemplate(id),
  forkTemplate: (id) => templatesPort.forkTemplate(id),
  getTemplateCliCommand: (id) => templatesPort.getTemplateCliCommand(id),
};

function createUnconfiguredTemplatesPort(): TemplatesServicePort {
  const unavailable = (): never => {
    throw new Error('The App Store templates runtime is not configured.');
  };
  return {
    getTemplates: async () => unavailable(),
    getTemplateById: async () => unavailable(),
    publishTemplate: async () => unavailable(),
    starTemplate: async () => unavailable(),
    forkTemplate: async () => unavailable(),
    getTemplateCliCommand: async () => unavailable(),
  };
}
