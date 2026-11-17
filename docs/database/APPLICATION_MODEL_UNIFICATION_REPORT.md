# 应用体系统一与数据库设计改动报告

- 状态：待评审（Draft）
- 日期：2026-11-17
- 范围：`sdkwork-appstore`、`sdkwork-iam`、`sdkwork-deployments` 的应用身份、应用模板、租户安装、计价与部署绑定数据模型
- 规范依据：`DATABASE_SPEC.md` §7/§8/§9、`DATABASE_FRAMEWORK_SPEC.md` §7、`IAM_SPEC.md`、`IAM_APPLICATION_BOOTSTRAP_SPEC.md`、`NAMING_SPEC.md` §0.2、`API_SPEC.md` §13.6
- 前置修正：`ADR-20261117-design-time-table-prefix.md`（已提交 `cc10ece`）明确设计期资产必须使用已注册前缀，`studio_` 不得用于新表

本报告只定义契约与改造逻辑，不包含可执行迁移脚本；每个阶段的具体 SQL 在实施时按 `MIGRATION_SPEC.md` 另行提交。

## 1. 一句话结论

现状不是"表太多"，而是**同一条应用生命周期被拆成了四套互不相连的身份**。改造的实质是：为应用建立一条全局稳定的身份主轴，把"定义 / 版本 / 实例 / 凭据 / 商品"五个概念各自收敛到唯一的表与唯一的 owner，并用 `(tenant_id, application_id)` 作为多租户隔离的唯一强制维度。

## 2. 现状盘点（带证据）

### 2.1 四套应用身份

| 层 | 表 | 主键 | 证据 |
| --- | --- | --- | --- |
| 运行时定义 | `iam_application_template` | TEXT `id` / `app_key` | IAM 基线 application-bootstrap 段 |
| 租户实例 | `iam_tenant_application` | TEXT `app_id`（同时是 OAuth client id） | 同上，`UNIQUE (app_id)` + `UNIQUE (tenant_id, organization_id, template_id)` |
| 运行单元 | `deploy_app` | BIGINT `id` + `uuid` | deploy 基线 `deploy_app` |
| 商品 | `appstore_app` | TEXT `id` + `app_no`/`app_key`/`app_slug` | appstore 基线 `appstore_app` |

跨域连接只有松散的字符串引用（`appstore_app_deployment_binding.deploy_app_id`、`deploy_app_template.app_uuid`），没有一处能证明"这是同一个应用"。

### 2.2 四套"模板"

| 表 | 真实语义 | 归属 |
| --- | --- | --- |
| `iam_application_template` | 运行时/身份定义（OAuth relying party、包、默认权限） | iam |
| `iam_application_template_package` | 上一行的产物包 | iam |
| `appstore_app_template` | 生成器输入（git 仓库、变量 schema、依赖清单） | appstore |
| `deploy_app_template` | 市场模板商品（含可见性、定价、审核） | deploy |

### 2.3 两个计价面（高风险）

| 位置 | 金额表示 | 定价能力 |
| --- | --- | --- |
| `appstore_listing_price` | `price_amount NUMERIC(12,2)` | 区域价格、价格档、促销 |
| `deploy_app_template` | `price_minor BIGINT` | `pricing_model`、`price_minor`、`currency`、`install_count` |

同一件商品存在两个价格权威与两套审核状态，一旦同时启用即产生对账风险。

### 2.4 三处规范不一致

| 维度 | 现状 | 规范要求 |
| --- | --- | --- |
| ID 风格 | `appstore_app` TEXT；`appstore_app_sku`/`deploy_app` BIGINT+uuid；iam TEXT | `API_SPEC.md` §13.6：int64 以字符串传输，前端不得转 number |
| 唯一索引命名 | appstore 用 `uq_`（实测 8 处）；deploy/iam 用 `uk_` | `DATABASE_SPEC.md` §7：`uk_<table>_<columns>` |
| 金额表示 | `NUMERIC(12,2)` 与 `BIGINT` 两种 | `DATABASE_SPEC.md` §8.1：decimal 用 `NUMERIC(p,s)`，金额禁用浮点 |

状态枚举同样分裂：`appstore` 有 `app_status`/`distribution_status`/`review_status` 三列，deploy 用 `DRAFT/PENDING_REVIEW/PUBLISHED/REJECTED/DISABLED`，iam 用 `pending_config/enabled/disabled`。

## 3. 目标模型

### 3.1 五层概念（一词一义）

| 概念 | 唯一含义 | 禁止再用该词表示 |
| --- | --- | --- |
| `application` | 跨租户的产品身份 | 实例、客户端、商品 |
| `version` | 一次发布的不可变版本 | 乐观锁列、展示号 |
| `blueprint` | 运行时/身份定义（OAuth、scope、域名、包） | 商品、脚手架 |
| `scaffold` | 设计期生成器输入 | 运行时定义 |
| `installation` | 某租户对某应用的一次安装 | 产品身份本身 |
| `listing` | 商品、定价与分发 | 运行时定义 |

