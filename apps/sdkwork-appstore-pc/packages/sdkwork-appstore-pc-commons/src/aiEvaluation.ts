import type { AppItem, AppSpec, Review, SpecRatingSummary } from '@sdkwork/appstore-pc-core'

/**
 * Curated evaluation candidates for the AI-model-evaluation storefront
 * category, modeled after popular public benchmarks (Chatbot Arena,
 * OpenCompass, SWE-bench, AIME leaderboards). Specs are a storefront-side
 * curation: the catalog API carries no spec field, so the module page and the
 * detail panel resolve a listing's spec set here — by listing id first, then
 * by display name, else the default set.
 *
 * User-facing signals stay two-sourced: `benchmark` is the curated official
 * baseline (score + per-dimension scores), while star ratings and comments
 * accumulate live through the sdkwork-comments per-spec threads.
 */

/** Display names of the storefront category that holds multi-spec AI evaluations. */
export const AI_MODEL_EVAL_CATEGORY_NAMES = ['AI模型测评', 'AI 模型测评', 'AI Model Evaluation'] as const

/** One per-dimension score of a curated benchmark (0-100). */
export interface EvalDimensionScore {
  name: string
  score: number
}

/** What one {@link EvalBenchmark.sampleSize} unit counts. */
export type EvalSampleUnit = 'votes' | 'tasks' | 'questions'

/** Curated official baseline of one evaluation spec (arena-style metadata). */
export interface EvalBenchmark {
  /** Composite benchmark score, 0-100 with one decimal. */
  score: number
  /** Sample volume backing the score (battles, resolved tasks, questions). */
  sampleSize?: number
  sampleUnit?: EvalSampleUnit
  dimensions: EvalDimensionScore[]
}

/** A curated evaluation spec carrying its optional benchmark baseline. */
export type CuratedEvalSpec = AppSpec & { benchmark?: EvalBenchmark }

/** Dimension names of the Chatbot-Arena-style overall board. */
const ARENA_DIMENSION_NAMES = ['综合推理', '编程', '数学', '写作', '中文'] as const

function arenaDims(scores: number[]) {
  return ARENA_DIMENSION_NAMES.map((name, index) => ({ name, score: scores[index] }))
}

const DEFAULT_MODEL_SPECS: CuratedEvalSpec[] = [
  { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '开源推理与代码能力基线' },
  { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '中文任务与工具调用' },
  { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '长上下文与多语言理解' },
  { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '通用推理与创意写作' },
  { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '长文档分析与安全对齐' },
]

const DEFAULT_AGENT_SPECS: CuratedEvalSpec[] = [
  { id: 'agent-birdcoder', kind: 'agent', name: 'BirdCoder', publisher: 'SDKWork', summary: '插件化 Agent Harness，全流程自主开发' },
  { id: 'agent-codex', kind: 'agent', name: 'Codex CLI', publisher: 'OpenAI', summary: '终端编码 Agent，脚本化任务流' },
  { id: 'agent-claude-code', kind: 'agent', name: 'Claude Code', publisher: 'Anthropic', summary: '终端编码 Agent，仓库级重构' },
  { id: 'agent-gemini-cli', kind: 'agent', name: 'Gemini CLI', publisher: 'Google', summary: '开源终端助手，多模态上下文' },
]

