import type { PublicUserStoreCategorySummary } from './public-user-store-category-summary';

export interface PublicUserStoreViewResponse {
  code: 0;
  data: unknown & { item: { shareToken: string; title: string; description?: string; ownerUserId: string; categories: PublicUserStoreCategorySummary[]; }; };
  /** Server-owned request correlation id. */
  traceId: string;
}
