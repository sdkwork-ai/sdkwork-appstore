# SDKWork App Store Implementation Status

Active alignment tracker for `sdkwork-appstore` against `sdkwork-specs`.

Last updated: 2026-08-08

## Framework Integration

| Framework | Status | Notes |
| --- | --- | --- |
| `sdkwork-web-framework` | Integrated | Standalone gateway wraps Axum router; production security policy + rate limit + idempotency + request timeout wired; IAM + route manifest validation; `SdkWorkApiResponse` / `ProblemDetail` via `routes-common` |
| `sdkwork-database` | Integrated | PostgreSQL authoritative (`sdkwork-appstore-database-host`); SQLite test/development adapter with dialect translation in `sdkwork-appstore-repository-sqlx` |
| `sdkwork-utils` | Integrated | Rust envelope helpers; TypeScript record helpers in PC/H5 commons via `@sdkwork/utils` |
| `sdkwork-discovery` | Deferred | HTTP-only unified-process gateway; adopt when RPC split-services land |
| `sdkwork-drive` | Integrated | PC/H5 `@sdkwork/drive-app-sdk` upload helpers; Rust `drive_adapter` + `drive_uploader` |
| `sdkwork-comments` | Integrated | PC/H5 `@sdkwork/comments-app-sdk` listing reviews via `comments_thread_id` |
| `sdkwork-cloudrouter` (notifications) | Integrated | PC/H5 inbox via `@sdkwork/cloudrouter-app-sdk` + `appstore-notification-core` |
| `sdkwork-cloudrouter` (commerce checkout) | Integrated | PC/H5 paid listing acquire via `@sdkwork/cloudrouter-app-sdk/domains` + `appstore-listing-acquire-core` |
| `sdkwork-search` | Integrated (optional) | `SearchFederationAdapter` + SQL fallback; env `APPSTORE_SEARCH_BASE_URL` |
| `sdkwork-appbase` | Integrated |
| `sdkwork-market_channels` | Integrated (fail-closed) | Market channel relay connectors require a configured provider; without `APPSTORE_MARKET_PROVIDER_ENABLED` every sync mode returns `InvalidState` — client-reported status is never accepted |
| `sdkwork-platform` | Integrated | Platform context resolver wired in standalone gateway preflight; IAM dual-token context propagation |

## API Operations (95+)

All catalog, listing, library, publisher, moderation, compliance, analytics, and market operations implemented end-to-end (gateway + SQLx repositories + composed SDK + PC/H5 surfaces).

| Component | Status | Notes |
| --- | --- | --- |
| Analytics worker | Implemented | Scheduled listing metrics, chart snapshots, trending term projections; startup + interval cycles with bounded exponential-backoff retries; sargable date-range aggregation; trending upserts (no delete+insert) |
| App SDK composed client | Implemented | Catalog/listing extension methods in `composed/client.ts` |
| Publisher console core | Implemented | `@sdkwork/appstore-publisher-console-core` shared service/hooks |
| PC publisher UI | Implemented | `@sdkwork/appstore-pc-console-publisher` (zh-CN) |
| H5 publisher UI | Implemented | `@sdkwork/appstore-h5-console-publisher` (zh-CN mobile) |
| Listing acquire (paid checkout UX) | Implemented | `@sdkwork/appstore-listing-acquire-core`; PC/H5 listing detail ownership + checkout branch |
| Search UX core | Implemented | `@sdkwork/appstore-search-core`; PC/H5 zh-CN search mappers |
| Library updates UX core | Implemented | `@sdkwork/appstore-library-core`; PC/H5 updates page shared mapper |
| Listing support UX core | Implemented | `@sdkwork/appstore-listing-support-core`; PC/H5 listing report via support/mailto channel |
| Library actions core | Implemented | `@sdkwork/appstore-library-core`; PC/H5 uninstall + wishlist remove wired to app-api |
| Search index projection | Implemented | `SearchProjectionAdapter` on moderation approve; remove on storefront hide (optional env) |
| Market channel HTTP connectors | Implemented (fail-closed) | Apple/Google/Enterprise relay requires `APPSTORE_MARKET_*_SUBMIT_URL` + `APPSTORE_MARKET_PROVIDER_ENABLED` |

## Security & Authorization (2026-08-08 完成)

| Item | Status |
| --- | --- |
| listing / release / compliance 服务全量鉴权 | Implemented — 写操作要求 `appstore.listings.write` scope + publisher owner/member 校验；admin 操作要求 `appstore.listings.admin`；读操作按可见性门控（public 公开，否则属主/admin） |
| listing backend 管理端点 admin scope | Implemented — `admin_list/retrieve/visibility` 在服务层强制 `appstore.listings.admin` |
| 申诉人归属校验 | Implemented — 仅被审 listing 的 publisher owner/member 可申诉 |
| 审核决议投影鉴权 | Implemented — `apply_moderation_decision` 要求 moderation scope 或 system 调用者 |
| 移除恒 true 端口 | Implemented — 删除 `validate_publisher_access` / `verify_artifact_signature` 空实现（trait 与实现同步移除） |
| 网关生产安全配置 | Implemented — `SecurityPolicy::production()`（限流 120 req/min + pre-auth + tenant limit）、幂等 store、请求超时 30s、HSTS、JSON content-type 强制 |

