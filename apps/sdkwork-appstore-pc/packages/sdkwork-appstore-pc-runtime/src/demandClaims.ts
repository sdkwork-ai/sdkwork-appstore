import type {
  CreateDemandClaimInput,
  DemandClaimActionInput,
  DemandClaimEventItem,
  DemandClaimItem,
  DemandClaimListQuery,
  DemandClaimPage,
  DemandClaimsServicePort,
  DemandClaimStatistics,
  OrderAppClient,
} from '@sdkwork/appstore-pc-core';
import { configureDemandClaimsServicePort } from '@sdkwork/appstore-pc-core';

/**
 * Bind the demand-claim port to the commerce order app client. The order
 * capability owns the claim record and its lifecycle; the appstore demand hall
 * only reads and advances it.
 */
export function createDemandClaimsServicePort(client: OrderAppClient): DemandClaimsServicePort {
  const claims = client.demandClaims;

  return {
    async listClaims(query?: DemandClaimListQuery): Promise<DemandClaimPage> {
      const page = await claims.list({
        ...(query?.status === undefined ? {} : { status: query.status }),
        ...(query?.statusGroup === undefined ? {} : { statusGroup: query.statusGroup }),
        ...(query?.demandId === undefined ? {} : { demandId: query.demandId }),
        ...(query?.role === undefined ? {} : { role: query.role }),
        page: query?.page ?? 1,
        pageSize: query?.pageSize ?? 20,
      });
      const items = (page.items ?? []) as unknown as DemandClaimItem[];
      return {
        items,
        page: query?.page ?? 1,
        pageSize: query?.pageSize ?? 20,
        totalItems: parseTotalItems(page.pageInfo?.totalItems, items.length),
      };
    },

    async getClaim(claimId: string): Promise<DemandClaimItem> {
      return (await claims.retrieve(claimId)) as unknown as DemandClaimItem;
    },

    async getStatistics(): Promise<DemandClaimStatistics> {
      return (await claims.statistics.retrieve()) as unknown as DemandClaimStatistics;
    },

    async listEvents(claimId: string): Promise<DemandClaimEventItem[]> {
      const page = await claims.events.list(claimId);
      return (page.items ?? []) as unknown as DemandClaimEventItem[];
    },

    async createClaim(input: CreateDemandClaimInput): Promise<DemandClaimItem> {
      return (await claims.create({
        demandId: input.demandId,
        demandTitle: input.demandTitle,
        ...(input.demandCategory === undefined ? {} : { demandCategory: input.demandCategory }),
        ...(input.demandType === undefined ? {} : { demandType: input.demandType }),
        ...(input.appForms === undefined || input.appForms.length === 0
          ? input.appForm === undefined
            ? {}
            : { appForms: [input.appForm] }
          : { appForms: input.appForms }),
        ...(input.budgetText === undefined ? {} : { budgetText: input.budgetText }),
        ...(input.budgetMin === undefined ? {} : { budgetMin: input.budgetMin }),
        ...(input.budgetMax === undefined ? {} : { budgetMax: input.budgetMax }),
        ...(input.bidDeadline === undefined ? {} : { bidDeadline: input.bidDeadline }),
        publisherUserId: input.publisherUserId,
        ...(input.publisherCompanyName === undefined
          ? {}
          : { publisherCompanyName: input.publisherCompanyName }),
        ...(input.bidderCompanyId === undefined ? {} : { bidderCompanyId: input.bidderCompanyId }),
        quote: input.quote,
        ...(input.quoteCurrency === undefined ? {} : { quoteCurrency: input.quoteCurrency }),
        ...(input.deliveryDays === undefined ? {} : { deliveryDays: input.deliveryDays }),
        proposal: input.proposal,
        ...(input.requestNo === undefined ? {} : { requestNo: input.requestNo }),
      })) as unknown as DemandClaimItem;
    },

    async withdrawClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem> {
      return (await claims.withdraw(claimId, toActionBody(input))) as unknown as DemandClaimItem;
    },

    async startClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem> {
      return (await claims.start(claimId, toActionBody(input))) as unknown as DemandClaimItem;
    },

    async deliverClaim(claimId: string, input: DemandClaimActionInput): Promise<DemandClaimItem> {
      return (await claims.deliver(claimId, toActionBody(input))) as unknown as DemandClaimItem;
    },

    async shortlistClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem> {
      return (await claims.shortlist(claimId, toActionBody(input))) as unknown as DemandClaimItem;
    },

    async acceptClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem> {
      return (await claims.accept(claimId, toActionBody(input))) as unknown as DemandClaimItem;
    },

    async rejectClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem> {
      return (await claims.reject(claimId, toActionBody(input))) as unknown as DemandClaimItem;
    },

    async completeClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem> {
      return (await claims.complete(claimId, toActionBody(input))) as unknown as DemandClaimItem;
    },

    async reworkClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem> {
      return (await claims.rework(claimId, toActionBody(input))) as unknown as DemandClaimItem;
    },

    async cancelClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem> {
      return (await claims.cancel(claimId, toActionBody(input))) as unknown as DemandClaimItem;
    },
  };
}

/** Bind the singleton port used by the demand hall surfaces. */
export function configureAppstorePcDemandClaims(client: OrderAppClient): void {
  configureDemandClaimsServicePort(createDemandClaimsServicePort(client));
}

function toActionBody(input?: DemandClaimActionInput): {
  note?: string;
  deliveryNote?: string;
  attachmentUrls?: string[];
} {
  return {
    ...(input?.note === undefined ? {} : { note: input.note }),
    ...(input?.deliveryNote === undefined ? {} : { deliveryNote: input.deliveryNote }),
    ...(input?.attachmentUrls === undefined ? {} : { attachmentUrls: input.attachmentUrls }),
  };
}

function parseTotalItems(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
