# 多租户 SaaS 应用工厂重构 · 验收清单

- 日期：2026-11-17
- 结论：**范围目标已实现；剩余 3 项已记录的非阻塞债务，待验收方决定是否接受**
- 证据基线：以下每一项都对应已提交的 main 分支提交与可复跑的门禁命令

## 1. 范围目标达成情况

| 目标 | 状态 | 关键提交 |
| --- | --- | --- |
| 统一发布权威（deploy） | ✅ | deploy `bf4a076`、`5de39e7`；webserver `3161649f` |
| 脚手架统一（唯一 CRUD 在 deploy） | ✅ | deploy `b32311d`；appstore `0ecba8d` |
| admin 应用中心迁移 | ✅ | cloudrouter `e7182c46`、`3822fc54`、`7e1fa9fd` |
| birdcoder2 我的应用 | ✅ | 模板流程本就走 deploy；appstore 货架移除 `b355bb4533` |
| 专家目录独立建表 | ✅ | appstore `c0700e7`、`f1f59e7`、`d41ea00` |
| 删除 appstore 模板表 | ✅ | appstore `0ecba8d`（76 → 73，三表不存在） |
| IAM 安装/环境/凭据 | ✅ | iam `cda02b6a`、`37f120b1`、`f7c48b0e`（67 → 65） |
| webserver 降级为承载层 | ✅ | webserver `3161649f`、`1096bda3`、`ed132e78`、`fa6673ee` |
| token 绑定部署应用 | ✅ | iam `b918c3ce`、`1277a06d`、`088d7c64`；cloudrouter `6414f956`、`7def0713`；specs `c231613`、`bbde396` |
| 数据面隔离 | ✅ deploy 已完成并实测；其他模块经审计确认无应用作用域数据 | deploy `0c188c2`、`9dc6cf5`；appstore `4314383`、`95a9691` |
| 存量回填与对账 | ✅ 工具与 runbook | iam `f22d69c5`；deploy `5005071` |

## 2. 回归门禁（2026-11-17 最终轮）

| 检查 | 结果 |
| --- | --- |
| 契约物化（iam / deploy / appstore / webserver） | 65 / 68 / 73 / 37 表，四个模块契约 **dirty=0**（幂等） |
| 模板表数量 | 四模块均为 **0** |
| 数据库框架校验 | 四模块 **passed** |
| 工作区编译 | iam / deploy / appstore / cloudrouter **0 error**；webserver 仅 Linux-only gateway 受宿主限制 |
| specs 锚工具测试 | 27 pass / 0 fail |
| iam 适配器测试 | 171 pass |
| deploy service / 路由清单 | 106 / 2 pass |
| appstore 库与属主测试 | 91 pass |
| birdcoder2 deploy + markets | 497 pass |
| webserver 承载页 | 10 pass |
| 真实 PostgreSQL 18.3 | 四条迁移链 65/68/73/37 全部 EXIT=0；跨应用隔离、市场读取、软删幂等复用实测通过 |

## 3. 剩余债务（3 项，均非阻塞）

| # | 债务 | 影响 | 关闭条件 |
| --- | --- | --- | --- |
| D1 | appstore `create_listing` 无法证明"商品归属发布者"（`AppReference` 不含归属，平台 provider 可选） | 当前被同租户 `app_id` 唯一约束兜底；移除该约束才会变成抢注 | 平台 provider 返回归属（跨模块契约变更） |
| D2 | webserver 承载页的部署应用 ID 为手填，无存在性预检 | 输错时由服务端 404/422 拒绝，不会写脏数据 | deploy 暴露应用查询接口，或承载页接入现有 deploy 列表做下拉 |
| D3 | `runtime_app_id` 变量名仍承载"部署应用锚" | 纯命名债，无行为影响 | 一次纯重命名 |

## 4. 复跑方式

```bash
# 契约与框架（各模块根目录）
node <sdkwork-specs>/tools/materialize-database-contract-from-baseline.mjs ...
node <sdkwork-specs>/tools/check-database-framework-standard.mjs --root .

# 编译
cargo check --workspace        # iam / deployments / appstore / cloudrouter

# 关键测试
node --test tools/backfill_installation_deploy_link.test.mjs     # iam
cargo test -p sdkwork-iam-web-adapter --lib                      # iam
cargo test -p sdkwork-intelligence-deploy-service --lib          # deploy
pnpm exec vitest run packages/client/ui-sdkwork-deploy packages/client/ui-sdkwork-markets
```

## 5. 验收判定

- 商业化主链路（部署 → 开通 → token → 隔离 → 承载 → 商店 → 专家）已闭环，并经真实 PostgreSQL 验证。
- 审计发现的越权面（制品/上传会话、健康检查/编排、release 草稿、下载授权、库安装、属主过滤）均已修复并有测试。
- 剩余 D1–D3 不影响主链路可用性与数据安全，属"已记录、待决定"的边界。
- 若要求"零已知债务"字面达成，需先关闭 D1–D3；否则建议以本清单作为验收依据接受现状。
