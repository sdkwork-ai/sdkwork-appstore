# Appstore 技术架构

Status: active（行业对标重构）
Owner: SDKWork maintainers
Updated: 2026-07-05
Specs: ARCHITECTURE_DECISION_SPEC.md, DOCUMENTATION_SPEC.md, DATABASE_SPEC.md, API_SPEC.md, SDK_SPEC.md
Authority: [PRD.md](../../product/prd/PRD.md)、[appstore-architecture.md](../appstore-architecture.md)

## 文档地图

- 本文档：appstore 仓库级技术架构，承载产品 PRD 的工程落地。
- 产品 PRD：[PRD.md](../../product/prd/PRD.md)
- 应用架构：[appstore-architecture.md](../appstore-architecture.md)
- 集成能力：[TECH-appstore-integration-capabilities.md](TECH-appstore-integration-capabilities.md)
- 服务接口映射：[TECH-appstore-service-interface-map.md](TECH-appstore-service-interface-map.md)
- 表目录：[TECH-appstore-table-catalog.md](TECH-appstore-table-catalog.md)
- 操作目录：[TECH-operation-catalog.md](TECH-operation-catalog.md)
- SDK 设计：[TECH-sdk-design.md](TECH-sdk-design.md)
- 需求映射：[TECH-req-2026-appstore-foundation.md](TECH-req-2026-appstore-foundation.md)

---

## 1. 架构总览（Architecture Overview）

### 1.1 设计目标

| 目标 | 落地 |
| --- | --- |
| 行业对标 | 视觉/产品/UI/交互对标 App Store、Google Play、应用宝 |
| 多端一致 | PC、H5、移动原生、桌面、小程序统一契约 |
| 工程可控 | 分层清晰、契约先行、生成优先、零手改生成物 |
| 可演进 | 服务无状态、事件驱动、读写分离、水平扩展 |
| 安全合规 | 双令牌鉴权、RBAC、隐私标签、内容分级、制品签名 |
| 高性能 | 首页 LCP ≤ 2.5s、API P99 ≤ 300ms、搜索 P99 ≤ 500ms |

### 1.2 分层架构

