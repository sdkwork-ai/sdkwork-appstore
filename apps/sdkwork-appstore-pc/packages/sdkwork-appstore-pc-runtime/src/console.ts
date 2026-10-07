import type { AppStoreClient } from '@sdkwork/appstore-pc-core';
import {
  configureConsoleServicePort,
  type ConsoleCategoryOption,
  type ConsoleServicePort,
  type ManagedApp,
  type ManagedAppDetail,
  type PublisherMember,
  type PublisherProfile,
  type ListingMediaItem,
  type ReleaseHistoryEntry,
  type ReleaseItem,
} from '@sdkwork/appstore-pc-core';

export function configureAppstorePcConsole(client: AppStoreClient): void {
  configureConsoleServicePort(createConsoleServicePort(client));
}

export function createConsoleServicePort(client: AppStoreClient): ConsoleServicePort {
  return {
    async getManagedApps(): Promise<ManagedApp[]> {
      const response = await client.publishers.listMyListings({ limit: 200 });
      const listings = readPageItems<Record<string, unknown>>(response as unknown);
      const results = await Promise.all(
        listings.map(async (listing) => {
          const listingId = readString(listing, 'id');
          const releases = await client.listings
            .listReleases(listingId)
            .catch(() => undefined);
          const latest = releases ? readPageItems<Record<string, unknown>>(releases)[0] : undefined;
          return {
            id: listingId,
            name: readString(listing, 'displayName', 'display_name'),
            version: readString(latest, 'versionName', 'version_name') || '1.0.0',
            status: mapListingStatus(readString(listing, 'listingStatus', 'listing_status')),
            downloads: formatCount(readNumber(listing, 'downloadCount', 'download_count') ?? 0),
            updatedAt: formatDate(readString(listing, 'updatedAt', 'updated_at')),
          } satisfies ManagedApp;
        }),
      );
      return results.filter((app) => app.id);
    },

    async listCategories(): Promise<ConsoleCategoryOption[]> {
      const response = await client.catalog.listCategories({ locale: 'zh-CN', limit: 200 });
      const items = readPageItems<Record<string, unknown>>(response as unknown);
      return items
        .map((item) => {
          const categoryId = readString(item, 'id');
          if (!categoryId) {
            return undefined;
          }
          const localizations = Array.isArray(item.localizations) ? item.localizations : [];
          const preferred = localizations.find(
            (entry) => readString(entry as Record<string, unknown>, 'locale') === 'zh-CN',
          ) ?? localizations[0];
          return {
            categoryId,
            categoryCode: readString(item, 'categoryCode', 'category_code') || categoryId,
            displayName:
              readString(preferred as Record<string, unknown> | undefined, 'displayName', 'display_name')
              || readString(item, 'displayName', 'display_name')
              || categoryId,
          } satisfies ConsoleCategoryOption;
        })
        .filter((option): option is ConsoleCategoryOption => option !== undefined);
    },

    async publishApp(appData: {
      name: string;
      categoryId?: string;
      version?: string;
      description?: string;
      appType?: string;
      pricingModel?: string;
    }): Promise<ManagedApp> {
      // The bootstrap mints the app and draft listing; the follow-up calls
      // persist the form fields the publisher entered instead of dropping
      // them, so what the page shows matches what the backend stores.
      const slug = `${slugify(appData.name)}-${Date.now().toString(36)}`;
      const pricingModel = appData.pricingModel?.trim().toLocaleUpperCase();
      const result = await client.publishers.bootstrapApp({
        appKey: `dev-${slug}`,
        displayName: appData.name,
        defaultLocale: 'zh-CN',
        appType: appData.appType ?? 'APP',
        listingSlug: `dev-${slug}`,
        ...(pricingModel === 'FREEMIUM' || pricingModel === 'PAID'
          ? { pricingModel }
          : {}),
      });
      const listing = readObject(result as unknown as Record<string, unknown>, 'listing');
      const listingId = readString(listing, 'id');

      if (listingId) {
        const description = appData.description?.trim();
        if (description) {
          await client.listings
            .upsertLocalization(listingId, 'zh-CN', {
              displayName: appData.name,
              shortDescription: description.slice(0, 120),
              fullDescription: description,
            })
            .catch(() => undefined);
        }
        const categoryId = appData.categoryId?.trim();
        if (categoryId) {
          await client.listings
            .bindCategories(listingId, {
              categoryIds: [categoryId],
              primaryCategoryId: categoryId,
            })
            .catch(() => undefined);
        }
        const version = appData.version?.trim();
        if (version) {
          // `production` is the seeded stable channel; the quick-publish form
          // stages the initial version there as a draft release.
          await client.releases
            .create(listingId, {
              channelCode: 'production',
              versionName: version,
              versionCode: version,
            })
            .catch(() => undefined);
        }
      }

      return {
        id: listingId || Date.now().toString(),
        name: readString(listing, 'displayName', 'display_name') || appData.name,
        version: appData.version?.trim() || '1.0.0',
        status: mapListingStatus(
          readString(listing, 'listingStatus', 'listing_status') || 'DRAFT',
        ),
        downloads: '0',
        updatedAt: new Date().toISOString().slice(0, 10),
      };
    },

    async getPublisherProfile(): Promise<PublisherProfile | undefined> {
      const me = await client.publishers.getMe().catch(() => undefined);
      const row = me as unknown as Record<string, unknown> | undefined;
      if (!row || !readString(row, 'id')) {
        return undefined;
      }
      return {
        id: readString(row, 'id'),
        displayName: readString(row, 'displayName', 'display_name'),
        legalName: readString(row, 'legalName', 'legal_name'),
        supportEmail: readString(row, 'supportEmail', 'support_email'),
        websiteUrl: readString(row, 'websiteUrl', 'website_url'),
        verificationStatus: readString(row, 'verificationStatus', 'verification_status'),
        memberRole: readString(row, 'memberRole', 'member_role'),
      };
    },

    async registerPublisher(data: {
      displayName: string;
      legalName?: string;
      supportEmail?: string;
      websiteUrl?: string;
    }): Promise<PublisherProfile> {
      const result = await client.publishers.create({
        displayName: data.displayName,
        legalName: data.legalName,
        supportEmail: data.supportEmail,
        websiteUrl: data.websiteUrl,
        publisherType: 'INDIVIDUAL',
      });
      const row = result as unknown as Record<string, unknown>;
      return {
        id: readString(row, 'id'),
        displayName: readString(row, 'displayName', 'display_name') || data.displayName,
        legalName: readString(row, 'legalName', 'legal_name'),
        supportEmail: readString(row, 'supportEmail', 'support_email'),
        websiteUrl: readString(row, 'websiteUrl', 'website_url'),
        verificationStatus: readString(row, 'verificationStatus', 'verification_status'),
      };
    },

    async updatePublisherProfile(data: {
      displayName?: string;
      supportEmail?: string;
      websiteUrl?: string;
    }): Promise<PublisherProfile> {
      const me = await client.publishers.getMe();
      const row = me as unknown as Record<string, unknown>;
      const publisherId = readString(row, 'id');
      if (!publisherId) {
        throw new Error('No publisher profile is linked to this account.');
      }
      const result = await client.publishers.update(publisherId, {
        displayName: data.displayName,
        supportEmail: data.supportEmail,
        websiteUrl: data.websiteUrl,
      });
      const updated = result as unknown as Record<string, unknown>;
      return {
        id: readString(updated, 'id') || publisherId,
        displayName:
          readString(updated, 'displayName', 'display_name') ||
          readString(row, 'displayName', 'display_name'),
        legalName: readString(updated, 'legalName', 'legal_name'),
        supportEmail: readString(updated, 'supportEmail', 'support_email'),
        websiteUrl: readString(updated, 'websiteUrl', 'website_url'),
        verificationStatus: readString(
          updated,
          'verificationStatus',
          'verification_status',
        ),
      };
    },

    async submitVerification(data: {
      verificationType: string;
      evidenceMediaResourceId?: string;
    }): Promise<boolean> {
      const me = await client.publishers.getMe();
      const publisherId = readString(me as unknown as Record<string, unknown>, 'id');
      if (!publisherId) {
        return false;
      }
      await client.publishers.submitVerification(publisherId, {
        verificationType: data.verificationType,
        evidenceMediaResourceId: data.evidenceMediaResourceId,
      });
      return true;
    },

    async getListingById(id: string): Promise<ManagedAppDetail | undefined> {
      const listing = await client.listings.get(id).catch(() => undefined);
      const row = listing as unknown as Record<string, unknown> | undefined;
      if (!row || !readString(row, 'id')) {
        return undefined;
      }
      const releases = await client.listings.listReleases(id).catch(() => undefined);
      const latest = releases ? readPageItems<Record<string, unknown>>(releases)[0] : undefined;
      const releaseCount = releases ? readPageItems<Record<string, unknown>>(releases).length : 0;
      return {
        id: readString(row, 'id'),
        name: readString(row, 'displayName', 'display_name'),
        version: readString(latest, 'versionName', 'version_name') || '1.0.0',
        status: mapListingStatus(readString(row, 'listingStatus', 'listing_status')),
        downloads: formatCount(readNumber(row, 'downloadCount', 'download_count') ?? 0),
        updatedAt: formatDate(readString(row, 'updatedAt', 'updated_at')),
        slug: readString(row, 'listingSlug', 'listing_slug'),
        description: readString(row, 'description'),
        category: readString(row, 'category', 'categoryName'),
        pricingModel: readString(row, 'pricingModel', 'pricing_model') || 'FREE',
        appKey: readString(row, 'appKey', 'app_key'),
        listingStatus: readString(row, 'listingStatus', 'listing_status'),
        releaseCount,
      };
    },

    async updateListing(id: string, patch: {
      pricingModel?: string;
      officialWebsiteUrl?: string;
      supportUrl?: string;
      privacyPolicyUrl?: string;
    }): Promise<void> {
      await client.listings.update(id, patch);
    },

    async getReleases(listingId: string): Promise<ReleaseItem[]> {
      const releases = await client.listings.listReleases(listingId).catch(() => undefined);
      if (!releases) {
        return [];
      }
      return readPageItems<Record<string, unknown>>(releases).map((item) => ({
        id: readString(item, 'id'),
        versionName: readString(item, 'versionName', 'version_name'),
        versionCode: readString(item, 'versionCode', 'version_code'),
        buildNumber: readString(item, 'buildNumber', 'build_number'),
        channelCode: readString(item, 'channelCode', 'channel_code'),
        status: readString(item, 'releaseStatus', 'release_status'),
        rolloutStrategy: readString(item, 'rolloutStrategy', 'rollout_strategy'),
        targetPercentage: readNumber(item, 'targetPercentage', 'target_percentage'),
        createdAt: formatDate(readString(item, 'createdAt', 'created_at')),
        publishedAt: formatDate(readString(item, 'publishedAt', 'published_at')),
      })).filter((release) => release.id);
    },

    async createRelease(listingId: string, data: {
      channelCode: string;
      versionName: string;
      versionCode: string;
      buildNumber?: string;
    }): Promise<ReleaseItem> {
      const result = await client.releases.create(listingId, {
        channelCode: data.channelCode,
        versionName: data.versionName,
        versionCode: data.versionCode,
        buildNumber: data.buildNumber,
        minimumOsVersion: undefined,
      });
      const row = result as unknown as Record<string, unknown>;
      return {
        id: readString(row, 'id') || Date.now().toString(),
        versionName: readString(row, 'versionName', 'version_name') || data.versionName,
        versionCode: readString(row, 'versionCode', 'version_code') || data.versionCode,
        buildNumber: readString(row, 'buildNumber', 'build_number'),
        channelCode: readString(row, 'channelCode', 'channel_code') || data.channelCode,
        status: readString(row, 'releaseStatus', 'release_status') || 'DRAFT',
        createdAt: formatDate(readString(row, 'createdAt', 'created_at')),
        publishedAt: formatDate(readString(row, 'publishedAt', 'published_at')),
      };
    },

    async updateReleaseRollout(releaseId: string, targetPercentage: number, strategy: 'FULL' | 'STAGED' | 'PAUSE' = 'STAGED'): Promise<void> {
      await client.releases.updateRollout(releaseId, {
        rolloutStrategy: strategy,
        targetPercentage,
      });
    },

    async updateReleaseNotes(releaseId: string, locale: string, releaseNotes: string): Promise<void> {
      await client.releases.upsertNotes(releaseId, locale, { releaseNotes });
    },

    async retireRelease(releaseId: string): Promise<void> {
      await client.releases.retire(releaseId);
    },

    async listListingReleaseHistory(listingId: string): Promise<ReleaseHistoryEntry[]> {
      const page = await client.listings.listReleaseHistory(listingId, { limit: 50 });
      return (page.items as unknown as Record<string, unknown>[]).map((row) => ({
        id: readString(row, 'id'),
        versionName: readString(row, 'versionName', 'version_name'),
        versionCode: readString(row, 'versionCode', 'version_code') || undefined,
        channelCode: readString(row, 'channelId', 'channel_id', 'channelCode') || undefined,
        releaseStatus: readString(row, 'releaseStatus', 'release_status') || 'unknown',
        submittedAt: readString(row, 'submittedAt', 'submitted_at') || undefined,
        approvedAt: readString(row, 'approvedAt', 'approved_at') || undefined,
        publishedAt: readString(row, 'publishedAt', 'published_at') || undefined,
        retiredAt: readString(row, 'retiredAt', 'retired_at') || undefined,
      }));
    },

    async deleteListingMedia(listingId: string, mediaId: string): Promise<void> {
      await client.listings.removeMedia(listingId, mediaId);
    },

    async listListingMedia(listingId: string): Promise<ListingMediaItem[]> {
      const page = await client.listings.listMedia(listingId);
      const rows = (page as unknown as { items?: unknown }).items ?? page;
      return (rows as unknown as Record<string, unknown>[]).map((row) => ({
        id: readString(row, 'id'),
        mediaRole: readString(row, 'mediaRole', 'media_role') || 'UNKNOWN',
        mediaResourceId: readString(row, 'mediaResourceId', 'media_resource_id'),
        sortWeight: readNumber(row, 'sortWeight', 'sort_order', 'sortOrder'),
      }));
    },

    async submitListingForReview(listingId: string, releaseId?: string): Promise<boolean> {
      await client.listings.createSubmission(listingId, {
        submissionType: releaseId ? 'RELEASE' : 'INITIAL',
        releaseId,
      });
      return true;
    },

    async listMembers(publisherId: string): Promise<PublisherMember[]> {
      const members = await client.publishers.listMembers(publisherId).catch(() => undefined);
      if (!members) {
        return [];
      }
      return readPageItems<Record<string, unknown>>(members as unknown).map((item) => ({
        id: readString(item, 'id'),
        userId: readString(item, 'userId', 'user_id'),
        role: readString(item, 'memberRole', 'member_role') || 'MEMBER',
        joinedAt: formatDate(readString(item, 'joinedAt', 'joined_at')),
      })).filter((member) => member.id);
    },

    async inviteMember(publisherId: string, data: { userId: string; role: string }): Promise<boolean> {
      await client.publishers.inviteMember(publisherId, {
        // `inviteeUserId`: the platform context-selector guard rejects a
        // client-supplied `userId` body field as ambient subject selection.
        inviteeUserId: data.userId,
        memberRole: data.role,
      });
      return true;
    },
  };
}

