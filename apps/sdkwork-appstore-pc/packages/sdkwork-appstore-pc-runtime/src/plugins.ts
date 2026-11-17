import type { AppStoreClient } from '@sdkwork/appstore-pc-core';
import {
  configurePluginsServicePort,
  type PluginsServicePort,
} from '@sdkwork/appstore-pc-core';

import type { PluginItem } from '../types';

/**
 * The plugin marketplace lost its API.
 *
 * Plugin entries were stored as `appstore_app_template` rows with
 * `template_type = 'PLUGIN'`; that table family is retired (migration 0011) and
 * the appstore catalog serves no plugin or template surface any more. The port
 * keeps its shape so the marketplace pages still compile: reads degrade to an
 * empty shelf, and the operations that used to write catalog rows fail loudly.
 *
 * Repointing the plugin shelf at a dedicated plugin contract, or retiring its
 * pages, is a product decision outside this change.
 */
const retiredReadMessage =
  'The plugin marketplace is retired: plugin entries lived in the app-template family, which the appstore catalog no longer serves.';

const retiredWriteMessage =
  'Installing, enabling and publishing plugins is retired: plugin entries lived in the app-template family, which the appstore catalog no longer serves.';

export function configureAppstorePcPlugins(_client: AppStoreClient): void {
  configurePluginsServicePort(createPluginsServicePort());
}

export function createPluginsServicePort(): PluginsServicePort {
  return {
    async getPlugins(): Promise<PluginItem[]> {
      console.warn(retiredReadMessage);
      return [];
    },

    async togglePlugin(_id: string): Promise<boolean> {
      throw new Error(retiredWriteMessage);
    },

    async registerPlugin(_pluginData: Partial<PluginItem>): Promise<PluginItem> {
      throw new Error(retiredWriteMessage);
    },

    async executePluginApi(): Promise<{
      success: boolean;
      result: string;
      latencyMs: number;
    }> {
      throw new Error('Plugin capability execution is not exposed by the App Store app API.');
    },

    async getPluginSchema(): Promise<string> {
      throw new Error('Plugin API schema execution is not exposed by the App Store app API.');
    },
  };
}