```text
┌──────────────────────────────────────────────────────────────────────┐
│  客户端层（apps/*，独立仓库/进程）                                       │
│  PC（React + Vite + Tailwind） / H5 / 移动原生 / 桌面 / 小程序          │
│  ↓ 通过 @sdkwork/appstore-app-sdk / -backend-sdk 消费，禁止裸 HTTP      │
└──────────────────────────────────────────────────────────────────────┘
                                ↓ HTTPS
┌──────────────────────────────────────────────────────────────────────┐
│  网关层 sdkwork-api-appstore-standalone-gateway                              │
│  · 挂载 sdkwork-routes-*-{app,backend,open}-api 路由 crate              │
│  · 鉴权、限流、信封映射、ProblemDetail、Idempotency-Key                 │
│  · 单 HTTP 入口（single HTTP ingress）                                  │
└──────────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────────┐
│  服务层 sdkwork-appstore-service-host                                   │
│  publisher | listing | release | catalog | library                     │
│  moderation | compliance | analytics 投影端口                            │
│  · 领域不变量、编排端口、事件发布                                        │
│  · 跨域调用仅经生成 SDK 或声明的 connector 端口                           │
└──────────────────────────────────────────────────────────────────────┘
              ↓                                  ↓
┌──────────────────────────────┐   ┌───────────────────────────────────┐
│  持久层                       │   │  外部 SDK 端口（connector trait）    │
│  sdkwork-appstore-            │   │  · IAM（appbase）双令牌             │
│  repository-sqlx              │   │  · Platform（app_id 校验）          │
│  · appstore_* 表 SQLx 仓储     │   │  · Drive（媒体/制品引用）            │
│  · 读写分离、keyset 分页       │   │  · Comments（评论/评分/收藏）        │
│  · 列/索引/行映射              │   │  · Commerce（entitlement 同步）     │
└──────────────────────────────┘   │  · Notifications（事件投递）         │
              ↓                    │  · Search（索引同步）                │
┌──────────────────────────────┐   │  · Market channels（外部市场）       │
│  存储 PostgreSQL / SQLite     │   └───────────────────────────────────┘
│  · appstore_* 表              │
│  · 读写分离、冷热分层          │
└──────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────────┐
│  异步层 sdkwork-appstore-analytics-worker                                │
│  · 榜单快照、指标聚合、推荐画像、搜索索引同步                              │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.3 分层规则

| 规则 | 说明 |
| --- | --- |
| 路由层只适配 HTTP | 路由 crate 不含业务规则，只做请求/响应映射、信封、ProblemDetail |
| 服务层持有不变量 | 领域不变量、跨域编排、事件发布都在服务层 |
| 仓储层只做持久化 | SQLx 仓储不持有业务规则，只做列/行映射、分页、索引利用 |
| 跨域走 SDK/端口 | 跨域调用必须经生成 SDK 或声明的 connector trait，禁止直连外表 |
| 生成物不可手改 | SDK 生成物、路由 manifest、OpenAPI 生成物禁止手改 |
| 单 HTTP 入口 | 所有 API 经 standalone-gateway 暴露，无独立 API server |

---

## 2. 技术选型

| 层 | 技术 | 选型理由 |
| --- | --- | --- |
| 后端语言 | Rust | 性能、安全、生态（tokio、sqlx、axum） |
| Web 框架 | sdkwork-web-framework（基于 axum） | 统一信封、ProblemDetail、Idempotency |
| 持久化 | SQLx + PostgreSQL / SQLite | 编译期 SQL 校验、读写分离、keyset 分页 |
| 异步任务 | tokio + cron 调度 | 榜单快照、指标聚合 |
| 事件 | sdkwork async events（领域事件） | 解耦、索引同步、通知触发 |
| 网关 | sdkwork-api-appstore-standalone-gateway | 单入口、路由聚合、鉴权 |
| 前端框架 | React 18 + Vite + TypeScript | 生态成熟、HMR 快、类型安全 |
| UI 样式 | Tailwind CSS + 设计 token | 原子化、主题化、深色模式 |
| 路由 | react-router-dom | 客户端路由、嵌套路由 |
| 状态 | zustand + react-query | 服务端状态 + 客户端状态分离 |
| 图标 | lucide-react | 一致线性图标 |
| 动效 | framer-motion | 共享元素、布局动画 |
| SDK 生成 | sdkwork SDK 生成器（TypeScript） | 信封解包、类型安全、消费者包 |
| 包管理 | pnpm workspace | monorepo、依赖联邦 |
| 构建 | Vite + cargo | 前端 Vite，后端 cargo |
| 校验 | zod + json-schema | 运行时类型校验 |
| 测试 | vitest + cargo test + playwright | 单测 + 集成 + E2E |
| 可观测 | tracing + metrics + OpenTelemetry | 结构化日志、指标、链路 |

---

## 3. 系统边界与模块

### 3.1 能力模块（crate）

| 模块 | 服务 crate | 路由 crate | 职责 |
| --- | --- | --- | --- |
| Publisher | `sdkwork-appstore-publisher-service` | `sdkwork-routes-publisher-app-api` | 开发者入驻、成员、实名认证 |
| Listing | `sdkwork-appstore-listing-service` | `sdkwork-routes-listing-{app,backend,open}-api` | 上架信息、本地化、媒体、提交 |
| Release | `sdkwork-appstore-release-service` | `sdkwork-routes-appstore-catalog-app-api`（部分） | 版本、制品、渠道、灰度、退役 |
| Catalog | `sdkwork-appstore-catalog-service` | `sdkwork-routes-catalog-{app,backend,open}-api` | 首页、分类、合集、榜单、搜索、推荐 |
| Library | `sdkwork-appstore-library-service` | `sdkwork-routes-library-app-api` | 用户库、收藏、安装、下载凭证 |
| Moderation | `sdkwork-appstore-moderation-service` | `sdkwork-routes-moderation-backend-api` | 审核队列、决议、申诉 |
| Compliance | `sdkwork-appstore-compliance-service` | `sdkwork-routes-compliance-app-api` | 隐私标签、权限披露、内容分级 |
| Analytics | `sdkwork-appstore-analytics-worker` | `sdkwork-routes-metrics-backend-api` | 指标快照、榜单生成、推荐画像 |
| Market | `sdkwork-appstore-market-service` | `sdkwork-routes-market-backend-api` | 外部市场渠道分发 |
| 通用 | `sdkwork-appstore-routes-common`、`sdkwork-appstore-authorization` | — | 信封、ProblemDetail、鉴权 |
| 主机 | `sdkwork-appstore-service-host`、`sdkwork-api-appstore-standalone-gateway`、`sdkwork-appstore-database-host` | — | 服务装配、HTTP 入口、DB 主机 |

### 3.2 跨域边界

| 跨域调用 | 方式 | 边界规则 |
| --- | --- | --- |
| IAM 鉴权 | appbase SDK + 双令牌 | 不持有用户/组织主数据 |
| 应用注册校验 | platform SDK | listing 创建时校验 app_id 合法性 |
| 媒体/制品存储 | drive SDK + 客户端直传 | appstore 只引用 drive 资源 ID |
| 评论/评分/收藏 | comments SDK | listing 关联 comments_thread_id，汇总写入读模型 |
| 权益同步 | commerce connector trait | entitlement 同步，不持有结算 |
| 通知投递 | notifications connector trait | 事件订阅触发 |
| 搜索索引 | search connector trait | catalog 事件驱动同步 |
| 外部市场 | market connector trait | market_release 同步 |

---

## 4. 完整数据库设计

### 4.1 设计原则

| 原则 | 落地 |
| --- | --- |
| 表前缀 | 所有表 `appstore_` 前缀（DOMAIN_SPEC） |
| 主键 | `id BIGINT IDENTITY`（int64），雪花 ID 或自增 |
| 租户 | `tenant_id BIGINT NOT NULL`（多租户隔离） |
| 软删除 | `deleted_at TIMESTAMPTZ NULL`（关键实体保留） |
| 审计 | `created_at`、`updated_at`、`created_by`、`updated_by` |
| 时间 | `TIMESTAMPTZ`，UTC 存储 |
| 字符串 | `TEXT` 为主，短码用 `VARCHAR(n)` |
| 枚举 | `TEXT` + CHECK 约束（可读性优先） |
| JSON | `JSONB` 用于灵活结构（如媒体元信息、隐私标签） |
| 索引 | B-tree 为主；列表查询用复合索引；keyset 分页用 `(tenant_id, sort_key, id)` |
| 分页 | 仓储层 `LIMIT`/keyset，禁止内存 collect + skip |
| 本地化 | 独立 `_localization` 表，按 `locale` 区分 |
| 关联 | 中间表用 `_binding`/`_item` 后缀 |
| 快照 | 指标/榜单用 `_snapshot` 表，按时间分区或定期归档 |

### 4.2 通用列（profile: appstore_entity / tenant_entity）

每张业务表至少包含：

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | BIGINT | PK IDENTITY | 主键 |
| `tenant_id` | BIGINT | NOT NULL | 租户隔离 |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | 创建时间 |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | 更新时间 |
| `created_by` | BIGINT | NULL | 创建人（subject_id） |
| `updated_by` | BIGINT | NULL | 更新人 |
| `deleted_at` | TIMESTAMPTZ | NULL | 软删除 |

下文表结构只列业务列，通用列省略。

### 4.3 表清单（47 张）

| # | 表 | 模块 | 说明 |
| --- | --- | --- | --- |
| 1 | appstore_app | Listing | 已注册应用绑定 |
| 2 | appstore_app_dependency | Listing | 应用依赖关系 |
| 3 | appstore_app_template | Listing | 应用模板 |
| 4 | appstore_app_template_usage | Listing | 模板使用记录 |
| 5 | appstore_app_template_version | Listing | 模板版本 |
| 6 | appstore_publisher | Publisher | 开发者主体 |
| 7 | appstore_publisher_member | Publisher | 成员 |
| 8 | appstore_publisher_verification | Publisher | 实名认证 |
| 9 | appstore_listing | Listing | 应用上架信息（核心） |
| 10 | appstore_listing_localization | Listing | 多语言元信息 |
| 11 | appstore_listing_media | Listing | 媒体资源 |
| 12 | appstore_listing_category_binding | Listing | 分类绑定 |
| 13 | appstore_listing_tag_binding | Listing | 标签绑定 |
| 14 | appstore_listing_submission | Listing | 提交记录 |
| 15 | appstore_listing_metric_snapshot | Analytics | 指标快照 |
| 16 | appstore_listing_iap_item | Listing | IAP 预览项 |
| 17 | appstore_category | Catalog | 分类 |
| 18 | appstore_category_localization | Catalog | 分类本地化 |
| 19 | appstore_tag | Catalog | 标签 |
| 20 | appstore_tag_localization | Catalog | 标签本地化 |
| 21 | appstore_regional_availability | Listing | 区域可用性 |
| 22 | appstore_release | Release | 版本 |
| 23 | appstore_release_artifact | Release | 制品 |
| 24 | appstore_release_channel | Release | 发布渠道 |
| 25 | appstore_release_note_localization | Release | 更新日志本地化 |
| 26 | appstore_release_rollout | Release | 灰度发布 |
| 27 | appstore_release_beta_invite | Release | 内测邀请 |
| 28 | appstore_user_library_item | Library | 用户库 |
| 29 | appstore_user_wishlist_item | Library | 收藏 |
| 30 | appstore_install_event | Library | 安装事件 |
| 31 | appstore_download_grant | Library | 下载凭证 |
| 32 | appstore_entitlement | Library | 权益 |
| 33 | appstore_moderation_review | Moderation | 审核记录 |
| 34 | appstore_moderation_decision | Moderation | 审核决议 |
| 35 | appstore_moderation_appeal | Moderation | 审核申诉 |
| 36 | appstore_compliance_profile | Compliance | 合规档案 |
| 37 | appstore_compliance_permission_disclosure | Compliance | 权限披露 |
| 38 | appstore_catalog_collection | Catalog | 合集 |
| 39 | appstore_catalog_collection_item | Catalog | 合集项 |
| 40 | appstore_catalog_collection_localization | Catalog | 合集本地化 |
| 41 | appstore_catalog_featured_slot | Catalog | 推荐位 |
| 42 | appstore_catalog_chart_snapshot | Catalog | 榜单快照 |
| 43 | appstore_catalog_search_history | Catalog | 用户搜索历史 |
| 44 | appstore_catalog_trending_term | Catalog | 热搜词快照 |
| 45 | appstore_market_channel | Market | 市场渠道 |
| 46 | appstore_market_release | Market | 市场发布 |
| 47 | appstore_idempotency_key | 通用 | 幂等键 |

### 4.4 表结构详细定义

#### 4.4.1 appstore_app（已注册应用绑定）

绑定 platform 域注册的应用到 appstore 上下文。

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `app_key` | VARCHAR(64) | NOT NULL UNIQUE | 应用唯一 key（slug） |
| `platform_app_id` | BIGINT | NOT NULL | platform 域 app_id |
| `publisher_id` | BIGINT | NOT NULL FK → publisher | 所属开发者 |
| `display_name` | TEXT | NOT NULL | 显示名 |
| `app_kind` | TEXT | NOT NULL CHECK in (app, game, mini_program, desktop, extension) | 应用类型 |
| `platforms` | JSONB | NOT NULL DEFAULT '[]' | 支持平台数组（windows/macos/linux/ios/android/h5/mini_program） |
| `current_listing_id` | BIGINT | NULL FK → listing | 当前生效 listing |
| `status` | TEXT | NOT NULL CHECK in (active, suspended, delisted) | 状态 |

索引：`(tenant_id, app_key) UNIQUE`、`(tenant_id, publisher_id)`、`(tenant_id, platform_app_id)`。

#### 4.4.2 appstore_app_dependency（应用依赖）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `app_id` | BIGINT | NOT NULL FK → app | 依赖方 |
| `depends_on_app_id` | BIGINT | NOT NULL FK → app | 被依赖方 |
| `dependency_kind` | TEXT | NOT NULL CHECK in (required, optional, recommends) | 依赖类型 |
| `version_constraint` | TEXT | NULL | 版本约束（semver） |

索引：`(tenant_id, app_id)`、`(tenant_id, depends_on_app_id)`。

#### 4.4.3 appstore_app_template（应用模板）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `template_code` | VARCHAR(64) | NOT NULL | 模板代码 |
| `owner_publisher_id` | BIGINT | NULL FK → publisher | 模板所有者 |
| `display_name` | TEXT | NOT NULL | 模板名 |
| `description` | TEXT | NULL | 描述 |
| `icon_drive_id` | TEXT | NULL | 图标 drive ID |
| `category_id` | BIGINT | NULL FK → category | 主分类 |
| `status` | TEXT | NOT NULL CHECK in (draft, published, archived) | 状态 |

#### 4.4.4 appstore_app_template_usage（模板使用记录）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `template_id` | BIGINT | NOT NULL FK → app_template | 模板 |
| `app_id` | BIGINT | NOT NULL FK → app | 衍生应用 |
| `publisher_id` | BIGINT | NOT NULL FK → publisher | 使用者 |

#### 4.4.5 appstore_app_template_version（模板版本）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `template_id` | BIGINT | NOT NULL FK → app_template | 模板 |
| `version` | VARCHAR(64) | NOT NULL | 版本号 |
| `blueprint` | JSONB | NOT NULL | 模板蓝图（默认配置） |
| `changelog` | TEXT | NULL | 变更日志 |
| `status` | TEXT | NOT NULL CHECK in (draft, published, archived) | 状态 |

#### 4.4.6 appstore_publisher（开发者主体）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `publisher_code` | VARCHAR(64) | NOT NULL UNIQUE | 开发者代码 |
| `display_name` | TEXT | NOT NULL | 显示名 |
| `legal_name` | TEXT | NULL | 法定名称 |
| `entity_kind` | TEXT | NOT NULL CHECK in (individual, enterprise, organization) | 主体类型 |
| `contact_email` | TEXT | NOT NULL | 联系邮箱 |
| `contact_phone` | TEXT | NULL | 联系电话 |
| `website_url` | TEXT | NULL | 官网 |
| `support_url` | TEXT | NULL | 支持页 |
| `logo_drive_id` | TEXT | NULL | Logo drive ID |
| `description` | TEXT | NULL | 简介 |
| `publisher_status` | TEXT | NOT NULL CHECK in (pending, active, suspended, terminated) | 状态 |
| `verification_status` | TEXT | NOT NULL CHECK in (unverified, pending, verified, rejected) | 实名状态 |
| `verified_at` | TIMESTAMPTZ | NULL | 认证时间 |
| `agreement_signed_at` | TIMESTAMPTZ | NULL | 协议签署时间 |
| `organization_id` | BIGINT | NULL | 关联 IAM 组织 |

索引：`(tenant_id, publisher_code) UNIQUE`、`(tenant_id, organization_id)`、`(tenant_id, publisher_status)`。

#### 4.4.7 appstore_publisher_member（成员）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `publisher_id` | BIGINT | NOT NULL FK → publisher | 所属开发者 |
| `subject_id` | BIGINT | NOT NULL | IAM subject_id |
| `role` | TEXT | NOT NULL CHECK in (owner, admin, developer, viewer) | 角色 |
| `invited_email` | TEXT | NULL | 邀请邮箱 |
| `invite_status` | TEXT | NOT NULL CHECK in (pending, accepted, declined, revoked) | 邀请状态 |
| `joined_at` | TIMESTAMPTZ | NULL | 加入时间 |

索引：`(tenant_id, publisher_id, subject_id) UNIQUE`、`(tenant_id, subject_id)`。

#### 4.4.8 appstore_publisher_verification（实名认证）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `publisher_id` | BIGINT | NOT NULL FK → publisher | 所属开发者 |
| `verification_kind` | TEXT | NOT NULL CHECK in (individual_id, enterprise_license, organization_cert) | 认证类型 |
| `submitted_data` | JSONB | NOT NULL | 提交信息（脱敏） |
| `evidence_drive_ids` | JSONB | NOT NULL DEFAULT '[]' | 证据材料 drive ID |
| `status` | TEXT | NOT NULL CHECK in (pending, in_review, approved, rejected) | 状态 |
| `reviewer_id` | BIGINT | NULL | 审核人 |
| `decided_at` | TIMESTAMPTZ | NULL | 决议时间 |
| `rejection_reason` | TEXT | NULL | 拒绝原因 |

索引：`(tenant_id, publisher_id)`、`(tenant_id, status)`。

#### 4.4.9 appstore_listing（应用上架信息 - 核心）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_slug` | VARCHAR(96) | NOT NULL UNIQUE | URL slug |
| `app_id` | BIGINT | NOT NULL FK → app | 绑定应用 |
| `publisher_id` | BIGINT | NOT NULL FK → publisher | 所属开发者 |
| `primary_category_id` | BIGINT | NULL FK → category | 主分类 |
| `default_locale` | VARCHAR(16) | NOT NULL DEFAULT 'en-US' | 默认语言 |
| `icon_drive_id` | TEXT | NULL | 图标 drive ID |
| `cover_drive_id` | TEXT | NULL | 封面 drive ID |
| `pricing_model` | TEXT | NOT NULL CHECK in (free, paid, freemium, subscription) DEFAULT 'free' | 定价模型 |
| `base_price_cents` | BIGINT | NULL | 基础价格（分） |
| `currency` | VARCHAR(8) | NULL DEFAULT 'USD' | 币种 |
| `age_rating_code` | VARCHAR(16) | NULL | 年龄分级（如 4+/12+/16+/18+） |
| `age_rating_authority` | TEXT | NULL DEFAULT 'IARC' | 分级机构 |
| `listing_status` | TEXT | NOT NULL CHECK in (draft, submitted, in_review, approved, published, rejected, delisted) | 状态 |
| `storefront_visibility` | TEXT | NOT NULL CHECK in (public, unlisted, hidden) DEFAULT 'hidden' | 可见性 |
| `review_status` | TEXT | NOT NULL CHECK in (not_submitted, pending, in_review, approved, rejected) DEFAULT 'not_submitted' | 审核状态 |
| `current_release_id` | BIGINT | NULL FK → release | 当前发布版本 |
| `comments_thread_id` | BIGINT | NULL | comments 域评论线程 ID |
| `average_rating` | NUMERIC(3,2) | NOT NULL DEFAULT 0 | 平均评分（缓存） |
| `rating_count` | BIGINT | NOT NULL DEFAULT 0 | 评分人数（缓存） |
| `download_count` | BIGINT | NOT NULL DEFAULT 0 | 下载量（缓存） |
| `view_count` | BIGINT | NOT NULL DEFAULT 0 | 详情页访问量 |
| `published_at` | TIMESTAMPTZ | NULL | 首次发布时间 |
| `delisted_at` | TIMESTAMPTZ | NULL | 下架时间 |
| `official_website_url` | TEXT | NULL | 官网 |
| `support_url` | TEXT | NULL | 支持页 |
| `privacy_policy_url` | TEXT | NULL | 隐私政策 |
| `keywords` | JSONB | NOT NULL DEFAULT '[]' | 搜索关键词数组 |
| `editorial_highlight` | TEXT | NULL | 编辑点评 |