/** Spec sets of the curated multi-spec evaluation listings (database seeds). */
const CURATED_EVAL_SPECS: { listingIds: string[]; listingNames: string[]; specs: CuratedEvalSpec[] }[] = [
  {
    listingIds: ['app-eval-model-arena'],
    listingNames: ['大模型能力竞技场'],
    // Chatbot Arena-style overall board: battle-voted, five dimensions.
    specs: [
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '通用推理与创意写作', benchmark: { score: 91.2, sampleSize: 128400, sampleUnit: 'votes', dimensions: arenaDims([92, 90, 91, 93, 88]) } },
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '长文档分析与安全对齐', benchmark: { score: 90.4, sampleSize: 119600, sampleUnit: 'votes', dimensions: arenaDims([91, 90, 88, 93, 89]) } },
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '数学、代码与复杂推理基线', benchmark: { score: 89.6, sampleSize: 132800, sampleUnit: 'votes', dimensions: arenaDims([90, 91, 92, 86, 91]) } },
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '多模态推理与搜索增强', benchmark: { score: 88.9, sampleSize: 104200, sampleUnit: 'votes', dimensions: arenaDims([89, 87, 89, 88, 86]) } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '长文档与多语言任务', benchmark: { score: 87.3, sampleSize: 96800, sampleUnit: 'votes', dimensions: arenaDims([87, 86, 88, 85, 92]) } },
      { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '中文理解与工具调用', benchmark: { score: 86.5, sampleSize: 87400, sampleUnit: 'votes', dimensions: arenaDims([86, 85, 85, 86, 93]) } },
      { id: 'model-kimi-k2', kind: 'model', name: 'Kimi K2', publisher: '月之暗面', summary: '超长上下文检索与研读', benchmark: { score: 85.1, sampleSize: 79600, sampleUnit: 'votes', dimensions: arenaDims([85, 82, 84, 87, 90]) } },
      { id: 'model-doubao-16', kind: 'model', name: 'Doubao-1.6', publisher: '字节跳动', summary: '对话自然度与多模态理解', benchmark: { score: 84.2, sampleSize: 88900, sampleUnit: 'votes', dimensions: arenaDims([84, 80, 82, 87, 91]) } },
    ],
  },
  {
    listingIds: ['app-eval-agent-arena'],
    listingNames: ['编程 Agent 评测'],
    // SWE-bench-style board: score is the resolved-task rate over real repos.
    specs: [
      { id: 'agent-birdcoder', kind: 'agent', name: 'BirdCoder', publisher: 'SDKWork', summary: '插件化 Agent Harness，全流程自主开发', benchmark: { score: 68.4, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主开发', score: 70 }, { name: '仓库重构', score: 68 }, { name: '调试修复', score: 69 }, { name: '任务编排', score: 66 } ] } },
      { id: 'agent-codex', kind: 'agent', name: 'Codex CLI', publisher: 'OpenAI', summary: '终端编码 Agent，脚本化任务流', benchmark: { score: 66.8, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主开发', score: 68 }, { name: '仓库重构', score: 65 }, { name: '调试修复', score: 68 }, { name: '任务编排', score: 64 } ] } },
      { id: 'agent-claude-code', kind: 'agent', name: 'Claude Code', publisher: 'Anthropic', summary: '终端编码 Agent，仓库级重构', benchmark: { score: 65.2, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主开发', score: 67 }, { name: '仓库重构', score: 66 }, { name: '调试修复', score: 65 }, { name: '任务编排', score: 62 } ] } },
      { id: 'agent-gemini-cli', kind: 'agent', name: 'Gemini CLI', publisher: 'Google', summary: '开源终端助手，多模态上下文', benchmark: { score: 58.7, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主开发', score: 60 }, { name: '仓库重构', score: 57 }, { name: '调试修复', score: 59 }, { name: '任务编排', score: 58 } ] } },
      { id: 'agent-cursor', kind: 'agent', name: 'Cursor Agent', publisher: 'Anysphere', summary: '编辑器内并行编码 Agent', benchmark: { score: 57.9, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主开发', score: 60 }, { name: '仓库重构', score: 56 }, { name: '调试修复', score: 58 }, { name: '任务编排', score: 57 } ] } },
      { id: 'agent-copilot', kind: 'agent', name: 'GitHub Copilot', publisher: 'GitHub', summary: 'IDE 补全与工作区问答', benchmark: { score: 49.6, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主开发', score: 52 }, { name: '仓库重构', score: 47 }, { name: '调试修复', score: 50 }, { name: '任务编排', score: 48 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-math-arena'],
    listingNames: ['数学推理评测'],
    // Competition-math board (AIME/MATH style): score is the accuracy rate.
    specs: [
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '竞赛级推理链路，长思考稳定', benchmark: { score: 89.4, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '竞赛数学', score: 90 }, { name: '符号推导', score: 89 }, { name: '证明题', score: 88 } ] } },
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '高难度综合题稳定率高', benchmark: { score: 88.1, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '竞赛数学', score: 88 }, { name: '符号推导', score: 89 }, { name: '证明题', score: 87 } ] } },
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '几何与组合题表现突出', benchmark: { score: 86.7, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '竞赛数学', score: 87 }, { name: '符号推导', score: 86 }, { name: '证明题', score: 86 } ] } },
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '证明题表述严谨', benchmark: { score: 85.9, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '竞赛数学', score: 86 }, { name: '符号推导', score: 85 }, { name: '证明题', score: 88 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '中文题干理解准确', benchmark: { score: 84.8, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '竞赛数学', score: 85 }, { name: '符号推导', score: 85 }, { name: '证明题', score: 83 } ] } },
      { id: 'model-kimi-k2', kind: 'model', name: 'Kimi K2', publisher: '月之暗面', summary: '长推理链路中偶发跳步', benchmark: { score: 82.6, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '竞赛数学', score: 83 }, { name: '符号推导', score: 83 }, { name: '证明题', score: 80 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-longctx-arena'],
    listingNames: ['长文本理解评测'],
    // Needle-in-a-haystack + long-doc QA board (128K window).
    specs: [
      { id: 'model-kimi-k2', kind: 'model', name: 'Kimi K2', publisher: '月之暗面', summary: '128K 检索召回率最高', benchmark: { score: 93.6, sampleSize: 800, sampleUnit: 'questions', dimensions: [ { name: '大海捞针', score: 98 }, { name: '长文档问答', score: 92 }, { name: '跨文档综合', score: 90 } ] } },
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '超长窗口稳定，跨章节综合强', benchmark: { score: 92.4, sampleSize: 800, sampleUnit: 'questions', dimensions: [ { name: '大海捞针', score: 97 }, { name: '长文档问答', score: 91 }, { name: '跨文档综合', score: 91 } ] } },
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '全书综述与引用溯源严谨', benchmark: { score: 90.8, sampleSize: 800, sampleUnit: 'questions', dimensions: [ { name: '大海捞针', score: 96 }, { name: '长文档问答', score: 90 }, { name: '跨文档综合', score: 89 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '中文长文档问答表现出色', benchmark: { score: 89.2, sampleSize: 800, sampleUnit: 'questions', dimensions: [ { name: '大海捞针', score: 95 }, { name: '长文档问答', score: 89 }, { name: '跨文档综合', score: 86 } ] } },
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '长文档代码定位能力强', benchmark: { score: 87.5, sampleSize: 800, sampleUnit: 'questions', dimensions: [ { name: '大海捞针', score: 94 }, { name: '长文档问答', score: 87 }, { name: '跨文档综合', score: 85 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-multimodal-arena'],
    listingNames: ['多模态理解评测'],
    // MMBench-style board: image understanding / chart / doc QA.
    specs: [
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '图表推理与截图操作领先', benchmark: { score: 90.2, sampleSize: 950, sampleUnit: 'questions', dimensions: [ { name: '图像理解', score: 91 }, { name: '图表推理', score: 92 }, { name: '文档问答', score: 88 } ] } },
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '细粒度视觉属性识别稳定', benchmark: { score: 89.1, sampleSize: 950, sampleUnit: 'questions', dimensions: [ { name: '图像理解', score: 90 }, { name: '图表推理', score: 89 }, { name: '文档问答', score: 88 } ] } },
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '版面理解与 OCR 错误率低', benchmark: { score: 87.6, sampleSize: 950, sampleUnit: 'questions', dimensions: [ { name: '图像理解', score: 88 }, { name: '图表推理', score: 86 }, { name: '文档问答', score: 90 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '中文场景图像问答准确', benchmark: { score: 85.4, sampleSize: 950, sampleUnit: 'questions', dimensions: [ { name: '图像理解', score: 86 }, { name: '图表推理', score: 84 }, { name: '文档问答', score: 87 } ] } },
      { id: 'model-doubao-16', kind: 'model', name: 'Doubao-1.6', publisher: '字节跳动', summary: '海报与营销图理解自然', benchmark: { score: 83.2, sampleSize: 950, sampleUnit: 'questions', dimensions: [ { name: '图像理解', score: 85 }, { name: '图表推理', score: 80 }, { name: '文档问答', score: 85 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-tools-arena'],
    listingNames: ['工具调用评测'],
    // BFCL/tau-bench-style board: function calling reliability.
    specs: [
      { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '参数 schema 遵循度最高', benchmark: { score: 91.6, sampleSize: 1100, sampleUnit: 'questions', dimensions: [ { name: '函数调用', score: 93 }, { name: '多步规划', score: 89 }, { name: '参数遵循', score: 93 } ] } },
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '多步工具链规划稳健', benchmark: { score: 90.3, sampleSize: 1100, sampleUnit: 'questions', dimensions: [ { name: '函数调用', score: 91 }, { name: '多步规划', score: 92 }, { name: '参数遵循', score: 88 } ] } },
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '并行调用与重试策略成熟', benchmark: { score: 89.8, sampleSize: 1100, sampleUnit: 'questions', dimensions: [ { name: '函数调用', score: 91 }, { name: '多步规划', score: 89 }, { name: '参数遵循', score: 90 } ] } },
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '复杂嵌套调用成功率高', benchmark: { score: 89.2, sampleSize: 1100, sampleUnit: 'questions', dimensions: [ { name: '函数调用', score: 90 }, { name: '多步规划', score: 90 }, { name: '参数遵循', score: 87 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '中文工具描述理解准确', benchmark: { score: 86.9, sampleSize: 1100, sampleUnit: 'questions', dimensions: [ { name: '函数调用', score: 88 }, { name: '多步规划', score: 85 }, { name: '参数遵循', score: 88 } ] } },
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '长工具列表检索偶发误选', benchmark: { score: 85.1, sampleSize: 1100, sampleUnit: 'questions', dimensions: [ { name: '函数调用', score: 86 }, { name: '多步规划', score: 86 }, { name: '参数遵循', score: 83 } ] } },
    ],
  },
]

function isAiModelEvalApp(app: Pick<AppItem, 'category'>): boolean {
  return AI_MODEL_EVAL_CATEGORY_NAMES.includes(app.category as (typeof AI_MODEL_EVAL_CATEGORY_NAMES)[number])
}

/**
 * Resolve the evaluation specs of a listing, or `undefined` when the listing
 * is not a multi-spec AI evaluation app. Curated spec sets match by listing
 * id, then by display name; any other listing in the AI 模型测评 category
 * falls back to the combined default candidate set.
 */
export function resolveAppSpecs(app: Pick<AppItem, 'id' | 'name' | 'category'>): CuratedEvalSpec[] | undefined {
  if (!isAiModelEvalApp(app)) {
    return undefined
  }
  for (const curated of CURATED_EVAL_SPECS) {
    if (curated.listingIds.includes(app.id) || curated.listingNames.includes(app.name)) {
      return curated.specs
    }
  }
  return [...DEFAULT_MODEL_SPECS, ...DEFAULT_AGENT_SPECS]
}

/**
 * Leaderboard order for an evaluation app's specs: curated benchmark score
 * descending; specs without a baseline keep their original order at the end.
 */
export function rankEvalSpecs<T extends AppSpec>(specs: readonly T[]): T[] {
  return specs
    .map((spec, index) => ({ spec, index }))
    .sort((a, b) => {
      const scoreA = (a.spec as CuratedEvalSpec).benchmark?.score ?? -1
      const scoreB = (b.spec as CuratedEvalSpec).benchmark?.score ?? -1
      return scoreB === scoreA ? a.index - b.index : scoreB - scoreA
    })
    .map((entry) => entry.spec)
}

/**
 * Fold spec-scoped reviews into the spec's aggregate rating. Reviews without
 * a rating (plain comments) do not count toward the score.
 */
export function summarizeSpecReviews(reviews: readonly Review[]): SpecRatingSummary {
  const rated = reviews.filter((review) => review.rating > 0)
  if (rated.length === 0) {
    return { rating: 0, reviewsCount: 0 }
  }
  const total = rated.reduce((sum, review) => sum + review.rating, 0)
  return {
    rating: Math.round((total / rated.length) * 10) / 10,
    reviewsCount: rated.length,
  }
}
