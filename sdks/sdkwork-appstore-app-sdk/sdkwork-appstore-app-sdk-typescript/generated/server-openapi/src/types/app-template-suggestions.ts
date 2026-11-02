import type { AppTemplate } from './app-template';

export interface AppTemplateSuggestions {
  /** Newest published templates in the same market. */
  latest: AppTemplate[];
  /** Templates sharing the current template's category or type, most used first. */
  related: AppTemplate[];
  /** Most used remaining templates for the current template's platform. */
  recommended: AppTemplate[];
}