索引：`(tenant_id, listing_slug) UNIQUE`、`(tenant_id, publisher_id)`、`(tenant_id, primary_category_id)`、`(tenant_id, listing_status, storefront_visibility)`、`(tenant_id, published_at DESC)`、`(tenant_id, average_rating DESC)`、`(tenant_id, download_count DESC)`。

#### 4.4.10 appstore_listing_localization（多语言元信息）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `locale` | VARCHAR(16) | NOT NULL | 语言代码 |
| `display_name` | TEXT | NOT NULL | 显示名 |
| `subtitle` | TEXT | NULL | 副标题 |
| `short_description` | TEXT | NULL | 短描述（列表卡） |
| `full_description` | TEXT | NULL | 完整描述（详情页） |
| `whats_new_summary` | TEXT | NULL | 更新摘要 |
| `promotional_text` | TEXT | NULL | 推广文案 |
| `keywords` | JSONB | NULL | 关键词 |

索引：`(tenant_id, listing_id, locale) UNIQUE`。

#### 4.4.11 appstore_listing_media（媒体资源）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `media_kind` | TEXT | NOT NULL CHECK in (icon, screenshot, video_preview, promo_banner, cover) | 媒体类型 |
| `drive_id` | TEXT | NOT NULL | drive 资源 ID |
| `cdn_url` | TEXT | NULL | CDN 地址（缓存） |
| `locale` | VARCHAR(16) | NULL | 语言特定（NULL=通用） |
| `platform` | TEXT | NULL | 平台特定（NULL=通用） |
| `sort_order` | INT | NOT NULL DEFAULT 0 | 排序 |
| `width` | INT | NULL | 宽 |
| `height` | INT | NULL | 高 |
| `duration_ms` | INT | NULL | 视频时长 |
| `thumbnail_drive_id` | TEXT | NULL | 视频缩略图 |
| `metadata` | JSONB | NULL | 其他元信息 |

索引：`(tenant_id, listing_id, media_kind, sort_order)`。

#### 4.4.12 appstore_listing_category_binding（分类绑定）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `category_id` | BIGINT | NOT NULL FK → category | 分类 |
| `is_primary` | BOOLEAN | NOT NULL DEFAULT false | 是否主分类 |
| `sort_order` | INT | NOT NULL DEFAULT 0 | 排序 |

索引：`(tenant_id, listing_id, category_id) UNIQUE`、`(tenant_id, category_id, listing_id)`。

#### 4.4.13 appstore_listing_tag_binding（标签绑定）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `tag_id` | BIGINT | NOT NULL FK → tag | 标签 |

索引：`(tenant_id, listing_id, tag_id) UNIQUE`、`(tenant_id, tag_id, listing_id)`。

