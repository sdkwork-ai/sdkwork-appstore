# 应用体系统一与数据库设计改动报告

- 状态：待评审（Draft，v2：按"以 deploy 应用为身份锚点"修订）
- 日期：2026-11-17
- 范围：`sdkwork-deployments`、`sdkwork-iam`、`sdkwork-appstore` 的应用身份、应用模板、租户安装、计价与部署绑定
- 规范依据：`DATABASE_SPEC.md` §7/§8、`DATABASE_FRAMEWORK_SPEC.md` §7、`IAM_SPEC.md`、`IAM_APPLICATION_BOOTSTRAP_SPEC.md`、`NAMING_SPEC.md` §0.2、`API_SPEC.md` §13.6
- 前置决策：`ADR-20261117-design-time-table-prefix.md`（提交 `cc10ece`）——设计期资产必须使用已注册前缀，`studio_` 不得用于新表

本报告只定义契约与改造逻辑，不含可执行迁移脚本。

## 1. 核心结论

**身份锚点是 deploy 应用，不是 appstore，也不是 IAM。**

- access token 的 `app_id` **必须是 deploy 的应用身份**（部署应用 = 运行实例）。
- IAM 应用与 deploy 应用 **一对一**：一个 IAM 应用行对应且仅对应一个 deploy 应用。
- appstore 应用与 deploy 应用同样是 1:1，但它是"商品面"，不参与运行时鉴权。

因此改造不是"选一个模块当权威"，而是：**deploy 应用当锚点，IAM 与 appstore 各自通过受约束的链接表挂上去**。

## 2. 现状盘点

### 2.1 三组应用已经存在，靠 metadata 串起来

控制台已经把"应用"显式分成三组（`ApplicationGroupId`）：

```
type ApplicationGroupId = "iam" | "deploy" | "app-store";
```

证据：`sdkwork-cloudrouter-pc-admin-application/src/types/application-catalog.ts:10`。

三组之间靠 deploy 应用上的自由文档关联：

| 项 | 事实 |
| --- | --- |
| 存储位置 | `deploy_app.metadata.integrations`（键名 `integrations`） |
| 文档版本 | `sdkwork.application.integrations/v1` |
| 链接形态 | `linkedApplications: LinkedApplicationRef[]`，元素为 `{ groupId, id, reference?, name? }` |
| 解析顺序 | 先按显式链接；再回退到 `reference`/`name` 规范化匹配；已链接到别的行的跳过 |
| 一对一强制 | **仅前端校验**（`linkedToAnotherRow` 跳过），数据库无任何约束 |
| 写入方式 | `apps.update` 整块替换 `metadata`，并发写会丢更新 |

证据：`services/application-integration-document.ts:30-91,196-240`、`services/application-integrations.ts:153-191`、`types/application-integrations.ts:19-67`。

**结论**：一对一在业务上已经成立，但在数据层**没有任何约束**，且以 JSON 列表形式可被写成一对多。这是本次要修的第一处逻辑缺口。

### 2.2 四套应用表

| 组 | 表 | 主键风格 | 是否已有 deploy 关联 |
| --- | --- | --- | --- |
| deploy | `deploy_app` | BIGINT `id` + `uuid`(36) | 锚点本身 |
| iam | `iam_application_template` | TEXT | 无 |
| iam | `iam_tenant_application` | TEXT `app_id`（兼作 OAuth client id） | 无 |
| app-store | `appstore_app` | TEXT | 无（仅 `appstore_app_deployment_binding` 指向部署目标） |

### 2.3 四套"模板"与两个计价面

| 表 | 真实语义 |
| --- | --- |
| `iam_application_template` | 运行时/身份定义（OAuth、包、默认权限） |
| `appstore_app_template` | 设计期生成器（git 仓库、变量 schema） |
| `deploy_app_template` | 市场模板商品，**自带定价** |
| `appstore_listing_price` | 上架定价（`NUMERIC(12,2)`） |

