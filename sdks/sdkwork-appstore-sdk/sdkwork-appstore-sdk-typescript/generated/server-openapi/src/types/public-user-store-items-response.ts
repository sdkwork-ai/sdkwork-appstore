import type { PageInfo } from './page-info';
import type { PublicUserStoreListingCard } from './public-user-store-listing-card';

export interface PublicUserStoreItemsResponse {
  code: 0;
  data: unknown & { items: PublicUserStoreListingCard[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
