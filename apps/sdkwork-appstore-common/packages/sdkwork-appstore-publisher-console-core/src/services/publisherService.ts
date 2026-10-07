import type { AppStoreClient } from '@sdkwork/appstore-app-sdk';

let clientAccessor: (() => AppStoreClient) | null = null;

/**
 * Configure the publisher service with an AppStoreClient accessor.
 * The app root must call this during bootstrap before using any
 * publisher console service or hook.
 */
export function configurePublisherClient(accessor: () => AppStoreClient): void {
  clientAccessor = accessor;
}

function getClient(): AppStoreClient {
  if (!clientAccessor) {
    throw new Error(
      'Publisher service is not configured. Call configurePublisherClient() during app bootstrap.',
    );
  }
  return clientAccessor();
}

export const publisherService = {
  getMe: () => getClient().publishers.getMe(),
  listMyListings: () => getClient().publishers.listMyListings(),
  listMembers: (publisherId: string) => getClient().publishers.listMembers(publisherId),
  inviteMember: (
    publisherId: string,
    data: Parameters<AppStoreClient['publishers']['inviteMember']>[1],
  ) => getClient().publishers.inviteMember(publisherId, data),
  createPublisher: (
    data: Parameters<AppStoreClient['publishers']['create']>[0],
  ) => getClient().publishers.create(data),
  bootstrapApp: (data: Parameters<AppStoreClient['publishers']['bootstrapApp']>[0]) =>
    getClient().publishers.bootstrapApp(data),
  updatePublisher: (
    publisherId: string,
    data: Parameters<AppStoreClient['publishers']['update']>[1],
  ) => getClient().publishers.update(publisherId, data),
  getListing: (listingId: string) => getClient().listings.get(listingId),
  updateListing: (
    listingId: string,
    data: Parameters<AppStoreClient['listings']['update']>[1],
  ) => getClient().listings.update(listingId, data),
  listListingMedia: (listingId: string) => getClient().listings.listMedia(listingId),
  listListingReleases: (listingId: string) => getClient().listings.listReleases(listingId),
  upsertLocalization: (
    listingId: string,
    locale: string,
    data: Parameters<AppStoreClient['listings']['upsertLocalization']>[2],
  ) => getClient().listings.upsertLocalization(listingId, locale, data),
  createRelease: (
    listingId: string,
    data: Parameters<AppStoreClient['releases']['create']>[1],
  ) => getClient().releases.create(listingId, data),
  createSubmission: (
    listingId: string,
    data: Parameters<AppStoreClient['listings']['createSubmission']>[1],
  ) => getClient().listings.createSubmission(listingId, data),
  updateReleaseRollout: (
    releaseId: string,
    data: Parameters<AppStoreClient['releases']['updateRollout']>[1],
  ) => getClient().releases.updateRollout(releaseId, data),
  upsertReleaseNotes: (
    releaseId: string,
    locale: string,
    data: Parameters<AppStoreClient['releases']['upsertNotes']>[2],
  ) => getClient().releases.upsertNotes(releaseId, locale, data),
  retireRelease: (releaseId: string) => getClient().releases.retire(releaseId),
};
