# REQ-2026-0002 Education Experiment Apps Module

Status: in-progress（阶段一已实现，待合入）
Owner: sdkwork-appstore
Date: 2026-10-25
Specs: REQUIREMENTS_SPEC.md, DOCUMENTATION_SPEC.md, COMPONENT_SPEC.md, COMPOSABLE_ARCHITECTURE_SPEC.md, I18N_SPEC.md, PAGINATION_SPEC.md, DATABASE_SPEC.md, PRIVACY_SPEC.md
Product design: [PRD-vertical-evaluation-modules.md](../prd/PRD-vertical-evaluation-modules.md) §3

## Problem

左侧导航的「AI模型测评」模块只覆盖通用模型/Agent 基准（竞技场、数学、长文本等），教育实验场景没有入口：教师与教育机构无法按学段（K12/大学/专业）和学科找到并比较教育实验类 AI 测评应用，实验操作仿真、实验报告批改等学科任务的能力差异没有结构化呈现。

需要一个独立模块，把多规格测评范式落到教育实验场景，并给出学段×学科两级分类。

## Goals

1. 左侧导航主分组中「AI模型测评」下方新增独立入口「教育实验应用」，路由 `/edu-experiment`，渲染独立模块页。
2. 模块页支持学段一级筛选（K12 / 大学 / 专业应用；K12 内分小学/初中/高中）与学科二级筛选（数学、物理、化学、生物、科学、地理、信息科技、语文、外语、工程基础）。
3. 测评应用卡片与详情页按「学段×学科覆盖矩阵」呈现每个 AI 规格的任务覆盖与基准分，每规格独立评分与评论。
4. 目录新增 `cat-edu-experiment` 分类并上架首发三个策展测评应用，zh/en 双语种子完整。
5. 全程不改动数据库 schema 与目录 API；分类体系为 storefront 侧策展数据。

## Non-Goals

- 不改动目录 API、数据库 schema 或 SDK 生成物；分类体系后端化属阶段二。
- 不提供 H5 / 移动端 / 小程序模块面（阶段二）。
- 不实现学科自适应推荐与个性化排序。
- 不承担教学内容的课程合规审查；适龄与内容分级沿用现有 listing 分级字段与审核流程。
- 不创建新的评论体系；沿用 sdkwork-comments 每规格线程。

## Personas

| Persona | Primary surface | Core jobs |
| --- | --- | --- |
| K12 教师 | PC storefront `/edu-experiment` | 按学段/学科筛选实验测评应用，看班级适用任务覆盖 |
| 大学实验课教师 | 同上 | 比较各规格在大学物理/化学实验任务上的基准分 |
| 职业培训讲师 | 同上 | 选专业认证方向的实训测评工具 |
| 学生 | 同上 + 详情页 | 实验预习与自学，看规格评分与评论 |
| 教育信息化采购 | 详情页 | 批量选型，看覆盖矩阵与规格评分汇总 |

## Capability Requirements

### 模块四件套（独立模块包）

- 新建 `apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-edu-experiment/`（npm `@sdkwork/appstore-pc-edu-experiment`），导出模块页、分区与卡片组件、路由常量（`path: '/edu-experiment'`、`title: '教育实验应用'`、`id: 'edu-experiment'`）。
- `sdkwork-appstore-pc-embed` 注册 `<Route path="edu-experiment">`；`DesktopSidebar` 主分组在 `aiEval` 之后插入 `eduExperiment` 项（GraduationCap 图标）；`nav.menu.eduExperiment` 文案 zh/en 补齐。
- 分类解析沿用名称集合匹配：`EDU_EXPERIMENT_CATEGORY_NAMES = ['教育实验应用', 'Education Experiment Apps']`（en 变体与种子分类英文名一致；适配器按 zh-CN 解析分类名，zh 名为权威匹配面）；分类缺失渲染显式空态。

### 纵向分类数据（storefront 侧策展）

- `sdkwork-appstore-pc-commons` 新增 `eduExperiment.ts`：学段枚举（`k12-primary`/`k12-junior`/`k12-senior`/`university`/`professional`）、学科枚举、策展规格集（复用 `CuratedEvalSpec` + benchmark 结构）、覆盖矩阵与排序助手；维度示例：实验操作仿真、实验报告批改、实验设计辅导、学科知识问答、安全规范提示。
- 页面加载单分类窗口（≤50 条，游标分页遵循 `PAGINATION_SPEC.md`）；学段/学科筛选在已加载窗口内联动。

