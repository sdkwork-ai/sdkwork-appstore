import { useCallback, useEffect, useRef, useState } from 'react';
import {
  isAppStoreApiError,
  type AppStoreApiError,
} from '@sdkwork/appstore-app-sdk';
import {
  beginPaidListingCheckout,
  type PaidCheckoutResult,
} from '@sdkwork/appstore-listing-acquire-core';
import { getStoreClient } from '@/services/storeClient';
import { getCommentsClient, getNotificationService } from '@/bootstrap/sdkClients';
import { getDriveClient } from '@/services/driveClient';
import { getCommerceDomainsClient } from '@/services/commerceDomainsClient';

export interface UseApiOptions {
  immediate?: boolean;
  /** When the key changes the hook refetches automatically (default: mount only). */
  refreshKey?: string;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
  execute: () => Promise<void>;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions = {},
): UseApiResult<T> {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(options.immediate !== false);
  const [error, setError] = useState<unknown>(null);
  const requestSeq = useRef(0);

  const execute = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (seq === requestSeq.current) {
        setData(result);
      }
    } catch (err) {
      if (seq === requestSeq.current) {
        setError(err);
      }
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (options.immediate !== false) {
      void execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.refreshKey]);

  return { data, loading, error, execute };
}

/** Search catalog listings by query. */
export function useSearch(q: string) {
  return useApi(
    async () => {
      const page = await getStoreClient().catalog.searchListings({ q, limit: 20 });
      return { items: page.items };
    },
    { refreshKey: q },
  );
}

/** Current user's installed library. */
export function useLibrary() {
  return useApi(async () => {
    const page = await getStoreClient().library.listItems({ limit: 200 });
    return { items: page.items };
  });
}

/** Current user's wishlist. */
export function useWishlist() {
  return useApi(async () => {
    const page = await getStoreClient().wishlist.listItems();
    return { items: page.items };
  });
}

/** Library updates for the current user's installed apps. */
export function useLibraryUpdates() {
  return useApi(async () => {
    const store = getStoreClient();
    const libraryItems = await store.library.listItems({ limit: 200 });
    // The check contract is per-item (appKey + platform + installed version),
    // mirroring the server-side numeric version comparison.
    const items = (libraryItems.items ?? []).map((row: any) => ({
      appKey: String(row.appKey ?? ''),
      platform: String(row.platform ?? 'h5'),
      installedVersionCode: String(row.installedVersionCode ?? '0'),
    }));
    const updates =
      items.length > 0 ? await store.library.checkUpdates({ items }) : { items: [] };
    return { libraryItems: libraryItems.items, updates: updates.items };
  });
}

/** Appstore notifications for the current user (empty when anonymous). */
export function useNotifications(authed: boolean) {
  return useApi(
    async () => {
      if (!authed) {
        return { items: [] };
      }
      const result = await getNotificationService().list({ page: 1, pageSize: 50 });
      return { items: result.items };
    },
    { refreshKey: authed ? 'authed' : 'anon' },
  );
}

/** Editor home feed. */
export function useHomeFeed() {
  return useApi(async () => getStoreClient().catalog.getHome());
}

/** Storefront categories. */
export function useCategories(limit: number) {
  return useApi(async () => {
    const page = await getStoreClient().catalog.listCategories({ limit });
    return { items: page.items };
  });
}

/** Personalized recommendations. */
export function useRecommendations(limit: number) {
  return useApi(async () => {
    const page = await getStoreClient().catalog.listRecommendations({ limit });
    return { items: page.items };
  });
}

/** Editorial collections rail (discover). */
export function useCollections(limit: number) {
  return useApi(async () => {
    const page = await getStoreClient().catalog.listCollections({ limit });
    return { items: page.items };
  });
}

/** Active store events rail (discover). */
export function useActiveEvents(limit: number) {
  return useApi(async () => {
    const page = await getStoreClient().catalog.listEvents({ status: 'active', limit });
    return { items: page.items };
  });
}

/** Recently updated listings rail (discover). */
export function useRecentlyUpdated(limit: number) {
  return useApi(async () => {
    const page = await getStoreClient().catalog.listRecentlyUpdated({ limit });
    return { items: page.items };
  });
}

/** Public listing detail by slug (falls back to a search when not an id). */
export function usePublicListing(slug: string) {
  return useApi(
    async () => {
      if (!slug) {
        return null;
      }
      try {
        return await getStoreClient().listings.get(slug);
      } catch (err) {
        if (isAppStoreApiError(err) && err.status === 404) {
          const page = await getStoreClient().catalog.searchListings({ q: slug, limit: 1 });
          return page.items[0] ?? null;
        }
        throw err;
      }
    },
    { refreshKey: slug },
  );
}

/** Similar listings for a listing detail page. */
export function useListingSimilar(listingId: string, limit: number) {
  return useApi(
    async () => {
      if (!listingId) {
        return { items: [] };
      }
      const page = await getStoreClient().listings.listSimilar(listingId, { limit });
      return { items: page.items };
    },
    { refreshKey: listingId },
  );
}

/** Reviews for a listing's comments thread. */
export function useListingReviews(commentsThreadId?: string) {
  return useApi(
    async () => {
      if (!commentsThreadId) {
        return { items: [] };
      }
      const response = await getCommentsClient().comments.comments.list(commentsThreadId, {
        pageSize: 50,
      });
      return { items: response.items };
    },
    { refreshKey: commentsThreadId ?? 'none' },
  );
}