#### 4.4.14 appstore_listing_submission（提交记录）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `release_id` | BIGINT | NULL FK → release | 关联版本 |
| `submission_kind` | TEXT | NOT NULL CHECK in (initial, update, relist) | 提交类型 |
| `status` | TEXT | NOT NULL CHECK in (pending, in_review, approved, rejected, withdrawn) | 状态 |
| `submitted_by` | BIGINT | NOT NULL | 提交人 |
| `submitted_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | 提交时间 |
| `review_id` | BIGINT | NULL FK → moderation_review | 关联审核 |
| `notes` | TEXT | NULL | 提交备注 |

索引：`(tenant_id, listing_id, submitted_at DESC)`、`(tenant_id, status)`。

#### 4.4.15 appstore_listing_metric_snapshot（指标快照）

按日聚合的指标快照，支撑榜单与分析。

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `snapshot_date` | DATE | NOT NULL | 快照日期 |
| `install_count_daily` | BIGINT | NOT NULL DEFAULT 0 | 日安装量 |
| `install_count_cumulative` | BIGINT | NOT NULL DEFAULT 0 | 累计安装量 |
| `view_count_daily` | BIGINT | NOT NULL DEFAULT 0 | 日访问量 |
| `rating_avg` | NUMERIC(3,2) | NULL | 平均评分 |
| `rating_count_cumulative` | BIGINT | NOT NULL DEFAULT 0 | 累计评分人数 |
| `dau` | BIGINT | NULL | DAU |
| `mau` | BIGINT | NULL | MAU |
| `retention_d1` | NUMERIC(5,4) | NULL | 次日留存 |
| `retention_d7` | NUMERIC(5,4) | NULL | 7日留存 |
| `retention_d30` | NUMERIC(5,4) | NULL | 30日留存 |
| `crash_rate` | NUMERIC(7,5) | NULL | 崩溃率 |
| `revenue_cents_daily` | BIGINT | NULL | 日收入（分） |

索引：`(tenant_id, listing_id, snapshot_date DESC) UNIQUE`、`(tenant_id, snapshot_date, install_count_daily DESC)`、`(tenant_id, snapshot_date, rating_avg DESC)`。

#### 4.4.16 appstore_listing_iap_item（IAP 预览项）

由 Catalog SKU 投影或开发者关联的 IAP 预览，不持有结算。

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `item_code` | VARCHAR(64) | NOT NULL | 商品代码 |
| `display_name` | TEXT | NOT NULL | 显示名 |
| `description` | TEXT | NULL | 描述 |
| `price_cents` | BIGINT | NULL | 价格（分） |
| `currency` | VARCHAR(8) | NULL | 币种 |
| `iap_kind` | TEXT | NOT NULL CHECK in (consumable, non_consumable, subscription) | 类型 |
| `external_product_id` | TEXT | NULL | Catalog 产品或 SKU ID |
| `sort_order` | INT | NOT NULL DEFAULT 0 | 排序 |
| `status` | TEXT | NOT NULL CHECK in (active, hidden) DEFAULT 'active' | 状态 |

索引：`(tenant_id, listing_id, item_code) UNIQUE`、`(tenant_id, listing_id, sort_order)`。

#### 4.4.17 appstore_category（分类）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `category_code` | VARCHAR(64) | NOT NULL UNIQUE | 分类代码 |
| `parent_id` | BIGINT | NULL FK → category | 父分类（二级） |
| `icon_drive_id` | TEXT | NULL | 图标 |
| `color_theme` | VARCHAR(16) | NULL | 主题色 |
| `sort_order` | INT | NOT NULL DEFAULT 0 | 排序 |
| `status` | TEXT | NOT NULL CHECK in (active, hidden) DEFAULT 'active' | 状态 |
| `app_kind` | TEXT | NULL CHECK in (app, game, mini_program) | 适用类型 |

索引：`(tenant_id, category_code) UNIQUE`、`(tenant_id, parent_id)`、`(tenant_id, sort_order)`。

#### 4.4.17 appstore_category_localization（分类本地化）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `category_id` | BIGINT | NOT NULL FK → category | 所属分类 |
| `locale` | VARCHAR(16) | NOT NULL | 语言 |
| `display_name` | TEXT | NOT NULL | 显示名 |
| `description` | TEXT | NULL | 描述 |

索引：`(tenant_id, category_id, locale) UNIQUE`。

#### 4.4.18 appstore_tag（标签）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `tag_code` | VARCHAR(64) | NOT NULL UNIQUE | 标签代码 |
| `tag_kind` | TEXT | NOT NULL CHECK in (feature, theme, audience, platform) | 标签类型 |
| `status` | TEXT | NOT NULL CHECK in (active, hidden) DEFAULT 'active' | 状态 |

索引：`(tenant_id, tag_code) UNIQUE`、`(tenant_id, tag_kind)`。

#### 4.4.19 appstore_tag_localization（标签本地化）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `tag_id` | BIGINT | NOT NULL FK → tag | 所属标签 |
| `locale` | VARCHAR(16) | NOT NULL | 语言 |
| `display_name` | TEXT | NOT NULL | 显示名 |

索引：`(tenant_id, tag_id, locale) UNIQUE`。

#### 4.4.20 appstore_regional_availability（区域可用性）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `region_code` | VARCHAR(8) | NOT NULL | 区域代码（如 CN/US/JP） |
| `availability` | TEXT | NOT NULL CHECK in (available, unavailable) | 可用性 |
| `price_cents` | BIGINT | NULL | 区域定价（分） |
| `currency` | VARCHAR(8) | NULL | 币种 |

索引：`(tenant_id, listing_id, region_code) UNIQUE`、`(tenant_id, region_code, availability)`。

#### 4.4.21 appstore_release（版本）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `version` | VARCHAR(64) | NOT NULL | 版本号（semver） |
| `build_number` | VARCHAR(64) | NULL | 构建号 |
| `platform` | TEXT | NOT NULL | 平台 |
| `channel_id` | BIGINT | NOT NULL FK → release_channel | 发布渠道 |
| `release_status` | TEXT | NOT NULL CHECK in (draft, submitted, in_review, approved, published, rejected, retired) | 状态 |
| `min_os_version` | VARCHAR(32) | NULL | 最低 OS 版本 |
| `file_size_bytes` | BIGINT | NULL | 文件大小 |
| `checksum_sha256` | VARCHAR(64) | NULL | SHA256 校验和 |
| `signature_drive_id` | TEXT | NULL | 签名 drive ID |
| `release_type` | TEXT | NOT NULL CHECK in (major, minor, patch, hotfix) DEFAULT 'minor' | 版本类型 |
| `released_at` | TIMESTAMPTZ | NULL | 发布时间 |
| `retired_at` | TIMESTAMPTZ | NULL | 退役时间 |
| `force_update` | BOOLEAN | NOT NULL DEFAULT false | 是否强制更新 |
| `rollout_status` | TEXT | NOT NULL CHECK in (not_started, in_progress, paused, completed) DEFAULT 'not_started' | 灰度状态 |

索引：`(tenant_id, listing_id, version DESC)`、`(tenant_id, channel_id, release_status)`、`(tenant_id, released_at DESC)`。

#### 4.4.22 appstore_release_artifact（制品）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `release_id` | BIGINT | NOT NULL FK → release | 所属版本 |
| `artifact_kind` | TEXT | NOT NULL CHECK in (binary, package, source, symbol) | 制品类型 |
| `platform` | TEXT | NOT NULL | 平台 |
| `arch` | TEXT | NULL CHECK in (x64, arm64, x86, universal) | 架构 |
| `drive_id` | TEXT | NOT NULL | drive 资源 ID |
| `file_name` | TEXT | NOT NULL | 文件名 |
| `file_size_bytes` | BIGINT | NOT NULL | 大小 |
| `mime_type` | TEXT | NULL | MIME 类型 |
| `checksum_sha256` | VARCHAR(64) | NOT NULL | SHA256 |
| `signature_drive_id` | TEXT | NULL | 签名 |
| `artifact_status` | TEXT | NOT NULL CHECK in (uploaded, verified, published, revoked) | 状态 |
| `metadata` | JSONB | NULL | 元信息 |

索引：`(tenant_id, release_id, platform, arch)`、`(tenant_id, drive_id)`。

#### 4.4.23 appstore_release_channel（发布渠道）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `channel_code` | VARCHAR(64) | NOT NULL | 渠道代码（stable/beta/internal/alpha） |
| `display_name` | TEXT | NOT NULL | 显示名 |
| `channel_kind` | TEXT | NOT NULL CHECK in (production, beta, internal, market) | 渠道类型 |
| `is_default` | BOOLEAN | NOT NULL DEFAULT false | 是否默认渠道 |
| `status` | TEXT | NOT NULL CHECK in (active, archived) DEFAULT 'active' | 状态 |

索引：`(tenant_id, listing_id, channel_code) UNIQUE`。

#### 4.4.24 appstore_release_note_localization（更新日志本地化）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `release_id` | BIGINT | NOT NULL FK → release | 所属版本 |
| `locale` | VARCHAR(16) | NOT NULL | 语言 |
| `notes` | TEXT | NOT NULL | 更新日志 |
| `highlights` | JSONB | NULL | 高亮项数组 |

索引：`(tenant_id, release_id, locale) UNIQUE`。

#### 4.4.25 appstore_release_rollout（灰度发布）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `release_id` | BIGINT | NOT NULL FK → release | 所属版本 |
| `rollout_kind` | TEXT | NOT NULL CHECK in (percentage, region, cohort, market) | 灰度类型 |
| `target_spec` | JSONB | NOT NULL | 目标规则（百分比/区域/分群） |
| `current_percentage` | INT | NULL | 当前百分比 |
| `status` | TEXT | NOT NULL CHECK in (not_started, in_progress, paused, completed, aborted) | 状态 |
| `started_at` | TIMESTAMPTZ | NULL | 开始时间 |
| `completed_at` | TIMESTAMPTZ | NULL | 完成时间 |
| `paused_at` | TIMESTAMPTZ | NULL | 暂停时间 |
| `abort_reason` | TEXT | NULL | 中止原因 |

索引：`(tenant_id, release_id)`、`(tenant_id, status)`。

#### 4.4.26 appstore_release_beta_invite（内测邀请）

对标 TestFlight / Play 封闭测试轨道。

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `release_id` | BIGINT | NOT NULL FK → release | 内测版本 |
| `channel_id` | BIGINT | NOT NULL FK → release_channel | 内测渠道 |
| `invite_kind` | TEXT | NOT NULL CHECK in (email, link, subject) | 邀请类型 |
| `invite_target` | TEXT | NOT NULL | 邮箱 / 链接 token / subject_id |
| `invited_by` | BIGINT | NOT NULL | 邀请人 |
| `status` | TEXT | NOT NULL CHECK in (pending, accepted, expired, revoked) DEFAULT 'pending' | 状态 |
| `expires_at` | TIMESTAMPTZ | NULL | 过期时间 |
| `accepted_at` | TIMESTAMPTZ | NULL | 接受时间 |

索引：`(tenant_id, release_id, invite_target)`、`(tenant_id, channel_id, status)`。

#### 4.4.27 appstore_user_library_item（用户库）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `subject_id` | BIGINT | NOT NULL | 用户 subject_id |
| `listing_id` | BIGINT | NOT NULL FK → listing | 应用 |
| `installed_release_id` | BIGINT | NULL FK → release | 已安装版本 |
| `install_status` | TEXT | NOT NULL CHECK in (owned, installed, uninstalled) DEFAULT 'owned' | 状态 |
| `installed_at` | TIMESTAMPTZ | NULL | 首次安装时间 |
| `last_updated_at` | TIMESTAMPTZ | NULL | 最后更新时间 |
| `auto_update` | BOOLEAN | NOT NULL DEFAULT true | 自动更新 |
| `device_id` | VARCHAR(64) | NULL | 设备 ID |
| `platform` | TEXT | NULL | 安装平台 |

索引：`(tenant_id, subject_id, listing_id, device_id) UNIQUE`、`(tenant_id, subject_id, install_status)`。

#### 4.4.27 appstore_user_wishlist_item（收藏）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `subject_id` | BIGINT | NOT NULL | 用户 |
| `listing_id` | BIGINT | NOT NULL FK → listing | 应用 |
| `price_at_add_cents` | BIGINT | NULL | 加入时价格 |
| `notify_on_price_drop` | BOOLEAN | NOT NULL DEFAULT true | 降价提醒 |

索引：`(tenant_id, subject_id, listing_id) UNIQUE`、`(tenant_id, listing_id)`。

#### 4.4.28 appstore_install_event（安装事件）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `subject_id` | BIGINT | NOT NULL | 用户 |
| `listing_id` | BIGINT | NOT NULL FK → listing | 应用 |
| `release_id` | BIGINT | NOT NULL FK → release | 版本 |
| `event_kind` | TEXT | NOT NULL CHECK in (install, update, uninstall) | 事件类型 |
| `device_id` | VARCHAR(64) | NULL | 设备 |
| `platform` | TEXT | NULL | 平台 |
| `source` | TEXT | NULL CHECK in (organic, search, collection, featured, referral) | 来源 |
| `occurred_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | 发生时间 |

索引：`(tenant_id, listing_id, occurred_at DESC)`、`(tenant_id, subject_id, occurred_at DESC)`、`(tenant_id, event_kind, occurred_at)`。

#### 4.4.29 appstore_download_grant（下载凭证）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `grant_code` | VARCHAR(64) | NOT NULL UNIQUE | 凭证代码 |
| `subject_id` | BIGINT | NOT NULL | 用户 |
| `listing_id` | BIGINT | NOT NULL FK → listing | 应用 |
| `release_id` | BIGINT | NOT NULL FK → release | 版本 |
| `artifact_id` | BIGINT | NOT NULL FK → release_artifact | 制品 |
| `drive_id` | TEXT | NOT NULL | drive 资源 |
| `signed_url` | TEXT | NULL | 签名 URL（缓存） |
| `expires_at` | TIMESTAMPTZ | NOT NULL | 过期时间 |
| `consumed_at` | TIMESTAMPTZ | NULL | 消费时间 |
| `status` | TEXT | NOT NULL CHECK in (issued, consumed, expired, revoked) DEFAULT 'issued' | 状态 |
| `client_ip` | TEXT | NULL | 客户端 IP |
| `user_agent` | TEXT | NULL | UA |

索引：`(tenant_id, grant_code) UNIQUE`、`(tenant_id, subject_id, listing_id)`、`(tenant_id, status, expires_at)`。

#### 4.4.30 appstore_entitlement（权益）

由 Order/Payment entitlement 流程同步的权益快照。

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `subject_id` | BIGINT | NOT NULL | 用户 |
| `listing_id` | BIGINT | NOT NULL FK → listing | 应用 |
| `entitlement_kind` | TEXT | NOT NULL CHECK in (purchase, subscription, iap, promo) | 权益类型 |
| `external_entitlement_id` | TEXT | NOT NULL | Order/Payment 权益 ID |
| `status` | TEXT | NOT NULL CHECK in (active, expired, refunded, suspended) | 状态 |
| `granted_at` | TIMESTAMPTZ | NOT NULL | 授予时间 |
| `expires_at` | TIMESTAMPTZ | NULL | 过期时间 |
| `metadata` | JSONB | NULL | 元信息 |

索引：`(tenant_id, subject_id, listing_id, entitlement_kind)`、`(tenant_id, external_entitlement_id) UNIQUE`。

