import {
  categoryIn,
  curatedEntryOf,
  type VerticalEvalSpec,
  type VerticalListingInput,
} from './verticalEvaluation'

/**
 * 独立模块「文旅应用」(REQ-2026-0003): culture-and-tourism evaluation apps
 * below the AI 模型测评 category, with tourist attractions as the flagship
 * scenario. Taxonomy (scenario, region, attraction metadata) is a
 * storefront-side curation resolved by listing id, then display name, else the
 * default profile. Dimension labels are i18n keys under `tourism.dims.*`.
 */

/** Display names of the storefront category that holds culture and tourism. */
export const CULTURE_TOURISM_CATEGORY_NAMES = ['文旅应用', 'Culture & Tourism Apps'] as const

/** Curated scenario taxonomy (labels under `tourism.scenarios.*`). */
export const TOURISM_SCENARIOS = ['attraction', 'museum', 'citywalk', 'heritage', 'study-tour'] as const

export type TourScenarioId = (typeof TOURISM_SCENARIOS)[number]

/** Curated region taxonomy (labels under `tourism.regions.*`). */
export const TOURISM_REGIONS = ['north', 'east', 'south', 'central', 'southwest', 'northwest', 'northeast'] as const

export type TourRegionId = (typeof TOURISM_REGIONS)[number]

/** Attraction theme (labels under `tourism.themes.*`). */
export const TOURISM_THEMES = ['nature', 'culture', 'ruins', 'park'] as const

export type TourThemeId = (typeof TOURISM_THEMES)[number]

/** One covered attraction with its metadata and guided-tour accuracy. */
export interface TourAttraction {
  name: string
  level: '5A' | '4A' | '3A'
  region: TourRegionId
  theme: TourThemeId
  /** Guide accuracy of the evaluated specs on this attraction, 0-100. */
  accuracy: number
}

/** Curated tourism listing: spec set plus attraction coverage. */
export interface CuratedTourismListing {
  listingIds: string[]
  listingNames: string[]
  scenarios: TourScenarioId[]
  regions: TourRegionId[]
  /** Sampling period of the curated benchmark data, rendered as-is. */
  sampledAt: string
  attractions: TourAttraction[]
  specs: VerticalEvalSpec[]
}

/** Resolved tourism profile of one listing. */
export interface TourismProfile {
  scenarios: TourScenarioId[]
  regions: TourRegionId[]
  sampledAt: string
  attractions: TourAttraction[]
  specs: VerticalEvalSpec[]
}

function spec(
  id: string,
  kind: 'model' | 'agent',
  name: string,
  publisher: string,
  summary: string,
  score: number,
  sampleSize: number,
  dims: [string, number][],
): VerticalEvalSpec {
  return {
    id,
    kind,
    name,
    publisher,
    summary,
    benchmark: {
      score,
      sampleSize,
      sampleUnit: 'questions',
      dimensions: dims.map(([dimId, dimScore]) => ({ id: `tourism.dims.${dimId}`, score: dimScore })),
    },
  }
}

const DEFAULT_TOURISM_SPECS: VerticalEvalSpec[] = [
  spec('model-gemini-25-pro', 'model', 'Gemini 2.5 Pro', 'Google', '景点知识覆盖与多模态识图', 85.8, 600, [
    ['accuracy', 86],
    ['planning', 84],
    ['multilingual', 90],
    ['knowledge', 85],
    ['freshness', 84],
  ]),
  spec('model-qwen3-max', 'model', 'Qwen3-Max', '阿里云', '中文讲解与本土行程规划', 84.9, 600, [
    ['accuracy', 86],
    ['planning', 85],
    ['multilingual', 84],
    ['knowledge', 86],
    ['freshness', 83],
  ]),
  spec('model-gpt-5', 'model', 'GPT-5', 'OpenAI', '跨城市行程组合与实用信息', 84.2, 600, [
    ['accuracy', 85],
    ['planning', 86],
    ['multilingual', 87],
    ['knowledge', 83],
    ['freshness', 82],
  ]),
]

