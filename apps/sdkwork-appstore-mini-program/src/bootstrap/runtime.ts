import { createClient as createIamClient, type SdkworkAppClient as IamAppClient } from "@sdkwork/iam-app-sdk";
import { createTokenManager, type AuthTokenManager } from "@sdkwork/sdk-common";
import {
  getAppstoreAppSdkClient,
  syncAppSdkSessionTokens,
  clearAppSdkSession,
} from "@sdkwork/appstore-mp-core";
import { seedRuntimeEnvFromBundle } from "./runtimeBundle";
import { readRuntimeEnv } from "./environment";
import { installWxFetch } from "./wxRequestPolyfill";
import { createSdkClients } from "./sdkClients";
import { registerHostAdapters } from "./hostAdapters";
import { createRoutes } from "./routes";
import type { AppstoreAppClient } from "@sdkwork/appstore-mp-core";

/**
 * Mini program bootstrap: fetch transport installation, environment
 * selection, host adapters, SDK client construction, route assembly, and the
 * capability page loaders consumed by the thin native pages. Mirrors the
 * Flutter and Harmony roots.
 *
 * The thin pages destructure `pageLoaders` / `auth` / `loadCurrentUser` from
 * this module at require time, so the singletons below are created at module
 * scope and each entrypoint lazily calls `ensureBootstrapped` — the first
 * loader invocation (or an explicit `bootstrapAppstoreMiniProgram` call)
 * installs the transport, seeds the runtime environment, restores the
 * persisted session, and constructs the SDK clients exactly once.
 *
 * `appApiBaseUrl` is forwarded into the runtime-env resolution, so a host that
 * already resolved a gateway origin can override the bundled profile value
 * without bypassing `resolveBaseUrl` (`ENVIRONMENT_SPEC.md` §6.3).
 */

/** Persisted IAM session projection shared by the pages and this bundle. */
export interface AppstoreMiniProgramIamSession {
  accessToken?: string;
  authToken?: string;
  refreshToken?: string;
  displayName?: string;
  userId?: string;
}

const SESSION_STORAGE_KEY = "sdkwork-appstore-mp-session";

let iamSession: AppstoreMiniProgramIamSession = {};
const iamSessionListeners: Array<(session: AppstoreMiniProgramIamSession) => void> = [];
const iamTokenManager: AuthTokenManager = createTokenManager();

function readSessionStorage(): AppstoreMiniProgramIamSession | null {
  try {
    const raw = wx.getStorageSync(SESSION_STORAGE_KEY) as unknown;
    if (raw && typeof raw === "object") {
      return raw as AppstoreMiniProgramIamSession;
    }
  } catch {
    // storage unavailable (pre-launch window); fall back to memory only
  }
  return null;
}

function writeSessionStorage(session: AppstoreMiniProgramIamSession): void {
  try {
    wx.setStorageSync(SESSION_STORAGE_KEY, session);
  } catch {
    // storage full/unavailable; the memory copy still holds the session
  }
}

/** Mirror a session change into the appstore SDK client and the IAM client. */
function projectSessionTokens(session: AppstoreMiniProgramIamSession): void {
  syncAppSdkSessionTokens(session);
  const authToken =
    typeof session.authToken === "string" && session.authToken.trim() !== ""
      ? session.authToken
      : undefined;
  const accessToken =
    typeof session.accessToken === "string" && session.accessToken.trim() !== ""
      ? session.accessToken
      : undefined;
  if (authToken) {
    iamTokenManager.setAuthToken(authToken);
  } else {
    iamTokenManager.clearAuthToken();
  }
  if (accessToken) {
    iamTokenManager.setAccessToken(accessToken);
  } else {
    iamTokenManager.clearAccessToken();
  }
}

/** Re-seed the session from wx storage; call once during bootstrap. */
export function loadPersistedIamSession(): AppstoreMiniProgramIamSession {
  const persisted = readSessionStorage();
  if (persisted) {
    iamSession = persisted;
    projectSessionTokens(persisted);
  }
  return { ...iamSession };
}

