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

/** Content sections of the evaluation page, ordered as rendered. */
export type EvalSectionId = 'general' | 'code' | 'agent' | 'multimodal' | 'trust'

export interface EvalSectionDescriptor {
  id: EvalSectionId
  titleKey: string
  descKey: string
}

/** Grouping of the evaluation listing board into content sections. */
export const EVAL_SECTIONS: readonly EvalSectionDescriptor[] = [
  { id: 'general', titleKey: 'aiEval.sections.general', descKey: 'aiEval.sections.generalDesc' },
  { id: 'code', titleKey: 'aiEval.sections.code', descKey: 'aiEval.sections.codeDesc' },
  { id: 'agent', titleKey: 'aiEval.sections.agent', descKey: 'aiEval.sections.agentDesc' },
  { id: 'multimodal', titleKey: 'aiEval.sections.multimodal', descKey: 'aiEval.sections.multimodalDesc' },
  { id: 'trust', titleKey: 'aiEval.sections.trust', descKey: 'aiEval.sections.trustDesc' },
]

/** Curated listing id → section id (unknown listings fall back to general). */
const EVAL_SECTION_BY_LISTING_ID: Record<string, EvalSectionId> = {
  'app-eval-model-arena': 'general',
  'app-eval-math-arena': 'general',
  'app-eval-chinese-eval': 'general',
  'app-eval-ridiculous': 'general',
  'app-eval-instruction-following': 'general',
  'app-eval-agent-arena': 'code',
  'app-eval-swe-bench': 'code',
  'app-eval-pelican-bike': 'code',
  'app-eval-forbidden-city': 'code',
  'app-eval-webdev-arena': 'code',
  'app-eval-tools-arena': 'agent',
  'app-eval-gaia': 'agent',
  'app-eval-longctx-arena': 'multimodal',
  'app-eval-multimodal-arena': 'multimodal',
  'app-eval-safety': 'trust',
  'app-eval-hallucination': 'trust',
}

/** Section that owns an evaluation listing on the module page. */
export function resolveEvalSectionId(app: Pick<AppItem, 'id'>): EvalSectionId {
  return EVAL_SECTION_BY_LISTING_ID[app.id] ?? 'general'
}

/** Secondary classification: the benchmark domain of one evaluation listing. */
export type EvalDomainId =
  | 'arena'
  | 'math'
  | 'chinese'
  | 'logic'
  | 'instruction'
  | 'agent-coding'
  | 'swe'
  | 'svg'
  | 'scene3d'
  | 'webdev'
  | 'gaia'
  | 'tools'
  | 'longctx'
  | 'multimodal'
  | 'safety'
  | 'hallucination'

/** Curated listing id → benchmark domain (unknown listings have no domain). */
const EVAL_DOMAIN_BY_LISTING_ID: Record<string, EvalDomainId> = {
  'app-eval-model-arena': 'arena',
  'app-eval-math-arena': 'math',
  'app-eval-chinese-eval': 'chinese',
  'app-eval-ridiculous': 'logic',
  'app-eval-instruction-following': 'instruction',
  'app-eval-agent-arena': 'agent-coding',
  'app-eval-swe-bench': 'swe',
  'app-eval-pelican-bike': 'svg',
  'app-eval-forbidden-city': 'scene3d',
  'app-eval-webdev-arena': 'webdev',
  'app-eval-tools-arena': 'tools',
  'app-eval-gaia': 'gaia',
  'app-eval-longctx-arena': 'longctx',
  'app-eval-multimodal-arena': 'multimodal',
  'app-eval-safety': 'safety',
  'app-eval-hallucination': 'hallucination',
}

/** Benchmark domain of a listing, or `undefined` when unclassified. */
export function resolveEvalAppDomain(app: Pick<AppItem, 'id'>): EvalDomainId | undefined {
  return EVAL_DOMAIN_BY_LISTING_ID[app.id]
}

/**
 * Domain options for the second-level filter row, in curated order. With
 * `sectionId` the row narrows to the domains inside that section — the
 * dependent-filter behavior of the education experiment page.
 */
