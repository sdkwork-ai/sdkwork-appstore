import type { UserCategory } from './user-category';

export interface UserCategoryResponse {
  code: 0;
  data: unknown & { item: UserCategory; };
  /** Server-owned request correlation id. */
  traceId: string;
}
