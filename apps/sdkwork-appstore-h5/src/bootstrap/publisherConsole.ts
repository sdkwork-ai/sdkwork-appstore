import {
  configurePublisherClient,
  configurePublisherOrganizationResolver,
  configurePublisherUploads,
} from '@sdkwork/appstore-publisher-console-core';
import { getStoreClient } from '@/services/storeClient';
import {
  attachListingMedia,
  createAppstoreListingImageService,
  uploadListingMedia,
  uploadReleaseArtifact,
} from '@/services/driveUpload';
import { getCurrentUser } from '@/bootstrap/iamRuntime';

/** Wire publisher console package with app-root SDK clients and Drive uploads. */
export function bootstrapPublisherConsole(): void {
  configurePublisherClient(() => getStoreClient());
  configurePublisherUploads({
    uploadListingMedia,
    uploadReleaseArtifact,
    createListingImageService: createAppstoreListingImageService,
    attachListingMedia,
  });
  configurePublisherOrganizationResolver(() => getCurrentUser()?.organizationId);
}
