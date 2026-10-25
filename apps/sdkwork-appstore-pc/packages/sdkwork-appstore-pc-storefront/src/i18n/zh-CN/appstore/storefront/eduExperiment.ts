export const eduExperiment = {
  header: {
    badge: '教育实验测评',
    title: '教育实验应用',
    subtitle: '多规格教育实验测评应用：同一测评覆盖 K12、大学与专业应用的实验任务，按学段与学科分类，每个 AI 规格独立评分与评论。'
  },
  filters: {
    all: '全部',
    stageLabel: '学段',
    k12Label: 'K12 学段',
    allStages: '全部 K12',
    subjectLabel: '学科',
    allSubjects: '全部学科'
  },
  stageGroups: {
    k12: 'K12',
    university: '大学',
    professional: '专业应用'
  },
  stages: {
    'k12-primary': '小学',
    'k12-junior': '初中',
    'k12-senior': '高中',
    university: '大学',
    professional: '专业应用'
  },
  subjects: {
    math: '数学',
    physics: '物理',
    chemistry: '化学',
    biology: '生物',
    science: '科学',
    geography: '地理',
    it: '信息科技',
    chinese: '语文',
    'foreign-language': '外语',
    engineering: '工程基础'
  },
  sections: {
    hall: '实验测评应用 ({{count}})',
    desc: '按学段与学科筛选，查看每个 AI 规格在实验任务上的独立评分与评论'
  },
  card: {
    benchmark: '基准分',
    specs: '{{count}} 个规格'
  },
  specs: {
    title: '教育实验规格测评',
    subtitle: '{{name}} 覆盖 {{model}} 个模型与 {{agent}} 个 Agent 规格，按基准分排序，逐规格评分与评论'
  },
  panel: {
    title: '学段×学科覆盖矩阵',
    subtitle: '{{name}} 覆盖的学段与学科实验任务集，格内为任务数与基准分',
    colTask: '任务数',
    colScore: '基准分',
    empty: '策展覆盖数据配置后展示'
  },
  dims: {
    operation: '实验操作仿真',
    grading: '实验报告批改',
    design: '实验设计辅导',
    qa: '学科知识问答',
    safety: '安全规范提示'
  },
  empty: '该类目下还没有教育实验测评应用，运营配置后即会展示。'
};
