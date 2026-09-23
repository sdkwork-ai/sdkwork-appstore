import type { PageInfo } from './page-info';
import type { UserStoreShare } from './user-store-share';

export interface UserStoreSharePageResponse {
  code: 0;
  data: unknown & { items: UserStoreShare[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