#### 4.4.31 appstore_moderation_review（审核记录）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `review_code` | VARCHAR(64) | NOT NULL UNIQUE | 审核代码 |
| `listing_id` | BIGINT | NOT NULL FK → listing | 应用 |
| `release_id` | BIGINT | NULL FK → release | 版本 |
| `submission_id` | BIGINT | NULL FK → listing_submission | 提交 |
| `review_kind` | TEXT | NOT NULL CHECK in (initial, update, appeal) | 审核类型 |
| `status` | TEXT | NOT NULL CHECK in (queued, assigned, in_review, decided, withdrawn) DEFAULT 'queued' | 状态 |
| `priority` | TEXT | NOT NULL CHECK in (low, normal, high, urgent) DEFAULT 'normal' | 优先级 |
| `assigned_reviewer_id` | BIGINT | NULL | 分配审核员 |
| `assigned_at` | TIMESTAMPTZ | NULL | 分配时间 |
| `queued_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | 入队时间 |
| `decided_at` | TIMESTAMPTZ | NULL | 决议时间 |
| `policy_references` | JSONB | NULL | 政策引用数组 |
| `appeal_for_review_id` | BIGINT | NULL FK → moderation_review | 申诉关联 |

索引：`(tenant_id, review_code) UNIQUE`、`(tenant_id, status, priority, queued_at)`、`(tenant_id, assigned_reviewer_id, status)`、`(tenant_id, listing_id, queued_at DESC)`。

#### 4.4.32 appstore_moderation_decision（审核决议）

不可变审计表，每条决议一条记录。

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `review_id` | BIGINT | NOT NULL FK → moderation_review | 所属审核 |
| `decided_by` | BIGINT | NOT NULL | 决议人 |
| `decision` | TEXT | NOT NULL CHECK in (approved, rejected, changes_requested) | 决议 |
| `reason_code` | TEXT | NULL | 原因代码 |
| `reason_detail` | TEXT | NULL | 详细原因 |
| `policy_citations` | JSONB | NULL | 政策引用 |
| `decided_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | 决议时间 |
| `effective_listing_status` | TEXT | NOT NULL | 生效后的 listing 状态 |
| `effective_release_status` | TEXT | NULL | 生效后的 release 状态 |
| `immutable_audit` | BOOLEAN | NOT NULL DEFAULT true | 不可变标记 |

索引：`(tenant_id, review_id, decided_at DESC)`、`(tenant_id, decided_by, decided_at DESC)`。

#### 4.4.33 appstore_moderation_appeal（审核申诉）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `appeal_code` | VARCHAR(64) | NOT NULL UNIQUE | 申诉代码 |
| `review_id` | BIGINT | NOT NULL FK → moderation_review | 原审核 |
| `listing_id` | BIGINT | NOT NULL FK → listing | 应用 |
| `publisher_id` | BIGINT | NOT NULL FK → publisher | 申诉开发者 |
| `submitted_by` | BIGINT | NOT NULL | 提交人 |
| `appeal_reason` | TEXT | NOT NULL | 申诉理由 |
| `evidence_drive_ids` | JSONB | NOT NULL DEFAULT '[]' | 证据材料 |
| `status` | TEXT | NOT NULL CHECK in (pending, in_review, upheld, dismissed) DEFAULT 'pending' | 状态 |
| `assigned_reviewer_id` | BIGINT | NULL | 处理人 |
| `decided_at` | TIMESTAMPTZ | NULL | 决议时间 |
| `decision_detail` | TEXT | NULL | 决议说明 |
| `new_review_id` | BIGINT | NULL FK → moderation_review | 重审关联 |

索引：`(tenant_id, appeal_code) UNIQUE`、`(tenant_id, status, submitted_by)`、`(tenant_id, listing_id)`。

#### 4.4.34 appstore_compliance_profile（合规档案）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `data_collection_purposes` | JSONB | NOT NULL DEFAULT '[]' | 隐私标签：数据收集目的 |
| `data_linked_to_user` | BOOLEAN | NOT NULL DEFAULT false | 数据是否关联用户 |
| `data_used_for_tracking` | BOOLEAN | NOT NULL DEFAULT false | 是否用于追踪 |
| `data_types_collected` | JSONB | NOT NULL DEFAULT '[]' | 收集的数据类型 |
| `data_types_linked` | JSONB | NOT NULL DEFAULT '[]' | 关联用户的数据类型 |
| `data_types_tracking` | JSONB | NOT NULL DEFAULT '[]' | 用于追踪的数据类型 |
| `privacy_practices_url` | TEXT | NULL | 隐私实践 URL |
| `content_rating_code` | VARCHAR(16) | NULL | 内容分级 |
| `content_rating_authority` | TEXT | NULL DEFAULT 'IARC' | 分级机构 |
| `content_rating_questionnaire` | JSONB | NULL | 分级问卷答案 |
| `security_certifications` | JSONB | NULL | 安全认证 |
| `last_updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | 最后更新 |

索引：`(tenant_id, listing_id) UNIQUE`。

#### 4.4.34 appstore_compliance_permission_disclosure（权限披露）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `listing_id` | BIGINT | NOT NULL FK → listing | 所属 listing |
| `permission_code` | VARCHAR(64) | NOT NULL | 权限代码 |
| `permission_kind` | TEXT | NOT NULL CHECK in (required, optional) | 必选/可选 |
| `purpose` | TEXT | NULL | 用途说明 |
| `purpose_locale` | VARCHAR(16) | NULL | 用途语言 |
| `data_category` | TEXT | NULL | 数据类别 |

索引：`(tenant_id, listing_id, permission_code) UNIQUE`。

#### 4.4.35 appstore_catalog_collection（合集）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `collection_code` | VARCHAR(64) | NOT NULL UNIQUE | 合集代码 |
| `collection_kind` | TEXT | NOT NULL CHECK in (editorial, chart, event, theme, personalized) | 类型 |
| `default_locale` | VARCHAR(16) | NOT NULL DEFAULT 'en-US' | 默认语言 |
| `cover_drive_id` | TEXT | NULL | 封面 |
| `hero_drive_id` | TEXT | NULL | Hero 图 |
| `sort_rule` | TEXT | NULL CHECK in (manual, popular, newest, trending, rating) | 排序规则 |
| `status` | TEXT | NOT NULL CHECK in (draft, published, archived) DEFAULT 'draft' | 状态 |
| `published_at` | TIMESTAMPTZ | NULL | 发布时间 |
| `starts_at` | TIMESTAMPTZ | NULL | 开始时间（活动） |
| `ends_at` | TIMESTAMPTZ | NULL | 结束时间（活动） |
| `target_audience` | JSONB | NULL | 目标分群 |
| `metadata` | JSONB | NULL | 其他元信息 |

索引：`(tenant_id, collection_code) UNIQUE`、`(tenant_id, collection_kind, status)`、`(tenant_id, published_at DESC)`。

#### 4.4.36 appstore_catalog_collection_item（合集项）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `collection_id` | BIGINT | NOT NULL FK → catalog_collection | 所属合集 |
| `listing_id` | BIGINT | NOT NULL FK → listing | 应用 |
| `sort_order` | INT | NOT NULL DEFAULT 0 | 排序 |
| `editorial_note` | TEXT | NULL | 编辑点评 |

索引：`(tenant_id, collection_id, listing_id) UNIQUE`、`(tenant_id, collection_id, sort_order)`、`(tenant_id, listing_id)`。

#### 4.4.37 appstore_catalog_collection_localization（合集本地化）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `collection_id` | BIGINT | NOT NULL FK → catalog_collection | 所属合集 |
| `locale` | VARCHAR(16) | NOT NULL | 语言 |
| `title` | TEXT | NOT NULL | 标题 |
| `subtitle` | TEXT | NULL | 副标题 |
| `description` | TEXT | NULL | 描述 |
| `cta_text` | TEXT | NULL | CTA 文案 |

索引：`(tenant_id, collection_id, locale) UNIQUE`。

#### 4.4.38 appstore_catalog_featured_slot（推荐位）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `slot_code` | VARCHAR(64) | NOT NULL UNIQUE | 推荐位代码（hero_home_1 等） |
| `slot_kind` | TEXT | NOT NULL CHECK in (hero, banner, story_card, app_card, collection_card) | 推荐位类型 |
| `surface` | TEXT | NOT NULL CHECK in (home, category, search, listing_detail) | 展示位 |
| `target_kind` | TEXT | NOT NULL CHECK in (listing, collection, url, event) | 目标类型 |
| `target_id` | BIGINT | NULL | 目标 ID |
| `target_url` | TEXT | NULL | 目标 URL |
| `cover_drive_id` | TEXT | NULL | 封面 |
| `default_locale` | VARCHAR(16) | NOT NULL DEFAULT 'en-US' | 默认语言 |
| `status` | TEXT | NOT NULL CHECK in (draft, scheduled, published, expired) DEFAULT 'draft' | 状态 |
| `starts_at` | TIMESTAMPTZ | NULL | 生效时间 |
| `ends_at` | TIMESTAMPTZ | NULL | 失效时间 |
| `target_audience` | JSONB | NULL | 目标分群 |
| `sort_order` | INT | NOT NULL DEFAULT 0 | 排序 |
| `metadata` | JSONB | NULL | 元信息 |

索引：`(tenant_id, slot_code) UNIQUE`、`(tenant_id, surface, status, sort_order)`、`(tenant_id, starts_at, ends_at)`。

#### 4.4.39 appstore_catalog_chart_snapshot（榜单快照）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `chart_code` | VARCHAR(64) | NOT NULL | 榜单代码（top_free/top_paid/top_new/trending/category_xxx） |
| `chart_kind` | TEXT | NOT NULL CHECK in (overall, category, editorial) | 榜单类型 |
| `category_id` | BIGINT | NULL FK → category | 分类（分类榜） |
| `snapshot_period` | TEXT | NOT NULL CHECK in (hourly, daily, weekly, monthly) | 快照周期 |
| `snapshot_at` | TIMESTAMPTZ | NOT NULL | 快照时间 |
| `rank` | INT | NOT NULL | 排名 |
| `listing_id` | BIGINT | NOT NULL FK → listing | 应用 |
| `metric_value` | BIGINT | NOT NULL | 指标值（安装量/评分等） |
| `metric_kind` | TEXT | NOT NULL CHECK in (installs, revenue, rating, growth) | 指标类型 |
| `previous_rank` | INT | NULL | 上期排名 |

索引：`(tenant_id, chart_code, snapshot_at DESC, rank)`、`(tenant_id, chart_kind, category_id, snapshot_at DESC)`、`(tenant_id, listing_id, chart_code, snapshot_at DESC)`。

#### 4.4.40 appstore_catalog_search_history（用户搜索历史）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `subject_id` | BIGINT | NOT NULL | 用户 |
| `query_text` | TEXT | NOT NULL | 搜索词 |
| `searched_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | 搜索时间 |
| `result_count` | INT | NULL | 结果数 |
| `clicked_listing_id` | BIGINT | NULL FK → listing | 点击的应用 |

