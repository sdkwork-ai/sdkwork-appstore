import type { AiExpertCard } from '@/hooks/aiLab';

/**
 * Storefront curated expert catalog for the H5 专家 page.
 *
 * Appstore-owned presentation content (`specs/AGENTS_DEPENDENCY_BOUNDARY_SPEC.md`
 * section 4): not an Agents contract, never written into Agents tables. The H5
 * root owns its curated set; the Experts runtime (sessions, turns) always flows
 * through the Agents SDK services.
 */
export const AI_EXPERT_CATALOG: readonly AiExpertCard[] = [
  {
    id: 'exp-senior-dev',
    name: '高级开发工程师',
    title: '吴人哥',
    description: '10年以上全栈经验，精通多种语言和框架，擅长复杂分布式架构与代码质量把关。',
    category: '技术工程',
    tags: ['高级开发', '架构设计', '代码质量'],
    scenarios: ['代码审查', '架构设计', '系统重构'],
  },
  {
    id: 'exp-content',
    name: '内容创作专家团',
    title: '文博远',
    description: '覆盖选题策划、标题打磨与平台分发策略的内容创作专家团队。',
    category: '内容创作',
    tags: ['内容策划', '新媒体运营', '爆款方法论'],
    scenarios: ['选题策划', '文章润色', '平台分发'],
  },
  {
    id: 'exp-invest',
    name: '交易分析团队',
    title: '量化师',
    description: '以量化视角解读市场数据，输出结构化的交易分析与风险提示。',
    category: '投资分析',
    tags: ['量化分析', '市场研判', '风险控制'],
    scenarios: ['行情解读', '策略回测', '风险提示'],
  },
  {
    id: 'exp-legal',
    name: '法律检索专家',
    title: '法学通',
    description: '熟悉民商法检索与类案分析，快速给出法律依据与合规建议。',
    category: '法律咨询',
    tags: ['法律检索', '类案分析', '合规建议'],
    scenarios: ['合同审查', '类案检索', '合规咨询'],
  },
  {
    id: 'exp-ecom',
    name: '中国电商运营专家',
    title: '电商通',
    description: '精通主流电商平台运营打法，从选品到转化全链路提效。',
    category: '电商运营',
    tags: ['平台运营', '选品策略', '转化优化'],
    scenarios: ['选品分析', '活动策划', '转化诊断'],
  },
  {
    id: 'exp-data',
    name: '数据分析报告师',
    title: '数透析',
    description: '将业务数据转化为决策语言，输出结构化分析报告与行动建议。',
    category: '数据分析',
    tags: ['数据清洗', '可视化', '报告输出'],
    scenarios: ['指标拆解', '趋势分析', '报告生成'],
  },
  {
    id: 'exp-doc',
    name: '专业文档专家',
    title: '文先生',
    description: '合同、标书、论文等专业文档的结构化写作与审校专家。',
    category: '专业文档',
    tags: ['文档写作', '格式规范', '审校'],
    scenarios: ['标书撰写', '论文润色', '合同起草'],
  },
  {
    id: 'exp-education',
    name: '升学规划导师',
    title: '学路明',
    description: '熟悉升学路径与志愿策略，为家庭提供个性化教育规划建议。',
    category: '教育升学',
    tags: ['升学规划', '志愿填报', '学习路径'],
    scenarios: ['志愿填报', '学业规划', '备考策略'],
  },
];

/** Scenario strip mirrored from the PC 专家 page scenario rail. */
export const AI_EXPERT_SCENARIOS: ReadonlyArray<{
  id: string;
  title: string;
  expertCount: number;
}> = [
  { id: 'scen-content', title: '内容创作', expertCount: 12 },
  { id: 'scen-invest', title: '投资分析', expertCount: 9 },
  { id: 'scen-legal', title: '法律咨询', expertCount: 8 },
  { id: 'scen-business', title: '小微企业', expertCount: 15 },
  { id: 'scen-ecom', title: '电商运营', expertCount: 11 },
  { id: 'scen-data', title: '数据分析', expertCount: 14 },
  { id: 'scen-doc', title: '专业文档', expertCount: 10 },
];

/** Distinct filter tags in catalog order. */
export const AI_EXPERT_TAGS: readonly string[] = Array.from(
  new Set(AI_EXPERT_CATALOG.map((expert) => expert.category)),
);
