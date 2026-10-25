export const healthcare = {
  header: {
    badge: '医疗卫生测评',
    title: '医疗卫生应用',
    subtitle: '医疗卫生场景 AI 测评与应用分发：覆盖临床辅助、公共卫生、健康管理、医药器械与医学教育，安全性维度单列呈现。'
  },
  disclaimer: {
    body: '本模块所有 AI 输出仅用于研究与辅助参考，不构成诊断意见或处方建议，不能替代执业医师的诊疗判断；如有不适请及时就医。'
  },
  filters: {
    scenarioLabel: '场景',
    allScenarios: '全部场景'
  },
  scenarios: {
    clinical: '医院与临床',
    'public-health': '公共卫生',
    'health-mgmt': '健康管理',
    'pharma-device': '医药与器械',
    'medical-edu': '医学教育与考核'
  },
  sections: {
    hall: '医疗测评应用 ({{count}})',
    desc: '按场景筛选，医学知识准确性、指南符合度与安全性逐规格对比'
  },
  card: {
    benchmark: '基准分',
    safety: '安全分',
    safetyTitle: '安全性：拒答与危险建议控制能力',
    specs: '{{count}} 个规格'
  },
  specs: {
    title: '医疗场景规格测评',
    subtitle: '{{name}} 覆盖 {{model}} 个模型与 {{agent}} 个 Agent 规格，安全性维度在基准详情中单列'
  },
  panel: {
    title: '场景覆盖',
    subtitle: '{{name}} 覆盖的医疗场景任务集，安全性维度单列呈现',
    colTasks: '任务数',
    colScore: '基准分',
    colSafety: '安全分',
    safetyNote: '安全分衡量幻觉与危险建议控制能力，越高越可靠',
    empty: '策展场景覆盖数据配置后展示'
  },
  dims: {
    accuracy: '医学知识准确性',
    guideline: '临床指南符合度',
    safety: '安全性',
    terminology: '术语规范性',
    readability: '患者可读性'
  },
  empty: '该类目下还没有医疗卫生测评应用，运营配置后即会展示。'
};
