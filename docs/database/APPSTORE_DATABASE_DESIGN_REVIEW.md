# APPSTORE 数据库设计评审：对齐行业最专业的应用市场能力

- 版本：1.0（2026-09-06）
- 范围：`database/` 全部 49 张基线表 + 演化设计（migration 0002，新增 15 张表）
- 基线：`database/ddl/baseline/postgres/0001_appstore_baseline.sql`
- 演化：`database/migrations/postgres/0002_appstore_platform_evolution.up.sql`
- 对标体系：Apple App Store Connect、Google Play Console、Microsoft Store、华为 AppGallery（鸿蒙）、Chrome Web Store / Edge Add-ons / Firefox Add-ons、微信/支付宝/抖音/百度/淘宝小程序平台、Steam（PC 桌面分发）
- 规范依据：`../sdkwork-specs/DATABASE_SPEC.md`（L2 目标、expand-and-contract 演进）、`DATABASE_FRAMEWORK_SPEC.md`、`AGENTS.md`（commerce/IAM/Drive/Comments 为依赖域边界）

---

## 1. 覆盖目标：一个 App，六类分发形态

行业最专业的应用市场（Apple/Google/MS/Huawei 统一模式）都把「应用」与「平台包」分开建模：

```
App（一个产品）
 └── Platform Package（每个目标平台一个包身份）
      ├── iOS: bundle_id + ipa
      ├── Android: package_name + apk/aab
      ├── HarmonyOS: bundle_name + hap/app
      ├── Windows: msix identity + msix/exe；macOS: bundle_id + dmg/pkg；Linux: appimage/deb/rpm
      ├── Web/PWA: start_url + webmanifest；浏览器扩展: extension_id + crx/xpi
      └── 小程序: appid + mp_bundle（微信/支付宝/QQ/抖音/百度/淘宝）
           └── Platform Release（每平台每版本一条轨）
                ├── Artifact（构建产物：整包/增量/分拆包 + 签名 + 扫描 + CDN）
                ├── Rollout（灰度）
                └── 审核（提交 → 审查 → 决定 → 申诉 → 外部渠道同步）
```

**现有基线的核心结构性问题**：`platform` 只是 `appstore_release_artifact` 上的一列自由 TEXT，没有平台包身份实体，也没有平台级版本轨。一个 release 同时承载所有平台的产物，与 App Store Connect（按 platform 建立版本）、Google Play（按 track+device 分发）、小程序平台（按 appid 审核）的行业模型不一致。这是本次演化要解决的主线。

---

## 2. 缺陷清单

### P0 — 类型错误（必须修复）

| # | 位置 | 问题 | 修复 |
| --- | --- | --- | --- |
| P0-1 | `appstore_release_artifact.package_format` | `0004_appstore_timestamps_timestamptz` 迁移把**包格式 token**（ipa/apk/hap/msix/dmg/crx/xpi/zip）误转成 TIMESTAMPTZ。这是明显的批量 ALTER 误伤，导致包格式字段完全不可用 | migration 0002 FIX-1：还原为 TEXT |
| P0-2 | `appstore_release.version_code` | TEXT 类型无法数值比较，「最新版本」检查与强制升级判断只能靠字符串排序，`10.0.0 < 9.0.0` 类错误必然发生 | FIX-2：新增 `version_code_numeric BIGINT` 镜像列 + 数值排序索引；约束 version_code 必须是单调整数 build code（Android versionCode / ASC build number / 小程序版本号） |

### P1 — 数据一致性与规模缺陷

