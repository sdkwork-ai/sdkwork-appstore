# SDKWork App Store UI/UX 设计规范

Status: active  
Owner: SDKWork maintainers  
Updated: 2026-07-06  
Authority: [PRD.md](../prd/PRD.md)、[TECH_ARCHITECTURE.md](../../architecture/tech/TECH_ARCHITECTURE.md)

## 1. 设计目标

对标 Apple App Store、Google Play、应用宝，在 SDKWork 生态内建立统一、可信、高转化的应用市场视觉与交互语言。覆盖 PC Web、H5 移动、桌面原生壳与小程序受限端。

设计原则：

| 原则 | 说明 |
| --- | --- |
| 内容优先 | 应用图标、截图、编辑大图是视觉主角 |
| 编辑感 | 首页不是纯算法货架，而是有温度的策展 |
| 信任闭环 | 隐私标签、官方认证、安全下载标识贯穿全站 |
| 转化导向 | 详情页 3 秒内传递价值；获取按钮状态清晰 |
| 多端一致 | 同一设计 token，按断点调整布局密度 |
| 无障碍 | WCAG 2.1 AA；键盘可达；尊重 reduced-motion |

---

## 2. 设计 Token

### 2.1 色彩（浅色 / 深色）

| Token | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- |
| `--bg-canvas` | `#F5F5F7` | `#000000` | 页面背景 |
| `--bg-surface` | `#FFFFFF` | `#1C1C1E` | 卡片 |
| `--bg-elevated` | `#FFFFFF` | `#2C2C2E` | 弹层/抽屉 |
| `--text-primary` | `#1D1D1F` | `#F5F5F7` | 主文字 |
| `--text-secondary` | `#6E6E73` | `#AEAEB2` | 次要文字 |
| `--text-tertiary` | `#8E8E93` | `#636366` | 辅助文字 |
| `--accent` | `#0071E3` | `#0A84FF` | 品牌蓝 / CTA |
| `--accent-hover` | `#0077ED` | `#409CFF` | CTA hover |
| `--success` | `#34C759` | `#30D158` | 成功 / 免费 |
| `--warning` | `#FF9500` | `#FF9F0A` | 限时 / 警告 |
| `--danger` | `#FF3B30` | `#FF453A` | 错误 / 拒绝 |
| `--star` | `#FFCE00` | `#FFD60A` | 评分星 |
| `--border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | 分割线 |

### 2.2 字体

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
  "PingFang SC", "Microsoft YaHei", Roboto, sans-serif;
```

| 层级 | 字号 | 字重 | 行高 | 用途 |
| --- | --- | --- | --- | --- |
| Display | 48 / 40 / 32 | 700 | 1.1 | Hero 标题 |
| Heading | 28 / 24 / 20 | 700 / 600 | 1.2 | 区块标题 |
| Title | 18 / 16 | 600 | 1.3 | 卡片标题 |
| Body | 16 / 14 | 400 / 500 | 1.5 | 正文 |
| Caption | 13 / 12 | 400 | 1.4 | 辅助信息 |

### 2.3 间距与圆角

- 间距梯度：`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64` px
- 圆角：卡片 `16–24px`；按钮胶囊 `9999px` 或 `12px`；应用图标连续圆角 `22.37%`
- 阴影：卡片 `--shadow-sm`；hover `--shadow-md`；弹层 `--shadow-lg`

### 2.4 断点

| 名称 | 宽度 | 布局 |
| --- | --- | --- |
| mobile | `< 768px` | 单栏 + 底部 Tab |
| tablet | `768–1279px` | 双栏 + 顶栏 |
| desktop | `≥ 1280px` | 多栏 + 侧边导航 |

---

## 3. 导航模式

### 3.1 PC（≥1280）

```text
┌────────────────────────────────────────────────────────────┐
│ Logo    [ 搜索栏 —————————————————————— ]    库  通知  头像  │
├──────────┬─────────────────────────────────────────────────┤
│ 发现     │                                                 │
│ 应用     │              主内容区                            │
│ 游戏     │                                                 │
│ 榜单     │                                                 │
│ 更新     │                                                 │
│ ─────    │                                                 │
│ 开发者   │                                                 │
└──────────┴─────────────────────────────────────────────────┘
```

