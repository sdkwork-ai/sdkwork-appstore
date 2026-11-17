import type { CatalogExpert } from './catalog-expert';

export interface CatalogExpertResponse {
  code: 0;
  data: unknown & { item: CatalogExpert; };
  /** Server-owned request correlation id. */
  traceId: string;
}
