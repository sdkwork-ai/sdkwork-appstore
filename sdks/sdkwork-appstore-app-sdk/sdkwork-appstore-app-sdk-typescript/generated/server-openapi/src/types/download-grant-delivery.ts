export interface DownloadGrantDelivery {
  /** Presigned installer URL (present when drive integration is enabled). */
  downloadUrl?: string;
  downloadUrlExpiresAt?: string;
  platform: string;
  architecture: string;
  packageFormat: string;
  fileSizeBytes?: string;
}
