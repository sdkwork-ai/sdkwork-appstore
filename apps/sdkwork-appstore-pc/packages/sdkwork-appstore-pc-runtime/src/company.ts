import type {
  CompanyAppClient,
  CompanyDemandsServicePort,
  DemandAppForm,
  DemandCategory,
  DemandClaimInput,
  DemandHallBid,
  DemandHallItem,
  DemandPublishInput,
  DemandSuggestionSections,
} from '@sdkwork/appstore-pc-core';
import { configureCompanyDemandsServicePort, DEMAND_APP_FORMS } from '@sdkwork/appstore-pc-core';

const demandPageSize = 200;

type DemandRecord = Record<string, unknown>;
type BidRecord = Record<string, unknown>;

/** Read one discovery rail from the suggestions payload. */
function readDemandList(record: DemandRecord, key: string): DemandHallItem[] {
  const value = record[key];
  return Array.isArray(value) ? value.filter(isRecord).map(mapDemandRecord) : [];
}

/** Narrow one wire application-form code to the shipped taxonomy. */
function readAppFormCode(value: unknown): DemandAppForm | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  return (DEMAND_APP_FORMS as readonly string[]).includes(text)
    ? (text as DemandAppForm)
    : undefined;
}

/** Narrow a wire application-form code to the shipped taxonomy. */
function readAppForm(record: DemandRecord | undefined): DemandAppForm | undefined {
  return readAppFormCode(record?.['appForm']);
}

