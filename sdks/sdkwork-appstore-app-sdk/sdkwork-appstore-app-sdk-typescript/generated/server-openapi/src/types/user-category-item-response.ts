import type { UserCategoryItemWithCard } from './user-category-item-with-card';

export interface UserCategoryItemResponse {
  code: 0;
  data: unknown & { item: UserCategoryItemWithCard; };
  /** Server-owned request correlation id. */
  traceId: string;
}
