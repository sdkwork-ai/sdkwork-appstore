import { useApi } from '@/hooks/useApi';
import { getStoreClient } from '@/services/storeClient';

/** Localized card view shared by catalog-driven browse pages. */
export interface StoreListingCard {
  id: string;
  name: string;
  developer: string;
  rating: number;
  pricingModel: string;
  chartRank?: number;
}

/** Localized catalog entry name/description helper (zh-CN first). */
export function readLocalizedName(
  record: Record<string, unknown>,
  fallback: string,
): string {
  const localizations = Array.isArray(record.localizations)
    ? (record.localizations as Record<string, unknown>[])
    : [];
  const preferred =
    localizations.find((entry) => entry.locale === 'zh-CN' || entry.locale === 'zh_CN') ??
    localizations[0];
  return (
    String(preferred?.displayName ?? preferred?.name ?? '') || fallback
  );
}

export function readLocalizedDescription(
  record: Record<string, unknown>,
): string {
  const localizations = Array.isArray(record.localizations)
    ? (record.localizations as Record<string, unknown>[])
    : [];
  const preferred =
    localizations.find((entry) => entry.locale === 'zh-CN' || entry.locale === 'zh_CN') ??
    localizations[0];
  return String(preferred?.description ?? preferred?.subtitle ?? '');
}

/** Listing ids attached to a collection/event payload (items[] or CSV). */
export function readEntryListingIds(record: Record<string, unknown>): string[] {
  const items = Array.isArray(record.items)
    ? (record.items as Record<string, unknown>[])
    : [];
  if (items.length > 0) {
    return items
      .map((entry) => String(entry.listingId ?? ''))
      .filter(Boolean);
  }
  return String(record.listingIds ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

function toCard(row: Record<string, unknown>): StoreListingCard {
  return {
    id: String(row.listingSlug ?? row.id ?? ''),
    name: String(row.displayName ?? row.title ?? '应用'),
    developer: String(row.developerName ?? row.publisherName ?? '开发者'),
    rating: Number(row.averageRating ?? row.rating ?? 0),
    pricingModel: String(row.pricingModel ?? 'FREE'),
  };
}

/** Resolve a bounded listing-id list into cards, preserving the given order. */
export async function resolveListingCards(
  ids: string[],
  rankFrom?: number,
): Promise<StoreListingCard[]> {
  const unique = Array.from(new Set(ids)).filter(Boolean).slice(0, 50);
  if (unique.length === 0) {
    return [];
  }
  const page = await getStoreClient().catalog.searchListings({
    ids: unique,
    limit: unique.length,
  });
  const bySlug = new Map<string, StoreListingCard>();
  for (const item of page.items) {
    const row = item as unknown as Record<string, unknown>;
    const card = toCard(row);
    bySlug.set(card.id, card);
    bySlug.set(String(row.id ?? ''), card);
  }
  return unique
    .map((id, index) => {
      const card = bySlug.get(id);
      if (!card) {
        return undefined;
      }
      return rankFrom === undefined ? card : { ...card, chartRank: rankFrom + index };
    })
    .filter((card): card is StoreListingCard => Boolean(card));
}

/** Top charts: ranking ids from the chart snapshot, resolved and re-ranked. */
export function useTopCharts(tab: 'free' | 'paid') {
  return useApi(
    async () => {
      const chart = await getStoreClient().catalog.getChart(tab);
      const snapshot = chart as unknown as Record<string, unknown>;
      const ranking = Array.isArray(snapshot.rankingJson)
        ? (snapshot.rankingJson as Record<string, unknown>[])
        : Array.isArray(snapshot.ranking)
          ? (snapshot.ranking as Record<string, unknown>[])
          : [];
      const rankedIds = ranking
        .map((entry) => String(entry.listingId ?? ''))
        .filter(Boolean);
      const cards = await resolveListingCards(rankedIds);
      return cards.map((card, index) => ({ ...card, chartRank: index + 1 }));
    },
    { refreshKey: tab },
  );
}

/** Category detail header + its listing page. */
export function useCatalogCategory(categoryId: string) {
  return useApi(
    async () => {
      if (!categoryId) {
        return null;
      }
      const store = getStoreClient();
      const category = await store.catalog.getCategory(categoryId);
      const row = category as unknown as Record<string, unknown>;
      const name = readLocalizedName(row, '分类');
      const page = await store.catalog
        .searchListings({ categoryId, limit: 50 })
        .catch(() => ({ items: [] }));
      return {
        name,
        description: readLocalizedDescription(row),
        apps: (page.items as unknown as Record<string, unknown>[]).map(toCard),
      };
    },
    { refreshKey: categoryId },
  );
}

/** Editorial collection detail: header + ordered listing cards. */
export function useCatalogCollection(collectionId: string) {
  return useApi(
    async () => {
      if (!collectionId) {
        return null;
      }
      const store = getStoreClient();
      const collection = await store.catalog.getCollection(collectionId);
      const row = collection as unknown as Record<string, unknown>;
      const apps = await resolveListingCards(readEntryListingIds(row));
      return {
        name: readLocalizedName(row, '精选合集'),
        description: readLocalizedDescription(row),
        apps,
      };
    },
    { refreshKey: collectionId },
  );
}

/** Store event detail: header + schedule + participating listings. */
export function useCatalogEvent(eventId: string) {
  return useApi(
    async () => {
      if (!eventId) {
        return null;
      }
      const store = getStoreClient();
      const event = await store.catalog.getEvent(eventId);
      const row = event as unknown as Record<string, unknown>;
      const apps = await resolveListingCards(readEntryListingIds(row));
      return {
        name: String(row.title ?? '') || readLocalizedName(row, '限时活动'),
        description: String(row.subtitle ?? '') || readLocalizedDescription(row),
        startsAt: String(row.startsAt ?? ''),
        endsAt: String(row.endsAt ?? ''),
        status: String(row.status ?? ''),
        apps,
      };
    },
    { refreshKey: eventId },
  );
}

export interface AppTemplateCard {
  id: string;
  templateCode: string;
  name: string;
  description: string;
  categoryCode: string;
  author: string;
  stars: number;
  forks: number;
  framework: string;
  language: string;
}

function toTemplateCard(row: Record<string, unknown>): AppTemplateCard {
  const metadata =
    row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {};
  return {
    id: String(row.id ?? ''),
    templateCode: String(row.templateCode ?? ''),
    name: String(row.templateName ?? row.template_code ?? '模板'),
    description: String(row.description ?? ''),
    categoryCode: String(row.categoryCode ?? ''),
    author: String(metadata.authorName ?? row.authorName ?? 'SDKWork'),
    stars: Number(metadata.stars ?? row.starCount ?? 0),
    forks: Number(metadata.forks ?? row.forkCount ?? 0),
    framework: String(row.framework ?? ''),
    language: String(row.language ?? ''),
  };
}

/** App template marketplace list (templateType filterable). */
export function useTemplates(templateType: 'APP' | 'PLUGIN', query: string) {
  return useApi(
    async () => {
      const page = await getStoreClient().catalog.listTemplates({
        templateType,
        q: query.trim() || undefined,
        limit: 50,
      });
      return (page.items as unknown as Record<string, unknown>[]).map(toTemplateCard);
    },
    { refreshKey: `${templateType}:${query}` },
  );
}

/** One template detail by id (route param). */
export function useTemplate(templateId: string) {
  return useApi(
    async () => {
      if (!templateId) {
        return null;
      }
      const template = await getStoreClient().catalog.getTemplate(templateId);
      return toTemplateCard(template as unknown as Record<string, unknown>);
    },
    { refreshKey: templateId },
  );
}