## Download / Release Pipeline (2026-08-08 完成)

| Item | Status |
| --- | --- |
| 制品验证流程 | Implemented — attach/automation 时 drive_node + SHA-256 齐备即 `Verified`；发布（Published）前置校验至少一个 Verified 制品 |
| 制品状态统一 | Implemented — 所有查询过滤统一为 `artifact_status = 'verified'`（原 'active' 漂移修复） |
| 下载授权强制 | Implemented — 付费/订阅 listing 的 `resolve_download` 必须携带 grant；grant 校验 artifact 匹配 + consumable + 原子消费（防双花）；免费应用保持公开下载 |
| 下载凭证原子消费 | Implemented — `consume_grant_atomically` 条件 UPDATE（状态/次数/过期/归属），并发不会超发 |
| check_update 版本排序 | Implemented — semver 数值排序键（非行 version），游标稳定 |
| 灰度发布生效 | Implemented — `check_update` 读取 rollout：paused/cancelled 不发、completed/full 全量、百分比哈希分桶、region 过滤 |

## Pagination & Performance (2026-08-08 完成)

| Item | Status |
| --- | --- |
| page_size 边界 | Implemented — 全仓 `clamp(1, 200)`，负值/超大值不再穿透数据库 |
| ids 过滤上限 | Implemented — `listings_search` 拒绝超过 100 个 id 的请求 |
| keyset 游标一致性 | Implemented — 模板/评分/搜索/相似/开发者其他列表的游标与 ORDER BY 对齐（评分用 (created_at, id) 元组游标；搜索/相似/开发者降级为稳定键排序） |
| LIKE 通配符 | Implemented — `%`/`_`/`\` 转义 + `ESCAPE '\'` 子句（PG/SQLite 双兼容） |
| 租户覆盖 | Implemented — `upsert_rating`/`insert_feedback` 使用 context 租户而非领域对象 |
| 唯一约束 | Implemented — `appstore_app_template_usage` 增加 `UNIQUE (tenant_id, user_id, template_id, usage_type)` + ON CONFLICT upsert（防重复 star） |
| 集合项事务 | Implemented — `replace_collection_items` 事务化（delete+insert 原子） |
| 输入严格性 | Implemented — 路由层全部请求结构体 `deny_unknown_fields`（375 处） |
| 查询性能 | Implemented — analytics-worker 改用 sargable 日期范围 + trending upsert；失败指数退避重试 |

## SQLite / PostgreSQL 双引擎 (2026-08-08 完成)

| Item | Status |
| --- | --- |
| 方言适配 | Implemented — SQLite 方言翻译 `::text`→CAST、`->>'key'`→json_extract、`::numeric` 剥离（含括号配对回溯，9 个单测） |
| SQLite fixture 基线 | Implemented — 补齐 7 张缺失表（49 表对齐 PG 基线，含 rating/feedback/search_history/trending/iap/appeal/beta_invite） |
| 权威 schema 单一来源 | Implemented — 废弃 `specs/database/migrations/*.sql`（已删除），测试/工具全部指向 `database/ddl/baseline/postgres/0001_appstore_baseline.sql` 与 SQLite fixture |

## 已知限制（有意保留，非技术债务）

- 状态机行更新（审核/申诉/灰度配置等管理端低频操作）未加 version 乐观锁：并发 last-write-wins 风险低、影响面小；如上线后需要可加列迁移。
- 网关限流/幂等 store 为进程内存实现：单副本部署有效；多副本部署需替换为共享 Redis store（框架预留 store trait）。
- 驱动上传器为全量内存缓冲：大文件（>1GB）建议改流式分片（当前端口未被调用，属潜伏能力）。
- 市场渠道同步为 fail-closed：外部端点就绪后配置 env 即可启用。
- 个性化推荐仍为规则兜底（Phase 2 接入 search/recommendation 域）。

## Client Surfaces

| Surface | Dev command | Status |
| --- | --- | --- |
| PC browser | `pnpm dev` (pc app root) | zh-CN shell; IAM profile; publisher console package |
| H5 mobile web | `pnpm dev` (h5 app root) | 5-tab nav; zh-CN library/report/settings |

## Verification

```bash
pnpm install
pnpm check
pnpm verify
cargo test --workspace
node ../sdkwork-specs/tools/check-pagination.mjs --workspace .
node ../sdkwork-specs/tools/check-api-response-envelope.mjs --workspace .
node ../sdkwork-specs/tools/check-api-operation-patterns.mjs --workspace .
node ../sdkwork-specs/tools/check-app-sdk-consumer-imports.mjs --workspace .
```

Last verified: 2026-08-08 — workspace tests green; pagination/envelope/operation-pattern checks pass.