export function evalDomainsForSection(sectionId: EvalSectionId | 'all'): EvalDomainId[] {
  const domains: EvalDomainId[] = []
  for (const [listingId, domain] of Object.entries(EVAL_DOMAIN_BY_LISTING_ID)) {
    if (sectionId !== 'all' && resolveEvalSectionId({ id: listingId }) !== sectionId) {
      continue
    }
    if (!domains.includes(domain)) {
      domains.push(domain)
    }
  }
  return domains
}

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
  {
    listingIds: ['app-eval-chinese-eval'],
    listingNames: ['中文知识测评（C-Eval）', '中文知识测评'],
    // C-Eval/CMMLU board: accuracy over 52 disciplines and four difficulty levels.
    specs: [
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '中文知识与学科覆盖最均衡', benchmark: { score: 90.8, sampleSize: 13948, sampleUnit: 'questions', dimensions: [ { name: '人文', score: 92 }, { name: '社科', score: 91 }, { name: 'STEM', score: 90 }, { name: '专业', score: 90 } ] } },
      { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '中文专业考试表现稳定', benchmark: { score: 89.6, sampleSize: 13948, sampleUnit: 'questions', dimensions: [ { name: '人文', score: 91 }, { name: '社科', score: 90 }, { name: 'STEM', score: 89 }, { name: '专业', score: 89 } ] } },
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: 'STEM 与专业题推理扎实', benchmark: { score: 88.9, sampleSize: 13948, sampleUnit: 'questions', dimensions: [ { name: '人文', score: 90 }, { name: '社科', score: 89 }, { name: 'STEM', score: 89 }, { name: '专业', score: 88 } ] } },
      { id: 'model-doubao-16', kind: 'model', name: 'Doubao-1.6', publisher: '字节跳动', summary: '中文语义理解自然', benchmark: { score: 87.4, sampleSize: 13948, sampleUnit: 'questions', dimensions: [ { name: '人文', score: 88 }, { name: '社科', score: 87 }, { name: 'STEM', score: 87 }, { name: '专业', score: 88 } ] } },
      { id: 'model-kimi-k2', kind: 'model', name: 'Kimi K2', publisher: '月之暗面', summary: '长题干与材料题阅读稳定', benchmark: { score: 86.8, sampleSize: 13948, sampleUnit: 'questions', dimensions: [ { name: '人文', score: 87 }, { name: '社科', score: 86 }, { name: 'STEM', score: 86 }, { name: '专业', score: 87 } ] } },
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '英文语境强，中文专业题略逊', benchmark: { score: 84.2, sampleSize: 13948, sampleUnit: 'questions', dimensions: [ { name: '人文', score: 84 }, { name: '社科', score: 83 }, { name: 'STEM', score: 85 }, { name: '专业', score: 85 } ] } },
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '长文本材料分析强，题库覆盖偏弱', benchmark: { score: 82.6, sampleSize: 13948, sampleUnit: 'questions', dimensions: [ { name: '人文', score: 83 }, { name: '社科', score: 82 }, { name: 'STEM', score: 82 }, { name: '专业', score: 84 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-ridiculous'],
    listingNames: ['弱智吧逻辑测评'],
    // Ridiculous-Bar board: anti-intuition traps and ambiguous wording.
    specs: [
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '反直觉陷阱识别率最高', benchmark: { score: 88.6, sampleSize: 500, sampleUnit: 'questions', dimensions: [ { name: '反直觉陷阱', score: 90 }, { name: '语义歧义', score: 88 }, { name: '常识纠错', score: 89 }, { name: '多轮追问', score: 87 } ] } },
      { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '中文语境与谐音陷阱识别好', benchmark: { score: 87.2, sampleSize: 500, sampleUnit: 'questions', dimensions: [ { name: '反直觉陷阱', score: 88 }, { name: '语义歧义', score: 88 }, { name: '常识纠错', score: 87 }, { name: '多轮追问', score: 86 } ] } },
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '逻辑拆分清晰，偶被中文谐音带偏', benchmark: { score: 86.4, sampleSize: 500, sampleUnit: 'questions', dimensions: [ { name: '反直觉陷阱', score: 87 }, { name: '语义歧义', score: 85 }, { name: '常识纠错', score: 88 }, { name: '多轮追问', score: 85 } ] } },
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '解释自洽，中文陷阱识别中等', benchmark: { score: 85.7, sampleSize: 500, sampleUnit: 'questions', dimensions: [ { name: '反直觉陷阱', score: 86 }, { name: '语义歧义', score: 85 }, { name: '常识纠错', score: 86 }, { name: '多轮追问', score: 86 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '常识纠错稳定，多轮略弱', benchmark: { score: 85.1, sampleSize: 500, sampleUnit: 'questions', dimensions: [ { name: '反直觉陷阱', score: 86 }, { name: '语义歧义', score: 85 }, { name: '常识纠错', score: 86 }, { name: '多轮追问', score: 83 } ] } },
      { id: 'model-kimi-k2', kind: 'model', name: 'Kimi K2', publisher: '月之暗面', summary: '长题干易被前提带偏', benchmark: { score: 83.8, sampleSize: 500, sampleUnit: 'questions', dimensions: [ { name: '反直觉陷阱', score: 84 }, { name: '语义歧义', score: 84 }, { name: '常识纠错', score: 84 }, { name: '多轮追问', score: 83 } ] } },
      { id: 'model-doubao-16', kind: 'model', name: 'Doubao-1.6', publisher: '字节跳动', summary: '对话自然，陷阱题稳定度一般', benchmark: { score: 82.9, sampleSize: 500, sampleUnit: 'questions', dimensions: [ { name: '反直觉陷阱', score: 83 }, { name: '语义歧义', score: 83 }, { name: '常识纠错', score: 84 }, { name: '多轮追问', score: 81 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-instruction-following'],
    listingNames: ['指令遵循测评（IFEval）', '指令遵循测评'],
    // IFEval board: strict compliance on verifiable instructions.
    specs: [
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '格式与长度硬约束最稳', benchmark: { score: 93.4, sampleSize: 541, sampleUnit: 'questions', dimensions: [ { name: '格式约束', score: 95 }, { name: '长度约束', score: 94 }, { name: '关键词约束', score: 92 }, { name: '多约束组合', score: 92 } ] } },
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '多约束组合遵循稳定', benchmark: { score: 92.8, sampleSize: 541, sampleUnit: 'questions', dimensions: [ { name: '格式约束', score: 94 }, { name: '长度约束', score: 93 }, { name: '关键词约束', score: 92 }, { name: '多约束组合', score: 92 } ] } },
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '格式还原准确，长输出偶超限', benchmark: { score: 91.2, sampleSize: 541, sampleUnit: 'questions', dimensions: [ { name: '格式约束', score: 93 }, { name: '长度约束', score: 90 }, { name: '关键词约束', score: 91 }, { name: '多约束组合', score: 90 } ] } },
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '结构化输出可靠', benchmark: { score: 90.6, sampleSize: 541, sampleUnit: 'questions', dimensions: [ { name: '格式约束', score: 92 }, { name: '长度约束', score: 90 }, { name: '关键词约束', score: 90 }, { name: '多约束组合', score: 90 } ] } },
      { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '中文格式指令理解准确', benchmark: { score: 89.7, sampleSize: 541, sampleUnit: 'questions', dimensions: [ { name: '格式约束', score: 91 }, { name: '长度约束', score: 89 }, { name: '关键词约束', score: 90 }, { name: '多约束组合', score: 88 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '单约束稳定，多约束偶有遗漏', benchmark: { score: 88.9, sampleSize: 541, sampleUnit: 'questions', dimensions: [ { name: '格式约束', score: 90 }, { name: '长度约束', score: 89 }, { name: '关键词约束', score: 89 }, { name: '多约束组合', score: 87 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-swe-bench'],
    listingNames: ['真实仓库修复（SWE-bench）', '真实仓库修复'],
    // SWE-bench Verified board: resolved-issue rate in real repositories.
    specs: [
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '仓库定位与补丁最小性领先', benchmark: { score: 74.6, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主定位', score: 76 }, { name: '补丁正确', score: 74 }, { name: '回归通过', score: 75 }, { name: '改动最小', score: 73 } ] } },
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '跨文件修复与测试补全稳定', benchmark: { score: 73.2, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主定位', score: 75 }, { name: '补丁正确', score: 73 }, { name: '回归通过', score: 73 }, { name: '改动最小', score: 72 } ] } },
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '大仓库上下文理解强', benchmark: { score: 71.8, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主定位', score: 73 }, { name: '补丁正确', score: 71 }, { name: '回归通过', score: 72 }, { name: '改动最小', score: 71 } ] } },
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '算法类修复准确，前端仓库稍弱', benchmark: { score: 69.4, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主定位', score: 71 }, { name: '补丁正确', score: 69 }, { name: '回归通过', score: 70 }, { name: '改动最小', score: 68 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '中文注释仓库修补稳定', benchmark: { score: 66.1, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主定位', score: 68 }, { name: '补丁正确', score: 66 }, { name: '回归通过', score: 66 }, { name: '改动最小', score: 65 } ] } },
      { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '依赖梳理准确，复杂补丁偏保守', benchmark: { score: 62.7, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主定位', score: 64 }, { name: '补丁正确', score: 63 }, { name: '回归通过', score: 63 }, { name: '改动最小', score: 61 } ] } },
      { id: 'model-kimi-k2', kind: 'model', name: 'Kimi K2', publisher: '月之暗面', summary: '长上下文仓库阅读强，修复偏慢', benchmark: { score: 60.3, sampleSize: 500, sampleUnit: 'tasks', dimensions: [ { name: '自主定位', score: 63 }, { name: '补丁正确', score: 60 }, { name: '回归通过', score: 60 }, { name: '改动最小', score: 58 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-pelican-bike'],
    listingNames: ['醍醐骑单车 · SVG 空间推理', '醍醐骑单车'],
    // Pelican-on-a-bicycle board: spatial composition and native SVG output.
    specs: [
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '骑手坐姿与踏板关系最自然', benchmark: { score: 93.8, sampleSize: 480, sampleUnit: 'votes', dimensions: [ { name: '物体组合', score: 96 }, { name: '空间关系', score: 93 }, { name: '肢体连贯', score: 92 }, { name: '代码自洽', score: 94 } ] } },
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '双轮车架结构完整，细节稳定', benchmark: { score: 92.1, sampleSize: 480, sampleUnit: 'votes', dimensions: [ { name: '物体组合', score: 95 }, { name: '空间关系', score: 91 }, { name: '肢体连贯', score: 90 }, { name: '代码自洽', score: 92 } ] } },
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '循环动画流畅，肢体偶有脱节', benchmark: { score: 90.6, sampleSize: 480, sampleUnit: 'votes', dimensions: [ { name: '物体组合', score: 93 }, { name: '空间关系', score: 89 }, { name: '肢体连贯', score: 89 }, { name: '代码自洽', score: 91 } ] } },
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: 'SVG 结构正确，空间层次偏平', benchmark: { score: 88.3, sampleSize: 480, sampleUnit: 'votes', dimensions: [ { name: '物体组合', score: 91 }, { name: '空间关系', score: 87 }, { name: '肢体连贯', score: 86 }, { name: '代码自洽', score: 89 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '车架比例准确，踏板连贯稍弱', benchmark: { score: 86.9, sampleSize: 480, sampleUnit: 'votes', dimensions: [ { name: '物体组合', score: 89 }, { name: '空间关系', score: 86 }, { name: '肢体连贯', score: 84 }, { name: '代码自洽', score: 88 } ] } },
      { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '基础图形完整，空间遮挡欠佳', benchmark: { score: 84.7, sampleSize: 480, sampleUnit: 'votes', dimensions: [ { name: '物体组合', score: 87 }, { name: '空间关系', score: 83 }, { name: '肢体连贯', score: 82 }, { name: '代码自洽', score: 87 } ] } },
      { id: 'model-kimi-k2', kind: 'model', name: 'Kimi K2', publisher: '月之暗面', summary: '元素齐全，骑乘关系易错位', benchmark: { score: 82.4, sampleSize: 480, sampleUnit: 'votes', dimensions: [ { name: '物体组合', score: 85 }, { name: '空间关系', score: 80 }, { name: '肢体连贯', score: 80 }, { name: '代码自洽', score: 85 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-forbidden-city'],
    listingNames: ['紫禁城 · 3D 场景生成', '紫禁城'],
    // Forbidden-City 3D board: architecture fidelity and runtime quality.
    specs: [
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '建筑比例与檐角结构还原准确', benchmark: { score: 91.7, sampleSize: 240, sampleUnit: 'votes', dimensions: [ { name: '建筑还原', score: 93 }, { name: '比例结构', score: 91 }, { name: '材质光影', score: 90 }, { name: '交互性能', score: 93 } ] } },
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '场景完整，雪景光影自然', benchmark: { score: 90.2, sampleSize: 240, sampleUnit: 'votes', dimensions: [ { name: '建筑还原', score: 92 }, { name: '比例结构', score: 90 }, { name: '材质光影', score: 90 }, { name: '交互性能', score: 89 } ] } },
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '材质表现好，台基比例偶有偏差', benchmark: { score: 89.4, sampleSize: 240, sampleUnit: 'votes', dimensions: [ { name: '建筑还原', score: 90 }, { name: '比例结构', score: 88 }, { name: '材质光影', score: 91 }, { name: '交互性能', score: 89 } ] } },
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '结构清晰，斗拱细节简化', benchmark: { score: 86.8, sampleSize: 240, sampleUnit: 'votes', dimensions: [ { name: '建筑还原', score: 88 }, { name: '比例结构', score: 86 }, { name: '材质光影', score: 86 }, { name: '交互性能', score: 87 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '中式元素齐备，性能优化一般', benchmark: { score: 85.9, sampleSize: 240, sampleUnit: 'votes', dimensions: [ { name: '建筑还原', score: 87 }, { name: '比例结构', score: 85 }, { name: '材质光影', score: 85 }, { name: '交互性能', score: 86 } ] } },
      { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '屋顶结构正确，场景偏空', benchmark: { score: 83.6, sampleSize: 240, sampleUnit: 'votes', dimensions: [ { name: '建筑还原', score: 85 }, { name: '比例结构', score: 83 }, { name: '材质光影', score: 82 }, { name: '交互性能', score: 84 } ] } },
      { id: 'model-doubao-16', kind: 'model', name: 'Doubao-1.6', publisher: '字节跳动', summary: '氛围感好，建筑细节不足', benchmark: { score: 81.2, sampleSize: 240, sampleUnit: 'votes', dimensions: [ { name: '建筑还原', score: 82 }, { name: '比例结构', score: 80 }, { name: '材质光影', score: 82 }, { name: '交互性能', score: 81 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-webdev-arena'],
    listingNames: ['前端作品竞技场'],
    // WebDev-Arena board: pairwise page-generation battles.
    specs: [
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '视觉还原与代码质量兼顾', benchmark: { score: 92.6, sampleSize: 24000, sampleUnit: 'votes', dimensions: [ { name: '视觉还原', score: 93 }, { name: '交互完整', score: 92 }, { name: '响应式', score: 91 }, { name: '代码质量', score: 94 } ] } },
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '交互完成度高，视觉偶有偏差', benchmark: { score: 91.8, sampleSize: 24000, sampleUnit: 'votes', dimensions: [ { name: '视觉还原', score: 92 }, { name: '交互完整', score: 93 }, { name: '响应式', score: 91 }, { name: '代码质量', score: 91 } ] } },
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '动画与动效表现突出', benchmark: { score: 90.4, sampleSize: 24000, sampleUnit: 'votes', dimensions: [ { name: '视觉还原', score: 92 }, { name: '交互完整', score: 90 }, { name: '响应式', score: 90 }, { name: '代码质量', score: 90 } ] } },
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '代码结构清晰，视觉细节偏简', benchmark: { score: 87.9, sampleSize: 24000, sampleUnit: 'votes', dimensions: [ { name: '视觉还原', score: 88 }, { name: '交互完整', score: 88 }, { name: '响应式', score: 87 }, { name: '代码质量', score: 89 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '中文版面还原稳定', benchmark: { score: 86.5, sampleSize: 24000, sampleUnit: 'votes', dimensions: [ { name: '视觉还原', score: 87 }, { name: '交互完整', score: 86 }, { name: '响应式', score: 86 }, { name: '代码质量', score: 87 } ] } },
      { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '基础组件可靠，复杂动效不足', benchmark: { score: 84.8, sampleSize: 24000, sampleUnit: 'votes', dimensions: [ { name: '视觉还原', score: 85 }, { name: '交互完整', score: 84 }, { name: '响应式', score: 84 }, { name: '代码质量', score: 86 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-gaia'],
    listingNames: ['通用助手任务（GAIA）', '通用助手任务'],
    // GAIA board: real-world assistant tasks solved end to end.
    specs: [
      { id: 'agent-birdcoder', kind: 'agent', name: 'BirdCoder', publisher: 'SDKWork', summary: '工具编排与文件处理一体化', benchmark: { score: 72.8, sampleSize: 466, sampleUnit: 'tasks', dimensions: [ { name: '多步推理', score: 74 }, { name: '工具编排', score: 73 }, { name: '网页检索', score: 72 }, { name: '多模态', score: 71 } ] } },
      { id: 'agent-manus', kind: 'agent', name: 'Manus Agent', publisher: 'Manus', summary: '网页任务与交付物生成成熟', benchmark: { score: 70.6, sampleSize: 466, sampleUnit: 'tasks', dimensions: [ { name: '多步推理', score: 72 }, { name: '工具编排', score: 71 }, { name: '网页检索', score: 71 }, { name: '多模态', score: 68 } ] } },
      { id: 'agent-claude-code', kind: 'agent', name: 'Claude Code', publisher: 'Anthropic', summary: '文件与代码任务强，网页弱', benchmark: { score: 68.9, sampleSize: 466, sampleUnit: 'tasks', dimensions: [ { name: '多步推理', score: 71 }, { name: '工具编排', score: 69 }, { name: '网页检索', score: 65 }, { name: '多模态', score: 69 } ] } },
      { id: 'agent-codex', kind: 'agent', name: 'Codex CLI', publisher: 'OpenAI', summary: '脚本化流程稳定，检索偏弱', benchmark: { score: 66.4, sampleSize: 466, sampleUnit: 'tasks', dimensions: [ { name: '多步推理', score: 68 }, { name: '工具编排', score: 67 }, { name: '网页检索', score: 63 }, { name: '多模态', score: 65 } ] } },
      { id: 'agent-gemini-cli', kind: 'agent', name: 'Gemini CLI', publisher: 'Google', summary: '多模态优势，长流程不稳', benchmark: { score: 63.7, sampleSize: 466, sampleUnit: 'tasks', dimensions: [ { name: '多步推理', score: 65 }, { name: '工具编排', score: 63 }, { name: '网页检索', score: 63 }, { name: '多模态', score: 66 } ] } },
      { id: 'agent-cursor', kind: 'agent', name: 'Cursor Agent', publisher: 'Anysphere', summary: '编辑器内任务快，跨工具链弱', benchmark: { score: 59.2, sampleSize: 466, sampleUnit: 'tasks', dimensions: [ { name: '多步推理', score: 61 }, { name: '工具编排', score: 59 }, { name: '网页检索', score: 57 }, { name: '多模态', score: 58 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-safety'],
    listingNames: ['安全对齐测评'],
    // HarmBench/JailbreakBench board: refusal correctness, not blanket refusal.
    specs: [
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '越狱抵抗与过度拒答控制均衡', benchmark: { score: 94.1, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '越狱抵抗', score: 96 }, { name: '有害拒答', score: 94 }, { name: '隐私保护', score: 93 }, { name: '过度拒答控制', score: 93 } ] } },
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '有害请求识别稳定', benchmark: { score: 93.2, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '越狱抵抗', score: 95 }, { name: '有害拒答', score: 93 }, { name: '隐私保护', score: 93 }, { name: '过度拒答控制', score: 92 } ] } },
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '高风险建议拦截准确', benchmark: { score: 91.7, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '越狱抵抗', score: 93 }, { name: '有害拒答', score: 92 }, { name: '隐私保护', score: 91 }, { name: '过度拒答控制', score: 91 } ] } },
      { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '中文越狱变体识别好', benchmark: { score: 90.4, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '越狱抵抗', score: 92 }, { name: '有害拒答', score: 90 }, { name: '隐私保护', score: 90 }, { name: '过度拒答控制', score: 89 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '拒答边界清晰', benchmark: { score: 89.8, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '越狱抵抗', score: 91 }, { name: '有害拒答', score: 90 }, { name: '隐私保护', score: 89 }, { name: '过度拒答控制', score: 89 } ] } },
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '角色扮演越狱偶有穿透', benchmark: { score: 88.6, sampleSize: 1200, sampleUnit: 'questions', dimensions: [ { name: '越狱抵抗', score: 89 }, { name: '有害拒答', score: 89 }, { name: '隐私保护', score: 88 }, { name: '过度拒答控制', score: 88 } ] } },
    ],
  },
  {
    listingIds: ['app-eval-hallucination'],
    listingNames: ['事实性幻觉测评'],
    // SimpleQA/TruthfulQA board: factual accuracy and calibrated abstention.
    specs: [
      { id: 'model-gpt-5', kind: 'model', name: 'GPT-5', publisher: 'OpenAI', summary: '短事实问答与校准度领先', benchmark: { score: 78.4, sampleSize: 3000, sampleUnit: 'questions', dimensions: [ { name: '事实准确', score: 80 }, { name: '校准度', score: 77 }, { name: '恰当拒答', score: 79 }, { name: '引用可溯', score: 76 } ] } },
      { id: 'model-claude-sonnet-45', kind: 'model', name: 'Claude Sonnet 4.5', publisher: 'Anthropic', summary: '不确定时更愿意拒答', benchmark: { score: 76.9, sampleSize: 3000, sampleUnit: 'questions', dimensions: [ { name: '事实准确', score: 78 }, { name: '校准度', score: 77 }, { name: '恰当拒答', score: 78 }, { name: '引用可溯', score: 74 } ] } },
      { id: 'model-gemini-25-pro', kind: 'model', name: 'Gemini 2.5 Pro', publisher: 'Google', summary: '搜索增强降低幻觉', benchmark: { score: 75.3, sampleSize: 3000, sampleUnit: 'questions', dimensions: [ { name: '事实准确', score: 77 }, { name: '校准度', score: 74 }, { name: '恰当拒答', score: 75 }, { name: '引用可溯', score: 75 } ] } },
      { id: 'model-deepseek-v32', kind: 'model', name: 'DeepSeek-V3.2', publisher: 'DeepSeek', summary: '推理类事实稳定，冷知识易幻觉', benchmark: { score: 72.8, sampleSize: 3000, sampleUnit: 'questions', dimensions: [ { name: '事实准确', score: 74 }, { name: '校准度', score: 72 }, { name: '恰当拒答', score: 73 }, { name: '引用可溯', score: 72 } ] } },
      { id: 'model-qwen3-max', kind: 'model', name: 'Qwen3-Max', publisher: '阿里云', summary: '中文事实准确度较好', benchmark: { score: 71.4, sampleSize: 3000, sampleUnit: 'questions', dimensions: [ { name: '事实准确', score: 74 }, { name: '校准度', score: 70 }, { name: '恰当拒答', score: 71 }, { name: '引用可溯', score: 70 } ] } },
      { id: 'model-glm-47', kind: 'model', name: 'GLM-4.7', publisher: '智谱 AI', summary: '愿意给出来源，个别年份漂移', benchmark: { score: 70.2, sampleSize: 3000, sampleUnit: 'questions', dimensions: [ { name: '事实准确', score: 72 }, { name: '校准度', score: 69 }, { name: '恰当拒答', score: 70 }, { name: '引用可溯', score: 70 } ] } },
      { id: 'model-kimi-k2', kind: 'model', name: 'Kimi K2', publisher: '月之暗面', summary: '检索补充好，闭卷题偏弱', benchmark: { score: 69.6, sampleSize: 3000, sampleUnit: 'questions', dimensions: [ { name: '事实准确', score: 71 }, { name: '校准度', score: 69 }, { name: '恰当拒答', score: 70 }, { name: '引用可溯', score: 68 } ] } },
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