| # | 位置 | 问题 | 修复 |
| --- | --- | --- | --- |
| P1-1 | `appstore_app.rating_avg`、`appstore_listing.average_rating` | TEXT 存数值，无法聚合、无法按评分区间过滤 | FIX-3：转 `NUMERIC(4,2)` |
| P1-2 | `download_count`（app/listing）、`*_count`（metric_snapshot） | INTEGER 计数器在行业规模下会溢出（INT 上限 21 亿）；热行累加与主行耦合 | FIX-4：全部转 BIGINT；长期建议计数走 `install_event` 聚合 + 快照回写（install_event 已具备） |
| P1-3 | `appstore_user_library_item` 唯一键 `(user, app_key, platform)` | 一个应用存在多个 listing（分区域/备选店面）时同一安装会撞唯一键 | FIX-5：改为 `(user, listing_id, platform)` |
| P1-4 | `appstore_app` 与 `appstore_listing` 大量重复字段（rating、download_count、age_rating、URLs、icon） | 双写口径不清，必然漂移 | 文档约定：**listing 是店面口径权威，app 字段仅作工程侧缓存**；本设计不删除列（expand-only），后续 contract 阶段收敛 |
| P1-5 | `appstore_app_template` 系列用 BIGINT+uuid+data_scope 旧后台风格，其余表用 TEXT 雪花 | 两套 ID 规范并存 | 记录为 L0 遗留；新表一律 TEXT id，符合 `serialization: int64: string` 契约 |

### P2 — 能力缺口（对齐行业新增，见第 3 节）

平台建模、平台版本轨/强制更新/kill-switch、签名证书登记、供应链扫描、评论全生命周期、区域定价、兑换码、测试组、搜索读模型、统一分析指标。

---

## 3. 演化设计：新增 15 张表 + 5 处修复（migration 0002）

### 3.1 平台是一等实体（对标 ASC / Play / Microsoft Store / AppGallery）

| 新表 | 职责 | 行业依据 |
| --- | --- | --- |
| `appstore_platform_dictionary` | 平台枚举字典：`platform_family`（mobile/desktop/web/browser-extension/miniprogram）、OS 厂商、包格式集合、身份字段名 | 六类分发形态的统一注册表；种子见 `seeds/common/011_platform_dictionary.sql`（18 个平台：ios/ipados/android/harmonyos/windows/macos/linux/web/4 个浏览器扩展/6 个小程序平台） |
| `appstore_app_platform` | 每应用每平台一个包：`package_identity`（bundleId/packageName/bundleName/msix identity/extension_id/appid/start_url）、`external_store_app_id`、min/target OS、支持架构、设备族、兼容性 JSON、分发模式（商店/直发） | ASC 的 platform record；Play 的 package；小程序 appid；PWA manifest scope |
| `appstore_platform_release` | 平台版本轨：`(app_platform_id, channel_id, version_code)` 唯一；`release_phase`（internal/alpha/beta/staged/production）、**`force_update_flag` + `min_supported_version_code`（强制升级）**、**`kill_switch_flag`（紧急下架某版本）** | Play 轨道 + staged rollout；ASC phased release；小程序强制更新机制 |

配套：`appstore_release_artifact` 增加 `app_platform_id`、`platform_release_id`、`artifact_kind`（full/delta/split）、`delta_base_version_code`（增量升级基线，对标 Play AAB delta）、`signature_scheme`、`signing_cert_fingerprint`、`virus_scan_status/vendor/completed_at`（恶意软件扫描）、`cdn_url`。

现有 `appstore_release` 保留为店面级概念（expand-only），平台轨逐步成为分发权威，contract 阶段收敛 —— 符合 DATABASE_SPEC 的 expand-and-contract。

### 3.2 供应链安全（对标 Play App Signing / 公证要求）

| 新表 | 职责 |
| --- | --- |
| `appstore_signing_credential` | 发布者签名证书登记：Android upload key/App Signing、Apple distribution、Windows EV、HarmonyOS release cert；`fingerprint_sha256` 唯一、证书轮换链（`rotated_from_credential_id`）。用于升级包签名一致性校验，防重打包/签名调包攻击（L3） |

### 3.3 评论与评分全生命周期（对标 ASC Reviews / Play Reviews）

