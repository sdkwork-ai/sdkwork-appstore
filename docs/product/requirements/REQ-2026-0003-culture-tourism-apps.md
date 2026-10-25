# REQ-2026-0003 Culture And Tourism Apps Module

Status: in-progress（阶段一已实现，待合入）
Owner: sdkwork-appstore
Date: 2026-10-25
Specs: REQUIREMENTS_SPEC.md, DOCUMENTATION_SPEC.md, COMPONENT_SPEC.md, COMPOSABLE_ARCHITECTURE_SPEC.md, I18N_SPEC.md, PAGINATION_SPEC.md, DATABASE_SPEC.md
Product design: [PRD-vertical-evaluation-modules.md](../prd/PRD-vertical-evaluation-modules.md) §4

## Problem

文旅场景（旅游景点讲解、行程规划、文博场馆导览）没有独立的市场入口：游客无法在出行前比较各 AI 讲解/规划工具的覆盖景点与讲解准确性，景区与文旅机构没有结构化的选型依据。通用「AI模型测评」不携带景点维度的元数据（地区、等级、主题），无法回答「哪些工具覆盖我目的地」。

需要一个独立模块，以旅游景点为旗舰场景，按场景与地区组织文旅 AI 测评应用。

## Goals

1. 左侧导航主分组中「教育实验应用」下方新增独立入口「文旅应用」，路由 `/tourism`，渲染独立模块页。
2. 模块页支持场景筛选（旅游景点 / 文博场馆 / 城市漫游 / 非遗民俗 / 研学旅行）与地区筛选；旅游景点为旗舰场景并携带景点元数据（省/市地区、5A/4A/3A 等级、自然/人文/遗址/主题乐园主题）。
3. 测评应用卡片与详情页呈现「景点覆盖」面板（覆盖景区列表 + 每景点讲解准确度），每 AI 规格独立评分与评论。
4. 目录新增 `cat-culture-tourism` 分类并上架首发三个策展测评应用，zh/en 双语种子完整。
5. 策展基准数据标注采样周期，详情面板展示「数据更新于」时间戳，不宣称实时。

## Non-Goals

- 不改动目录 API、数据库 schema 或 SDK 生成物；景点主数据后端化属阶段二。
- 不提供 H5 / 移动端 / 小程序模块面（阶段二）。
- 不做景区实时信息（开放状态/票价/人流）查询或票务预订；模块只做测评与分发。
- 不接入地图/导航服务；行程规划能力只做测评呈现。
- 不创建新的评论体系；沿用 sdkwork-comments 每规格线程。

## Personas

| Persona | Primary surface | Core jobs |
| --- | --- | --- |
| 游客 | PC storefront `/tourism` + 详情页 | 出行前比较目的地覆盖与讲解准确性 |
| 景区运营 | 详情页 | 选智能导览/讲解系统，看规格安全与覆盖 |
| 文旅局/目的地营销 | 模块页 + 详情页 | 区域导览方案选型 |
| 导游/研学导师 | 模块页 | 带团辅助工具比较 |
| 旅行社 | 详情页 | 行程规划工具选型 |

## Capability Requirements

### 模块四件套（独立模块包）

- 新建 `apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-tourism/`（npm `@sdkwork/appstore-pc-tourism`），导出模块页、分区与卡片组件、路由常量（`path: '/tourism'`、`title: '文旅应用'`、`id: 'tourism'`）。
- `sdkwork-appstore-pc-embed` 注册 `<Route path="tourism">`；`DesktopSidebar` 主分组在 `eduExperiment` 之后插入 `tourism` 项（MapPinned 图标）；`nav.menu.tourism` 文案 zh/en 补齐。
- 分类解析沿用名称集合匹配：`CULTURE_TOURISM_CATEGORY_NAMES = ['文旅应用', 'Culture & Tourism Apps']`（en 变体与种子分类英文名一致；适配器按 zh-CN 解析分类名，zh 名为权威匹配面）；分类缺失渲染显式空态。

### 纵向分类数据（storefront 侧策展）

