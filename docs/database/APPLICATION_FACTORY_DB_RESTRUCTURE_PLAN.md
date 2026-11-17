# 多租户应用工厂：数据库重构完整方案

- 状态：待评审
- 日期：2026-11-17
- 范围：`sdkwork-iam`（67 表）、`sdkwork-deployments`（67 表）、`sdkwork-appstore`（74 表），合计 208 张表
- 依据：`APPLICATION_IDENTITY_SPEC.md`、`DATABASE_SPEC.md` §7/§8、`DATABASE_FRAMEWORK_SPEC.md` §7、`ADR-20261117-design-time-table-prefix.md`
- 前置报告：`APPLICATION_MODEL_UNIFICATION_REPORT.md`（v3）

## 0. 本方案替你定下的两个建模决策

这两条此前悬空，不先定就无法确定任何唯一键。

| 决策 | 结论 | 理由 |
| --- | --- | --- |
| D1 安装粒度 | **安装 1:1 对 deploy 应用**；环境级域名与凭据放子表 `iam_application_installation_environment` | 直接满足"iam 应用和 deploy 应用一对一"；`deploy_app` 本身是"一应用多环境"（`deploy_app_environment`），环境维度下沉为子表而不是复制安装 |
| D2 一对一唯一权威 | **只有 `iam_application_installation.deploy_application_id UNIQUE`**；不再引入通用 `deploy_application_link` | 同一关系记两处必然漂移。appstore 通过安装行或分发绑定获知锚点，不需要第二张链接表 |

## 1. 总账

| 处置 | 数量 | 说明 |
| --- | --- | --- |
| 新增 | 3 | 环境身份、安装凭据、资源绑定 |
| 删除 | 5 | iam 模板 2 张、appstore 模板 3 张 |
| 变更（改名或改列/约束） | 18 | 核心语义表 |
| 仅改名（命名一致性） | 29 | deploy 子表 14、appstore 系列 15 |
| 保留不变 | 153 | 认证、RBAC、部署运行时、证书、商城运营等 |
| **合计** | **208** | |

## 2. 新增表（3）

### 2.1 `iam_application_installation_environment`

一个安装下的每个环境一份身份配置。

| 列 | 说明 |
| --- | --- |
| `id` | TEXT 雪花 |
| `tenant_id` / `organization_id` | 与安装一致 |
| `installation_id` | → `iam_application_installation` |
| `env_key` | 与 `deploy_application_environment.env_key` 对应 |
| `primary_domain` | 该环境对外域名 |
| `domain_config_json` | 域名/证书/回调配置 |
| `env_status` | 该环境身份是否可用 |
| `created_at` / `updated_at` / `deleted_at` | |

约束：`uk_iam_application_installation_environment_key UNIQUE (installation_id, env_key)`；`uk_..._domain UNIQUE (tenant_id, primary_domain) WHERE deleted_at IS NULL`。

### 2.2 `iam_application_installation_credential`

环境级 OAuth 客户端，与安装凭据彻底分离（不再复用 `app_id`）。

| 列 | 说明 |
| --- | --- |
| `id` | TEXT 雪花 |
| `tenant_id` | |
| `installation_environment_id` | → 2.1 |
| `client_id` | OAuth client id，**全局唯一** |
| `secret_hash` | Argon2id，禁止明文 |
| `redirect_uris_json` | 绝对、无通配 |
| `granted_scopes_json` | 申请的 scope 子集 |
| `credential_status` | `active` / `rotated` / `retired` |
| `rotated_at` / `retired_at` | 轮换与退役 |

约束：`uk_iam_application_installation_credential_client UNIQUE (client_id)`。

### 2.3 `deploy_application_resource_link`

公众号、小程序、支付账号与部署应用的绑定，取代 `deploy_app.metadata.integrations`。

| 列 | 说明 |
| --- | --- |
| `id` | TEXT 雪花 |
| `tenant_id` / `organization_id` | |
| `application_id` | → `deploy_application` |
| `env_key` | 绑定所属环境 |
| `resource_kind` | `official_account` / `mini_program` / `payment_account` |
| `resource_ref` | 对侧资源 id（IAM 渠道账号 / 支付渠道账号） |
| `provider_code` | 渠道代码（如 wechat、alipay） |
| `is_default` | 支付渠道默认账户标记 |
| `binding_status` | `active` / `disabled` |
| `created_at` / `updated_at` / `deleted_at` | |

约束：

