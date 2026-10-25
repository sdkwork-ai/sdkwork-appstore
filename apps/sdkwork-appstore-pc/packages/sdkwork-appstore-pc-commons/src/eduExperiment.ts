import {
  categoryIn,
  curatedEntryOf,
  type VerticalEvalSpec,
  type VerticalListingInput,
} from './verticalEvaluation'

/**
 * 独立模块「教育实验应用」(REQ-2026-0002): education-experiment evaluation
 * apps below the AI 模型测评 category. Taxonomy is a storefront-side curation —
 * the catalog API carries no stage/subject field — so the module page and the
 * detail panel resolve a listing's coverage here, by listing id first, then by
 * display name, else the default profile. Dimension labels are i18n keys under
 * `eduExperiment.dims.*`.
 */

/** Display names of the storefront category that holds education experiments. */
export const EDU_EXPERIMENT_CATEGORY_NAMES = ['教育实验应用', 'Education Experiment Apps'] as const

/** Curated stage taxonomy: K12 (primary/junior/senior), university, professional. */
export const EDU_STAGES = [
  'k12-primary',
  'k12-junior',
  'k12-senior',
  'university',
  'professional',
] as const

export type EduStageId = (typeof EDU_STAGES)[number]

/** Stage filter groups: the three top-level segments the module page filters by. */
export const EDU_STAGE_GROUPS = ['k12', 'university', 'professional'] as const

export type EduStageGroupId = (typeof EDU_STAGE_GROUPS)[number]

/** Curated subject taxonomy (labels live under `eduExperiment.subjects.*`). */
export const EDU_SUBJECTS = [
  'math',
  'physics',
  'chemistry',
  'biology',
  'science',
  'geography',
  'it',
  'chinese',
  'foreign-language',
  'engineering',
] as const

export type EduSubjectId = (typeof EDU_SUBJECTS)[number]

/** One 学段×学科 coverage cell: experiment task count and its benchmark score. */
export interface EduCoverageCell {
  stage: EduStageId
  subject: EduSubjectId
  tasks: number
  score: number
}

/** Curated education-experiment listing: spec set plus stage×subject coverage. */
export interface CuratedEduListing {
  listingIds: string[]
  listingNames: string[]
  stages: EduStageId[]
  subjects: EduSubjectId[]
  cells: EduCoverageCell[]
  specs: VerticalEvalSpec[]
}

/** Resolved education-experiment profile of one listing. */
export interface EduExperimentProfile {
  stages: EduStageId[]
  subjects: EduSubjectId[]
  cells: EduCoverageCell[]
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
      sampleUnit: 'tasks',
      dimensions: dims.map(([dimId, dimScore]) => ({ id: `eduExperiment.dims.${dimId}`, score: dimScore })),
    },
  }
}

const DEFAULT_EDU_SPECS: VerticalEvalSpec[] = [
  spec('model-deepseek-v32', 'model', 'DeepSeek-V3.2', 'DeepSeek', '理科实验推理与报告批改基线', 84.6, 300, [
    ['operation', 83],
    ['grading', 86],
    ['design', 84],
    ['qa', 85],
    ['safety', 88],
  ]),
  spec('model-gpt-5', 'model', 'GPT-5', 'OpenAI', '跨学科实验设计与安全提示', 83.9, 300, [
    ['operation', 82],
    ['grading', 84],
    ['design', 86],
    ['qa', 84],
    ['safety', 87],
  ]),
  spec('model-qwen3-max', 'model', 'Qwen3-Max', '阿里云', '中文实验题干理解与解题引导', 82.1, 300, [
    ['operation', 81],
    ['grading', 82],
    ['design', 82],
    ['qa', 84],
    ['safety', 86],
  ]),
]

