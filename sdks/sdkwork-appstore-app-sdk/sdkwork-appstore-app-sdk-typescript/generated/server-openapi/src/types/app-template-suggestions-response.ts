import type { AppTemplateSuggestions } from './app-template-suggestions';

export interface AppTemplateSuggestionsResponse {
  code: 0;
  data: unknown & { item: AppTemplateSuggestions; };
  /** Server-owned request correlation id. */
  traceId: string;
}
