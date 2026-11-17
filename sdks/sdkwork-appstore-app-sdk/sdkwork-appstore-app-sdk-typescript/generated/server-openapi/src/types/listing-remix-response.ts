import type { ListingRemixDownload } from './listing-remix-download';

export interface ListingRemixResponse {
  code: 0;
  data: unknown & { item: ListingRemixDownload; };
  /** Server-owned request correlation id. */
  traceId: string;
}