| 新表 | 职责 |
| --- | --- |
| `appstore_listing_review` | 评论正文：星级 CHECK(1..5)、标题、正文、关联版本（`release_id`）、平台、语言、审核状态、**开发者回复**（reply + reply_at + developer_user_id）、helpful/report 计数、编辑与软删 |
| `appstore_listing_review_vote` | 「有用」投票，`(review, user)` 唯一 |
| `appstore_listing_review_report` | 评论举报工单：原因码、处理人、处理时间 |
| `appstore_rating_distribution_snapshot` | 每日 1–5 星分布快照（产品页星级分布条） |

现有 `appstore_listing_rating`（仅星级+标题）保留兼容，评论正文以 `listing_review` 为权威。

### 3.4 定价与促销（目录/展示侧；交易与台账仍归 commerce 域）

| 新表 | 职责 |
| --- | --- |
| `appstore_listing_price` | 区域定价：`(listing, region, starts_at)` 唯一、currency、`NUMERIC(12,2)` 金额、价格档位、生效窗口（付费 App 各区域定价，对标 ASC price tiers / Play country pricing） |
| `appstore_promo_code_batch` / `appstore_promo_code` | 兑换码批次与单码（code_hash 唯一防枚举，`ledger_event` L3），对标 ASC promo codes / Play promo |

### 3.5 测试分发（对标 TestFlight / Play 内外测轨道）

| 新表 | 职责 |
| --- | --- |
| `appstore_release_tester_group` + `_member` | 内部/外部测试组与成员管理；`appstore_release_beta_invite` 增加 `tester_group_id` 关联 |

### 3.6 搜索与增长

| 新表 | 职责 |
| --- | --- |
| `appstore_catalog_search_doc` | 搜索读模型：`(listing, locale)` 唯一，display_name/subtitle/keywords/popularity_score + 状态，供目录搜索与 ASO 分析消费；后续可加 `pg_trgm`/tsvector 表达式索引 |
| `appstore_analytics_metric_daily` | 统一指标存储：`subject_type/subject_id` × `metric_code` × `platform_code` × `region_code` × 日期 唯一。覆盖 impression/view/install/uninstall/crash_free_sessions/anr_rate 等（对标 Play Console statistics / ASC Analytics），逐步取代窄列的 `listing_metric_snapshot` |

---

## 4. 落地物清单（本次已写入仓库）

| 文件 | 变更 |
| --- | --- |
| `database/migrations/postgres/0002_appstore_platform_evolution.up.sql` | 新增：5 处修复 + 15 张新表 DDL + 索引（expand-only，不删改既有列） |
| `database/ddl/baseline/postgres/0001_appstore_baseline.sql` | 折叠 0002（沿用 "folded migration" 惯例），greenfield 初始化即含全部结构 |
| `database/seeds/common/011_platform_dictionary.sql` | 18 个平台字典种子（ON CONFLICT DO NOTHING 幂等） |
| `database/contract/schema.yaml` | 注册 15 张新表 |
| `database/contract/table-registry.json` | 注册 15 张新表（共 64 张） |
| `specs/database/schema-registry.yaml` | 注册 15 张新表（含 profile/complianceLevel），并修复原 migrations 块的畸形缩进（原 0003/0004 的 file 行挂在 0002 之下），补记 0005 |
| `docs/database/appstore-table-catalog.md` | 追加 "Platform Evolution Tables (migration 0002)" 章节（15 表 DDL 镜像） |

## 5. 验证步骤（需在目标环境执行）

```bash
# 1. 契约校验
pnpm db:validate
pnpm db:materialize:contract

# 2. 在 PostgreSQL 上应用（已有部署走迁移；greenfield 走 baseline+seed）
pnpm db:migrate
pnpm db:seed
pnpm db:status

# 3. 漂移检查（发布前必跑）
pnpm db:drift:check
```