- 左侧固定导航 240px；主内容最大宽 1200px 居中
- 搜索栏全局可用，`/` 快捷键聚焦
- 滚动时顶栏 sticky，搜索栏可收缩

### 3.2 H5（<768）

```text
┌────────────────────────┐
│  标题 / 搜索入口         │
├────────────────────────┤
│                        │
│      主内容区           │
│                        │
├────────────────────────┤
│ 发现  应用  游戏  搜索  库 │
└────────────────────────┘
```

- 底部 Tab 5 项：发现 / 应用 / 游戏 / 搜索 / 库
- 详情页、合集页隐藏 Tab，左上角返回
- 下拉刷新列表；上拉加载更多（分页）

---

## 4. 核心组件规格

### 4.1 AppCard（标准应用卡）

| 属性 | PC | H5 |
| --- | --- | --- |
| 宽度 | 200px | 160px |
| 图标 | 60×60 连续圆角 | 56×56 |
| 名称 | 14px/600 单行截断 | 同左 |
| 副标题 | 13px 灰色单行 | 同左 |
| 评分 | 12px + 星标 | 同左 |
| 获取按钮 | 可选内嵌或 hover 显示 | 始终显示 |

交互：hover 阴影上浮 + scale(1.02)；点击整卡进详情；获取按钮 stopPropagation。

### 4.2 AppCardLarge（编辑推荐大卡）

- 封面 16:9 大图
- 底部信息区：48px 图标 + 名称 + 编辑点评一行
- 用于 Today 流、合集首位

### 4.3 FeaturedBanner（Hero）

| 属性 | PC | H5 |
| --- | --- | --- |
| 高度 | 360px | 240px |
| 背景 | 全宽大图 + 渐变遮罩 | 同左 |
| 标题 | 48px/700 左下 | 28px/700 |
| CTA | 胶囊按钮 accent | 同左 |

- 自动轮播 5s；支持手势滑动；视差滚动（respect reduced-motion）

### 4.4 StoryCard（Today 故事卡）

- 封面 4:3；标题 18px；副标题 13px 灰
- 点击进入故事详情或关联合集

### 4.5 InstallButton（安装按钮状态机）

按钮先解析宿主平台，再决定文案、样式与安装包：宿主操作系统优先，其次 CPU 架构，最后按各系统约定的安装包格式排序。宿主识别使用 User-Agent Client Hints 的 `architecture`/`bitness`（Chromium、Electron 可用，可区分 Apple 芯片与 Intel Mac），不可用时回退 `navigator.userAgent`/`navigator.platform` 启发式；识别不到架构时按“能跑”的顺序回退（macOS 优先 x64/Rosetta，Windows 优先 x64/ARM64 模拟，Linux 优先 x64）。

| 状态 | 文案 | 样式 | 交互 |
| --- | --- | --- | --- |
| 未安装（免费，宿主有安装包） | 安装 {OS} 版 | accent 胶囊 | 安装该宿主推荐架构的安装包并创建 download_grant |
| 未安装（付费） | ¥价格 / 购买 | accent 胶囊 | 经 `@sdkwork/cloudrouter-app-sdk/domains` 创建 checkout session |
| 安装中 | 进度环 | accent + spinner | 禁用 |
| 已安装 | 打开 | 灰色胶囊 | 唤起应用 |
| 可更新 | 更新 | accent 描边 | 进入更新流 |
| 宿主无对应系统安装包 | 选择平台 | 中性描边胶囊 + 下拉箭头 | 打开安装包菜单，列出全部可用系统 |
| 同一系统多架构/多格式 | 安装 {OS} 版 + 拆分箭头 | accent 胶囊 + 右侧拆分箭头 | 默认安装推荐架构；菜单可选其他架构与包格式 |

