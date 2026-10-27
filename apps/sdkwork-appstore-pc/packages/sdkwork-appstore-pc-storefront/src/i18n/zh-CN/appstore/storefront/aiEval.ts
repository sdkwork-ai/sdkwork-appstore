export const aiEval = {
  header: {
    badge: 'AI 测评中心',
    title: 'AI 模型测评',
    subtitle: '多规格测评应用：同一测评覆盖不同模型与 Agent（BirdCoder、Codex、Claude Code 等），每个规格独立评分与评论。'
  },
  sections: {
    hall: '测评应用 ({{count}})',
    desc: '按分类与领域筛选，点击应用查看规格详情，按模型或 Agent 分别打分与评论',
    general: '通用能力测评（{{count}}）',
    generalDesc: '综合竞技、中文知识、逻辑陷阱与指令遵循',
    code: '代码与创作生成（{{count}}）',
    codeDesc: '真实仓库修复、SVG 空间推理、3D 场景与前端作品',
    agent: 'Agent 与工具（{{count}}）',
    agentDesc: '工具调用与真实世界助手任务',
    multimodal: '多模态与长文本（{{count}}）',
    multimodalDesc: '图像与图表理解、超长上下文检索',
    trust: '安全与事实性（{{count}}）',
    trustDesc: '越狱抵抗、有害内容拒答与幻觉校准'
  },
  filters: {
    all: '全部',
    sectionLabel: '分类',
    domainLabel: '领域',
    allDomains: '全部领域',
    sections: {
      general: '综合能力',
      code: '代码与创作',
      agent: 'Agent 与工具',
      multimodal: '多模态与长文本',
      trust: '安全与事实'
    }
  },
  domains: {
    arena: '综合竞技场',
    math: '数学推理',
    chinese: '中文知识',
    logic: '逻辑常识',
    instruction: '指令遵循',
    'agent-coding': '编程 Agent',
    swe: '仓库修复',
    svg: 'SVG 空间创作',
    scene3d: '3D 场景生成',
    webdev: '前端竞技场',
    gaia: '通用助手任务',
    tools: '工具调用',
    longctx: '长文本理解',
    multimodal: '多模态理解',
    safety: '安全对齐',
    hallucination: '事实性幻觉'
  },
  specs: {
    model: '模型规格',
    agent: 'Agent 规格',
    count: '{{count}} 个规格',
    breakdown: '模型×{{model}} · Agent×{{agent}}'
  },
  card: {
    benchmark: '基准分'
  },
  empty: '该类目下还没有测评应用，运营配置后即会展示。'
};