- `uk_deploy_application_resource_link_ref UNIQUE (application_id, env_key, resource_kind, resource_ref)`
- `uk_deploy_application_resource_link_single UNIQUE (application_id, env_key, resource_kind) WHERE resource_kind IN ('official_account','mini_program') AND deleted_at IS NULL`
- `uk_deploy_application_resource_link_default UNIQUE (application_id, env_key, provider_code) WHERE is_default AND resource_kind='payment_account' AND deleted_at IS NULL`

## 3. 删除表（5）

| 表 | 原因 | 依赖清理 |
| --- | --- | --- |
| `iam_application_template` | 身份切片并入产品版本与安装 | `applications.register` 路由、`application_registry.rs`、`embedded_bootstrap`、种子 `003`、`IamTables` 常量、OpenAPI + 9 语言 SDK |
| `iam_application_template_package` | 同上 | 级联 |
| `appstore_app_template` | 脚手架统一到 deploy | 种子 `008`/`014`/`015`、`materialize_module_template_seed.mjs`、`catalog_repository.rs`、表清单与文档 |
| `appstore_app_template_version` | 同上 | 级联 |
| `appstore_app_template_usage` | 同上 | 级联 |

删除前必须先完成 `appstore_app_sku.source_template_id` / `source_template_version_id` 改指向 deploy 脚手架版本，否则 SKU 溯源断链。

## 4. 变更表（18）

### 4.1 IAM（6）

| 表 | 变更 |
| --- | --- |
| `iam_tenant_application` → `iam_application_installation` | 删 `template_id`/`template_version`/`instance_key`/`application_type`/`environment`（下沉子表）；加 `deploy_application_id UNIQUE`、`product_application_id`、`product_version_id`、`tenancy_model`（`pool`/`silo`/`bridge`）、`upgrade_policy`（`pinned`/`auto_minor`/`auto_major`）、`identity_status`（`pending_identity`/`active`/`failed`）、`provision_idempotency_key`；`primary_domain` 迁入 2.1 |
| `iam_session` | `app_id` 语义改为 deploy 应用身份；加 `installation_id`、`installation_environment_id`；保留 `environment` |
| `iam_api_key` | `app_id` 语义改为 deploy 应用身份 |
| `iam_service_account_credential` | `tenant_application_id` → `installation_id`；`app_id` 语义调整 |
| `iam_oauth_resource_account` | `app_id` 指向 deploy 应用身份（公众号/小程序归属锚点） |
| `iam_oauth_integration` | `app_id` 同上 |

### 4.2 deploy（5）

| 表 | 变更 |
| --- | --- |
| `deploy_app` → `deploy_application` | 加 `product_application_id`、`product_version_id`（可选，便于运行态直接反查）；保留 `owner_type`/`user_id` |
| `deploy_app_template` → `deploy_application_scaffold` | 删 `pricing_model`/`price_minor`/`currency`/`visibility`/`review_note`/`status`(审核)/`install_count`；加 `app_config_schema`、`variable_schema`、`dependency_manifest`、`capability_manifest`、`git_url`/`git_ref`/`git_sub_path`、`scaffold_visibility`、`license_code` |
| `deploy_app_template_version` → `deploy_application_scaffold_version` | 保留版本快照与产物引用 |
| `deploy_app_template_category` → `deploy_application_scaffold_category` | 仅改名 |
| `deploy_build_template` → `deploy_build_recipe` | 仅改名（它不是应用模板） |

### 4.3 appstore（7）

| 表 | 变更 |
| --- | --- |
| `appstore_app` → `appstore_application` | 加 `distribution_kind`（`runnable`/`scaffold`/`both`）；`default_sku_id`/`default_deployment_binding_id` 保持派生 |
| `appstore_app_sku` → `appstore_application_sku` | `source_template_id`/`source_template_version_id` 改为脚手架版本引用 |
| `appstore_app_deployment_binding` → `appstore_application_deployment_binding` | 仅改名（分发目标，N:1） |
| `appstore_listing` → `appstore_application_listing` | 仅改名 |
| `appstore_listing_price` | 加 `application_id`；成为唯一计价权威（含原 deploy 模板价格） |
| `appstore_entitlement` | 键改为 `(tenant_id, application_id, subject_type, subject_id, entitlement_type)`，并加 `installation_id` 可空列 |
| `appstore_install_event` | 加 `installation_id`，安装事件与 IAM 安装对齐 |

## 5. 仅改名（29，命名一致性）

