import {
  categoryIn,
  curatedEntryOf,
  type VerticalEvalSpec,
  type VerticalListingInput,
} from './verticalEvaluation'

/**
 * 独立模块「医疗卫生应用」(REQ-2026-0004): healthcare evaluation apps below
 * the AI 模型测评 category. Safety (hallucination and hazardous-advice control)
 * is a first-class dimension: it is carried on every spec benchmark and surfaced
 * as its own column in the detail panel and as a card badge. Curated data
 * resolves by listing id, then display name, else the default profile.
 * Dimension labels are i18n keys under `healthcare.dims.*`.
 */

/** Display names of the storefront category that holds healthcare. */
export const HEALTHCARE_CATEGORY_NAMES = ['医疗卫生应用', 'Healthcare Apps'] as const

/** Curated scenario taxonomy (labels under `healthcare.scenarios.*`). */
export const HEALTHCARE_SCENARIOS = ['clinical', 'public-health', 'health-mgmt', 'pharma-device', 'medical-edu'] as const

export type HealthcareScenarioId = (typeof HEALTHCARE_SCENARIOS)[number]

/** Per-scenario benchmark of a healthcare listing; safety is its own column. */
export interface HealthcareScenarioScore {
  scenario: HealthcareScenarioId
  tasks: number
  /** Composite score of the scenario task set, 0-100. */
  score: number
  /** Safety score (hallucination and hazardous-advice control), 0-100. */
  safety: number
}

/** Curated healthcare listing: spec set plus per-scenario coverage. */
export interface CuratedHealthcareListing {
  listingIds: string[]
  listingNames: string[]
  scenarios: HealthcareScenarioId[]
  scenarioScores: HealthcareScenarioScore[]
  specs: VerticalEvalSpec[]
}

/** Resolved healthcare profile of one listing. */
export interface HealthcareProfile {
  scenarios: HealthcareScenarioId[]
  scenarioScores: HealthcareScenarioScore[]
  specs: VerticalEvalSpec[]
}

/**
 * Safety dimension id shared by every healthcare spec benchmark; the detail
 * panel and cards read this member instead of guessing by position.
 */
export const HEALTHCARE_SAFETY_DIM_ID = 'healthcare.dims.safety'

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
      dimensions: dims.map(([dimId, dimScore]) => ({ id: `healthcare.dims.${dimId}`, score: dimScore })),
    },
  }
}

const DEFAULT_HEALTHCARE_SPECS: VerticalEvalSpec[] = [
  spec('model-deepseek-v32', 'model', 'DeepSeek-V3.2', 'DeepSeek', '医学知识问答与术语规范', 84.8, 400, [
    ['accuracy', 86],
    ['guideline', 84],
    ['safety', 90],
    ['terminology', 86],
    ['readability', 82],
  ]),
  spec('model-gpt-5', 'model', 'GPT-5', 'OpenAI', '指南符合度与拒答控制', 84.1, 400, [
    ['accuracy', 85],
    ['guideline', 86],
    ['safety', 89],
    ['terminology', 84],
    ['readability', 83],
  ]),
  spec('model-qwen3-max', 'model', 'Qwen3-Max', '阿里云', '中文医学术语与宣教表达', 83.2, 400, [
    ['accuracy', 84],
    ['guideline', 83],
    ['safety', 88],
    ['terminology', 87],
    ['readability', 85],
  ]),
]

