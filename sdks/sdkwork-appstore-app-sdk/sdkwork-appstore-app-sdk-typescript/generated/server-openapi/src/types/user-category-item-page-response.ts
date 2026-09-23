import type { PageInfo } from './page-info';
import type { UserCategoryItemWithCard } from './user-category-item-with-card';

export interface UserCategoryItemPageResponse {
  code: 0;
  data: unknown & { items: UserCategoryItemWithCard[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
