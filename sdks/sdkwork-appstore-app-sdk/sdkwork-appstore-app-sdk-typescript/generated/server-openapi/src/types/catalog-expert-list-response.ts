import type { CatalogExpert } from './catalog-expert';
import type { PageInfo } from './page-info';

export interface CatalogExpertListResponse {
  code: 0;
  data: unknown & { items: CatalogExpert[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