`deploy_app_template.price_minor BIGINT` 与 `appstore_listing_price.price_amount NUMERIC(12,2)` 是两套金额表示、两个价格权威，必须收敛为一处。

### 2.4 三处规范偏差

| 维度 | 现状 | 规范 |
| --- | --- | --- |
| ID 风格 | `appstore_app` TEXT；`appstore_app_sku`/`deploy_app` BIGINT+uuid；iam TEXT | `API_SPEC.md` §13.6：int64 以字符串传输 |
| 唯一索引命名 | appstore 用 `uq_`（实测 8 处），deploy/iam 用 `uk_` | `DATABASE_SPEC.md` §7：`uk_<table>_<columns>` |
| 状态枚举 | appstore 三列、deploy 五值、iam 三值 | 需单一生命周期状态机 |

## 3. 目标模型

### 3.1 五层概念

| 概念 | 唯一含义 | 承载 |
| --- | --- | --- |
| `deploy application` | **运行身份锚点**，token 的 `app_id` | deploy |
| `installation` | 某租户对某产品的安装，**与 deploy 应用 1:1** | iam |
| `blueprint` | 运行时/身份定义（OAuth、scope、域名、包），按版本冻结 | iam |
| `product application` | 跨租户的产品身份（开发与发布） | appstore |
| `listing` / `sku` | 商品、定价、规格 | appstore |
| `scaffold` | 设计期生成器输入 | appstore |

### 3.2 表清单（全部使用已注册前缀）

| # | 目标表 | 归属 | 来源 | 关系 |
| --- | --- | --- | --- | --- |
| 1 | `deploy_application` | deploy | `deploy_app` | 锚点 |
| 2 | `deploy_application_link` | deploy | **新表**，取代 `metadata.integrations` | 1:1 链接 |
| 3 | `deploy_application_template` | deploy | `deploy_app_template`（去价格） | 市场模板 |
| 4 | `iam_application_blueprint` | iam | `iam_application_template` | 1:N 安装 |
| 5 | `iam_application_blueprint_version` | iam | `iam_application_template_package` 父级 | 版本冻结 |
| 6 | `iam_application_installation` | iam | `iam_tenant_application` | **1:1 ← deploy_application** |
| 7 | `iam_application_installation_surface` | iam | 新 | 替代单值 `application_type` |
| 8 | `iam_application_installation_credential` | iam | `app_id` 迁出 | OAuth client |
| 9 | `appstore_application` | appstore | `appstore_app` | 1:1 ← deploy_application |
| 10 | `appstore_application_version` | appstore | `appstore_release` 身份部分 | 版本 |
| 11 | `appstore_application_sku` | appstore | `appstore_app_sku` | 规格变体 |
| 12 | `appstore_application_listing` | appstore | `appstore_listing` | 上架 |
| 13 | `appstore_application_listing_price` | appstore | `appstore_listing_price` | **唯一计价权威** |
| 14 | `appstore_application_deployment_binding` | appstore | `appstore_app_deployment_binding` | 分发目标（N:1） |
| 15 | `appstore_application_scaffold` | appstore | `appstore_app_template` | 设计期 |

### 3.3 一对一怎么落地

新增 `deploy_application_link`，把 metadata 文档规范化：

| 列 | 说明 |
| --- | --- |
| `id` | TEXT 雪花 |
| `tenant_id` | 与锚点同租户 |
| `deploy_application_id` | 指向 `deploy_application` |
| `linked_group` | `iam` / `app-store`（词汇开放，`CHECK` 约束） |
| `linked_id` | 对侧应用主键 |
| `linked_reference` / `linked_name` | 展示快照（对侧不可用时仍可显示） |
| `created_at` / `updated_at` / `deleted_at` | 审计与软删 |

**两条唯一约束构成 1:1**：

```
uk_deploy_application_link_target  UNIQUE (tenant_id, linked_group, linked_id)   -- 一个对侧应用只能挂一个锚点
uk_deploy_application_link_anchor  UNIQUE (deploy_application_id, linked_group)  -- 一个锚点每组只挂一个
```

