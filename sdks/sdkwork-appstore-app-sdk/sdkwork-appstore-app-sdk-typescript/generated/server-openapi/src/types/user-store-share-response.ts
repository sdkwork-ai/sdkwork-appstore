import type { UserStoreShare } from './user-store-share';

export interface UserStoreShareResponse {
  code: 0;
  data: unknown & { item: UserStoreShare; };
  /** Server-owned request correlation id. */
  traceId: string;
}
