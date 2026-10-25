# REQ-2026-0004 Healthcare Apps Module

Status: in-progress（阶段一已实现，待合入；举报理由延期，见 Acceptance Criteria）
Owner: sdkwork-appstore
Date: 2026-10-25
Specs: REQUIREMENTS_SPEC.md, DOCUMENTATION_SPEC.md, COMPONENT_SPEC.md, COMPOSABLE_ARCHITECTURE_SPEC.md, I18N_SPEC.md, PAGINATION_SPEC.md, DATABASE_SPEC.md, PRIVACY_SPEC.md, SECURITY_SPEC.md
Product design: [PRD-vertical-evaluation-modules.md](../prd/PRD-vertical-evaluation-modules.md) §5

## Problem

医疗卫生场景（临床辅助、公共卫生宣教、健康管理、医学教育）没有独立的市场入口：临床医生、医院信息科与医学院师生无法按场景比较各 AI 工具的医学知识准确性、指南符合度与安全性；测评应用的「安全性」（幻觉与危险建议控制）在通用测评里不单列，医疗选型最关键的信号缺失。医疗场景还有固定合规要求：AI 输出不得替代执业医师诊断，入口必须承载非诊断免责声明。

需要一个独立模块，按场景组织医疗 AI 测评应用，把安全维度作为显著信号呈现，并固定展示免责声明。

## Goals

1. 左侧导航主分组中「文旅应用」下方新增独立入口「医疗卫生应用」，路由 `/healthcare`，渲染独立模块页。
2. 模块页支持场景筛选（医院与临床 / 公共卫生 / 健康管理 / 医药与器械 / 医学教育与考核）。
3. 测评卡片与详情页把「安全性」维度（拒答与危险建议控制）单列展示；每 AI 规格独立评分与评论。
4. 详情页对分类 listing 固定展示非诊断免责声明（双语、不可关闭）。
5. 目录新增 `cat-healthcare` 分类并上架首发三个策展测评应用，zh/en 双语种子完整；模块不引入任何 PHI。

## Non-Goals

- 不改动目录 API、数据库 schema 或 SDK 生成物；场景体系后端化属阶段二。
- 不提供 H5 / 移动端 / 小程序模块面（阶段二）。
- 不提供诊断、处方、剂量或个体化医疗建议；模块只做测评与分发，免责声明为固定展示。
- 不新建医疗评论审核规则引擎；阶段一沿用现有审核队列，并新增「疑似诊疗建议」举报理由供用户标记。
- 不采集、不展示患者身份信息（PHI）；策展基准数据使用脱敏任务集。

## Personas

| Persona | Primary surface | Core jobs |
| --- | --- | --- |
| 临床医生 | PC storefront `/healthcare` + 详情页 | 按临床场景比较辅助工具的安全分与知识准确性 |
| 医院信息科 | 详情页 | 院内采购评估，看场景覆盖与免责声明完备性 |
| 医学院师生 | 模块页 | 教学与考核工具比较 |
| 公卫机构 | 模块页 | 健康宣教材料与工具选型 |
| 健康管理用户 | 详情页 | 个人健康工具选型，阅读安全分与免责声明 |

## Capability Requirements

### 模块四件套（独立模块包）

- 新建 `apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-healthcare/`（npm `@sdkwork/appstore-pc-healthcare`），导出模块页、分区与卡片组件、路由常量（`path: '/healthcare'`、`title: '医疗卫生应用'`、`id: 'healthcare'`）。
- `sdkwork-appstore-pc-embed` 注册 `<Route path="healthcare">`；`DesktopSidebar` 主分组在 `tourism` 之后插入 `healthcare` 项（HeartPulse 图标）；`nav.menu.healthcare` 文案 zh/en 补齐。
- 分类解析沿用名称集合匹配：`HEALTHCARE_CATEGORY_NAMES = ['医疗卫生应用', 'Healthcare Apps']`（en 变体与种子分类英文名一致；适配器按 zh-CN 解析分类名，zh 名为权威匹配面）；分类缺失渲染显式空态。

### 纵向分类数据（storefront 侧策展）

- `sdkwork-appstore-pc-commons` 新增 `healthcare.ts`：场景枚举（`clinical`/`public-health`/`health-mgmt`/`pharma-device`/`medical-edu`）、策展规格集（复用 `CuratedEvalSpec` + benchmark 结构）与排序助手；基准维度：医学知识准确性、临床指南符合度、安全性（拒答与危险建议控制）、术语规范性、患者可读性；「安全性」在卡片徽章与详情面板中单列。
- 页面加载单分类窗口（≤50 条，游标分页遵循 `PAGINATION_SPEC.md`）；场景筛选在已加载窗口内联动。

### 目录与上架种子