- `sdkwork-appstore-pc-commons` 新增 `tourism.ts`：场景枚举（`attraction`/`museum`/`citywalk`/`heritage`/`study-tour`）、景点元数据结构（地区/等级/主题）、策展规格集（复用 `CuratedEvalSpec` + benchmark 结构）、景点覆盖与排序助手；基准维度示例：讲解准确性、行程规划合理性、多语言讲解、文化知识覆盖、实用信息时效性。
- 页面加载单分类窗口（≤50 条，游标分页遵循 `PAGINATION_SPEC.md`）；场景/地区筛选在已加载窗口内联动。

### 目录与上架种子

- 种子文件（与 REQ-2026-0002 同一 `015_vertical_evaluation.sql` 或按现行编号顺延）创建 `cat-culture-tourism` 分类（zh + en 本地化行）与三个 listing：`app-tour-attraction-guide`（景区智能导览测评）、`app-tour-itinerary-planner`（行程规划测评）、`app-tour-multilingual-guide`（多语言讲解测评），含媒体与评论线程引用。
- zh/en 本地化文案落入 `database/seeds/locales/{zh-CN,en-US}/001_storefront_listings_*.sql`，并通过仓库自带生成脚本重算 `seed.manifest.json` 校验和。

### 详情页垂直面板

- storefront 详情页对 `cat-culture-tourism` 分类 listing 渲染「景点覆盖」面板（景区名称 + 等级 + 地区 + 讲解准确度 + 「数据更新于」时间戳），下方沿用 `AppSpecEvaluation` 每规格评分与评论流。

### i18n

- 模块文案（hero、场景/地区筛选、卡片、空态、覆盖面板标签、数据更新时间戳）新增 i18n 命名空间文件，zh 与 en 及 `.d.ts` 同步补齐；禁止硬编码文案（`I18N_SPEC.md` §6.1）。

## Non-Functional Requirements

| NFR | Target |
| --- | --- |
| Security | 只读 storefront 面，无新增写路径；`none beyond root standards` |
| Privacy | 模块自身不采集个人数据；`none beyond root standards` |
| Performance | 模块页一次分类窗口加载（≤50 条），筛选为窗口内过滤，无新增网络请求 |
| Reliability | 目录分类缺失或目录服务不可达时渲染显式空态，页面不白屏 |
| i18n | zh 与 en 文案同步完整；场景/等级/主题术语两语一致 |
| 内容时效 | 策展基准数据带采样周期标注；面板展示数据更新时间，不宣称实时景区状态 |

## Acceptance Criteria

- [x] 左侧导航「文旅应用」入口渲染在「教育实验应用」正下方；`/tourism` 渲染模块页（hero + 场景/地区筛选 + 卡片网格）。
- [x] 场景筛选与地区筛选联动已加载窗口，空结果渲染空态文案；旅游景点场景卡片携带场景徽章与覆盖景点数。
- [x] 种子创建 `cat-culture-tourism` 分类与 ≥3 个 zh/en listing；`seed.manifest.json` 校验和重新生成且 `db:audit-seeds` 全绿（0 缺失、0 损坏行）。
- [x] 详情页对种子 listing 渲染景点覆盖面板，含「数据更新于」时间戳；每规格评分提交与评论流复用 `AppSpecEvaluation` 可用。
- [x] zh/en 词典完整覆盖模块文案（含场景/地区/主题/维度标签）；无硬编码文案。
- [x] `pnpm check`、`pnpm verify`、`pnpm typecheck` 与 PC vitest（153 tests）全部通过。

## Traceability

| Requirement | Surface | Evidence |
| --- | --- | --- |
| 侧边栏入口与路由 | `DesktopSidebar.tsx`、`sdkwork-appstore-pc-embed`、nav i18n | 入口顺序与路由渲染检查 |
| 模块包 | `apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-tourism/` | 页面/卡片/路由导出 |
| 纵向分类数据 | `sdkwork-appstore-pc-commons` `tourism.ts` | 场景枚举、景点元数据、策展数据 |
| 分类与上架种子 | `database/seeds/common/015_vertical_evaluation.sql`、`locales/*` | 种子执行 + manifest 校验 |
| 详情页面板 | storefront `app-detail` 垂直面板 | 覆盖面板渲染与规格评分复用 |
| i18n | storefront `i18n/{zh,en}/appstore/storefront/tourism.ts` | 词典完整性检查 |

Related: [PRD-vertical-evaluation-modules.md](../prd/PRD-vertical-evaluation-modules.md)、[REQ-2026-0002](REQ-2026-0002-education-experiment-apps.md)（共享模块模式与种子文件）。