export function getIamSession(): AppstoreMiniProgramIamSession {
  return { ...iamSession };
}

export function setIamSession(next: AppstoreMiniProgramIamSession): void {
  iamSession = next;
  writeSessionStorage(next);
  projectSessionTokens(next);
  for (const listener of iamSessionListeners) {
    listener({ ...next });
  }
}

export function clearIamSession(): void {
  iamSession = {};
  try {
    wx.removeStorageSync(SESSION_STORAGE_KEY);
  } catch {
    // ignore; nothing persisted
  }
  iamTokenManager.clearTokens();
  clearAppSdkSession();
  for (const listener of iamSessionListeners) {
    listener({});
  }
}

export function onIamSessionChange(
  listener: (session: AppstoreMiniProgramIamSession) => void,
): void {
  iamSessionListeners.push(listener);
}

export function isIamAuthenticated(): boolean {
  const current = getIamSession();
  return Boolean(
    (current.authToken && current.authToken.length > 0) ||
      (current.accessToken && current.accessToken.length > 0),
  );
}

interface BootstrapOptions {
  appApiBaseUrl?: string;
  accessToken?: string;
  iamBaseUrl?: string;
}

interface AppstoreMiniProgramRuntime {
  readonly sdkClients: ReturnType<typeof createSdkClients>;
  readonly routes: ReturnType<typeof createRoutes>;
  readonly iamClient: IamAppClient;
}

let bootstrapOptions: BootstrapOptions = {};
let runtime: AppstoreMiniProgramRuntime | null = null;

/**
 * Idempotent bootstrap. Every lazy entrypoint (page loaders, auth loaders)
 * calls this, so page-layer module loading order can never race the
 * transport, environment, session restore, or SDK client construction.
 */
function ensureBootstrapped(options: BootstrapOptions = bootstrapOptions): AppstoreMiniProgramRuntime {
  if (runtime) {
    return runtime;
  }
  installWxFetch();
  seedRuntimeEnvFromBundle({ appApiBaseUrl: options.appApiBaseUrl });
  registerHostAdapters();
  loadPersistedIamSession();
  const sdkClients = createSdkClients(options.accessToken);
  const routes = createRoutes();
  const iamBaseUrl =
    options.iamBaseUrl ?? options.appApiBaseUrl ?? readRuntimeEnv().appstoreAppApiBaseUrl;
  const iamClient = createIamClient({
    baseUrl: iamBaseUrl,
    platform: "mini-program",
    tokenManager: iamTokenManager,
  });
  runtime = { sdkClients, routes, iamClient };
  return runtime;
}

export function bootstrapAppstoreMiniProgram(options: BootstrapOptions = {}) {
  bootstrapOptions = { ...options };
  const state = ensureBootstrapped(options);
  return {
    sdkClients: state.sdkClients,
    routes: state.routes,
    pageLoaders,
    auth,
  };
}

function requireAppClient(): AppstoreAppClient {
  ensureBootstrapped();
  return getAppstoreAppSdkClient();
}

function requireIamClient(): IamAppClient {
  const state = ensureBootstrapped();
  return state.iamClient;
}

type ListingRow = {
  id: string;
  name: string;
  developer: string;
  rating: number;
};

/** Describe a pending update for the shared list template's subtitle slot. */
function describeUpdate(update: { latestVersionName?: string; fileSizeBytes?: string }): string {
  const parts: string[] = [];
  const version =
    typeof update.latestVersionName === "string" ? update.latestVersionName.trim() : "";
  if (version !== "") {
    parts.push(`v${version.replace(/^v/i, "")}`);
  }
  const sizeBytes = Number(update.fileSizeBytes ?? 0);
  if (Number.isFinite(sizeBytes) && sizeBytes > 0) {
    parts.push(`${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`);
  }
  return parts.join(" · ");
}

