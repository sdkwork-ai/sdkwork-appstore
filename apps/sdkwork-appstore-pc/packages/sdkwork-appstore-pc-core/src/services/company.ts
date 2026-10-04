import type { CompanyAppClient } from '../sdk/clients';

/**
 * 需求大厅 (demand hall) service port — the AI Lab demand publishing and
 * claiming capability. Data is owned by the `sdkwork-company` domain and read
 * through the generated `@sdkwork/company-app-sdk` client bound in the pc-core
 * SDK inventory; the appstore never stores demand state locally.
 */

export interface DemandHallItem {
  id: string;
  title: string;
  /** 企业中心分类（自由文本），如 "IT设备"。 */
  category: string;
  /** 需求大类：软件开发 / 求购 / 设计 / 其他。 */
  demandType: string;
  /** 展示预算文本；结构化区间见 budgetMin/budgetMax。 */
  budget: string;
  budgetMin?: string;
  budgetMax?: string;
  bidDeadline?: string;
  location?: string;
  description: string;
  status: string;
  bidCount: number;
  publisherUserId: string;
  companyName: string;
  publishedAt: string;
}

export interface DemandHallBid {
  id: string;
  demandId: string;
  bidderUserId: string;
  quote: string;
  quoteCurrency: string;
  deliveryDays?: number;
  proposal: string;
  status: string;
  rejectNote?: string;
  orderId?: string;
  createdAt: string;
}

export type DemandHallType = 'development' | 'purchase' | 'design' | 'other';

export interface DemandPublishInput {
  title: string;
  category: string;
  demandType?: DemandHallType;
  budget?: string;
  budgetMin?: string;
  budgetMax?: string;
  bidDeadline?: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface DemandClaimInput {
  /** 抢单报价（元，decimal 字符串）。 */
  quote: string;
  /** 承诺交付天数。 */
  deliveryDays?: number;
  /** 方案说明；抢单场景可由服务端预填。 */
  proposal: string;
}

export interface ICompanyDemandsSDK {
  listDemands(query?: { q?: string; demandType?: string }): Promise<DemandHallItem[]>;
  getDemand(demandId: string): Promise<DemandHallItem>;
  publishDemand(input: DemandPublishInput): Promise<DemandHallItem>;
  /** 抢单：以当前登录身份对该需求提交一份接单投标。 */
  claimDemand(demandId: string, input: DemandClaimInput): Promise<DemandHallBid>;
  /** 需求方视角：查看收到的投标（仅发布人可见）。 */
  listDemandBids(demandId: string): Promise<DemandHallBid[]>;
  /** 我发出的投标。 */
  listMyBids(): Promise<DemandHallBid[]>;
}

export type CompanyDemandsServicePort = ICompanyDemandsSDK;

let companyDemandsPort: CompanyDemandsServicePort = createUnconfiguredCompanyDemandsPort();

/** Bind the real SDK-backed implementation during app bootstrap. */
export function configureCompanyDemandsServicePort(port: CompanyDemandsServicePort): void {
  companyDemandsPort = port;
}

export const CompanyDemandsService: ICompanyDemandsSDK = {
  listDemands: (query) => companyDemandsPort.listDemands(query),
  getDemand: (demandId) => companyDemandsPort.getDemand(demandId),
  publishDemand: (input) => companyDemandsPort.publishDemand(input),
  claimDemand: (demandId, input) => companyDemandsPort.claimDemand(demandId, input),
  listDemandBids: (demandId) => companyDemandsPort.listDemandBids(demandId),
  listMyBids: () => companyDemandsPort.listMyBids(),
};

function createUnconfiguredCompanyDemandsPort(): CompanyDemandsServicePort {
  const unavailable = (): never => {
    throw new Error('The demand hall runtime is not configured.');
  };
  return {
    listDemands: async () => unavailable(),
    getDemand: async () => unavailable(),
    publishDemand: async () => unavailable(),
    claimDemand: async () => unavailable(),
    listDemandBids: async () => unavailable(),
    listMyBids: async () => unavailable(),
  };
}

/** Exposed for the runtime package's SDK-backed port implementation. */
export type { CompanyAppClient };
