import type { DownloadGrant } from './download-grant';
import type { DownloadGrantDelivery } from './download-grant-delivery';

export interface DownloadGrantConsumeResponse {
  code: 0;
  data: unknown & { item: DownloadGrant & { delivery?: DownloadGrantDelivery; }; };
  /** Server-owned request correlation id. */
  traceId: string;
}