/** Read the canonical `appForms` set, falling back to the legacy `appForm`. */
function readAppForms(record: DemandRecord | undefined): DemandAppForm[] {
  const raw = record?.['appForms'];
  const forms: DemandAppForm[] = [];
  if (Array.isArray(raw)) {
    for (const value of raw) {
      const form = readAppFormCode(value);
      if (form !== undefined && !forms.includes(form)) forms.push(form);
    }
  }
  const legacy = readAppForm(record);
  if (legacy !== undefined && !forms.includes(legacy)) forms.unshift(legacy);
  return forms;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(record: DemandRecord | undefined, ...keys: string[]): string {
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

function readOptionalString(
  record: DemandRecord | undefined,
  ...keys: string[]
): string | undefined {
  const value = readString(record, ...keys);
  return value ? value : undefined;
}

function readCount(record: DemandRecord | undefined, key: string): number {
  const value = record?.[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function unwrapItem(value: unknown): Record<string, unknown> {
  if (isRecord(value) && 'item' in value && isRecord((value as { item: unknown }).item)) {
    return (value as { item: Record<string, unknown> }).item;
  }
  return isRecord(value) ? value : {};
}

function readPageItems(value: unknown): DemandRecord[] {
  const data = isRecord(value) && 'items' in value && isRecord(value.items)
    ? (value as { items: { items?: unknown[] } }).items
    : value;
  if (isRecord(data) && Array.isArray(data.items)) {
    return data.items.filter(isRecord);
  }
  return [];
}

function mapDemandRecord(record: DemandRecord): DemandHallItem {
  const appForm = readAppForm(record);
  const appForms = readAppForms(record);
  return {
    id: readString(record, 'id'),
    title: readString(record, 'title'),
    category: readString(record, 'category'),
    categoryId: readOptionalString(record, 'categoryId'),
    categoryPath: readOptionalString(record, 'categoryPath'),
    ...(appForm === undefined ? {} : { appForm }),
    ...(appForms.length === 0 ? {} : { appForms }),
    demandType: readString(record, 'demandType') || 'other',
    budget: readString(record, 'budget') || '面议',
    budgetMin: readOptionalString(record, 'budgetMin'),
    budgetMax: readOptionalString(record, 'budgetMax'),
    bidDeadline: readOptionalString(record, 'bidDeadline'),
    location: readOptionalString(record, 'location'),
    description: readString(record, 'description'),
    status: readString(record, 'status'),
    bidCount: readCount(record, 'bidCount'),
    viewCount: readCount(record, 'viewCount'),
    publisherUserId: readString(record, 'publisherUserId'),
    companyName: readString(record, 'companyName'),
    publishedAt: readString(record, 'publishedAt', 'createdAt'),
  };
}

function mapDemandCategoryRecord(record: DemandRecord): Omit<DemandCategory, 'children'> {
  const appForm = readAppForm(record);
  const parentId = readOptionalString(record, 'parentId');
  const displayNameEn = readOptionalString(record, 'displayNameEn');
  const description = readOptionalString(record, 'description');
  return {
    id: readString(record, 'id'),
    ...(parentId === undefined ? {} : { parentId }),
    categoryCode: readString(record, 'categoryCode'),
    displayName: readString(record, 'displayName'),
    ...(displayNameEn === undefined ? {} : { displayNameEn }),
    ...(description === undefined ? {} : { description }),
    ...(appForm === undefined ? {} : { appForm }),
    level: readCount(record, 'level'),
    path: readString(record, 'path'),
    sortOrder: readCount(record, 'sortOrder'),
    status: readString(record, 'status') === 'disabled' ? 'disabled' : 'active',
  };
}

/**
 * Build the cascading menu tree from the flat category list the service
 * returns. Rows whose parent is missing stay at the root so an orphaned node
 * is still selectable instead of disappearing from the menu.
 * @param records - flat category rows in service order.
 * @returns root nodes with `children` filled recursively.
 */
export function buildDemandCategoryTree(records: readonly DemandRecord[]): DemandCategory[] {
  const nodes = new Map<string, DemandCategory>();
  for (const record of records) {
    const node = mapDemandCategoryRecord(record);
    nodes.set(node.id, { ...node, children: [] });
  }
  const roots: DemandCategory[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId === undefined ? undefined : nodes.get(node.parentId);
    if (parent === undefined) {
      roots.push(node);
    } else {
      parent.children.push(node);
    }
  }
  const byOrder = (left: DemandCategory, right: DemandCategory): number =>
    left.sortOrder - right.sortOrder || left.categoryCode.localeCompare(right.categoryCode);
  const sortTree = (list: DemandCategory[]): void => {
    list.sort(byOrder);
    for (const item of list) {
      sortTree(item.children);
    }
  };
  sortTree(roots);
  return roots;
}

function mapBidRecord(record: BidRecord): DemandHallBid {
  const deliveryDays = record.deliveryDays;
  return {
    id: readString(record, 'id'),
    demandId: readString(record, 'demandId'),
    bidderUserId: readString(record, 'bidderUserId'),
    quote: readString(record, 'quote'),
    quoteCurrency: readString(record, 'quoteCurrency') || 'CNY',
    deliveryDays:
      typeof deliveryDays === 'number'
        ? deliveryDays
        : typeof deliveryDays === 'string' && deliveryDays.trim()
          ? Number.parseInt(deliveryDays, 10) || undefined
          : undefined,
    proposal: readString(record, 'proposal'),
    status: readString(record, 'status'),
    rejectNote: readOptionalString(record, 'rejectNote'),
    orderId: readOptionalString(record, 'orderId'),
    createdAt: readString(record, 'createdAt'),
  };
}

export function createCompanyDemandsServicePort(
  client: CompanyAppClient,
): CompanyDemandsServicePort {
  const demands = client.company.demands;
  const bids = client.company.bids;
  return {
    async listDemands(query): Promise<DemandHallItem[]> {
      const response = await demands.list({
        q: query?.q?.trim() || undefined,
        demandType: query?.demandType?.trim() || undefined,
        page: 1,
        pageSize: demandPageSize,
      });
      return readPageItems(response).map(mapDemandRecord);
    },

    async getDemand(demandId): Promise<DemandHallItem> {
      return mapDemandRecord(unwrapItem(await demands.retrieve(demandId)));
    },

    async listDemandSuggestions(demandId): Promise<DemandSuggestionSections> {
      // The endpoint returns one item carrying all three ranked rails, so the
      // detail page's right column needs a single request.
      const payload = unwrapItem(await demands.suggestions.retrieve(demandId));
      return {
        latest: readDemandList(payload, 'latest'),
        related: readDemandList(payload, 'related'),
        recommended: readDemandList(payload, 'recommended'),
      };
    },

    async publishDemand(input: DemandPublishInput): Promise<DemandHallItem> {
      const created = unwrapItem(
        await demands.create({
          title: input.title,
          categoryId: input.categoryId,
          ...(input.appForms !== undefined && input.appForms.length > 0
            ? { appForms: input.appForms }
            : input.appForm === undefined
              ? {}
              : { appForms: [input.appForm] }),
          demandType: input.demandType,
          budget: input.budget,
          budgetMin: input.budgetMin,
          budgetMax: input.budgetMax,
          bidDeadline: input.bidDeadline,
          description: input.description,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
        }),
      );
      return mapDemandRecord(created);
    },

    async listDemandCategories(): Promise<DemandCategory[]> {
      const response = await client.company.demandCategories.list();
      return buildDemandCategoryTree(readPageItems(response));
    },

    async claimDemand(demandId, input: DemandClaimInput): Promise<DemandHallBid> {
      const created = unwrapItem(
        await demands.bids.create(demandId, {
          quote: input.quote,
          deliveryDays: input.deliveryDays !== undefined ? String(input.deliveryDays) : undefined,
          proposal: input.proposal,
        }),
      );
      return mapBidRecord(created);
    },

    async listDemandBids(demandId): Promise<DemandHallBid[]> {
      const response = await demands.bids.list(demandId, { page: 1, pageSize: demandPageSize });
      return readPageItems(response).map(mapBidRecord);
    },

    async listMyBids(): Promise<DemandHallBid[]> {
      const response = await bids.list({ page: 1, pageSize: demandPageSize });
      return readPageItems(response).map(mapBidRecord);
    },

    async acceptDemandBid(demandId: string, bidId: string): Promise<void> {
      await demands.bids.accept(demandId, bidId);
    },

    async rejectDemandBid(demandId: string, bidId: string, note?: string): Promise<void> {
      await demands.bids.reject(demandId, bidId, note === undefined ? {} : { note });
    },

    async completeDemand(demandId: string): Promise<void> {
      await demands.complete(demandId);
    },

    async withdrawMyBidForDemand(demandId: string): Promise<void> {
      const response = await bids.list({ page: 1, pageSize: demandPageSize });
      const open = readPageItems(response)
        .map(mapBidRecord)
        .find((bid) => bid.demandId === demandId
          && (bid.status === 'submitted' || bid.status === 'shortlisted'));
      if (open !== undefined) await bids.delete(open.id);
    },
  };
}

/** Bind the demand hall port to the composed company app client. */
export function configureAppstorePcCompany(client: CompanyAppClient): void {
  configureCompanyDemandsServicePort(createCompanyDemandsServicePort(client));
}
