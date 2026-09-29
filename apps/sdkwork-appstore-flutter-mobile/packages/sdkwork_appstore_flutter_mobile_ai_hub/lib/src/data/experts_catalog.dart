import '../models/ai_hub_models.dart';

/// Storefront curated expert catalog for the Flutter 专家 page.
///
/// Appstore-owned presentation content
/// (`specs/AGENTS_DEPENDENCY_BOUNDARY_SPEC.md` section 4): not an Agents
/// contract, never written into Agents tables. Any expert runtime (sessions,
/// turns) flows through the Agents SDK services.
const List<AiExpertEntry> aiExpertCatalog = <AiExpertEntry>[
  AiExpertEntry(
    id: 'exp-senior-dev',
    name: '高级开发工程师',
    title: '吴人哥',
    description: '10年以上全栈经验，擅长复杂分布式架构与代码质量把关。',
    category: '技术工程',
    tags: <String>['高级开发', '架构设计', '代码质量'],
  ),
  AiExpertEntry(
    id: 'exp-content',
    name: '内容创作专家团',
    title: '文博远',
    description: '覆盖选题策划、标题打磨与平台分发策略的内容创作团队。',
    category: '内容创作',
    tags: <String>['内容策划', '新媒体运营', '爆款方法论'],
  ),
  AiExpertEntry(
    id: 'exp-invest',
    name: '交易分析团队',
    title: '量化师',
    description: '以量化视角解读市场数据，输出结构化交易分析与风险提示。',
    category: '投资分析',
    tags: <String>['量化分析', '市场研判', '风险控制'],
  ),
  AiExpertEntry(
    id: 'exp-legal',
    name: '法律检索专家',
    title: '法学通',
    description: '熟悉民商法检索与类案分析，快速给出法律依据与合规建议。',
    category: '法律咨询',
    tags: <String>['法律检索', '类案分析', '合规建议'],
  ),
  AiExpertEntry(
    id: 'exp-ecom',
    name: '中国电商运营专家',
    title: '电商通',
    description: '精通主流电商平台运营打法，从选品到转化全链路提效。',
    category: '电商运营',
    tags: <String>['平台运营', '选品策略', '转化优化'],
  ),
  AiExpertEntry(
    id: 'exp-data',
    name: '数据分析报告师',
    title: '数透析',
    description: '将业务数据转化为决策语言，输出结构化分析报告与行动建议。',
    category: '数据分析',
    tags: <String>['数据清洗', '可视化', '报告输出'],
  ),
];

/// Distinct expert categories in catalog order (filter chips).
List<String> aiExpertCategories() => <String>[
      '全部',
      for (final expert in aiExpertCatalog) expert.category,
    ];
