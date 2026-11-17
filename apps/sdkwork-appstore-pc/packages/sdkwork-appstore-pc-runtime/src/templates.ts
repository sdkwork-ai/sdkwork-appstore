import type { AppStoreClient } from '@sdkwork/appstore-pc-core';
import {
  configureTemplatesServicePort,
  type TemplateSuggestionSections,
  type TemplatesServicePort,
} from '@sdkwork/appstore-pc-core';

import type { TemplateItem } from '../types';

/**
 * The application-template marketplace lost its API.
 *
 * Application scaffolds are owned by the deploy service
 * (`/app/v3/api/app_templates`), and the appstore catalog no longer serves a
 * `catalog.templates` surface, so this runtime port keeps the page contracts
 * intact while every retired call fails loudly instead of reaching a deleted
 * endpoint. Reads degrade to an empty shelf so the pages render their empty
 * state; writes throw because silently dropping a publish/star is worse.
 *
 * Repointing these surfaces at the deploy scaffold API (or retiring the pages)
 * is a product decision outside this change.
 */
const retiredReadMessage =
  'The app-template marketplace is retired: application scaffolds are served by the deploy service (/app/v3/api/app_templates), not the appstore catalog.';

const retiredWriteMessage =
  'Publishing, starring and forking app templates is retired: application scaffolds are served by the deploy service (/app/v3/api/app_templates), not the appstore catalog.';

export function configureAppstorePcTemplates(_client: AppStoreClient): void {
  configureTemplatesServicePort(createTemplatesServicePort());
}

export function createTemplatesServicePort(): TemplatesServicePort {
  return {
    async getTemplates(): Promise<TemplateItem[]> {
      console.warn(retiredReadMessage);
      return [];
    },

    async getTemplateById(_id: string): Promise<TemplateItem | null> {
      console.warn(retiredReadMessage);
      return null;
    },

    async listTemplateSuggestions(_id: string): Promise<TemplateSuggestionSections> {
      console.warn(retiredReadMessage);
      return { latest: [], related: [], recommended: [] };
    },

    async publishTemplate(_templateData: Partial<TemplateItem>): Promise<TemplateItem> {
      throw new Error(retiredWriteMessage);
    },

    async starTemplate(_id: string): Promise<{ stars: number; isStarred: boolean }> {
      throw new Error(retiredWriteMessage);
    },

    async forkTemplate(_id: string): Promise<{ forks: number }> {
      throw new Error(retiredWriteMessage);
    },

    async getTemplateCliCommand(_id: string): Promise<string> {
      console.warn(retiredReadMessage);
      return 'npx create-sdkwork-app my-app';
    },
  };
}