/** Curated education-experiment listings (database seeds, `015_vertical_evaluation.sql`). */
const CURATED_EDU_LISTINGS: CuratedEduListing[] = [
  {
    listingIds: ['app-edu-k12-virtual-lab'],
    listingNames: ['K12 虚拟实验测评'],
    stages: ['k12-primary', 'k12-junior', 'k12-senior'],
    subjects: ['physics', 'chemistry', 'biology', 'science'],
    cells: [
      { stage: 'k12-primary', subject: 'science', tasks: 40, score: 88.4 },
      { stage: 'k12-junior', subject: 'physics', tasks: 36, score: 86.1 },
      { stage: 'k12-junior', subject: 'chemistry', tasks: 32, score: 85.3 },
      { stage: 'k12-junior', subject: 'biology', tasks: 28, score: 84.7 },
      { stage: 'k12-senior', subject: 'physics', tasks: 44, score: 83.9 },
      { stage: 'k12-senior', subject: 'chemistry', tasks: 40, score: 83.2 },
      { stage: 'k12-senior', subject: 'biology', tasks: 36, score: 84.5 },
    ],
    specs: [
      spec('model-deepseek-v32', 'model', 'DeepSeek-V3.2', 'DeepSeek', '实验步骤纠错与安全提示稳定', 87.2, 400, [
        ['operation', 86],
        ['grading', 88],
        ['design', 85],
        ['qa', 87],
        ['safety', 92],
      ]),
      spec('model-gpt-5', 'model', 'GPT-5', 'OpenAI', '实验设计引导表达清晰', 86.4, 400, [
        ['operation', 85],
        ['grading', 86],
        ['design', 88],
        ['qa', 86],
        ['safety', 90],
      ]),
      spec('model-qwen3-max', 'model', 'Qwen3-Max', '阿里云', '中文实验题干与课标术语贴合', 85.1, 400, [
        ['operation', 84],
        ['grading', 85],
        ['design', 84],
        ['qa', 88],
        ['safety', 89],
      ]),
      spec('model-glm-47', 'model', 'GLM-4.7', '智谱 AI', '实验报告批改反馈细致', 83.8, 400, [
        ['operation', 83],
        ['grading', 87],
        ['design', 82],
        ['qa', 85],
        ['safety', 88],
      ]),
    ],
  },
  {
    listingIds: ['app-edu-university-physics-lab'],
    listingNames: ['大学物理实验测评'],
    stages: ['university'],
    subjects: ['physics', 'math', 'engineering'],
    cells: [
      { stage: 'university', subject: 'physics', tasks: 48, score: 85.6 },
      { stage: 'university', subject: 'math', tasks: 30, score: 84.2 },
      { stage: 'university', subject: 'engineering', tasks: 26, score: 82.8 },
    ],
    specs: [
      spec('model-deepseek-v32', 'model', 'DeepSeek-V3.2', 'DeepSeek', '误差分析与数据处理推导严谨', 86.8, 320, [
        ['operation', 85],
        ['grading', 88],
        ['design', 86],
        ['qa', 88],
        ['safety', 89],
      ]),
      spec('model-claude-sonnet-45', 'model', 'Claude Sonnet 4.5', 'Anthropic', '实验报告表述与引用规范', 85.9, 320, [
        ['operation', 84],
        ['grading', 88],
        ['design', 85],
        ['qa', 86],
        ['safety', 90],
      ]),
      spec('model-gpt-5', 'model', 'GPT-5', 'OpenAI', '设计性实验方案生成完整', 85.2, 320, [
        ['operation', 83],
        ['grading', 85],
        ['design', 88],
        ['qa', 85],
        ['safety', 88],
      ]),
      spec('model-gemini-25-pro', 'model', 'Gemini 2.5 Pro', 'Google', '图表与测量数据解读准确', 83.7, 320, [
        ['operation', 84],
        ['grading', 83],
        ['design', 84],
        ['qa', 85],
        ['safety', 87],
      ]),
    ],
  },
  {
    listingIds: ['app-edu-professional-skills'],
    listingNames: ['专业技能实训测评'],
    stages: ['professional'],
    subjects: ['engineering', 'it', 'foreign-language'],
    cells: [
      { stage: 'professional', subject: 'engineering', tasks: 42, score: 83.4 },
      { stage: 'professional', subject: 'it', tasks: 46, score: 85.8 },
      { stage: 'professional', subject: 'foreign-language', tasks: 24, score: 81.6 },
    ],
    specs: [
      spec('agent-birdcoder', 'agent', 'BirdCoder', 'SDKWork', '实训任务编排与自动化评估', 85.3, 300, [
        ['operation', 84],
        ['grading', 86],
        ['design', 87],
        ['qa', 85],
        ['safety', 89],
      ]),
      spec('model-qwen3-max', 'model', 'Qwen3-Max', '阿里云', '职业技能题库覆盖面广', 84.1, 300, [
        ['operation', 83],
        ['grading', 84],
        ['design', 84],
        ['qa', 86],
        ['safety', 87],
      ]),
      spec('agent-copilot', 'agent', 'GitHub Copilot', 'GitHub', 'IT 实训补全与代码讲评', 82.6, 300, [
        ['operation', 82],
        ['grading', 83],
        ['design', 82],
        ['qa', 84],
        ['safety', 86],
      ]),
    ],
  },
]

/** Fallback profile for category listings without a curated entry. */
const DEFAULT_EDU_PROFILE: EduExperimentProfile = {
  stages: [...EDU_STAGES],
  subjects: ['math', 'physics', 'chemistry', 'biology'],
  cells: [],
  specs: DEFAULT_EDU_SPECS,
}

/**
 * Resolve the education-experiment profile of a listing, or `undefined` when
 * the listing is not in the 教育实验应用 category. Curated entries match by
 * listing id, then by display name; every other category listing falls back to
 * the default profile.
 */
export function resolveEduExperimentProfile(app: VerticalListingInput): EduExperimentProfile | undefined {
  if (!categoryIn(app, EDU_EXPERIMENT_CATEGORY_NAMES)) {
    return undefined
  }
  const curated = curatedEntryOf(CURATED_EDU_LISTINGS, app)
  if (!curated) {
    return DEFAULT_EDU_PROFILE
  }
  return { stages: curated.stages, subjects: curated.subjects, cells: curated.cells, specs: curated.specs }
}