### 目录与上架种子

- 新种子文件 `database/seeds/common/015_vertical_evaluation.sql`（或按现行编号顺延）创建 `cat-edu-experiment` 分类（zh + en 本地化行）与三个 listing：`app-edu-k12-virtual-lab`（K12 虚拟实验测评）、`app-edu-university-physics-lab`（大学物理实验测评）、`app-edu-professional-skills`（专业技能实训测评），含媒体与评论线程引用。
- zh/en 本地化文案落入 `database/seeds/locales/{zh-CN,en-US}/001_storefront_listings_*.sql`，并通过仓库自带生成脚本重算 `seed.manifest.json` 校验和。

### 详情页垂直面板

- storefront 详情页对 `cat-edu-experiment` 分类 listing 渲染「学段×学科覆盖矩阵」面板（行 = 学段，列 = 学科，格 = 任务数与基准分），下方沿用 `AppSpecEvaluation` 每规格评分与评论流。

### i18n

- 模块文案（hero、筛选、卡片、空态、矩阵面板标签）新增 i18n 命名空间文件，zh 与 en 及 `.d.ts` 同步补齐；禁止硬编码文案（`I18N_SPEC.md` §6.1）。

## Non-Functional Requirements

| NFR | Target |
| --- | --- |
| Security | 只读 storefront 面，无新增写路径；`none beyond root standards` |
| Privacy | 模块自身不采集个人数据；K12 相关内容与评论适用未成年人保护要求（`PRIVACY_SPEC.md`），适龄提示沿用 listing 年龄分级字段 |
| Performance | 模块页一次分类窗口加载（≤50 条），筛选为窗口内过滤，无新增网络请求 |
| Reliability | 目录分类缺失或目录服务不可达时渲染显式空态，页面不白屏 |
| i18n | zh 与 en 文案同步完整；教育术语（学段/学科）两语一致 |
| 合规 | 不宣称替代课堂教学；适龄提示沿现有分级展示 |

## Acceptance Criteria

- [x] 左侧导航「教育实验应用」入口渲染在「AI模型测评」正下方；`/edu-experiment` 渲染模块页（hero + 筛选 chips + 卡片网格）。
- [x] 学段一级筛选与学科二级筛选联动已加载窗口，空结果渲染空态文案。
- [x] 种子创建 `cat-edu-experiment` 分类与 ≥3 个 zh/en listing；`seed.manifest.json` 校验和重新生成且 `db:audit-seeds` 全绿（0 缺失、0 损坏行）。
- [x] 详情页对种子 listing 渲染覆盖矩阵面板；每规格评分提交与评论流复用 `AppSpecEvaluation` 可用。
- [x] zh/en 词典完整覆盖模块文案（含学段/学科/维度标签）；无硬编码文案。
- [x] `pnpm check`、`pnpm verify`、`pnpm typecheck` 与 PC vitest（153 tests）全部通过。

## Traceability

| Requirement | Surface | Evidence |
| --- | --- | --- |
| 侧边栏入口与路由 | `DesktopSidebar.tsx`、`sdkwork-appstore-pc-embed`、nav i18n | 入口顺序与路由渲染检查 |
| 模块包 | `apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-edu-experiment/` | 页面/卡片/路由导出 |
| 纵向分类数据 | `sdkwork-appstore-pc-commons` `eduExperiment.ts` | 学段/学科枚举与策展数据 |
| 分类与上架种子 | `database/seeds/common/015_vertical_evaluation.sql`、`locales/*` | 种子执行 + manifest 校验 |
| 详情页面板 | storefront `app-detail` 垂直面板 | 矩阵渲染与规格评分复用 |
| i18n | storefront `i18n/{zh,en}/appstore/storefront/eduExperiment.ts` | 词典完整性检查 |

Related: [PRD-vertical-evaluation-modules.md](../prd/PRD-vertical-evaluation-modules.md)、[REQ-2026-0001](REQ-2026-0001-app-sku-and-deployment-binding.md)（规格与评分体系前提）。