- 种子文件（与 REQ-2026-0002/0003 同一 `015_vertical_evaluation.sql` 或按现行编号顺延）创建 `cat-healthcare` 分类（zh + en 本地化行）与三个 listing：`app-health-medical-qa`（医学知识问答测评）、`app-health-emr-quality`（病历质控测评）、`app-health-health-education`（健康宣教测评），含媒体与评论线程引用。
- zh/en 本地化文案落入 `database/seeds/locales/{zh-CN,en-US}/001_storefront_listings_*.sql`，并通过仓库自带生成脚本重算 `seed.manifest.json` 校验和。

### 详情页垂直面板与免责声明

- storefront 详情页对 `cat-healthcare` 分类 listing 渲染「场景覆盖」面板（场景任务集与基准分，「安全性」单独一列），下方沿用 `AppSpecEvaluation` 每规格评分与评论流。
- 免责声明（「AI 输出不替代执业医师诊断与处方」）作为面板固定区块双语展示，文案进 locale 词典，不可关闭。

### 评论举报理由（延期）

- 阶段一未实现：PC storefront 目前不存在任何评论/ listing 举报入口；现有举报链路是 H5 的 listing 级 support 渠道（`sdkwork-appstore-listing-support-core`，`LISTING_REPORT_REASONS` 为全局固定集，H5 所有 listing 共用），把医疗专用理由加入全局集合会影响 H5 全部类目。
- 「疑似诊疗建议」理由需要先落地评论级举报入口（PC 详情页举报组件 + 按分类的理由集合），依赖 comments 域暴露举报 API 或 support 渠道按类目扩展；作为独立后续需求处理，不在本 REQ 阶段一验收。
- 阶段一交付的合规面：详情页固定双语非诊断免责声明 + 场景覆盖面板安全性单列 + 既有审核队列继续兜底。

### i18n

- 模块文案（hero、场景筛选、卡片、安全分徽章、空态、覆盖面板标签、免责声明、举报理由）新增 i18n 命名空间文件，zh 与 en 及 `.d.ts` 同步补齐；禁止硬编码文案（`I18N_SPEC.md` §6.1）。

## Non-Functional Requirements

| NFR | Target |
| --- | --- |
| Security | 只读 storefront 面，无新增写路径；举报理由复用现有鉴权链路；`none beyond root standards` |
| Privacy | 模块不采集、不展示 PHI；策展基准数据使用脱敏任务集（`PRIVACY_SPEC.md`） |
| Performance | 模块页一次分类窗口加载（≤50 条），筛选为窗口内过滤，无新增网络请求 |
| Reliability | 目录分类缺失或目录服务不可达时渲染显式空态，页面不白屏 |
| i18n | zh 与 en 文案同步完整；免责声明双语；场景与安全术语两语一致 |
| 合规 | 非诊断免责声明固定展示且不可关闭；不出现处方/剂量建议内容；年龄分级沿用 listing 字段 |

## Acceptance Criteria

- [x] 左侧导航「医疗卫生应用」入口渲染在「文旅应用」正下方；`/healthcare` 渲染模块页（hero + 不可关闭的双语免责声明条 + 场景筛选 + 卡片网格）。
- [x] 场景筛选联动已加载窗口，空结果渲染空态文案；卡片携带安全分徽章。
- [x] 种子创建 `cat-healthcare` 分类与 ≥3 个 zh/en listing；`seed.manifest.json` 校验和重新生成且 `db:audit-seeds` 全绿（0 缺失、0 损坏行）。
- [x] 详情页对种子 listing 渲染场景覆盖面板（安全性单列）并固定展示双语免责声明；每规格评分提交与评论流复用 `AppSpecEvaluation` 可用。
- [x] zh/en 词典完整覆盖模块文案（含场景/维度/免责声明）；无硬编码文案。
- [x] `pnpm check`、`pnpm verify`、`pnpm typecheck` 与 PC vitest（153 tests）全部通过。
- [ ] （延期）评论举报入口出现「疑似诊疗建议」理由并进入既有举报链路 — 依赖评论级举报入口先落地，见 Capability Requirements。

## Traceability

| Requirement | Surface | Evidence |
| --- | --- | --- |
| 侧边栏入口与路由 | `DesktopSidebar.tsx`、`sdkwork-appstore-pc-embed`、nav i18n | 入口顺序与路由渲染检查 |
| 模块包 | `apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-healthcare/` | 页面/卡片/路由导出 |
| 纵向分类数据 | `sdkwork-appstore-pc-commons` `healthcare.ts` | 场景枚举与策展数据、安全维度 |
| 分类与上架种子 | `database/seeds/common/015_vertical_evaluation.sql`、`locales/*` | 种子执行 + manifest 校验 |
| 详情页面板与免责声明 | storefront `app-detail` 垂直面板 | 面板渲染、免责声明固定展示、规格评分复用 |
| 举报理由 | storefront 评论举报入口 + 现有审核队列 | 举报理由提交链路 |
| i18n | storefront `i18n/{zh,en}/appstore/storefront/healthcare.ts` | 词典完整性检查 |

Related: [PRD-vertical-evaluation-modules.md](../prd/PRD-vertical-evaluation-modules.md)、[REQ-2026-0002](REQ-2026-0002-education-experiment-apps.md)（共享模块模式与种子文件）。