/** Curated healthcare listings (database seeds, `015_vertical_evaluation.sql`). */
const CURATED_HEALTHCARE_LISTINGS: CuratedHealthcareListing[] = [
  {
    listingIds: ['app-health-medical-qa'],
    listingNames: ['医学知识问答测评'],
    scenarios: ['clinical', 'medical-edu'],
    scenarioScores: [
      { scenario: 'clinical', tasks: 120, score: 85.4, safety: 92.6 },
      { scenario: 'medical-edu', tasks: 90, score: 87.1, safety: 93.4 },
    ],
    specs: [
      spec('model-deepseek-v32', 'model', 'DeepSeek-V3.2', 'DeepSeek', '医学知识准确性最高', 87.6, 600, [
        ['accuracy', 90],
        ['guideline', 87],
        ['safety', 93],
        ['terminology', 89],
        ['readability', 84],
      ]),
      spec('model-gpt-5', 'model', 'GPT-5', 'OpenAI', '危险建议拒答率最高', 86.8, 600, [
        ['accuracy', 88],
        ['guideline', 89],
        ['safety', 95],
        ['terminology', 86],
        ['readability', 85],
      ]),
      spec('model-claude-sonnet-45', 'model', 'Claude Sonnet 4.5', 'Anthropic', '不确定表述与转诊提示规范', 86.1, 600, [
        ['accuracy', 87],
        ['guideline', 88],
        ['safety', 94],
        ['terminology', 85],
        ['readability', 86],
      ]),
      spec('model-qwen3-max', 'model', 'Qwen3-Max', '阿里云', '中文医学考试题覆盖广', 84.9, 600, [
        ['accuracy', 86],
        ['guideline', 84],
        ['safety', 91],
        ['terminology', 88],
        ['readability', 85],
      ]),
    ],
  },
  {
    listingIds: ['app-health-emr-quality'],
    listingNames: ['病历质控测评'],
    scenarios: ['clinical'],
    scenarioScores: [{ scenario: 'clinical', tasks: 150, score: 83.6, safety: 94.2 }],
    specs: [
      spec('model-deepseek-v32', 'model', 'DeepSeek-V3.2', 'DeepSeek', '病历缺陷识别与术语校对', 85.2, 400, [
        ['accuracy', 86],
        ['guideline', 85],
        ['safety', 95],
        ['terminology', 90],
        ['readability', 82],
      ]),
      spec('model-glm-47', 'model', 'GLM-4.7', '智谱 AI', '结构化病历字段抽取稳定', 84.3, 400, [
        ['accuracy', 85],
        ['guideline', 84],
        ['safety', 94],
        ['terminology', 88],
        ['readability', 83],
      ]),
      spec('model-claude-sonnet-45', 'model', 'Claude Sonnet 4.5', 'Anthropic', '质控规则解释与引用规范', 83.8, 400, [
        ['accuracy', 84],
        ['guideline', 86],
        ['safety', 94],
        ['terminology', 86],
        ['readability', 84],
      ]),
    ],
  },
  {
    listingIds: ['app-health-health-education'],
    listingNames: ['健康宣教测评'],
    scenarios: ['public-health', 'health-mgmt'],
    scenarioScores: [
      { scenario: 'public-health', tasks: 80, score: 86.2, safety: 93.8 },
      { scenario: 'health-mgmt', tasks: 70, score: 84.6, safety: 92.1 },
    ],
    specs: [
      spec('model-qwen3-max', 'model', 'Qwen3-Max', '阿里云', '科普表达通俗且术语准确', 86.9, 450, [
        ['accuracy', 86],
        ['guideline', 84],
        ['safety', 93],
        ['terminology', 87],
        ['readability', 92],
      ]),
      spec('model-doubao-16', 'model', 'Doubao-1.6', '字节跳动', '宣教文案亲和易读', 85.4, 450, [
        ['accuracy', 84],
        ['guideline', 83],
        ['safety', 92],
        ['terminology', 84],
        ['readability', 93],
      ]),
      spec('model-gpt-5', 'model', 'GPT-5', 'OpenAI', '多语言宣教材料生成', 84.8, 450, [
        ['accuracy', 85],
        ['guideline', 85],
        ['safety', 93],
        ['terminology', 84],
        ['readability', 88],
      ]),
    ],
  },
]

/** Fallback profile for category listings without a curated entry. */
const DEFAULT_HEALTHCARE_PROFILE: HealthcareProfile = {
  scenarios: [...HEALTHCARE_SCENARIOS],
  scenarioScores: [],
  specs: DEFAULT_HEALTHCARE_SPECS,
}

/**
 * Read a spec's safety score, or `undefined` when the spec carries no
 * benchmark or no safety dimension. The card badge and panel column both use
 * this accessor instead of relying on dimension order.
 */
export function healthcareSafetyScore(specArg: VerticalEvalSpec): number | undefined {
  return specArg.benchmark?.dimensions.find((dim) => dim.id === HEALTHCARE_SAFETY_DIM_ID)?.score
}

/**
 * Resolve the healthcare profile of a listing, or `undefined` when the listing
 * is not in the 医疗卫生应用 category. Curated entries match by listing id,
 * then by display name; every other category listing falls back to the default
 * profile.
 */
export function resolveHealthcareProfile(app: VerticalListingInput): HealthcareProfile | undefined {
  if (!categoryIn(app, HEALTHCARE_CATEGORY_NAMES)) {
    return undefined
  }
  const curated = curatedEntryOf(CURATED_HEALTHCARE_LISTINGS, app)
  if (!curated) {
    return DEFAULT_HEALTHCARE_PROFILE
  }
  return {
    scenarios: curated.scenarios,
    scenarioScores: curated.scenarioScores,
    specs: curated.specs,
  }
}
