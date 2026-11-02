/**
 * 抢单 (demand claim) service port — the provider's offer against a published
 * demand and the delivery lifecycle that follows it. Claim records are owned by
 * the commerce order capability (`sdkwork-order`), not by the company demand
 * store; the demand facts travel as an immutable snapshot on the claim.
 */

/** Claim status vocabulary; mirrors the order domain state machine. */
export type DemandClaimStatus =
  | 'submitted'
  | 'shortlisted'
  | 'accepted'
  | 'in_delivery'
  | 'delivered'
  | 'completed'
  | 'rejected'
  | 'withdrawn'
  | 'cancelled';

/** The three buckets the My Claims page filters by. */
export type DemandClaimStatusGroup = 'in_progress' | 'completed' | 'closed';

/** Which side of a claim a list query is scoped to. */
export type DemandClaimViewerRole = 'provider' | 'publisher';

/** Demand type snapshot accepted by the claim create command. */
export type DemandClaimDemandType = string;

/** One claim as returned by the order API (`camelCase` wire shape). */
export interface DemandClaimItem {
  id: string;
  tenantId: string;
  claimNo: string;
  demandId: string;
  demandTitle: string;
  demandCategory?: string;
  demandType: string;
  /** @deprecated Single-form compatibility alias; prefer `appForms`. */
  appForm?: string;
  /** Ordered application forms snapshotted from the demand. */
  appForms?: string[];
  budgetText?: string;
  budgetMin?: string;
  budgetMax?: string;
  bidDeadline?: string;
  publisherUserId: string;
  publisherCompanyName?: string;
  bidderUserId: string;
  bidderCompanyId?: string;
  /** Quote in major currency units, decimal string. */
  quote: string;
  quoteCurrency: string;
  deliveryDays?: number;
  proposal: string;
  status: DemandClaimStatus;
  statusGroup: DemandClaimStatusGroup;
  role: 'provider' | 'publisher' | 'operator';
  rejectReason?: string;
  withdrawReason?: string;
  cancelReason?: string;
  deliveryNote?: string;
  deliveryAttachmentUrls: string[];
  orderId?: string;
  orderNo?: string;
  submittedAt: string;
  acceptedAt?: string;
  startedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** One timeline entry of a claim. */
export interface DemandClaimEventItem {
  id: string;
  claimId: string;
  eventType: string;
  fromStatus?: string;
  toStatus: string;
  actorType: 'provider' | 'publisher' | 'operator' | 'system';
  actorId?: string;
  message?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

/** Tab counters for My Claims. */
export interface DemandClaimStatistics {
  inProgress: number;
  completed: number;
  closed: number;
  total: number;
}

/** One page of claims. */
export interface DemandClaimPage {
  items: DemandClaimItem[];
  page: number;
  pageSize: number;
  totalItems: number;
}

/** Filters accepted by the My Claims list. */
export interface DemandClaimListQuery {
  status?: DemandClaimStatus;
  statusGroup?: DemandClaimStatusGroup;
  demandId?: string;
  role?: DemandClaimViewerRole;
  page?: number;
  pageSize?: number;
}

/** Create-claim payload; bidder identity comes from the session. */
export interface CreateDemandClaimInput {
  demandId: string;
  demandTitle: string;
  demandCategory?: string;
  demandType?: DemandClaimDemandType;
  /** @deprecated Single-form compatibility alias; prefer `appForms`. */
  appForm?: string;
  /** Ordered application forms snapshotted from the demand. */
  appForms?: string[];
  budgetText?: string;
  budgetMin?: string;
  budgetMax?: string;
  bidDeadline?: string;
  publisherUserId: string;
  publisherCompanyName?: string;
  bidderCompanyId?: string;
  quote: string;
  quoteCurrency?: string;
  deliveryDays?: number;
  proposal: string;
  requestNo?: string;
}

/** Body shared by every claim transition. */
export interface DemandClaimActionInput {
  note?: string;
  deliveryNote?: string;
  attachmentUrls?: string[];
}

/** The claim capability consumed by the demand hall surfaces. */
export interface IDemandClaimsSDK {
  listClaims(query?: DemandClaimListQuery): Promise<DemandClaimPage>;
  getClaim(claimId: string): Promise<DemandClaimItem>;
  getStatistics(): Promise<DemandClaimStatistics>;
  listEvents(claimId: string): Promise<DemandClaimEventItem[]>;
  createClaim(input: CreateDemandClaimInput): Promise<DemandClaimItem>;
  withdrawClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem>;
  startClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem>;
  deliverClaim(claimId: string, input: DemandClaimActionInput): Promise<DemandClaimItem>;
  shortlistClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem>;
  acceptClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem>;
  rejectClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem>;
  completeClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem>;
  reworkClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem>;
  cancelClaim(claimId: string, input?: DemandClaimActionInput): Promise<DemandClaimItem>;
}

export type DemandClaimsServicePort = IDemandClaimsSDK;

let demandClaimsPort: DemandClaimsServicePort = createUnconfiguredDemandClaimsPort();

/** Bind the order-SDK-backed implementation during app bootstrap. */
export function configureDemandClaimsServicePort(port: DemandClaimsServicePort): void {
  demandClaimsPort = port;
}

export const DemandClaimsService: IDemandClaimsSDK = {
  listClaims: (query) => demandClaimsPort.listClaims(query),
  getClaim: (claimId) => demandClaimsPort.getClaim(claimId),
  getStatistics: () => demandClaimsPort.getStatistics(),
  listEvents: (claimId) => demandClaimsPort.listEvents(claimId),
  createClaim: (input) => demandClaimsPort.createClaim(input),
  withdrawClaim: (claimId, input) => demandClaimsPort.withdrawClaim(claimId, input),
  startClaim: (claimId, input) => demandClaimsPort.startClaim(claimId, input),
  deliverClaim: (claimId, input) => demandClaimsPort.deliverClaim(claimId, input),
  shortlistClaim: (claimId, input) => demandClaimsPort.shortlistClaim(claimId, input),
  acceptClaim: (claimId, input) => demandClaimsPort.acceptClaim(claimId, input),
  rejectClaim: (claimId, input) => demandClaimsPort.rejectClaim(claimId, input),
  completeClaim: (claimId, input) => demandClaimsPort.completeClaim(claimId, input),
  reworkClaim: (claimId, input) => demandClaimsPort.reworkClaim(claimId, input),
  cancelClaim: (claimId, input) => demandClaimsPort.cancelClaim(claimId, input),
};

function createUnconfiguredDemandClaimsPort(): DemandClaimsServicePort {
  const unavailable = (): never => {
    throw new Error('The demand claim runtime is not configured.');
  };
  return {
    listClaims: async () => unavailable(),
    getClaim: async () => unavailable(),
    getStatistics: async () => unavailable(),
    listEvents: async () => unavailable(),
    createClaim: async () => unavailable(),
    withdrawClaim: async () => unavailable(),
    startClaim: async () => unavailable(),
    deliverClaim: async () => unavailable(),
    shortlistClaim: async () => unavailable(),
    acceptClaim: async () => unavailable(),
    rejectClaim: async () => unavailable(),
    completeClaim: async () => unavailable(),
    reworkClaim: async () => unavailable(),
    cancelClaim: async () => unavailable(),
  };
}