const PUBLISHER_STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  submitted: "待审核",
  in_review: "审核中",
  pending_review: "待审核",
  approved: "审核通过",
  published: "已发布",
  rejected: "已拒绝",
  archived: "已下架",
  retired: "已退役",
};

function publisherStatusLabel(status: string): string {
  return PUBLISHER_STATUS_LABELS[status] ?? status;
}

/**
 * Capability page loaders over the composed app SDK client.
 *
 * Each loader returns plain, setData-ready records for the thin native
 * pages; mapping follows the PC/H5 root data flows (ranking id resolution,
 * id-set queries, order-preserving listings, localized catalog headers).
 */
function createPageLoaders(getClient: () => AppstoreAppClient) {
  function listingRows(items: unknown): ListingRow[] {
    if (!Array.isArray(items)) {
      return [];
    }
    return items.map((item) => {
      const row = (item ?? {}) as Record<string, unknown>;
      const id = [row.listingSlug, row.id]
        .find((value) => typeof value === 'string' && value.trim() !== '')
        ?.toString() ?? '';
      return {
        id,
        name: [row.displayName, row.title].find(
          (value) => typeof value === 'string' && value.trim() !== '',
        )?.toString() ?? '应用',
        developer: [row.developerName, row.publisherName]
          .find((value) => typeof value === 'string' && value.trim() !== '')
          ?.toString() ?? 'SDKWork',
        rating: Number(row.averageRating ?? row.rating ?? 0) || 0,
      };
    });
  }

  /**
   * Resolve raw listing references into display rows, keyed by both the
   * listing slug and the listing id, so domain rows carrying either shape
   * (library `listingId`, ranking snapshot ids) find their display card.
   */
  async function resolveRowsByListingIds(
    listingIds: string[],
  ): Promise<Map<string, ListingRow>> {
    const map = new Map<string, ListingRow>();
    const uniqueIds = Array.from(
      new Set(
        listingIds.filter(
          (id) => typeof id === "string" && id.trim() !== "",
        ),
      ),
    );
    const chunkSize = 50;
    for (let index = 0; index < uniqueIds.length; index += chunkSize) {
      const chunk = uniqueIds.slice(index, index + chunkSize);
      try {
        const page = await getClient().catalog.searchListings({
          ids: chunk,
          limit: chunk.length,
        });
        for (const item of page?.items ?? []) {
          const record = (item ?? {}) as unknown as Record<string, unknown>;
          const mapped = listingRows([record])[0];
          if (!mapped) {
            continue;
          }
          for (const key of [record.listingSlug, record.id]) {
            if (typeof key === "string" && key.trim() !== "" && !map.has(key)) {
              map.set(key, mapped);
            }
          }
        }
      } catch {
        // name resolution is best-effort; unresolved rows keep their raw ids
      }
    }
    return map;
  }

  function localizedField(
    record: Record<string, unknown>,
    field: 'displayName' | 'description',
    fallback: string,
  ): string {
    const localizations = Array.isArray(record.localizations)
      ? (record.localizations as Array<Record<string, unknown>>)
      : [];
    const preferred =
      localizations.find(
        (entry) => entry.locale === 'zh-CN' || entry.locale === 'zh_CN',
      ) ?? localizations[0];
    const value = preferred?.[field];
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
  }

  function entryListingIds(record: Record<string, unknown>): string[] {
    const items = Array.isArray(record.items) ? record.items : [];
    if (items.length > 0) {
      return items
        .map((entry) =>
          entry && typeof entry === 'object'
            ? String((entry as Record<string, unknown>).listingId ?? '')
            : '',
        )
        .filter((id) => id !== '');
    }
    return String(record.listingIds ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id !== '');
  }

  async function searchListings(params: {
    q?: string;
    categoryId?: string;
    ids?: string[];
    cursor?: string;
    limit?: number;
  }): Promise<{ rows: ListingRow[]; nextCursor?: string }> {
    const page = await getClient().catalog.searchListings(params);
    const pageInfo = (page ?? {}) as {
      pageInfo?: { nextCursor?: string | null };
    };
    return {
      rows: listingRows(page?.items),
      nextCursor: pageInfo.pageInfo?.nextCursor ?? undefined,
    };
  }

  function localizedRecordName(
    record: Record<string, unknown>,
    fallback: string,
  ): string {
    return localizedField(record, 'displayName', fallback);
  }

  return {
    /** Charts: ranking ids from the snapshot, resolved in rank order. */
    async charts(
      kind: string,
    ): Promise<Array<ListingRow & { rank: number }>> {
      const chart = (await getClient().catalog.getChart(
        kind === 'paid' ? 'paid' : 'free',
      )) as unknown as Record<string, unknown>;
      const rankingRaw = chart.rankingJson ?? chart.ranking;
      const rankedIds = (Array.isArray(rankingRaw) ? rankingRaw : [])
        .map((entry) =>
          entry && typeof entry === 'object'
            ? String((entry as Record<string, unknown>).listingId ?? '')
            : '',
        )
        .filter((id) => id !== '');
      const resolved = await resolveRowsByListingIds(rankedIds);
      const entries: Array<ListingRow & { rank: number }> = [];
      let rank = 0;
      for (const rankedId of rankedIds) {
        const row = resolved.get(rankedId);
        if (row) {
          rank += 1;
          entries.push({ ...row, rank });
        }
      }
      return entries;
    },

    /** Apps browse: keyword listing page with keyset pagination. */
    async apps(cursor?: string): Promise<{
      rows: ListingRow[];
      nextCursor?: string;
    }> {
      const page = await searchListings({ q: '应用', cursor, limit: 50 });
      return { rows: page.rows, nextCursor: page.nextCursor };
    },

    /** Games browse: keyword listing page with keyset pagination. */
    async games(cursor?: string): Promise<{
      rows: ListingRow[];
      nextCursor?: string;
    }> {
      const page = await searchListings({ q: '游戏', cursor, limit: 50 });
      return { rows: page.rows, nextCursor: page.nextCursor };
    },

    /**
     * Discover feed (home): hero picks, categories, active events, and
     * recommendations — the mini-program counterpart of the PC/H5 storefront.
     */
    async discover(): Promise<{
      heroApps: Array<{ id: string; name: string; developer: string }>;
      categories: Array<{ id: string; name: string }>;
      events: Array<{ id: string; title: string; endsAt: string }>;
      recommendations: ListingRow[];
    }> {
      const [home, categoriesPage, eventsPage, recommendationsPage] =
        await Promise.all([
          getClient().catalog.getHome().catch(() => undefined),
          getClient().catalog
            .listCategories({ limit: 10, locale: 'zh-CN' })
            .catch(() => undefined),
          getClient().catalog
            .listEvents({ status: 'active', limit: 6 })
            .catch(() => undefined),
          getClient().catalog
            .listRecommendations({ limit: 8 })
            .catch(() => undefined),
        ]);
      const homeData = (home ?? {}) as unknown as Record<string, unknown>;
      const featuredSlots = Array.isArray(homeData.featuredSlots)
        ? homeData.featuredSlots
        : [];
      const heroIds = featuredSlots
        .map((slot) =>
          slot && typeof slot === 'object'
            ? String((slot as Record<string, unknown>).listingId ?? '')
            : '',
        )
        .filter((id) => id !== '')
        .slice(0, 8);
      const heroPage = await searchListings({ ids: heroIds, limit: heroIds.length }).catch(
        () => ({ rows: [], nextCursor: undefined }),
      );
      const categoriesPageItems = ((categoriesPage?.items ?? []) as unknown) as Array<
        Record<string, unknown>
      >;
      const eventItems = (eventsPage?.items ?? []) as Array<Record<string, unknown>>;
      return {
        heroApps: heroPage.rows.map((row) => ({
          id: row.id,
          name: row.name,
          developer: row.developer,
        })),
        categories: categoriesPageItems.map((row) => ({
          id: String(row.id ?? ''),
          name: localizedRecordName(row, String(row.categoryCode ?? '分类')),
        })),
        events: eventItems.map((row) => {
          const localizations = Array.isArray(row.localizations)
            ? (row.localizations as Array<Record<string, unknown>>)
            : [];
          const preferred =
            localizations.find(
              (entry) => entry.locale === 'zh-CN' || entry.locale === 'zh_CN',
            ) ?? localizations[0];
          return {
            id: String(row.id ?? ''),
            title:
              String(preferred?.displayName ?? '') || String(row.title ?? '') || '限时活动',
            endsAt: String(row.endsAt ?? ''),
          };
        }),
        recommendations: listingRows(recommendationsPage?.items),
      };
    },

    /** Search results for a query. */
    async search(query: string): Promise<ListingRow[]> {
      const page = await searchListings({ q: query.trim(), limit: 50 });
      return page.rows;
    },

    /** Category detail: localized header plus its listing page. */
    async category(categoryId: string): Promise<{
      name: string;
      apps: ListingRow[];
    }> {
      const category = (await getClient().catalog.getCategory(categoryId)) as unknown as Record<
        string,
        unknown
      >;
      const name = localizedField(category, 'displayName', '分类');
      const apps = await searchListings({ categoryId, limit: 50 })
        .then((page) => page.rows)
        .catch(() => []);
      return { name, apps };
    },

    /** Collection detail: localized header plus id-ordered listings. */
    async collection(collectionId: string): Promise<{
      name: string;
      apps: ListingRow[];
    }> {
      const collection = (await getClient().catalog.getCollection(collectionId)) as unknown as Record<
        string,
        unknown
      >;
      const name = localizedField(collection, 'displayName', '精选合集');
      const ids = entryListingIds(collection);
      const apps =
        ids.length === 0
          ? []
          : (await searchListings({ ids, limit: ids.length })).rows;
      return { name, apps };
    },

    /** Event detail: localized header plus id-ordered participating listings. */
    async events(eventId: string): Promise<{
      name: string;
      apps: ListingRow[];
    }> {
      const event = (await getClient().catalog.getEvent(eventId)) as unknown as Record<
        string,
        unknown
      >;
      const name = localizedField(event, 'displayName', '限时活动');
      const ids = entryListingIds(event);
      const apps =
        ids.length === 0
          ? []
          : (await searchListings({ ids, limit: ids.length })).rows;
      return { name, apps };
    },

    /** App detail: header fields plus similar listings. */
    async appDetail(listingId: string): Promise<{
      id: string;
      name: string;
      developer: string;
      description: string;
      rating: number;
      whatsNew: string;
      similar: ListingRow[];
    }> {
      const listing = (await getClient().listings.get(listingId)) as unknown as Record<
        string,
        unknown
      >;
      const similarResponse = await getClient().listings
        .listSimilar(listingId, { limit: 6 })
        .catch(() => undefined);
      return {
        id: [listing.listingSlug, listing.id].find(
          (value) => typeof value === 'string' && value.trim() !== '',
        )?.toString() ?? listingId,
        name:
          [listing.displayName, listing.title].find(
            (value) => typeof value === 'string' && value.trim() !== '',
          )?.toString() ?? '应用',
        developer:
          [listing.developerName, listing.publisherName].find(
            (value) => typeof value === 'string' && value.trim() !== '',
          )?.toString() ?? 'SDKWork',
        description:
          typeof listing.description === 'string' ? listing.description : '',
        rating: Number(listing.averageRating ?? 0) || 0,
        whatsNew:
          typeof listing.whatsNewSummary === 'string' ? listing.whatsNewSummary : '',
        similar: listingRows(similarResponse?.items),
      };
    },

    /** App templates (catalog template domain, templateType filterable). */
    async templates(
      templateType: 'APP' | 'PLUGIN',
    ): Promise<
      Array<{ id: string; name: string; author: string; description: string; stars: number }>
    > {
      const page = await getClient().catalog.listTemplates({ templateType, limit: 50 });
      if (!Array.isArray(page?.items)) {
        return [];
      }
      return page.items.map((item) => {
        const row = (item ?? {}) as unknown as Record<string, unknown>;
        const metadata =
          row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
            ? (row.metadata as Record<string, unknown>)
            : {};
        return {
          id: String(row.id ?? ''),
          name: String(row.templateName ?? '模板'),
          author: String(metadata.authorName ?? 'SDKWork'),
          description: String(row.description ?? ''),
          stars: Number(row.starCount ?? 0) || 0,
        };
      });
    },
    /** Library: installed listings with resolved display names (auth required). */
    async library(): Promise<ListingRow[]> {
      const page = await getClient().library.listItems({ limit: 200 });
      const items = page?.items ?? [];
      const resolved = await resolveRowsByListingIds(
        items.map((row) => row.listingId),
      );
      return items.map((row) => {
        const card = resolved.get(row.listingId);
        return {
          id: row.listingId,
          name: card?.name ?? row.listingId,
          developer: card?.developer ?? '',
          rating: card?.rating ?? 0,
        };
      });
    },

    /** Wishlist: saved listings with resolved display names (auth required). */
    async wishlist(): Promise<ListingRow[]> {
      const page = await getClient().wishlist.listItems({ limit: 200 });
      const items = page?.items ?? [];
      const resolved = await resolveRowsByListingIds(
        items.map((row) => row.listingId),
      );
      return items.map((row) => {
        const card = resolved.get(row.listingId);
        return {
          id: row.listingId,
          name: card?.name ?? row.listingId,
          developer: card?.developer ?? '',
          rating: card?.rating ?? 0,
        };
      });
    },

    /** Updates: pending updates for installed library (library domain). */
    async updates(): Promise<ListingRow[]> {
      const installed = await getClient().library
        .listItems({ limit: 200 })
        .catch(() => undefined);
      const installRows = installed?.items ?? [];
      if (installRows.length === 0) {
        return [];
      }
      const items = installRows.map((row) => ({
        appKey: row.appKey ?? '',
        platform: 'mini-program',
        installedVersionCode: row.installedVersionCode ?? '0',
      }));
      const check = await getClient().library
        .checkUpdates({ items })
        .catch(() => undefined);
      const checkItems = check?.items ?? [];
      if (checkItems.length === 0) {
        return [];
      }
      const byAppKey = new Map(checkItems.map((row) => [row.appKey ?? '', row]));
      const pending = installRows.filter((item) =>
        byAppKey.has(item.appKey ?? ''),
      );
      const resolved = await resolveRowsByListingIds(
        pending.map((item) => item.listingId),
      );
      return pending.map((item) => {
        const update = byAppKey.get(item.appKey ?? '');
        const card = resolved.get(item.listingId);
        return {
          id: item.listingId,
          name: card?.name ?? item.listingId,
          developer: update ? describeUpdate(update) : '',
          rating: card?.rating ?? 0,
        };
      });
    },

    /** User store: custom categories + active shares (user_store domain, auth). */
    async userStore(): Promise<{
      categories: Array<{ id: string; name: string; itemCount: number }>;
      shares: Array<{ id: string; title: string; shareToken: string }>;
    }> {
      const [categories, shares] = await Promise.all([
        getClient().userStore.listCategories().catch(() => undefined),
        getClient().userStore.listShares().catch(() => undefined),
      ]);
      return {
        categories: (categories?.items ?? []).map((row) => ({
          id: row.id,
          name: row.name ?? '分类',
          itemCount: row.itemCount ?? 0,
        })),
        shares: (shares?.items ?? [])
          .filter((row) => (row.status ?? 'active') === 'active')
          .map((row) => ({
            id: row.id,
            title: row.title ?? '我的 Appstore',
            shareToken: row.shareToken ?? '',
          })),
      };
    },

    /** Create a custom category (user_store domain, auth required). */
    async createCategory(name: string): Promise<void> {
      await getClient().userStore.createCategory({ name });
    },

    /** Delete a custom category (user_store domain, auth required). */
    async deleteCategory(categoryId: string): Promise<void> {
      await getClient().userStore.deleteCategory(categoryId);
    },

    /** Create an unlisted share link (user_store domain, auth required). */
    async createShare(title: string): Promise<void> {
      await getClient().userStore.createShare({ title });
    },

    /** Revoke a share link (user_store domain, auth required). */
    async revokeShare(shareId: string): Promise<void> {
      await getClient().userStore.revokeShare(shareId);
    },
    /** Publisher: my listings with readable statuses (publishers domain, auth). */
    async publisher(): Promise<ListingRow[]> {
      const page = await getClient().publishers.listMyListings({ limit: 50 });
      const items = ((page?.items ?? []) as unknown) as Array<Record<string, unknown>>;
      const resolved = await resolveRowsByListingIds(
        items.map((row) => String(row.id ?? '')),
      );
      return items.map((row) => {
        const listingId = String(row.id ?? '');
        const card = resolved.get(listingId);
        const name = String(row.displayName ?? '') || card?.name || listingId || '应用';
        return {
          id: String(row.listingSlug ?? listingId),
          name,
          developer: publisherStatusLabel(String(row.status ?? '')),
          rating: 0,
        };
      });
    },
  };
}

