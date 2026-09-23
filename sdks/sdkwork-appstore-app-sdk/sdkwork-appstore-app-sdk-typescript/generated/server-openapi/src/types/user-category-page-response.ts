import type { PageInfo } from './page-info';
import type { UserCategory } from './user-category';

export interface UserCategoryPageResponse {
  code: 0;
  data: unknown & { items: UserCategory[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
