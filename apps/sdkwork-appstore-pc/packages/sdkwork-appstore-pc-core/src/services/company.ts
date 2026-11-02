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
  /** Leaf demand category id selected through the cascading category menu. */
  categoryId?: string;
  /** Slash-delimited category tree path, for example `/software/web/admin-system`. */
  categoryPath?: string;
  /** @deprecated Single-form compatibility alias; prefer `appForms`. */
  appForm?: DemandAppForm;
  /** Canonical ordered set of commissioned application forms. */
  appForms?: DemandAppForm[];
  /** 需求大类：软件开发 / 视频生成 / 图片生成 / 音乐创作 / 配音合成 / 设计 / 求购 / 其他。 */
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
  /** Detail-page counters the list payload does not emphasize. */
  viewCount?: number;
  publisherUserId: string;
  companyName: string;
  publishedAt: string;
}

/**
 * Demand application forms, one code per SDKWork application architecture
 * standard, in publish-form order. The code is the wire value; the label and
 * the spec each code implements live in the client dictionaries.
 */
export const DEMAND_APP_FORMS = [
  'pc',
  'h5',
  'static-web',
  'miniprogram',
  'flutter',
  'uniapp',
  'android-native',
  'ios-native',
  'harmony-native',
  'unity',
] as const;

/** One {@link DEMAND_APP_FORMS} code. */
export type DemandAppForm = (typeof DEMAND_APP_FORMS)[number];

/** One node of the demand category tree served for the cascading menu. */
export interface DemandCategory {
  id: string;
  parentId?: string;
  categoryCode: string;
  displayName: string;
  displayNameEn?: string;
  description?: string;
  /** Application form this category usually commissions, offered as the default. */
  appForm?: DemandAppForm;
  level: number;
  path: string;
  sortOrder: number;
  status: 'active' | 'disabled';
  children: DemandCategory[];
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

/**
 * The three discovery rails of the demand detail page, ranked by the company
 * service: 最新需求 (latest), 相关需求 (related), 推荐需求 (recommended).
 * The service guarantees a demand appears in at most one rail.
 */
export interface DemandSuggestionSections {
  latest: DemandHallItem[];
  related: DemandHallItem[];
  recommended: DemandHallItem[];
}

export type DemandHallType =
  | 'development'
  | 'purchase'
  | 'design'
  | 'other'
  | 'video'
  | 'image'
  | 'music'
  | 'voice';

export interface DemandPublishInput {
  title: string;
  /** Leaf category id from the cascading category menu; required by the service. */
  categoryId: string;
  /** Application forms being commissioned; required for a development demand. */
  appForms?: DemandAppForm[];
  /** @deprecated Single-form compatibility alias; prefer `appForms`. */
  appForm?: DemandAppForm;
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
  /**
   * Read the detail page's discovery rails. One request returns all three
   * sections, so the detail page renders its right column in one round trip.
   */
  listDemandSuggestions(demandId: string): Promise<DemandSuggestionSections>;
  publishDemand(input: DemandPublishInput): Promise<DemandHallItem>;
  /** Read the demand category tree that drives the cascading publish menu. */
  listDemandCategories(): Promise<DemandCategory[]>;
  /** 抢单：以当前登录身份对该需求提交一份接单投标。 */
  claimDemand(demandId: string, input: DemandClaimInput): Promise<DemandHallBid>;
  /** 需求方视角：查看收到的投标（仅发布人可见）。 */
  listDemandBids(demandId: string): Promise<DemandHallBid[]>;
  /** 我发出的投标。 */
  listMyBids(): Promise<DemandHallBid[]>;
  /**
   * Award the company-domain bid that mirrors an order claim. Keeps the demand
   * status (published → assigned) and the legacy bid list in step with the
   * order-owned claim lifecycle.
   */
  acceptDemandBid(demandId: string, bidId: string): Promise<void>;
  /** Reject the company-domain bid mirroring a rejected order claim. */
  rejectDemandBid(demandId: string, bidId: string, note?: string): Promise<void>;
  /** Mark the awarded demand complete once the order claim is accepted. */
  completeDemand(demandId: string): Promise<void>;
  /** Remove the provider's open company-domain bid after an order withdrawal. */
  withdrawMyBidForDemand(demandId: string): Promise<void>;
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
  listDemandSuggestions: (demandId) => companyDemandsPort.listDemandSuggestions(demandId),
  publishDemand: (input) => companyDemandsPort.publishDemand(input),
  listDemandCategories: () => companyDemandsPort.listDemandCategories(),
  claimDemand: (demandId, input) => companyDemandsPort.claimDemand(demandId, input),
  listDemandBids: (demandId) => companyDemandsPort.listDemandBids(demandId),
  listMyBids: () => companyDemandsPort.listMyBids(),
  acceptDemandBid: (demandId, bidId) => companyDemandsPort.acceptDemandBid(demandId, bidId),
  rejectDemandBid: (demandId, bidId, note) => companyDemandsPort.rejectDemandBid(demandId, bidId, note),
  completeDemand: (demandId) => companyDemandsPort.completeDemand(demandId),
  withdrawMyBidForDemand: (demandId) => companyDemandsPort.withdrawMyBidForDemand(demandId),
};

function createUnconfiguredCompanyDemandsPort(): CompanyDemandsServicePort {
  const unavailable = (): never => {
    throw new Error('The demand hall runtime is not configured.');
  };
  return {
    listDemands: async () => unavailable(),
    getDemand: async () => unavailable(),
    listDemandSuggestions: async () => unavailable(),
    publishDemand: async () => unavailable(),
    listDemandCategories: async () => unavailable(),
    claimDemand: async () => unavailable(),
    listDemandBids: async () => unavailable(),
    listMyBids: async () => unavailable(),
    acceptDemandBid: async () => unavailable(),
    rejectDemandBid: async () => unavailable(),
    completeDemand: async () => unavailable(),
    withdrawMyBidForDemand: async () => unavailable(),
  };
}

/** Exposed for the runtime package's SDK-backed port implementation. */
export type { CompanyAppClient };