### 3.2 表清单（全部使用已注册前缀）

| # | 目标表 | 归属 | 来源 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | `appstore_application` | appstore | `appstore_app` | source-of-record（DB065） |
| 2 | `appstore_application_version` | appstore | `appstore_release` 身份部分 | 不可变版本 |
| 3 | `appstore_application_sku` | appstore | `appstore_app_sku` | 规格变体 + 开发溯源 |
| 4 | `appstore_application_listing` | appstore | `appstore_listing` | 上架与分发 |
| 5 | `appstore_application_listing_price` | appstore | `appstore_listing_price` | **唯一计价权威** |
| 6 | `appstore_application_deployment_binding` | appstore | `appstore_app_deployment_binding` | 指向 deploy 单元 |
| 7 | `appstore_application_scaffold` | appstore | `appstore_app_template` | 设计期生成器 |
| 8 | `iam_application_blueprint` | iam | `iam_application_template` | 运行时/身份定义 |
| 9 | `iam_application_blueprint_version` | iam | `iam_application_template_package` 父级 | 版本冻结 |
| 10 | `iam_application_installation` | iam | `iam_tenant_application` | 租户实例 |
| 11 | `iam_application_installation_surface` | iam | 新 | 替代单值 `application_type` |
| 12 | `iam_application_installation_credential` | iam | `app_id` 迁出 | OAuth client |
| 13 | `deploy_application` | deploy | `deploy_app` | 构建/部署单元 |
| 14 | `deploy_application_template` | deploy | `deploy_app_template` | 去价格 |

### 3.3 关键表设计要点

**`appstore_application`**

- `id TEXT`（雪花字符串）、`slug TEXT` 全局唯一、`application_no TEXT` 全局唯一
- `publisher_id`、`owner_user_id`：发布者与归属人分离
- `kind`（app/ppt/video，词汇开放）、`lifecycle_status`（单一状态机）
- `current_version_id`、`default_sku_id`、`default_deployment_binding_id` 为派生的读优化列，权威仍是各自表的部分唯一索引

**`iam_application_installation`**

- `(tenant_id, application_id, organization_id, environment)` 唯一
- `blueprint_version_id` 固定，实例不得随应用升级自动漂移
- `tenancy_model` ∈ `pool|silo|bridge`，决定数据落点
- `primary_domain` 租户内唯一（部分唯一索引，`deleted_at IS NULL`）

**`iam_application_installation_surface`**

- `(installation_id, surface)` 唯一，`surface` ∈ `pc|h5|api|miniapp|...`

**`iam_application_installation_credential`**

- `client_id` 全局唯一；`secret_hash` 只存 Argon2id；`redirect_uris` 绝对、无通配；支持轮换（`retired_at`）

**`deploy_application`**

- 保留 `tenant_id`/`organization_id`/`owner_type`/`user_id`
- 新增 `application_id`（指向 appstore 的应用身份），`version_id` 指向已发布版本

## 4. 跨域契约

| 关系 | 规则 |
| --- | --- |
| appstore 拥有应用身份 | 其他模块只存 `application_id` 引用，不复制身份字段 |
| iam 拥有实例与凭据 | appstore 不存 `app_id`/secret |
| deploy 拥有运行态 | appstore 通过绑定表引用 `deploy_application.id`，**不建跨模块外键**（沿用 ADR-20260921 的理由） |
| 跨模块引用 | 软引用必须配一致性巡检作业；能校验的在校验层拦截，不能校验的落巡检告警 |
| 计价 | 只有 `appstore_application_listing_price`，deploy 停止售买 |

## 5. Token 与多租户隔离

### 5.1 Claims

```
sub 主体   tid 租户   oid 组织   aid=application_id   iid=installation_id
aud=aid    azp=client_id          env/dlv   scp   sid/jti/iat/exp/kid
```

### 5.2 三条不变式

1. `aud == aid`：应用间 token 不可串用。
2. `iid ∈ tid`：签发与校验都必须证明该安装属于该租户。
3. 数据面按 `(tenant_id, application_id)` 双重过滤；跨租户仅限 `scope=platform.admin`。

### 5.3 需要同步改造的校验点（已定位）

| 文件 | 现状 |
| --- | --- |
| `application_access_token.rs:117-118` | `aud != app_id` 拒绝 |
| `iam_session.rs:767/964` | 会话解析校验 audience |
| `resolver.rs:118` | principal audience 匹配 |
| `runtime_auth_metadata.rs:81` | 实例已启用校验 |
| `api_key_lookup.rs:115` | API key → 实例校验 |
| `service_account_credentials.rs:285` | 服务账号 app_id 一致性 |

改造方式：先双发（`app_id` 与 `aid`+`iid` 并存，校验一致性），再强制只认 `aid`/`iid`。