function mapListingStatus(status: string): ManagedApp['status'] {
  switch (status.toLocaleUpperCase()) {
    case 'PUBLISHED':
      return '已上架';
    case 'SUBMITTED':
    case 'IN_REVIEW':
      return '审核中';
    case 'DRAFT':
      // A draft has not entered review yet; labeling it 已提交上架 misleads
      // publishers into thinking the moderation round-trip already happened.
      return '草稿';
    case 'APPROVED':
      return '已通过';
    case 'DELISTED':
    case 'SUSPENDED':
      return '已下架';
    case 'REJECTED':
      return '未通过';
    default:
      return '草稿';
  }
}

function readPageItems<T>(value: unknown): T[] {
  if (!value || typeof value !== 'object' || !Array.isArray((value as Record<string, unknown>).items)) {
    return [];
  }
  return (value as Record<string, unknown>).items as T[];
}

function readObject(record: Record<string, unknown> | undefined, ...keys: string[]): Record<string, unknown> {
  if (!record) {
    return {};
  }
  for (const key of keys) {
    const value = record[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }
  return {};
}

function readString(record: Record<string, unknown> | undefined, ...keys: string[]): string {
  if (!record) {
    return '';
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function readNumber(record: Record<string, unknown> | undefined, ...keys: string[]): number | undefined {
  if (!record) {
    return undefined;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function slugify(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'app';
}

function formatCount(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`;
  }
  return String(value);
}

function formatDate(value: string): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}