/**
 * Auth loaders over the generated iam-app-sdk client. Tokens from the session
 * create response persist through the bundle session module (wx storage) and
 * re-seed both the appstore client and the IAM client via the token managers.
 */
function createAuthLoaders(getIamClient: () => IamAppClient) {
  return {
    async loginWithPassword(account: string, password: string): Promise<void> {
      const trimmed = account.trim();
      const command: Record<string, unknown> = { password };
      if (trimmed.includes('@')) {
        command.email = trimmed;
      } else if (/^1\d{10}$/.test(trimmed)) {
        command.phone = trimmed;
      } else {
        command.username = trimmed;
      }
      const response = (await getIamClient().auth.sessions.create(command as never)) as unknown as Record<string, unknown>;
      applySessionTokens(response);
    },

    async loginWithExternalToken(externalToken: string, providerKey: string): Promise<void> {
      const response = (await getIamClient().auth.sessions.create({
        externalToken,
        providerKey,
      } as never)) as unknown as Record<string, unknown>;
      applySessionTokens(response);
    },

    async currentUser(): Promise<{ userId: string; displayName: string }> {
      const profile = (await getIamClient().iam.users.current.retrieve()) as unknown as Record<string, unknown>;
      const result = {
        userId: String(profile.id ?? ''),
        displayName: [profile.displayName, profile.nickname, profile.name]
          .find((value) => typeof value === 'string' && value.trim() !== '')
          ?.toString() ?? 'SDKWork 用户',
      };
      setIamSession({ ...getIamSession(), displayName: result.displayName, userId: result.userId });
      return result;
    },

    async logout(): Promise<void> {
      await getIamClient().auth.sessions.current.delete().catch(() => undefined);
      clearIamSession();
    },
  };
}

function applySessionTokens(response: Record<string, unknown>): void {
  const tokens: Partial<AppstoreMiniProgramIamSession> = {};
  for (const [key, value] of Object.entries(response)) {
    const normalized = key.replace(/_([a-z])/g, (_m: string, c: string) => c.toUpperCase());
    if (
      (normalized === 'authToken' || normalized === 'accessToken' || normalized === 'refreshToken') &&
      typeof value === 'string' &&
      value.trim() !== ''
    ) {
      tokens[normalized] = value.trim();
    }
  }
  setIamSession({ ...getIamSession(), ...tokens });
}

/** Module-scope singletons the thin pages destructure at require time. */
export const pageLoaders = createPageLoaders(requireAppClient);
export const auth = createAuthLoaders(requireIamClient);

/** Top-level current-user fetch (login/settings pages import it directly). */
export async function loadCurrentUser(): Promise<{ userId: string; displayName: string }> {
  return auth.currentUser();
}