## 6. 逻辑一致性矩阵

每条不变式都必须有**至少一个强制层**，否则只是文档约定。现状与目标如下：

| # | 不变式 | 数据库约束 | 服务层 | API | Token | 测试 |
| --- | --- | --- | --- | --- | --- | --- |
| I1 | 应用身份全局唯一 | 待建：`uk_appstore_application_slug` | 待补 | 待补 | — | 待补 |
| I2 | 版本发布后不可变 | 待建：禁止 UPDATE 触发器或状态机 | 待补 | 待补 | — | 待补 |
| I3 | 安装固定蓝图版本 | 待建：`blueprint_version_id NOT NULL` | 待补 | — | — | 待补 |
| I4 | 安装唯一 | 待建：`(tenant, application, org, env)` | 已有部分 | — | — | 待补 |
| I5 | 形态唯一 | 待建：`(installation_id, surface)` | 待补 | — | — | 待补 |
| I6 | client_id 全局唯一 | 已有：`uk_iam_tenant_application_oauth_client_id` | 已有 | — | `azp` | 已有 |
| I7 | 单一计价 | 待建：价格只在一处 | 待补 | 待补 | — | 待补 |
| I8 | 默认 SKU 唯一 | 已有：`uq_appstore_app_sku_default`（需改名 `uk_`） | 已有 | — | — | 已有 |
| I9 | token 绑定 | — | 已有部分 | 待补 | 已有部分 | 已有部分 |
| I10 | 跨域软引用可校验 | — | 待建巡检 | 待补 | — | 待补 |

**逻辑判断**：I6、I8 已有数据库级强制；I1–I5、I7、I10 目前没有强制层，属于"靠自觉"，这是改造必须补齐的部分。I9 需要在双发切换完成后才完整。

## 7. 迁移路径

未上线，不做兼容层，但每一步都必须可验证、可回滚（回滚 = 关闭消费方开关，不重写历史）。

| 阶段 | 内容 | 验证 |
| --- | --- | --- |
| S0 | 落地 `APPLICATION_IDENTITY_SPEC.md`（本报告第 3–6 节固化） | 评审通过 |
| S1 | 新建 `appstore_application` 及版本/SKU/上架/绑定/脚手架重命名；ID 统一为 TEXT 雪花 | 物化器重生成契约 + framework 校验 + 前端/API 类型同步 |
| S2 | iam：`application_template` → `application_blueprint(_version)`；`tenant_application` → `application_installation` + `surface` + `credential` | 同上 + 实例回放测试 |
| S3 | deploy：`deploy_app` → `deploy_application`；`deploy_app_template` 去价格 | 同上 |
| S4 | token 双发 → 强制 `aid`/`iid`；数据面补 `application_id` 列与索引 | 6 个校验点单测 + 隔离测试 |
| S5 | 清理软引用、补巡检、删除旧列与 `uq_` 命名 | 契约 0 漂移 + 全量门禁 |

### 不可逆点

- S1/S2/S3 的表重命名：一旦生成 SDK 与外部契约发布即不可回退，必须一次性完成并同步 SDK 版本。
- S4 删除 `app_id` 身份语义：必须在所有消费方（15+ 仓）切换后执行。

## 8. 风险

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| 三仓同时改名 | 生成 SDK 类型名变化，跨仓编译失败 | 按 S1→S2→S3 串行，每步合入并跑全量门禁 |
| 状态枚举收敛 | 已有数据无法映射 | 先加新枚举列并双写，确认映射 100% 后再删旧列 |
| `principal_id` 类历史矛盾（已见 IAM 0012/0013） | 收敛实例模型时叠加新矛盾 | 迁移前先冻结当前语义并加断言 |
| 软引用悬挂 | 统计与计费错账 | 巡检作业 + 计费前置校验 |

## 9. 验证清单

- `node <specs>/tools/check-database-framework-standard.mjs --root .`（每个仓）
- `db:materialize:contract` 必须幂等（重跑无 diff）
- 契约对齐测试：DDL 集合 == 契约注册表 == 来源模块目录
- 真实 PostgreSQL 回放：每阶段新增迁移在 PG 16/18 各跑一次，含空库与有数据库
- 隔离测试：跨租户、跨应用、跨安装三种越权用例必须拒绝
- 命名检查：表/索引/约束名全部符合 `DATABASE_SPEC.md` §7（含 `uk_` 替换 `uq_`）

## 10. 未决项

1. `application` 权威归属：建议 appstore（本报告假设），若改为独立服务则第 3 节表前缀与 owner 全部调整。
2. 隔离边界：建议 application × tenant；若只需租户级隔离，则 S4 的数据面列与索引可大幅简化。
3. `deploy_application_template` 是否保留：若市场模板能力并入 `appstore_application_scaffold` + `listing`，可整体下线。
4. 状态机词表最终取值，需与 appstore/deploy/iam 三份现有枚举取并集后评审。
