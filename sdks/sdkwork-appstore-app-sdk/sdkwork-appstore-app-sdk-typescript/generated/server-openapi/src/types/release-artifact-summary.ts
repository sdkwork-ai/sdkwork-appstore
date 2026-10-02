export interface ReleaseArtifactSummary {
  id: string;
  platform: string;
  architecture: string;
  packageFormat: string;
  fileSizeBytes?: string;
}