/** Curated tourism listings (database seeds, `015_vertical_evaluation.sql`). */
const CURATED_TOURISM_LISTINGS: CuratedTourismListing[] = [
  {
    listingIds: ['app-tour-attraction-guide'],
    listingNames: ['景区智能导览测评'],
    scenarios: ['attraction'],
    regions: ['north', 'east', 'southwest', 'central'],
    sampledAt: '2026-10',
    attractions: [
      { name: '故宫博物院', level: '5A', region: 'north', theme: 'culture', accuracy: 94.2 },
      { name: '黄山风景区', level: '5A', region: 'east', theme: 'nature', accuracy: 92.6 },
      { name: '九寨沟风景区', level: '5A', region: 'southwest', theme: 'nature', accuracy: 91.8 },
      { name: '张家界武陵源', level: '5A', region: 'central', theme: 'nature', accuracy: 90.4 },
    ],
    specs: [
      spec('model-qwen3-max', 'model', 'Qwen3-Max', '阿里云', '中文景点讲解准确率最高', 92.4, 800, [
        ['accuracy', 94],
        ['planning', 90],
        ['multilingual', 88],
        ['knowledge', 94],
        ['freshness', 90],
      ]),
      spec('model-gemini-25-pro', 'model', 'Gemini 2.5 Pro', 'Google', '实景图像识别与路线讲解', 91.6, 800, [
        ['accuracy', 92],
        ['planning', 90],
        ['multilingual', 94],
        ['knowledge', 91],
        ['freshness', 89],
      ]),
      spec('model-deepseek-v32', 'model', 'DeepSeek-V3.2', 'DeepSeek', '历史文化知识讲解深度', 90.2, 800, [
        ['accuracy', 91],
        ['planning', 88],
        ['multilingual', 87],
        ['knowledge', 93],
        ['freshness', 88],
      ]),
      spec('model-doubao-16', 'model', 'Doubao-1.6', '字节跳动', '口语化讲解自然亲和', 88.1, 800, [
        ['accuracy', 89],
        ['planning', 86],
        ['multilingual', 85],
        ['knowledge', 90],
        ['freshness', 88],
      ]),
    ],
  },
  {
    listingIds: ['app-tour-itinerary-planner'],
    listingNames: ['行程规划测评'],
    scenarios: ['attraction', 'citywalk'],
    regions: ['east', 'south', 'north'],
    sampledAt: '2026-10',
    attractions: [
      { name: '杭州西湖', level: '5A', region: 'east', theme: 'nature', accuracy: 89.4 },
      { name: '上海外滩', level: '4A', region: 'east', theme: 'culture', accuracy: 90.2 },
      { name: '广州塔', level: '4A', region: 'south', theme: 'park', accuracy: 88.6 },
      { name: '北京颐和园', level: '5A', region: 'north', theme: 'ruins', accuracy: 89.8 },
    ],
    specs: [
      spec('model-gpt-5', 'model', 'GPT-5', 'OpenAI', '多日行程约束组合最合理', 89.6, 500, [
        ['accuracy', 88],
        ['planning', 93],
        ['multilingual', 89],
        ['knowledge', 88],
        ['freshness', 86],
      ]),
      spec('model-qwen3-max', 'model', 'Qwen3-Max', '阿里云', '国内交通与开放时间贴合', 88.8, 500, [
        ['accuracy', 89],
        ['planning', 91],
        ['multilingual', 85],
        ['knowledge', 90],
        ['freshness', 89],
      ]),
      spec('model-kimi-k2', 'model', 'Kimi K2', '月之暗面', '长行程攻略资料整理完整', 86.9, 500, [
        ['accuracy', 87],
        ['planning', 88],
        ['multilingual', 84],
        ['knowledge', 88],
        ['freshness', 85],
      ]),
    ],
  },
  {
    listingIds: ['app-tour-multilingual-guide'],
    listingNames: ['多语言讲解测评'],
    scenarios: ['museum', 'attraction', 'heritage'],
    regions: ['north', 'northwest', 'east'],
    sampledAt: '2026-10',
    attractions: [
      { name: '秦始皇兵马俑博物馆', level: '5A', region: 'northwest', theme: 'ruins', accuracy: 90.8 },
      { name: '苏州博物馆', level: '4A', region: 'east', theme: 'culture', accuracy: 91.4 },
      { name: '天坛公园', level: '5A', region: 'north', theme: 'ruins', accuracy: 90.6 },
    ],
    specs: [
      spec('model-gemini-25-pro', 'model', 'Gemini 2.5 Pro', 'Google', '小语种讲解覆盖与准确', 91.2, 600, [
        ['accuracy', 90],
        ['planning', 85],
        ['multilingual', 95],
        ['knowledge', 91],
        ['freshness', 87],
      ]),
      spec('model-gpt-5', 'model', 'GPT-5', 'OpenAI', '文化术语翻译严谨', 90.4, 600, [
        ['accuracy', 90],
        ['planning', 86],
        ['multilingual', 93],
        ['knowledge', 90],
        ['freshness', 86],
      ]),
      spec('model-qwen3-max', 'model', 'Qwen3-Max', '阿里云', '中英讲解切换自然', 89.5, 600, [
        ['accuracy', 90],
        ['planning', 86],
        ['multilingual', 91],
        ['knowledge', 91],
        ['freshness', 87],
      ]),
    ],
  },
]

/** Fallback profile for category listings without a curated entry. */
const DEFAULT_TOURISM_PROFILE: TourismProfile = {
  scenarios: [...TOURISM_SCENARIOS],
  regions: [...TOURISM_REGIONS],
  sampledAt: '2026-10',
  attractions: [],
  specs: DEFAULT_TOURISM_SPECS,
}

/**
 * Resolve the tourism profile of a listing, or `undefined` when the listing is
 * not in the 文旅应用 category. Curated entries match by listing id, then by
 * display name; every other category listing falls back to the default profile.
 */
export function resolveTourismProfile(app: VerticalListingInput): TourismProfile | undefined {
  if (!categoryIn(app, CULTURE_TOURISM_CATEGORY_NAMES)) {
    return undefined
  }
  const curated = curatedEntryOf(CURATED_TOURISM_LISTINGS, app)
  if (!curated) {
    return DEFAULT_TOURISM_PROFILE
  }
  return {
    scenarios: curated.scenarios,
    regions: curated.regions,
    sampledAt: curated.sampledAt,
    attractions: curated.attractions,
    specs: curated.specs,
  }
}