索引：`(tenant_id, subject_id, searched_at DESC)`、`(tenant_id, subject_id, query_text)`。

#### 4.4.41 appstore_catalog_trending_term（热搜词快照）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `term` | TEXT | NOT NULL | 热搜词 |
| `locale` | VARCHAR(16) | NOT NULL DEFAULT 'zh-CN' | 语言 |
| `snapshot_at` | TIMESTAMPTZ | NOT NULL | 快照时间 |
| `rank` | INT | NOT NULL | 排名 |
| `search_count` | BIGINT | NOT NULL DEFAULT 0 | 搜索次数 |
| `growth_rate` | NUMERIC(7,4) | NULL | 增长率 |

索引：`(tenant_id, locale, snapshot_at DESC, rank)`、`(tenant_id, term, snapshot_at DESC)`。

#### 4.4.42 appstore_market_channel（市场渠道）

外部市场渠道（如华为/小米/应用宝等外部市场）。

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `channel_code` | VARCHAR(64) | NOT NULL UNIQUE | 渠道代码 |
| `display_name` | TEXT | NOT NULL | 显示名 |
| `provider_kind` | TEXT | NOT NULL | 提供方类型 |
| `api_endpoint` | TEXT | NULL | API 地址 |
| `credentials_drive_id` | TEXT | NULL | 凭证 drive ID |
| `status` | TEXT | NOT NULL CHECK in (active, paused, archived) DEFAULT 'active' | 状态 |
| `metadata` | JSONB | NULL | 元信息 |

索引：`(tenant_id, channel_code) UNIQUE`、`(tenant_id, status)`。

#### 4.4.41 appstore_market_release（市场发布）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `market_channel_id` | BIGINT | NOT NULL FK → market_channel | 渠道 |
| `release_id` | BIGINT | NOT NULL FK → release | 版本 |
| `external_release_id` | TEXT | NULL | 外部市场版本 ID |
| `sync_status` | TEXT | NOT NULL CHECK in (pending, syncing, synced, failed) DEFAULT 'pending' | 同步状态 |
| `synced_at` | TIMESTAMPTZ | NULL | 同步时间 |
| `last_error` | TEXT | NULL | 最近错误 |
| `external_metadata` | JSONB | NULL | 外部元信息 |
| `retry_count` | INT | NOT NULL DEFAULT 0 | 重试次数 |

索引：`(tenant_id, market_channel_id, release_id) UNIQUE`、`(tenant_id, sync_status)`。

#### 4.4.47 appstore_idempotency_key（幂等键）

| 列 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `idempotency_key` | VARCHAR(128) | NOT NULL | 幂等键 |
| `scope` | TEXT | NOT NULL | 作用域（如 appstore.release.create） |
| `subject_id` | BIGINT | NOT NULL | 发起人 |
| `request_payload_hash` | VARCHAR(64) | NOT NULL | 请求体 hash |
| `response_payload` | JSONB | NULL | 响应体（缓存） |
| `response_status` | INT | NULL | 响应状态码 |
| `expires_at` | TIMESTAMPTZ | NOT NULL | 过期时间 |

索引：`(tenant_id, scope, idempotency_key, subject_id) UNIQUE`、`(tenant_id, expires_at)`。

### 4.5 关键关系图

```text
publisher 1───* listing 1───* release 1───* release_artifact
                 │                │
                 │                └───* release_note_localization
                 │                └───* release_rollout
                 ├───* listing_localization
                 ├───* listing_media
                 ├───* listing_category_binding *───1 category
                 ├───* listing_tag_binding *───1 tag
                 ├───* regional_availability
                 ├───1 compliance_profile
                 │       └───* compliance_permission_disclosure
                 ├───* listing_submission
                 ├───* listing_metric_snapshot
                 └───* moderation_review *───1 moderation_decision
moderation_review 1───* moderation_appeal

catalog_search_history *─── subject
catalog_trending_term (snapshot)
listing 1───* listing_iap_item
release 1───* release_beta_invite

user_library_item *───1 listing
user_wishlist_item *───1 listing
install_event *───1 listing
download_grant *───1 listing / release / artifact
entitlement *───1 listing

catalog_collection 1───* catalog_collection_item *───1 listing
catalog_collection 1───* catalog_collection_localization
catalog_featured_slot ─── listing / collection
catalog_chart_snapshot *───1 listing
category 1───* category_localization
category 1───* category (self-ref parent)
tag 1───* tag_localization

market_channel 1───* market_release *───1 release
```

### 4.6 索引与分页策略

- **列表查询**：复合索引 `(tenant_id, <filter>, <sort_key>, id)`，仓储层用 keyset 分页（`WHERE sort_key < ? ORDER BY sort_key DESC, id DESC LIMIT ?`）。
- **详情查询**：主键或唯一索引（`listing_slug`、`review_code`、`grant_code`）。
- **聚合查询**：走 `listing_metric_snapshot` 快照表，不在 `install_event` 实时聚合。
- **搜索**：Phase 1 用 `listing` 全文索引（`tsvector`）兜底；Phase 2 切换 search 域。
- **榜单**：读 `catalog_chart_snapshot` 最新快照，不实时计算。
- **N+1 规避**：仓储层用 `IN` 批量加载本地化、媒体、分类绑定。

### 4.7 数据治理

| 维度 | 策略 |
| --- | --- |
| 软删除 | listing/publisher/review/decision 等关键实体软删除，事件类硬删除 |
| 不可变审计 | moderation_decision 不可变，只追加 |
| 快照归档 | metric_snapshot/chart_snapshot 按月归档冷存 |
| 敏感字段 | publisher_verification.submitted_data 加密存储；download_grant.signed_url 短时效 |
| 多租户 | 所有表 `tenant_id` 隔离；查询必须带 `tenant_id` |
| 国际化 | 所有面向用户文案走 `_localization` 表 |
| 数据最小化 | install_event 不存 PII；只存必要设备指纹 |

---

## 5. API、SDK 与数据归属

### 5.1 API 表面与前缀

| 表面 | 前缀 | 鉴权 | 用途 |
| --- | --- | --- | --- |
| app-api | `/app/v3/api` | 双令牌（AuthToken + AccessToken） | 终端用户 + 开发者 |
| backend-api | `/backend/v3/api` | 双令牌 + 后台权限 | 运营者 + 平台管理员 |
| open-api | `/store/v3/api` | API key / 客户端凭证 | CI/更新客户端 |

### 5.2 信封规范

- 成功：`{ "code": 0, "data": <payload>, "traceId": "<uuid>" }`
- 列表：`data.items` + `data.pageInfo`（`mode: offset|cursor`）
- 单资源：`data.item`
- 命令：`data.accepted` + 可选 `resourceId`/`status`
- 异步：`data.operationId` + `data.status` + 可选 `pollUrl`
- 错误：HTTP 4xx/5xx `application/problem+json`（`ProblemDetail`，含 `code`、`traceId`）
- HTTP 2xx JSON body 只用 `code: 0`
- 平台错误码：`40001`/`40101`/`40401`/`40901` 等

### 5.3 分页规范

- 输入：`SdkWorkListQuery` 或 `page`/`page_size`（offset）/`cursor`/`page_size`（cursor）
- 默认 `page_size: 20`，最大 `200`
- 仓储层 keyset 分页，禁止内存 collect + skip
- SDK 与前端一次只请求一页，禁止默认 `listAll*`

### 5.4 操作目录（73 → 90+）

完整操作目录见 [operation-catalog.md](../../api/operation-catalog.md)。Phase 1 补齐：

| 新增操作域 | 操作 |
| --- | --- |
| Catalog 推荐 | `appstore.catalog.recommendations.list`、`appstore.catalog.recentlyUpdated.list` |
| Catalog 福利 | `appstore.catalog.events.list`、`appstore.catalog.events.retrieve` |
| Listing 版本历史 | `appstore.listings.releases.history.list` |
| Listing 相似 | `appstore.listings.similar.list` |
| Listing 开发者其他 | `appstore.listings.developerOther.list` |
| Listing 编辑点评 | `appstore.listings.editorial.retrieve` |
| Search 建议 | `appstore.catalog.search.suggestions.list` |
| Search 热词 | `appstore.catalog.search.trending.list` |
| Search 历史 | `appstore.catalog.search.history.*` |
| Analytics 开发者 | `appstore.analytics.publisher.*` |
| Analytics 运营 | `appstore.analytics.operator.*` |
| Moderation 申诉 | `appstore.moderation.appeals.*` |
| Compliance IAP | `appstore.compliance.iapItems.list` |

### 5.5 SDK 家族

| SDK | 包名 | 用途 |
| --- | --- | --- |
| 公开 SDK | `@sdkwork/appstore-sdk` | open-api 消费 |
| App SDK | `@sdkwork/appstore-app-sdk` | app-api 消费（PC/H5/移动） |
| Backend SDK | `@sdkwork/appstore-backend-sdk` | backend-api 消费（运营后台） |

- 消费者禁止直接 import 生成器传输包，必须走组合 facade（`@sdkwork/appstore-app-sdk`）。
- 生成物在 `sdks/**/generated/**`，禁止手改。

---

## 6. 安全、隐私与合规

### 6.1 鉴权与授权

| 表面 | 鉴权 | RBAC 范围 |
| --- | --- | --- |
| app-api | 双令牌（AuthToken + AccessToken） | `appstore.catalog.read`、`appstore.listings.write`、`appstore.library.write` 等 |
| backend-api | 双令牌 + 后台权限 | `appstore.moderation.*`、`appstore.catalog.admin.*`、`appstore.publishers.admin` |
| open-api | API key / 客户端凭证 | 按 key 绑定 scope |

### 6.2 关键安全控制

| 控制 | 落地 |
| --- | --- |
| IDOR 防护 | listing/publisher 操作校验 ownership；library/wishlist 校验 subject_id |
| 制品完整性 | release_artifact 校验 SHA256 + 签名 |
| 下载凭证 | download_grant 短时效（默认 15min）+ 一次性消费 |
| 幂等 | 写操作支持 `Idempotency-Key`（scope 化） |
| 限流 | 网关层按 subject + IP 限流 |
| SQL 注入 | SQLx 编译期校验 + 参数化 |
| XSS | 前端 React 默认转义 + CSP |
| CSRF | 双令牌 + SameSite Cookie |
| 敏感数据 | publisher_verification.submitted_data 加密；credentials_drive_id 引用 |
| 审计 | moderation_decision 不可变；关键操作记审计日志 |

