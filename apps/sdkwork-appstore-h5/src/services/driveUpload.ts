import { hexEncode } from '@sdkwork/utils';
import type { DriveUploaderProgress } from '@sdkwork/drive-app-sdk';
import type { ListingMediaAttachRequest } from '@sdkwork/appstore-app-sdk';
import {
  APPSTORE_H5_LISTING_MEDIA_UPLOAD,
  APPSTORE_H5_RELEASE_ARTIFACT_UPLOAD,
} from '@sdkwork/appstore-h5-core/sdk';
import { getDriveClient } from '@/services/driveClient';
import { getStoreClient } from '@/services/storeClient';

export interface UploadListingMediaParams {
  file: File;
  organizationId: string;
  listingId: string;
  mediaRole: ListingMediaAttachRequest['mediaRole'];
  platformScope?: string;
  locale?: string;
  onProgress?: (progress: DriveUploaderProgress) => void;
}

export interface UploadReleaseArtifactParams {
  file: File;
  organizationId: string;
  releaseId: string;
  platform: string;
  architecture: string;
  packageFormat: string;
  onProgress?: (progress: DriveUploaderProgress) => void;
}

function profileForFile(file: File): 'archive' | 'image' | 'video' {
  if (file.type.startsWith('image/')) {
    return 'image';
  }
  if (file.type.startsWith('video/')) {
    return 'video';
  }
  return 'archive';
}

async function sha256ChecksumHex(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return `sha256:${hexEncode(new Uint8Array(digest))}`;
}

/** Upload listing media via sdkwork-drive, then attach the Drive asset reference to the listing. */
export async function uploadListingMedia(params: UploadListingMediaParams) {
  const drive = getDriveClient();
  const profile = profileForFile(params.file);
  const uploadResult = await drive.uploader.uploadByProfile(profile, {
    file: params.file,
    appResourceType: APPSTORE_H5_LISTING_MEDIA_UPLOAD.appResourceType,
    appResourceId: params.listingId,
    uploadProfileCode: profile,
    scene: APPSTORE_H5_LISTING_MEDIA_UPLOAD.scene,
    source: APPSTORE_H5_LISTING_MEDIA_UPLOAD.source,
    onProgress: params.onProgress,
  });

  const assetId = uploadResult.uploadItem.nodeId;
  const store = getStoreClient();
  return store.listings.attachMedia(params.listingId, {
    mediaRole: params.mediaRole,
    mediaResourceId: assetId,
    platformScope: params.platformScope ?? 'ALL',
    locale: params.locale,
  });
}

/** Upload a release artifact via sdkwork-drive, then attach it to the release. */
export async function uploadReleaseArtifact(params: UploadReleaseArtifactParams) {
  const drive = getDriveClient();
  const uploadResult = await drive.uploader.uploadArchive({
    file: params.file,
    appResourceType: APPSTORE_H5_RELEASE_ARTIFACT_UPLOAD.appResourceType,
    appResourceId: params.releaseId,
    uploadProfileCode: APPSTORE_H5_RELEASE_ARTIFACT_UPLOAD.uploadProfileCode,
    scene: APPSTORE_H5_RELEASE_ARTIFACT_UPLOAD.scene,
    source: APPSTORE_H5_RELEASE_ARTIFACT_UPLOAD.source,
    onProgress: params.onProgress,
  });

  const { uploadItem } = uploadResult;
  const checksumSha256 =
    uploadItem.checksumSha256Hex || (await sha256ChecksumHex(params.file));

  const store = getStoreClient();
  return store.releases.attachArtifact(params.releaseId, {
    platform: params.platform,
    architecture: params.architecture,
    packageFormat: params.packageFormat,
    driveNodeId: uploadItem.nodeId,
    checksumSha256,
    fileSizeBytes: uploadItem.contentLength || String(params.file.size),
    contentType: uploadItem.contentType || params.file.type || 'application/octet-stream',
  });
}
