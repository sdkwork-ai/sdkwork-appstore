# 应用工厂商业化落地差距报告（三消费面 + 五模型）

- 状态：待评审
- 日期：2026-11-17
- 范围：`sdkwork-appstore`、`sdkwork-deployments`、`sdkwork-iam`、`sdkwork-cloudrouter`（admin 应用中心）、`sdkwork-birdcoder2`（我的应用）、`sdkwork-webserver`（应用发布）
- 依据：`APPLICATION_IDENTITY_SPEC.md`、`APPLICATION_FACTORY_DB_RESTRUCTURE_PLAN.md`

## 1. 实测：平台存在五套"应用"模型

| # | 模型 | 表 | 主键 | 归属 |
| --- | --- | --- | --- | --- |
| 1 | 身份/运行时定义 | `iam_application_template`、`iam_application_template_package` | TEXT | iam |
| 2 | 租户安装 | `iam_tenant_application` | TEXT `app_id` | iam |
| 3 | 部署单元 | `deploy_app` + 15 张子表 | BIGINT + uuid | deploy |
| 4 | 商品 | `appstore_application`（原 `appstore_app`） | TEXT | appstore |
| 5 | **站点应用** | `webserver_application`、`webserver_application_host`、`webserver_app_platform_target` | BIGINT + uuid | webserver |

第 5 套此前未被纳入重构：它自带 `slug`、`application_kind`、`site_id`、`default_environment`，以及独立的 host 与发布目标表，与 `deploy_app` 的职责高度重叠。

## 2. 三个消费面的真实依赖

### 2.1 admin 应用中心（`sdkwork-cloudrouter-pc-admin-application`）

| 事实 | 证据 |
| --- | --- |
| 显式建模三组应用 | `ApplicationGroupId = "iam" \| "deploy" \| "app-store"` |
| 跨系统链接写入部署应用 metadata | `deploy_app.metadata.integrations.linkedApplications` |
| 一对一只靠前端判断 | `linkedToAnotherRow` 跳过逻辑 |
| 直接读写 appstore 模板 | `AppTemplatePanel.tsx`、`AppTemplateCategoryPanel.tsx` |

### 2.2 birdcoder2「我的应用」

| 事实 | 证据 |
| --- | --- |
| 我的应用 = 调用方名下 `deploy_app` | `apps.list` 的 `USER` 归属作用域 |
| 我的应用模板 = appstore 模板列表 | `template.appTemplates.list` |
| 发布为模板 / 从模板安装 | 直接走 appstore 模板接口 |
| 关联写入 | `metadata.publishing.appIdByTarget` |

**结论**：模板能力被 admin 与 birdcoder2 两个产品面直接消费，删除 appstore 模板表不是一次数据库操作，而是一次跨产品迁移。

### 2.3 webserver 应用发布

`webserver_application` 自带站点与发布目标，`deploy_app` 也自带域名与发布目标。**同一台服务器上的"应用"有两套注册入口**，谁负责发布没有单一权威。

## 3. 与规范的偏差

| # | 偏差 | 规范条款 | 影响 |
| --- | --- | --- | --- |
| D1 | 五套应用模型无统一身份主轴 | APPLICATION_IDENTITY_SPEC §2/§3 | 无法回答"同一个应用" |
| D2 | 跨系统链接以 metadata JSON 为权威 | §3（禁止 metadata/名称匹配做权威） | 丢更新、无唯一约束 |
| D3 | 模板被两个产品面直接依赖 | §9（脚手架唯一） | 无法安全删表 |
| D4 | 专家目录寄生在模板表（`template_type='EXPERT'`） | §1（一词一义） | 删模板连带删功能 |
| D5 | `webserver_application` 与 `deploy_app` 双发布权威 | §1/§7 | 发布链路不确定 |
| D6 | token `app_id` 仍为 IAM 租户应用 | §4 | 无法定位"哪个已部署应用" |
| D7 | ID 类型三种并存（TEXT / BIGINT+uuid / BIGINT） | API_SPEC §13.6 | 契约与 SDK 不一致 |

## 4. 商业化落地缺口（按严重度）

| 级别 | 缺口 | 说明 |
| --- | --- | --- |
| P0 | 发布权威不唯一 | webserver 与 deploy 都能"发布应用"，运营无法判断以谁为准 |
| P0 | 模板迁移未完成 | 三个消费面（admin、birdcoder2、专家页）仍依赖 appstore 模板 |
| P1 | token 未切到部署应用 | 无法按已部署应用做计费与隔离 |
| P1 | 安装/升级/卸载闭环未接 UI | 表已设计，产品面未使用 |
| P2 | 跨系统链接仍是 metadata | 一致性靠前端 |
| P2 | ID 与命名不统一 | 影响 SDK 与对外契约 |

## 5. 目标架构（收敛后）

```
产品面   appstore_application + version + sku + listing + price
部署面   deploy_application（唯一发布与运行权威）+ deploy_application_scaffold（唯一脚手架）
身份面   iam_application_installation（1:1 deploy）+ environment + credential
承载面   webserver 仅承载站点/反代/证书，不再拥有应用身份
消费面   admin 应用中心、birdcoder2 我的应用、控制台均读同一组 API
```

关键裁决：**webserver 从"应用模型"降级为"承载层"**；`webserver_application` 只保留站点级配置，应用身份与发布统一到 deploy。

## 6. 迁移路线

| 阶段 | 动作 | 验收 |
| --- | --- | --- |
| R1 | deploy 暴露 scaffold API（读/写/安装），appstore 模板表置只读 | deploy 契约通过；appstore 不再新增模板 |
| R2 | admin 应用中心切到 scaffold API + 安装链接 API | 页面无 metadata 写入；一对一路径改走接口 |
| R3 | birdcoder2 三个流程切到 deploy scaffold API | 我的应用模板/发布为模板/从模板安装全部可用 |
| R4 | 专家目录独立建表并迁移数据 | 专家页不依赖模板表 |
| R5 | 删除 appstore 三张模板表 | 契约 75 → 72，全仓零引用 |
| R6 | webserver 应用降级：身份与发布指向 deploy | 发布链路单一 |
| R7 | token 切到部署应用 + 数据面 `(tenant_id, app_id)` | 越权用例全绿 |

## 7. 每个消费面的验收标准

| 消费面 | 验收 |
| --- | --- |
| admin 应用中心 | 只通过受约束接口读写；不再以 metadata 为权威；一对一冲突有明确报错 |
| birdcoder2 我的应用 | 我的应用读 deploy；我的应用模板读 deploy scaffold；发布/安装链路可用 |
| webserver | 不再创建应用身份；站点配置仍可用；发布走 deploy |
| appstore | 无模板表；计价与上架不受影响 |
| iam | 安装 1:1 部署应用；token `app_id` = 部署应用 |

## 8. 结论

当前架构**可以支撑**多租户 SaaS 应用工厂，但尚未"可商业化落地"：发布权威二义、模板迁移跨三个产品面、token 未绑定部署应用，这三项是硬门槛。建议按 R1→R7 推进，先统一发布权威与脚手架，再切 token。