### 6.3 隐私与合规

| 维度 | 落地 |
| --- | --- |
| 隐私标签 | compliance_profile 全量覆盖（对标 App Store 隐私标签 + Play Data safety） |
| 权限披露 | compliance_permission_disclosure 全量 |
| 内容分级 | IARC 分级问卷 + age_rating_code |
| 数据最小化 | install_event 不存 PII；只存必要设备指纹 |
| 用户数据导出 | library/wishlist/install_event 可导出 |
| 用户数据删除 | 软删除 + 30 天后硬删除（GDPR/PIPL） |
| Cookie/追踪 | data_used_for_tracking 显式标记 |

---

## 7. 可观测性

| 维度 | 落地 |
| --- | --- |
| 日志 | `tracing` 结构化日志；每请求带 `traceId` |
| 指标 | Prometheus 指标：QPS、延迟分位、错误率、队列深度 |
| 链路 | OpenTelemetry traces；跨服务传播 `traceId` |
| 大盘 | Grafana 大盘：API、审核、目录、安装 |
| 告警 | 错误率 > 1%、P99 > 500ms、队列深度 > 阈值 |
| 健康检查 | `/health`、`/readiness` |
| 业务事件 | 领域事件落库 + 异步投递（评论/通知/索引） |

---

## 8. 部署与运行时拓扑

### 8.1 部署模式

| 模式 | 后端 | 数据库 | 用途 |
| --- | --- | --- | --- |
| SaaS | Java Spring（目标） | PostgreSQL | 多租户共享 |
| 本地/私有 | Rust + standalone-gateway | SQLite/PostgreSQL | 单租户 |
| 桌面内嵌 | Rust service-host in Tauri | SQLite | 桌面客户端 |

### 8.2 运行时拓扑（参考 etc/topology/）

| 拓扑 | 说明 |
| --- | --- |
| `standalone.development` / `standalone.production` | 单机：gateway 进程承载应用面 |
| `cloud.development` / `cloud.production` | 云上：平台 API gateway + 应用 ingress |

### 8.3 配置

- 配置文件：`etc/topology/*.env`、`configs/sdkwork-api-cloud-gateway.appstore.*.toml`
- 环境变量：`.env.example`
- 数据库：PostgreSQL（生产）/ SQLite（开发）
- 对象存储：sdkwork-drive
- 缓存：Redis（可选，Phase 2）

---

## 9. 前端架构与 UI 系统

### 9.1 应用根

| 应用 | 路径 | 端 |
| --- | --- | --- |
| sdkwork-appstore-pc | `apps/sdkwork-appstore-pc` | PC Web（≥1280） |
| sdkwork-appstore-h5 | `apps/sdkwork-appstore-h5` | H5/移动（<768） |

### 9.2 前端技术栈

| 维度 | 选型 |
| --- | --- |
| 框架 | React 18 + TypeScript |
| 构建 | Vite |
| 路由 | react-router-dom v6 |
| 状态 | zustand（客户端） + react-query（服务端） |
| 样式 | Tailwind CSS + 设计 token |
| 图标 | lucide-react |
| 动效 | framer-motion |
| SDK | `@sdkwork/appstore-app-sdk`（app）/ `@sdkwork/appstore-backend-sdk`（backend） |
| 校验 | zod |
| 国际化 | i18next（zh-CN/en-US/ja-JP/ko-KR） |
| 主题 | next-themes（深色模式） |

### 9.3 目录结构（PC）

```text
apps/sdkwork-appstore-pc/src/
  bootstrap/        # 环境、IAM、路由、host 适配
  components/
    common/         # Button、LoadingSpinner、EmptyState、Skeleton
    cards/          # AppCard、AppCardLarge、StoryCard、CollectionCard
    listing/        # ScreenshotGallery、RatingStars、ReviewCard、InstallButton
    layout/         # AppShell、Header、Sidebar、Footer
    search/         # SearchBar、SearchSuggestions、SearchFilters
  hooks/            # useApi、useDebounce、useTheme、usePagination
  pages/
    HomePage.tsx              # 首页编辑流
    SearchPage.tsx            # 搜索结果
    CategoryPage.tsx          # 分类页
    CollectionPage.tsx        # 合集页
    ChartPage.tsx             # 榜单页
    ListingDetailPage.tsx     # 应用详情（13 区块）
    LibraryPage.tsx           # 我的库
    UpdatesPage.tsx           # 更新中心
    WishlistPage.tsx          # 收藏夹
    LoginPage.tsx             # 登录
    settings/                 # 设置
    publisher/                # 开发者 Console
      PublisherConsolePage.tsx
      PublisherNewAppPage.tsx
      PublisherRoutes.tsx
      AppManagementPage.tsx
      ReleaseManagementPage.tsx
      AnalyticsPage.tsx
      CompliancePage.tsx
  providers/        # 主题、鉴权、Toast、Modal
  routes/           # 路由守卫
  services/         # storeClient、driveClient、driveUpload
  state/            # appStore（zustand）
  App.tsx
  main.tsx
  index.css         # Tailwind + 设计 token
```

### 9.4 路由结构（PC）

| 路由 | 页面 | 鉴权 |
| --- | --- | --- |
| `/` | HomePage | 公开 |
| `/search` | SearchPage | 公开 |
| `/category/:categoryId` | CategoryPage | 公开 |
| `/collection/:collectionId` | CollectionPage | 公开 |
| `/charts/:chartCode` | ChartPage | 公开 |
| `/app/:listingSlug` | ListingDetailPage | 公开 |
| `/library` | LibraryPage | 登录 |
| `/updates` | UpdatesPage | 登录 |
| `/wishlist` | WishlistPage | 登录 |
| `/publisher` | PublisherConsolePage | 开发者 |
| `/publisher/apps/new` | PublisherNewAppPage | 开发者 |
| `/publisher/apps/:listingId` | AppManagementPage | 开发者 |
| `/publisher/apps/:listingId/releases` | ReleaseManagementPage | 开发者 |
| `/publisher/apps/:listingId/analytics` | AnalyticsPage | 开发者 |
| `/publisher/apps/:listingId/compliance` | CompliancePage | 开发者 |
| `/settings` | SettingsPage | 登录 |
| `/login` | LoginPage | 公开 |

### 9.5 设计 Token 系统

```css
:root {
  /* 色板 - 浅色 */
  --bg-canvas: #F5F5F7;
  --bg-surface: #FFFFFF;
  --bg-elevated: #FFFFFF;
  --text-primary: #1D1D1F;
  --text-secondary: #6E6E73;
  --text-tertiary: #8E8E93;
  --accent: #0071E3;
  --accent-hover: #0077ED;
  --success: #34C759;
  --warning: #FF9500;
  --danger: #FF3B30;
  --star: #FFCE00;
  --border: rgba(0,0,0,0.08);
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.12);

  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  --radius-icon: 22.37%; /* 连续圆角矩形 */

  /* 间距 */
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px;
  --space-16: 64px;

  /* 字号 */
  --text-xs: 12px; --text-sm: 13px; --text-base: 14px;
  --text-md: 16px; --text-lg: 18px; --text-xl: 20px;
  --text-2xl: 24px; --text-3xl: 28px; --text-4xl: 32px;
  --text-5xl: 40px; --text-6xl: 48px;

  /* 断点 */
  --bp-mobile: 640px; --bp-tablet: 768px; --bp-desktop: 1024px;
  --bp-wide: 1280px; --bp-xwide: 1536px;
}

[data-theme="dark"] {
  --bg-canvas: #000000;
  --bg-surface: #1C1C1E;
  --bg-elevated: #2C2C2E;
  --text-primary: #F5F5F7;
  --text-secondary: #AEAEB2;
  --text-tertiary: #636366;
  --accent: #0A84FF;
  --accent-hover: #409CFF;
  --success: #30D158;
  --warning: #FF9F0A;
  --danger: #FF453A;
  --star: #FFD60A;
  --border: rgba(255,255,255,0.08);
}
```

### 9.6 视觉设计系统

#### 色彩

参见 PRD §6.2 色彩系统。设计 token 与 PRD 一致，深色模式全覆盖。

#### 字体

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
  "PingFang SC", "Microsoft YaHei", Roboto, sans-serif;
