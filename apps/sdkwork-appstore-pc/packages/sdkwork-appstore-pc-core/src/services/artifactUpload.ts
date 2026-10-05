import type { SdkworkDriveAppClient } from '@sdkwork/drive-app-sdk';
import type { AppStoreClient } from '@sdkwork/appstore-app-sdk';

import { APPSTORE_PC_RELEASE_ARTIFACT_UPLOAD } from '../upload-declaration';

/**
 * Release artifact upload port.
 *
 * Uploads a package archive through the drive sdk (declared
 * `appstore.artifact` purpose, `archive` profile) and attaches it to a
 * release via the app-api artifacts surface. Publishers cannot ship a
 * downloadable release without it.
 */
export interface ArtifactUploadPort {
  uploadAndAttachReleaseArtifact(params: {
    releaseId: string;
    platform: string;
    architecture: string;
    packageFormat: string;
    file: File;
    onProgress?: (percent: number) => void;
  }): Promise<{ artifactId: string | undefined }>;
}

let uploadPort: ArtifactUploadPort | undefined;

/** Bind the drive-backed artifact upload port (called once by the runtime). */
export function configureArtifactUploadPort(port: ArtifactUploadPort): void {
  uploadPort = port;
}

/**
 * Uploads and attaches the release artifact. When the port is not bound
 * (embedded hosts owning their own storage) the error is explicit, never a
 * silent no-op.
 */
export async function uploadAndAttachReleaseArtifact(params: {
  releaseId: string;
  platform: string;
  architecture: string;
  packageFormat: string;
  file: File;
  onProgress?: (percent: number) => void;
}): Promise<{ artifactId: string | undefined }> {
  const port = uploadPort;
  if (!port) {
    throw new Error('制品上传能力暂未配置。');
  }
  return port.uploadAndAttachReleaseArtifact(params);
}

/** Concrete port over the drive uploader + app artifacts surface. */
export function createArtifactUploadPort(config: {
  driveClient: SdkworkDriveAppClient;
  appClient: AppStoreClient;
}): ArtifactUploadPort {
  return {
    async uploadAndAttachReleaseArtifact(params) {
      const uploadResult = await config.driveClient.uploader.uploadArchive({
        file: params.file,
        appResourceType: APPSTORE_PC_RELEASE_ARTIFACT_UPLOAD.appResourceType,
        appResourceId: params.releaseId,
        uploadProfileCode: APPSTORE_PC_RELEASE_ARTIFACT_UPLOAD.uploadProfileCode,
        scene: APPSTORE_PC_RELEASE_ARTIFACT_UPLOAD.scene,
        source: APPSTORE_PC_RELEASE_ARTIFACT_UPLOAD.source,
        onProgress: params.onProgress
          ? (progress) => {
              if (progress.totalBytes > 0) {
                params.onProgress?.(
                  Math.min(
                    100,
                    Math.round((progress.uploadedBytes / progress.totalBytes) * 100),
                  ),
                );
              }
            }
          : undefined,
      });

      const checksum =
        uploadResult.uploadItem.checksumSha256Hex ?? '';
      const attach = await config.appClient.releases.attachArtifact(
        params.releaseId,
        {
          platform: params.platform,
          architecture: params.architecture,
          packageFormat: params.packageFormat,
          driveNodeId: uploadResult.uploadItem.nodeId,
          checksumSha256: checksum,
          fileSizeBytes:
            uploadResult.uploadItem.contentLength ?? String(params.file.size),
          contentType:
            uploadResult.uploadItem.contentType ??
            params.file.type ??
            'application/octet-stream',
        },
      );
      const artifactId = readArtifactId(attach);
      return { artifactId };
    },
  };
}

function readArtifactId(attach: unknown): string | undefined {
  if (!attach || typeof attach !== 'object') {
    return undefined;
  }
  const record = attach as Record<string, unknown>;
  const data = record.data;
  const inner =
    data && typeof data === 'object'
      ? ((data as Record<string, unknown>).item as
          | Record<string, unknown>
          | undefined)
      : undefined;
  const id =
    (inner?.id as string | undefined) ??
    (record.id as string | undefined) ??
    undefined;
  return id ?? undefined;
}