这两条索引把"只靠前端判断"变成数据库强制，也是本报告最关键的改动。

注意区分两个"绑定"：

| 表 | 语义 | 基数 |
| --- | --- | --- |
| `deploy_application_link` | **身份锚定**：IAM/appstore 行属于哪个 deploy 应用 | 1:1 |
| `appstore_application_deployment_binding` | **分发绑定**：哪个部署环境对外提供这个商品 | N:1 |

## 4. 跨域契约

| 关系 | 规则 |
| --- | --- |
| deploy 拥有锚点 | 其他模块只存锚点 id，不复制身份字段 |
| iam 安装 ↔ deploy 应用 | `iam_application_installation.deploy_application_id` **UNIQUE** |
| appstore 商品 ↔ deploy 应用 | 通过 `deploy_application_link` 1:1 |
| 同租户 | 链接行 `tenant_id` 必须等于锚点 `tenant_id` |
| 跨模块引用 | 不建跨模块外键（沿用 ADR-20260921）；由链接表 + 巡检保证 |
| 计价 | 只有 `appstore_application_listing_price` |

## 5. Token 与多租户隔离

### 5.1 Claims（修订）

```
sub   主体（用户或服务账号）
tid   租户
oid   组织（可空，组织登录时才有）
app_id  = deploy 应用身份（uuid 字符串）   ← 运行锚点
aud     = app_id
azp     = client_id（安装凭据，用于 OAuth 识别，不参与数据隔离）
env/dlv = 环境与部署形态
scp     = scope 集合
sid / jti / iat / exp / kid
```

**取消独立的 `iid`**：安装与 deploy 应用是 1:1，`app_id` 已经唯一确定"哪个租户的哪个运行实例"，再加 `iid` 只会在两处出现不一致。

### 5.2 三条不变式

1. `aud == app_id`（应用间 token 不可串用）。
2. `app_id` 对应的 deploy 应用必须属于 token 的 `tid`（签发与校验都证明）。
3. 数据面按 `(tenant_id, app_id)` 过滤；跨租户仅限 `scope=platform.admin`。

### 5.3 需要改造的校验点

| 文件 | 现状 |
| --- | --- |
| `application_access_token.rs:117-118` | `aud != app_id` 拒绝 |
| `iam_session.rs:767/964` | 会话解析 audience |
| `resolver.rs:118` | principal audience 匹配 |
| `runtime_auth_metadata.rs:81` | 实例已启用校验 |
| `api_key_lookup.rs:115` | API key → 实例校验 |
| `service_account_credentials.rs:285` | 服务账号 app_id 一致性 |

语义变化：这些点里的 `app_id` 从"IAM 租户实例的 app_id"改为"deploy 应用身份"，校验目标从 `iam_tenant_application` 改为 `deploy_application` + 安装行。

## 6. 逻辑一致性矩阵

| # | 不变式 | 数据库强制 | 服务层 | API | Token | 测试 |
| --- | --- | --- | --- | --- | --- | --- |
| I1 | deploy 锚点唯一（uuid/slug） | 已有 `uk_deploy_app_tenant_slug` | 已有 | 已有 | — | 已有 |
| I2 | 对侧应用只挂一个锚点 | **待建** `uk_..._link_target` | 现为前端校验 | 待补 | — | 待补 |
| I3 | 一个锚点每组只挂一个 | **待建** `uk_..._link_anchor` | 待补 | 待补 | — | 待补 |
| I4 | 安装 ↔ 锚点 1:1 | **待建** `installation.deploy_application_id UNIQUE` | 待补 | — | — | 待补 |
| I5 | 版本发布后不可变 | 待建 | 待补 | 待补 | — | 待补 |
| I6 | 形态唯一 | **待建** `(installation_id, surface)` | 待补 | — | — | 待补 |
| I7 | client_id 全局唯一 | 已有 `uk_iam_tenant_application_oauth_client_id` | 已有 | — | `azp` | 已有 |
| I8 | 默认 SKU 唯一 | 已有 `uq_appstore_app_sku_default`（需改 `uk_`） | 已有 | — | — | 已有 |
| I9 | 单一计价 | 待建 | 待补 | 待补 | — | 待补 |
| I10 | token 绑定锚点 | — | 部分 | 待补 | 部分 | 部分 |
| I11 | 链接跨租户拒绝 | **待建** 复合 CHECK / 触发器 | 待补 | — | — | 待补 |