- 多安装包时主按钮右侧为拆分箭头（同 Docker Desktop / VS Code 下载页），菜单行显示 `系统 · 架构`、`包格式 · 大小` 与“推荐”标记；不兼容当前 CPU 的行标注“可能无法在当前设备运行”。
- 按钮下方一行说明本次安装目标：`架构 · 包格式 · 大小`，并补一句“另支持…”，让用户不展开菜单也能看到其它平台。
- 详情页提供“安装包下载”区块，逐行列出每个系统与 CPU 架构（含包格式与大小）：本机可安装的行走安装流程，其它系统或本机 CPU 无法运行的行直接下载安装包文件，且不写入本机“已安装”库（付费应用仍先经结算门槛）。
- 直接下载用下载凭证换取短时链接并以文件下载方式交给浏览器（避免异步弹窗被拦截），结果以轻提示反馈：成功显示“已开始下载 {系统 · 架构}”，失败显示“下载链接暂不可用 / 下载失败”。
- 安装确认弹窗回显同一目标（系统 · 架构、包格式 · 大小）；命中宿主的显示“已识别当前系统”，回退到模拟层的显示兼容性提示。
- 详情页“信息”表增加“兼容性”一行，按系统汇总可用架构。

最小点击区域 44×44px（移动）。

### 4.6 ScreenshotGallery

- 横向滚动；截图包裹设备框（iPhone / Android / Desktop）
- 视频预览静音自动播放（可见区域）
- 点击 Lightbox 全屏；左右滑动切换
- 指示器显示当前索引

### 4.7 SearchBar

| 状态 | 内容 |
| --- | --- |
| 默认 | 占位「搜索应用、游戏、开发者」 |
| 聚焦 | 搜索历史 + 热搜词 |
| 输入中 | 实时建议列表 |
| 提交后 | 跳转搜索结果页 |

- 防抖 300ms；清空按钮；ESC 关闭

### 4.8 RatingStars + ReviewCard

- 详情页顶部：大数字评分 + 5 星 + 评分人数 + 分布柱图
- ReviewCard：头像 + 用户名 + 星 + 时间 + 正文 + 有用/举报
- 筛选：全部 / 最新 / 最高 / 最低；按版本、设备

### 4.9 Skeleton（骨架屏）

- 首页：Banner 矩形 + 3 行卡片骨架
- 详情：头部圆形 + 截图横条 + 文本行
- 列表：重复 AppCard 骨架
- 所有异步加载必须显示骨架，禁止空白闪烁

### 4.10 EmptyState / ErrorState

- 插画 + 主文案 + 副文案 + CTA（重试 / 去发现）
- 离线：提示缓存内容 + 重试

---

## 5. 页面布局规范

### 5.1 首页（发现）

**PC 布局（自上而下）：**

1. Hero Banner 全宽轮播
2. Today 故事卡横向滚动（2–3 列可见）
3. 编辑精选合集（CollectionCard 横滚）
4. 为你推荐（AppCard 网格 6 列）
5. 榜单速览（ChartList Top 10 双栏）
6. 分类入口（圆形图标横滚）
7. 福利活动（可选）

**H5 布局：** 同上，单列/双列网格；区块间距 24px。

加载策略：Hero 优先 → 故事卡 → 其余分区流式；每区独立 skeleton。

### 5.2 应用详情页（13 区块）

| # | 区块 | PC 布局 | H5 布局 |
| --- | --- | --- | --- |
| 1 | 应用头部 | 左图标右信息 + 右侧获取按钮 | 横排图标 + 获取按钮全宽 |
| 2 | 评分速览 | 横排指标 | 横排紧凑 |
| 3 | 截图画廊 | 全宽横滚 | 全宽横滚 |
| 4 | 描述 | 最大宽 720px | 全宽折叠 |
| 5 | 更新日志 | 卡片 | 卡片 |
| 6 | 评分评论 | 左分布柱右评论流 | 上下堆叠 |
| 7 | 隐私合规 | 标签网格 | 可折叠 |
| 8 | 信息表 | 两列表格 | 列表 |
| 9 | IAP 预览 | 横滚卡片 | 横滚 |
| 10 | 相似应用 | 4 列网格 | 横滚 |
| 11 | 开发者其他 | 横滚 | 横滚 |
| 12 | 编辑点评 | 引用块 | 引用块 |
| 13 | 支持链接 | 链接列表 | 链接列表 |

- PC：右侧 sticky 获取按钮（滚动超过头部后）
- H5：底部固定获取栏（滚动时浮现）

### 5.3 搜索结果页