/** Whether the current user owns (installed) the listing. */
export function useListingOwnership(listingId: string, authed: boolean) {
  return useApi(
    async () => {
      if (!authed || !listingId) {
        return null;
      }
      // Page through the library (bounded) so ownership stays correct beyond
      // the first 200 rows.
      let cursor: string | undefined;
      for (let page = 0; page < 5; page++) {
        const result = await getStoreClient().library.listItems({
          limit: 200,
          cursor,
        });
        const items = result.items ?? [];
        if (items.some((item) => item.listingId === listingId)) {
          return true;
        }
        cursor = result.pageInfo?.nextCursor ?? undefined;
        if (!cursor) {
          return false;
        }
      }
      return false;
    },
    { refreshKey: `${authed}:${listingId}` },
  );
}

/** Normalize any error shape into a user-facing message. */
export function formatApiError(error: unknown): string {
  if (error == null) {
    return '操作失败，请稍后重试。';
  }
  if (isAppStoreApiError(error)) {
    return error.detail || error.title || `请求失败（${error.status}）`;
  }
  if (
    error instanceof TypeError ||
    (error instanceof Error && /failed to fetch|networkerror|load failed/i.test(error.message))
  ) {
    // fetch 网络层失败（DNS/拒连/断网），原始 message 是浏览器英文细节；
    // SDK 包装后错误类型可能变为普通 Error，按 message 特征识别。
    return '网络连接失败，请检查网络后重试。';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  const message = String(error);
  return message || '操作失败，请稍后重试。';
}

export interface ResolveArtifactDownloadParams {
  artifactId: string;
  appKey?: string;
}

/** Resolve a signed download URL for a release artifact via sdkwork-drive. */
export async function resolveArtifactDownload(
  params: ResolveArtifactDownloadParams,
): Promise<string> {
  const drive = getDriveClient();
  const packageResult = await drive.drive.downloadPackages.create({
    nodeIds: [params.artifactId],
    packageName: params.appKey ? `${params.appKey}-artifact` : undefined,
  });
  if (!packageResult.downloadUrl) {
    throw new Error('下载包尚未就绪，请稍后重试。');
  }
  return packageResult.downloadUrl;
}

export interface InstallListingAndDownloadParams {
  listingId: string;
  platform: string;
  appKey?: string;
  /** Already owned: refresh the latest download instead of re-installing
   *  (the backend rejects duplicate installs). */
  skipInstall?: boolean;
}

export interface InstallListingAndDownloadResult {
  downloadUrl?: string;
}

/** Install a listing, then resolve a download URL for its current artifact. */
export async function installListingAndDownload(
  params: InstallListingAndDownloadParams,
): Promise<InstallListingAndDownloadResult> {
  const store = getStoreClient();
  let appKey = params.appKey ?? '';
  let installedVersionCode = '0';
  if (params.skipInstall) {
    // Owned listing: resolve the latest artifact directly; the check payload
    // uses a zero base version so the newest published release is returned.
    appKey = appKey || params.listingId;
  } else {
    const result = await store.library.install({
      listingId: params.listingId,
      platform: params.platform,
    });
    appKey = appKey || result.libraryItem.appKey;
    installedVersionCode = result.libraryItem.installedVersionCode ?? '0';
  }

  const check = await store.library.checkUpdates({
    items: [
      {
        appKey,
        platform: params.platform,
        installedVersionCode,
      },
    ],
  });
  const update = check.items.find((item) => item.appKey === appKey && item.artifactId);
  if (!update?.artifactId) {
    return { downloadUrl: undefined };
  }
  const downloadUrl = await resolveArtifactDownload({
    artifactId: update.artifactId,
    appKey,
  });
  return { downloadUrl };
}

export interface PurchaseListingViaCommerceParams {
  commerceProductId?: string;
}

/** Begin a paid checkout via the commerce domain surfaces. */
export function purchaseListingViaCommerce(
  params: PurchaseListingViaCommerceParams,
): Promise<PaidCheckoutResult> {
  return beginPaidListingCheckout(getCommerceDomainsClient, {
    commerceProductId: params.commerceProductId,
  });
}

export type { AppStoreApiError };


/** Trending search terms (catalog search domain). */
export function useTrendingSearches(enabled: boolean) {
  return useApi(
    async () => {
      if (!enabled) return { items: [] };
      const page = await getStoreClient().catalog.listTrendingSearchTerms({ locale: 'zh-CN', limit: 10 });
      return { items: (page?.items ?? []).map((r: any) => r.term ?? r.keyword ?? '') .filter(Boolean) };
    },
    { immediate: enabled },
  );
}

/** Search suggestions for a query prefix. */
export function useSearchSuggestions(query: string) {
  return useApi(
    async () => {
      if (!query.trim()) return { items: [] };
      const page = await getStoreClient().catalog.listSearchSuggestions({ q: query.trim() });
      return { items: (page?.items ?? []).map((r: any) => r.term ?? r.keyword ?? r.suggestion ?? '').filter(Boolean) };
    },
    { refreshKey: query },
  );
}

/** User's search history (catalog search domain). */
export function useSearchHistory(enabled: boolean) {
  return useApi(
    async () => {
      if (!enabled) return { items: [] };
      const page = await getStoreClient().catalog.listSearchHistory({ limit: 10 });
      return { items: (page?.items ?? []).map((r: any) => r.term ?? r.query ?? '').filter(Boolean) };
    },
    { refreshKey: String(enabled) },
  );
}