| 组 | 数量 | 示例 |
| --- | --- | --- |
| deploy 子表 `deploy_app_*` → `deploy_application_*` | 14 | `deploy_app_environment`、`deploy_app_variant`、`deploy_app_revision`、`deploy_app_source_spec`、`deploy_app_mount`、`deploy_app_binding`、`deploy_app_resource`、`deploy_app_platform_target`、`deploy_app_database_profile`、`deploy_app_database_migration`、`deploy_app_usage_daily`、`deploy_app_target_observation`、`deploy_app_variant_rule`、`deploy_app_source_spec_route` |
| appstore 应用族 | 5 | `_dependency`、`_platform`、`_sku_attribute`、`_sku_contributor`、`_sku_model` |
| appstore listing 族 | 12 | `_listing_localization`、`_listing_price` 之外的 `_listing_*` |
| appstore release 族 | 8 | `appstore_release` → `appstore_application_release`，含 `_artifact`、`_channel`、`_rollout`、`_note_localization`、`_beta_invite`、`_tester_group`、`_tester_group_member` |

改名同时必须改索引/约束名（`idx_`/`uk_`/`fk_`），否则留下半套命名。

## 6. 保留清单（153，按域分组）

| 域 | 模块 | 代表表 |
| --- | --- | --- |
| 租户/组织/用户/RBAC/目录 | iam | `iam_tenant`、`iam_user`、`iam_role*`、`iam_permission`、`iam_department*`、`iam_position*`、`iam_group*` |
| OAuth 提供方与集成 | iam | `iam_oauth_provider_catalog`、`iam_oauth_client`、`iam_oauth_grant`、`iam_oauth_scope_profile`、`iam_oauth_secret`、`iam_oauth_surface` 等 |
| 部署运行时 | deploy | `deploy_deployment`、`deploy_release`、`deploy_artifact`、`deploy_build`、`deploy_package`、`deploy_server`、`deploy_runtime_assignment` |
| 域名与证书 | deploy | `deploy_dns_zone*`、`deploy_domain*`、`deploy_certificate*`、`deploy_tls_*`、`deploy_acme_account` |
| 商城运营 | appstore | `appstore_publisher*`、`appstore_moderation_*`、`appstore_catalog_*`、`appstore_category*`、`appstore_tag*`、`appstore_promo_code*` |
| 下载与权益 | appstore | `appstore_download_grant`、`appstore_user_library_item`、`appstore_user_wishlist_item` |

## 7. 分阶段实施

| 阶段 | 内容 | 依赖 | 验证 |
| --- | --- | --- | --- |
| P0 | 规范定稿：`APPLICATION_IDENTITY_SPEC` 补 D1/D2、开通状态机、资源绑定 | — | 评审 |
| P1 | deploy：脚手架改造（4 张）+ `deploy_application_resource_link` + `deploy_app*` 改名 | P0 | 契约物化幂等 + PG 回放 |
| P2 | appstore：改名族 + `distribution_kind` + 计价并入 listing + 删除 3 张模板表 + SKU 溯源改指向 | P1 | 契约物化 + 计价用例 |
| P3 | appstore：版本承接身份切片（原 iam 模板字段） | P2 | 字段映射对账 |
| P4 | iam：安装重构 + 环境/凭据新表 + 6 张变更表 + 删除 2 张模板表 + 删注册接口 + SDK 重生成 | P3 | 实例回放 + 6 个 token 校验点单测 |
| P5 | 数据迁移：metadata 链接与资源绑定回填、重复/孤儿扫描 | P1–P4 | 回填对账、唯一约束可建 |
| P6 | token 切换：双发 → 强制 `app_id`=部署应用；数据面补 `(tenant_id, app_id)` 索引 | P5 | 越权用例 + 15+ 消费仓切换 |

不可逆点：P2/P4 的表删除与 SDK 重生成；P6 的旧 `app_id` 语义移除。

## 8. 回归检查清单

| # | 场景 | 期望 |
| --- | --- | --- |
| 1 | 个人开发者无组织发布应用 | 自动个人 publisher，成功 |
| 2 | 从脚手架创建应用 | 生成产品 + 版本，来源可溯 |
| 3 | 同一脚手架被多租户使用 | 各自独立产品/安装，互不可见 |
| 4 | 创建 deploy 应用后 IAM 自动建安装 | 唯一约束不冲突；失败有状态与补偿 |
| 5 | 绑定公众号/小程序/支付 | 唯一约束生效；重复绑定被拒 |
| 6 | 签发 token | `app_id`=deploy 应用，`aud==app_id`，含 `env` |
| 7 | 用 A 应用 token 访问 B 应用 | 401/403 |
| 8 | 用租户 A token 读租户 B 数据 | 拒绝 |
| 9 | 发布新版本后按策略升级 | `pinned` 不升级、`auto_minor` 升级且身份切片迁移 |
| 10 | 卸载安装 | token 吊销、凭据退役、域名释放、数据按 `tenancy_model` 留存 |