- 顶栏：搜索词 + 筛选按钮
- 筛选抽屉：分类、价格、评分、年龄分级
- 结果：AppCard 列表 / 网格切换
- 空结果：推荐热门 + 相关词

### 5.4 Publisher Console

- PC：`@sdkwork/appstore-pc-console-publisher`（左侧 Tab + 右侧表单/表格，zh-CN）
- H5：`@sdkwork/appstore-h5-console-publisher`（列表 → 详情分步，zh-CN）
- 共享逻辑：`@sdkwork/appstore-publisher-console-core`（SDK 服务与 hooks）
- 状态色：草稿灰、审核中橙、已发布绿、拒绝红

---

## 6. 动效与微交互

| 场景 | 规范 |
| --- | --- |
| 页面转场 | 共享元素（图标）过渡 300ms ease |
| 列表 hover | translateY(-2px) + shadow 200ms |
| 按钮点击 | scale(0.97) 100ms |
| 收藏 | 心形 scale + 颜色填充 200ms |
| 骨架屏 | shimmer 1.5s 循环 |
| 下拉刷新 | 原生/自定义指示器 |
| 加载更多 | 底部 spinner |
| reduced-motion | 禁用视差与 scale，保留 opacity |

---

## 7. 无障碍

| 要求 | 落地 |
| --- | --- |
| 对比度 | 正文 ≥ 4.5:1；大字 ≥ 3:1 |
| 焦点 | 可见 focus ring 2px accent |
| 键盘 | Tab 顺序合理；Esc 关闭弹层 |
| ARIA | 按钮/导航/搜索 role + label |
| 图片 | 截图 alt=应用名+序号 |
| 动效 | `prefers-reduced-motion: reduce` |

---

## 8. 国际化

- 默认 zh-CN；支持 en-US、ja-JP、ko-KR
- 文案走 i18n key；数字/日期本地化
- 布局：RTL 预留（Phase 3）
- 货币：区域定价显示本地符号

---

## 9. 与行业对标差异说明

| 能力 | App Store | Google Play | 应用宝 | SDKWork |
| --- | --- | --- | --- | --- |
| 主色 | 蓝 | 动态 Material | 蓝 | 品牌蓝 + 中性底 |
| 首页风格 | Today 编辑 | For You 算法 | 福利+推荐 | 编辑+算法混合 |
| 图标形状 | 连续圆角 | 圆形 | 圆角 | 连续圆角（iOS 风） |
| 游戏独立 Tab | Arcade | Games | 有 | 有 |
| 评论 | 深度整合 | 深度整合 | 深度整合 | comments 域 |
| IAP | 原生 | 原生 | 弱 | cloudrouter/commerce 域结算；库内 entitlement 同步 |

---

## 10. 交付检查清单

- [x] 设计 token 已写入 `index.css`（PC/H5）
- [x] 深色模式 PC 全页面覆盖（H5 预留 `data-theme` token）
- [x] P0 页面骨架屏（PC 首页/详情；H5 加载态）
- [x] InstallButton 状态机完整
- [x] 详情页 13 区块对齐 PRD（PC 全量；H5 核心区块 + 底部获取栏）
- [x] 键盘 `/` 聚焦搜索（PC Header）
- [x] 搜索聚焦下拉：热搜 / 历史 / 实时建议（PC Header `SearchDropdown`）
- [x] Publisher Console 包下沉（PC/H5 + `publisher-console-core`）
- [x] IAM 账户资料：登录后拉取 + 设置页展示
- [x] 评论区块：PC/H5 通过 `@sdkwork/comments-app-sdk` 加载 `comments_thread_id` 评价
- [x] 通知收件箱：PC/H5 通过 `@sdkwork/cloudrouter-app-sdk` + `appstore-notification-core` 分页加载
- [x] 付费获取：PC/H5 通过 `@sdkwork/appstore-listing-acquire-core` + cloudrouter domains 结算分支
- [x] 搜索页：PC/H5 共享 `@sdkwork/appstore-search-core`；H5 全中文 + 设计 token
- [x] 更新页：PC/H5 共享 `@sdkwork/appstore-library-core`；H5 全中文 + 设计 token
- [ ] 生产环境 LCP / CDN 压测（需部署环境）