```

字号梯度参见 PRD §6.3。

#### 圆角与间距

参见 PRD §6.4。卡片 16/20、按钮 9999（胶囊）/12、图标 22.37%（连续圆角矩形，iOS 风）。

#### 阴影

- 卡片：`--shadow-sm`（默认）/ `--shadow-md`（hover）
- 弹层：`--shadow-lg`
- 编辑卡：大图 + 微阴影，强调内容

#### 图标

- 应用图标：连续圆角矩形（22.37%），96/60/48px 三档
- 分类入口：圆形，56px
- UI 图标：lucide-react，1.5px stroke

### 9.7 关键组件规格

#### AppCard（应用卡 - 核心组件）

```text
┌─────────────────────────────┐
│  ┌──────┐                   │
│  │ icon │  应用名            │
│  │ 60px │  副标题            │
│  └──────┘  ★ 4.8  · 免费    │
└─────────────────────────────┘
```

- 尺寸：固定宽度（PC 200px / 移动 160px）
- 图标：60×60 连续圆角
- 名称：14px/600，单行截断
- 副标题：13px/400 灰，单行截断
- 评分：12px + 星图标
- hover：阴影 + 轻微上浮

#### AppCardLarge（大图卡 - 编辑推荐）

```text
┌───────────────────────────────────┐
│                                   │
│        大图封面（16:9）             │
│                                   │
├───────────────────────────────────┤
│  ┌──────┐  应用名                  │
│  │ icon │  副标题                  │
│  │ 48px │  编辑点评                │
│  └──────┘  ★ 4.8  · 免费          │
└───────────────────────────────────┘
```

#### FeaturedBanner（Hero Banner）

```text
┌───────────────────────────────────────────────────┐
│                                                   │
│   主标题（48px/700）                                │
│   副标题（18px/400）                                │
│   [ CTA 按钮 ]                                     │
│                                                   │
│            背景大图（视差）                          │
│                                                   │
└───────────────────────────────────────────────────┘
```

- 高度：PC 360px / 移动 240px
- 背景：大图 + 渐变遮罩
- 文字：左下角对齐
- CTA：胶囊按钮

#### StoryCard（编辑故事卡）

```text
┌────────────────────────┐
│                        │
│   封面图（4:3）          │
│                        │
├────────────────────────┤
│   标题（18px/600）       │
│   副标题（13px/400）     │
└────────────────────────┘
```

#### CollectionCard（合集卡）

```text
┌────────────────────────────────┐
│  合集封面（16:9）                │
├────────────────────────────────┤
│  合集标题                        │
│  [icon] [icon] [icon]  +N       │
└────────────────────────────────┘
```

#### InstallButton（安装按钮 - 状态机）

| 状态 | 文案 | 样式 |
| --- | --- | --- |
| 未安装（免费） | 获取 | 蓝色胶囊 |
| 未安装（付费） | ¥价格 | 蓝色胶囊 |
| 安装中 | （进度环） | 蓝色胶囊 + 进度 |
| 已安装 | 打开 | 灰色胶囊 |
| 已拥有 | 打开 | 灰色胶囊 |

#### RatingStars（评分星）

- 5 星图标，支持半星
- 配合数字 + 评分人数

#### ScreenshotGallery（截图画廊）

- 横向滚动 + 设备框包裹
- 视频预览自动播放（静音）
- 点击放大 Lightbox

#### ReviewCard（评论卡）

```text
┌─────────────────────────────────────┐
│  [头像] 用户名  ★★★★★  2天前          │
│                                     │
│  评论正文                            │
│                                     │
│  👍 有用 (24)   👎   🚩 举报        │
└─────────────────────────────────────┘
```

### 9.8 详情页 13 区块（落地）

参见 PRD §4.3.1。技术实现：

| 区块 | 组件 | 数据源 |
| --- | --- | --- |
| ① 应用头部 | AppHeader | listing + localization |
| ② 评分速览 | RatingSummary | listing 缓存字段 |
| ③ 截图/视频 | ScreenshotGallery | listing_media |
| ④ 描述 | DescriptionBlock | listing_localization.full_description |
| ⑤ 更新日志 | WhatsNewBlock | release_note_localization |
| ⑥ 评分评论 | RatingsReviews | comments SDK + listing 缓存 |
| ⑦ 隐私合规 | PrivacyBlock | compliance_profile |
| ⑧ 信息表 | InfoTable | listing + release |
| ⑨ IAP 预览 | IapPreview | entitlement（commerce 同步） |
| ⑩ 相似应用 | SimilarApps | catalog 推荐接口 |
| ⑪ 开发者其他 | DeveloperApps | listing by publisher |
| ⑫ 编辑点评 | EditorialNote | listing.editorial_highlight |
| ⑬ 支持 | SupportBlock | listing URLs |

### 9.9 性能优化

| 维度 | 落地 |
| --- | --- |
| 首屏 LCP | SSR/SSG 首页骨架 + 流式加载 + CDN |
| 图片 | 懒加载 + 响应式 srcset + WebP + drive CDN |
| 代码分割 | 路由级 lazy import |
| 缓存 | react-query stale-while-revalidate |
| 骨架屏 | 所有异步加载 100% 骨架屏 |
| 虚拟列表 | 长列表虚拟滚动（react-window） |
| 预加载 | 鼠标 hover 预加载详情页 |
| Service Worker | 资源缓存 + 离线兜底（Phase 2） |

### 9.10 多端适配

| 端 | 断点 | 布局 | 导航 |
| --- | --- | --- | --- |
| PC | ≥1280 | 多栏网格 | 侧边栏 + 顶部搜索 |
| 平板 | 768–1280 | 双栏 | 顶部导航 |
| 移动 | <768 | 单栏 | 底部 Tab（发现/应用/游戏/搜索/库） |
| 桌面原生 | 同 PC | 同 PC | Tauri/Capacitor 包壳 |
| 小程序 | 同移动 | 同移动 | 受限原生能力 |

### 9.11 无障碍

| 维度 | 落地 |
| --- | --- |
| 对比度 | WCAG 2.1 AA（深色/浅色均满足） |
| 键盘 | 全量键盘导航 + 焦点环 |
| ARIA | 语义化 + ARIA label |
| 屏幕阅读器 | alt 文本 + aria-label |
| 动效 | 尊重 `prefers-reduced-motion` |

---

## 10. 智能推荐与搜索

### 10.1 推荐（Phase 2）

| 推荐场景 | 数据 | 算法 |
| --- | --- | --- |
| 首页「为你推荐」 | install_event + listing_metric | 协同过滤 + 内容相似 |
| 详情页「相似应用」 | 同分类 + 同标签 + 行为相似 | 内容相似 |
| 详情页「开发者其他」 | 同 publisher | 简单查询 |
| 搜索「猜你想找」 | 搜索历史 + 热词 | 热度 + 个性化 |
| 合集「个性化合集」 | 行为画像 | 运行时生成 |

推荐引擎 Phase 2 接入 search/recommendation 域，Phase 1 用规则兜底（热门 + 分类 + 标签）。

### 10.2 搜索

| 阶段 | 实现 |
| --- | --- |
| Phase 1 | DB `tsvector` 全文索引 + LIKE 兜底 |
| Phase 2 | 接入 sdkwork-search 域，事件驱动同步索引 |

| 能力 | 数据 |
| --- | --- |
| 关键词检索 | listing_localization + keywords |
| 搜索建议 | 热词 + 应用名前缀匹配 |
| 热搜词 | search_events 聚合 |
| 搜索历史 | 客户端 localStorage + 服务端同步 |
| 筛选 | category + pricing_model + age_rating + rating |
| 排序 | 相关度 / 热度 / 评分 / 最新 |
| 空结果 | 推荐热门 + 相似词 |

---

## 11. 验证与质量门禁

### 11.1 验证命令

| 命令 | 用途 |
| --- | --- |
| `pnpm run verify` | 前端 lint + 类型 + 单测 |
| `pnpm run sdk:check` | SDK 消费合规 |
| `cargo fmt --all --check` | Rust 格式 |
| `cargo test --workspace` | Rust 测试 |
| `node <sdkwork-specs>/tools/check-api-response-envelope.mjs --workspace .` | API 信封合规 |
| `node <sdkwork-specs>/tools/check-pagination.mjs --workspace .` | 分页合规 |
| `node <sdkwork-specs>/tools/check-app-sdk-consumer-imports.mjs --workspace .` | SDK 消费合规 |

### 11.2 质量门禁

| 维度 | 要求 |
| --- | --- |
| API 信封 | 100% `SdkWorkApiResponse` + `ProblemDetail` |
| 分页 | 100% keyset + `data.pageInfo` |
| SDK 消费 | 100% 走组合 facade |
| 命名 | operationId `appstore.<capability>.<action>`；表 `appstore_*` |
| 安全 | 0 严重漏洞；IDOR 全覆盖 |
| 测试 | 关键路径 E2E ≥ 80% |
| 文档 | PRD + TECH + 操作目录 + 表目录一致 |

---

## 12. 架构决策索引

| ADR | 主题 |
| --- | --- |
| ADR-20260612-appstore-foundation | appstore 基础架构 |
| ADR-20260628-api-response-envelope | API 响应信封 |
| ADR-20260629-native-composition-architecture | 原生组合架构 |

新增（待补）：

| 待补 ADR | 主题 |
| --- | --- |
| ADR-appstore-editorial-curation | 编辑式发现与运营编排 |
| ADR-appstore-personalization | 个性化推荐引擎接入 |
| ADR-appstore-search-federation | 搜索联邦到 search 域 |
| ADR-appstore-rollout-strategy | 灰度发布策略 |
| ADR-appstore-dark-launch | 深色模式与设计 token |

---

## 13. 风险与缓解

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| comments 域未就绪 | 评分评论缺失 | Phase 1 占位 + 缓存字段；Phase 2 集成 |
| search 域未就绪 | 搜索降级 | Phase 1 DB 全文索引兜底 |
| 商品包含多个 SKU | 用户无法确定购买规格 | 未提供规格选择前 fail closed；不得任取 SKU |
| drive 配额 | 媒体/制品受限 | 配额协商 + 冷热分层 |
| 多端壳差异 | 体验不一致 | 统一设计系统 + Phase 3 原生壳 |
| 个性化算法 | 推荐质量 | Phase 1 规则兜底 + Phase 2 接入推荐域 |

---

## 14. 实现状态与下一步

| 工作项 | 当前状态 | 下一步 |
| --- | --- | --- |
| 数据库 schema | 权威基线 `database/ddl/baseline/postgres/0001_appstore_baseline.sql`（49 表，含索引/唯一约束）；SQLite fixture 对齐 49 表；废弃迁移文件已清理 | 上线后按 `database/migrations/{engine}/` 追加增量迁移 |
| 服务鉴权 | listing/release/compliance 写操作 scope + publisher 成员/属主三重校验；admin 端点强制 `appstore.listings.admin`；申诉仅限被审 publisher | 无 |
| 下载/发布链路 | 制品 Verified 流程 + 发布前置校验 + 付费下载强制 grant + 原子消费（防双花）；check_update 按 semver 排序且灰度真实生效（百分比分桶/region/paused） | 无 |
| 网关安全 | `SecurityPolicy::production()` + 限流 + 幂等 store + 请求超时 30s + HSTS | 多副本部署时换共享 Redis store |
| 分页 | 全仓 `page_size` clamp(1,200)、ids 上限 100、keyset 游标与 ORDER BY 对齐、LIKE 转义 + ESCAPE | 无 |
| 后端 95+ 路由 | 服务层已实现，网关已接线 | OpenAPI/SDK 再生成校验 |
| PC/H5 详情页 | 13 区块骨架 + 部分真实数据 | 全量区块 + 视觉对齐 |
| PC/H5 首页 | Hero + 分类 + 榜单 | 编辑流 + 个性化数据 |
| 发布者 Console | 骨架 | 包归属收敛 + 完整向导 |
| 审核中心 | 后端就绪（含申诉回滚） | Backend Admin UI |
| 视觉系统 | 设计 token 草案 | 组件库 + 深色模式落地 |
| 搜索联邦 | DB 兜底已实现 | Phase 2 接入 search 域 |
| 推荐 | 规则引擎已实现 | Phase 2 深度学习推荐 |

详见 [crates/IMPLEMENTATION_TODO.md](../../../crates/IMPLEMENTATION_TODO.md)。