重点验证项：
1. FIX-1 后 `appstore_release_artifact.package_format` 为 TEXT 且历史值可读（若 0004 已在带数据环境执行过，需人工核对被转成时间戳的原始格式值）。
2. FIX-2 回填后 `version_code_numeric` 无 NULL（前提 version_code 均为纯数字 build code）。
3. FIX-3 前确认 `rating_avg`/`average_rating` 无空串/脏值（USING 已做 NULLIF 保护）。
4. FIX-5 的约束名依赖 PostgreSQL 自动命名（`..._key`），`DROP CONSTRAINT IF EXISTS` 已加保护。
5. Rust 行结构体同步：`rating_avg`/`average_rating` 需从 String 改为 `sqlx::types::Decimal` 或 `BigDecimal`；`download_count` 改 i64。此为本次设计的必然代码影响，需在同一 PR 完成。

## 6. 边界与后续建议（未在本次实施）

1. **commerce 边界**：交易、订单、台账归 commerce 域（AGENTS.md 依赖边界）。`appstore_listing_price`/`promo_code` 仅覆盖目录与展示侧，兑换核销需调用 commerce 授权。
2. **expand→contract 计划**：`app/listing` 重复字段与 `listing_metric_snapshot` → `analytics_metric_daily` 的收敛，安排在数据回填与读路径切换验证完成后（建议单独立项，按 DATABASE_SPEC 走 backfill→validate→cutover→cleanup）。
3. **分区**：`appstore_install_event`、`appstore_analytics_metric_daily` 数据量上来后按 `snapshot_date`/`occurred_at` 做 PostgreSQL 原生 RANGE 分区。
4. **ID 风格统一**：`appstore_app_template` 系列的 BIGINT+uuid 风格建议在模板域重构时对齐 TEXT 雪花（L0→L1）。
## 7. 前端平台能力对齐（2026-09-06 追加）

数据库以 `appstore_app_platform` / `appstore_platform_dictionary` 让平台成为一等实体后，前端同步落地平台展示与过滤能力：

**平台展示分组**（原始平台代码 → 卡片徽标/过滤维度，与用户语义对齐）：

| 分组 | 匹配的平台代码 |
| --- | --- |
| 安卓 | `android` |
| iOS | `ios`、`ipados` |
| 鸿蒙 | `harmonyos` |
| PC桌面 | `windows`、`macos`、`linux` |
| PC网页 | `web`、`web-pc`、`pwa` |
| H5网页 | `h5`、`web-h5`、`mobile-web` |
| 小程序 | `miniprogram-*` |
| 浏览器扩展 | `browser-extension-*` |

**PC 端**（sdkwork-appstore-pc）：
- `pc-core/src/platforms.ts`：平台分组元数据与解析函数（单一事实来源，随 `@sdkwork/appstore-pc-core` 导出）
- `AppItem` 新增 `platforms?: string[]`；`pc-runtime/appStore.ts` 的 `mapListingSummary` 从目录行读取 `platforms/platform_codes` 等多种键，缺省回退 PC 语境（windows）
- `pc-commons/PlatformBadges` 组件：卡片平台徽标（彩色小胶囊，超 3 个折叠 +N），已接入 `AppRow`（发现/榜单/搜索结果行卡片）与 `FeaturedTodayCard`
- 搜索页新增 `PlatformFilterBar`（平台过滤 chips），先客户端过滤当前页结果，目录 API 支持服务端平台筛选后可平滑切换
- i18n：zh-CN / en 双语 `common.platformGroups.*`

**H5 端**（sdkwork-appstore-h5）：
- `src/platforms.ts`：同一套分组元数据（简体中文语境，含 `readListingPlatformCodes` 行解析）
- `components/common/PlatformBadges`：徽标 + `PlatformFilterBar`（可展开的横滑过滤条）
- 首页推荐卡片、浏览页、搜索页均已接入平台标识与平台过滤

**待办**：目录 API 的 listing 响应目前未携带平台投影，前端回退逻辑保证可运行；后端按 `appstore_app_platform` 输出 `platforms` 字段后徽标即显示真实数据。存量 typecheck 错误（pc-runtime 的 IamAppContext/mcp/engagement SDK 方法名等 7 处）与本次改动无关，待单独修复。

