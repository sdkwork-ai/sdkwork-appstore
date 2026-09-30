import { seedRuntimeEnvFromBundle } from "./runtimeBundle";
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
 * `appApiBaseUrl` is forwarded into the runtime-env resolution, so a host that
 * already resolved a gateway origin can override the bundled profile value
 * without bypassing `resolveBaseUrl` (`ENVIRONMENT_SPEC.md` §6.3).
 */
export function bootstrapAppstoreMiniProgram(options: {
  appApiBaseUrl?: string;
  accessToken?: string;
} = {}) {
  installWxFetch();
  seedRuntimeEnvFromBundle({ appApiBaseUrl: options.appApiBaseUrl });
  registerHostAdapters();
  const sdkClients = createSdkClients(options.accessToken);
  const routes = createRoutes();
  return { sdkClients, routes, pageLoaders: createPageLoaders(sdkClients) };
}

type ListingRow = {
  id: string;
  name: string;
  developer: string;
  rating: number;
};

/**
 * Capability page loaders over the composed app SDK client.
 *
 * Each loader returns plain, setData-ready records for the thin native
 * pages; mapping follows the PC/H5 root data flows (ranking id resolution,
 * id-set queries, order-preserving listings, localized catalog headers).
 */
function createPageLoaders(client: AppstoreAppClient) {
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
    limit?: number;
  }): Promise<ListingRow[]> {
    const page = await client.catalog.searchListings(params);
    return listingRows(page?.items);
  }

  return {
    /** Charts: ranking ids from the snapshot, resolved in rank order. */
    async charts(
      kind: string,
    ): Promise<Array<ListingRow & { rank: number }>> {
      const chart = (await client.catalog.getChart(
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
      const rows = await searchListings({ ids: rankedIds, limit: rankedIds.length });
      const bySlug = new Map(rows.map((row) => [row.id, row]));
      const entries: Array<ListingRow & { rank: number }> = [];
      for (let index = 0; index < rankedIds.length; index++) {
        const row = bySlug.get(rankedIds[index]);
        if (row) {
          entries.push({ ...row, rank: index + 1 });
        }
      }
      return entries;
    },

    /** Apps browse: keyword listing page (PC/H5 browse pattern). */
    apps(): Promise<ListingRow[]> {
      return searchListings({ q: '应用', limit: 50 });
    },

    /** Games browse: keyword listing page. */
    games(): Promise<ListingRow[]> {
      return searchListings({ q: '游戏', limit: 50 });
    },

    /** Search results for a query. */
    search(query: string): Promise<ListingRow[]> {
      return searchListings({ q: query.trim(), limit: 50 });
    },

    /** Category detail: localized header plus its listing page. */
    async category(categoryId: string): Promise<{
      name: string;
      apps: ListingRow[];
    }> {
      const category = (await client.catalog.getCategory(categoryId)) as unknown as Record<
        string,
        unknown
      >;
      const name = localizedField(category, 'displayName', '分类');
      const apps = await searchListings({ categoryId, limit: 50 }).catch(() => []);
      return { name, apps };
    },

    /** Collection detail: localized header plus id-ordered listings. */
    async collection(collectionId: string): Promise<{
      name: string;
      apps: ListingRow[];
    }> {
      const collection = (await client.catalog.getCollection(collectionId)) as unknown as Record<
        string,
        unknown
      >;
      const name = localizedField(collection, 'displayName', '精选合集');
      const ids = entryListingIds(collection);
      const apps = ids.length === 0 ? [] : await searchListings({ ids, limit: ids.length });
      return { name, apps };
    },

    /** Event detail: localized header plus id-ordered participating listings. */
    async event(eventId: string): Promise<{
      name: string;
      apps: ListingRow[];
    }> {
      const event = (await client.catalog.getEvent(eventId)) as unknown as Record<
        string,
        unknown
      >;
      const name = localizedField(event, 'displayName', '限时活动');
      const ids = entryListingIds(event);
      const apps = ids.length === 0 ? [] : await searchListings({ ids, limit: ids.length });
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
      const listing = (await client.listings.get(listingId)) as unknown as Record<
        string,
        unknown
      >;
      const similarResponse = await client.listings
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
      const page = await client.catalog.listTemplates({ templateType, limit: 50 });
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
  };
}