**判据**：I1、I7、I8 已有数据库强制；I2、I3、I4、I6、I9、I11 目前**没有任何强制层**，这正是"逻辑不闭环"的位置。改造必须先把这些约束落库，再谈改名。

## 7. 迁移路径

未上线，可直接改；每步必须可验证。

| 阶段 | 内容 | 验证 |
| --- | --- | --- |
| S0 | 固化本报告为 `APPLICATION_IDENTITY_SPEC.md` | 评审 |
| S1 | 建 `deploy_application_link`，从 `metadata.integrations` 回填；先加唯一索引前做重复检测；控制台停写 metadata | 回填条数对账 + 重复扫描为 0 + 控制台改读链接 API |
| S2 | iam 侧：`application_template` → `application_blueprint(_version)`；`tenant_application` → `application_installation` + `surface` + `credential`；补 `deploy_application_id UNIQUE` | 契约物化 + 实例回放 |
| S3 | appstore 侧：`app*` → `application*`；计价收敛到 listing_price；8 处 `uq_` → `uk_` | 契约物化 + 命名检查 |
| S4 | token：`app_id` 切到 deploy 锚点；双发过渡；数据面补 `app_id` 列 | 6 个校验点单测 + 越权用例 |
| S5 | 清理：删 metadata 旧键、删软引用残留、补巡检 | 契约 0 漂移 + 全量门禁 |

### 回填前必须跑的两条检查

1. **重复链接扫描**：同一个 `(groupId, id)` 出现在多个 deploy 应用上——存在则先人工裁定，否则唯一索引建不上。
2. **孤儿扫描**：`linked_id` 在对侧已不存在——存在则链接表回填时跳过并记录，不能静默丢。

## 8. 风险

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| metadata 整块替换导致回填期间双写冲突 | 链接丢失 | S1 期间控制台只读旧键、只写新表，禁双写 |
| 三仓串行改名 | 生成 SDK 类型名变化 | S2→S3 分两次合入，各自跑门禁 |
| token 语义切换 | 15+ 消费仓鉴权失败 | 双发期同时认旧 `app_id` 与新锚点，逐仓切换 |
| 状态枚举收敛 | 历史数据无法映射 | 先加新列双写，映射验证 100% 后删旧列 |

## 9. 验证清单

- `check-database-framework-standard.mjs`（每仓）
- `db:materialize:contract` 幂等（重跑无 diff）
- 契约对齐：DDL 集合 == 注册表 == 来源模块目录
- 真实 PostgreSQL 回放：新迁移在空库与有数据库各跑一次
- 隔离测试：跨租户、跨锚点、跨安装三类越权必须拒绝
- 命名检查：全部 `uk_`/`idx_`/`fk_` 符合 `DATABASE_SPEC.md` §7

## 10. 已定与未决

**已定**

1. 身份锚点 = deploy 应用；token `app_id` = deploy 应用身份。
2. IAM 应用 ↔ deploy 应用 1:1，由 `deploy_application_link` 的唯一约束强制。
3. appstore 应用 ↔ deploy 应用同为 1:1，但只影响商品面。

**未决**

1. `appstore_application_deployment_binding`（分发目标）是否并入链接表，还是保持独立——建议独立，避免把"身份"与"分发"混成一张多态表。
2. `deploy_application_template` 是否保留：若市场能力并入 `appstore_application_scaffold` + `listing`，可整体下线。
3. 生命周期状态机词表的最终取值（三套枚举取并集）。
4. 控制台改为读链接 API 的排期，决定 S1 能否一次完成。
