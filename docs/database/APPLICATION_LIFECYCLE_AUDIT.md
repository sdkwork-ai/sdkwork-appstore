# 应用部署 / 注册 / access token 链路审查

- 状态：待评审
- 日期：2026-11-17
- 目标规范：`APPLICATION_IDENTITY_SPEC.md` §2–§4、§9；`APPLICATION_FACTORY_READINESS_GAP_REPORT.md` R1–R7

## 1. 现行链路（证据）

### 1.1 部署：创建部署应用

`deploy_app` 由 deploy 模块独立创建，含 `uuid`、`slug`、`application_kind`、`owner_type`、`default_environment` 与 15 张子表。
deploy 虽然依赖 IAM（`sdkwork-iam-web-adapter` 的请求上下文解析、`sdkwork-iam-provider-account-service` 的账号），但**不调用 IAM 的应用注册或安装开通接口**，因此创建部署应用不会产生 IAM 安装记录。

### 1.2 注册：IAM 应用注册

| 环节 | 实现 | 事实 |
| --- | --- | --- |
| 注册模板 | `applications.register`（bootstrap-body） | 只有运维凭据可写，与"人人可发布"冲突 |
| 开通租户应用 | `provision_tenant_application`（`application_registry.rs:485`） | 以 `template_id` 或 `app_key` 为输入 |
| runtime `app_id` 生成 | `platform_runtime_app_id_for_tenant`（`application_registry.rs:163`） | 默认 `app_{tenant_id}`，或由调用方显式给 |

注册产物是 `iam_application_template` + `iam_tenant_application`，与 deploy 应用**没有任何引用关系**。

### 1.3 签发：access token

| 环节 | 实现 | 事实 |
| --- | --- | --- |
| 会话令牌 | `access_token_issue.rs:161` `sign_local_session_token` | claims 由 IAM 上下文构造 |
| audience | `access_token_issue.rs:562` `"aud": context.app_id` | `app_id` = **IAM 租户应用**的 app_id |
| OAuth 令牌 | `oauth_authorization_server.rs:1218-1239` | audience = OAuth client id |
| 校验 | `application_access_token.rs:117-118`；`resolver.rs:116-123` | `aud == app_id`，并与宿主的 audience 允许列表比对 |

即：不变式 `aud == app_id` 已经成立，**但 `app_id` 指向 IAM 租户应用，不是部署应用**。

## 2. 目标链路（规范要求）

```
deploy 创建部署应用
   └─(开通，1:1)→ iam 安装 + 环境 + 凭据
登录/授权
   └─ token: app_id = 部署应用，aud = app_id，env 区分环境
请求
   └─ 校验 aud==app_id、部署应用属于 tid、数据按 (tid, app_id) 过滤
```

## 3. 逐环节差异

| # | 环节 | 现状 | 规范要求 | 判定 |
| --- | --- | --- | --- | --- |
| A1 | 部署→注册 | 无联动 | 1:1 且由唯一约束/开通事务保证 | ❌ 缺失 |
| A2 | 注册入口 | `bootstrap-body` 运维专用 | 开发者可自主注册/发布 | ❌ 冲突 |
| A3 | 注册对象 | 注册"模板" | 注册的是产品与版本；IAM 只记安装 | ❌ 过时 |
| A4 | token `app_id` | IAM 租户应用 | 部署应用 | ❌ 错误对象 |
| A5 | `aud` 校验 | 已成立但对象错 | `aud == 部署应用` | ⚠️ 需换对象 |
| A6 | 多环境 | 单 `environment` 列 | 环境级域名与凭据 | ⚠️ 新表未接 |
| A7 | 开通幂等/补偿 | 无 | 失败可重试、可巡检 | ❌ 缺失 |
| A8 | 数据面隔离 | 部分 `tenant_id` | `(tenant_id, app_id)` | ❌ 未完成 |

## 4. 必须改造的点

### 4.1 部署（deploy）

- 创建部署应用时，以幂等键调用 IAM 开通安装；失败进入 `pending_identity` 并可重试。
- 部署应用上暴露 `product_application_id` / `product_version_id`，使运行态可反查产品。
- 提供脚手架 API（R1），供 admin 与 birdcoder2 消费。

### 4.2 注册（iam）

- `application_installation.deploy_application_id UNIQUE` 成为一对一唯一权威（替换 metadata 与前端判断）。
- 删除 `applications.register`（模板注册），改为"安装开通"接口：输入部署应用 + 产品版本 + 环境清单。
- 安装环境与凭据写入 `iam_application_installation_environment` / `_credential`（已在 0039 建表）。
- 开通状态机：`pending_identity → active → failed`，附 `provision_idempotency_key`。

### 4.3 签发（token）

- `app_id` 取部署应用身份；`aud` 同步。
- 保留 `environment` claim，但校验时以 `installation_environment.(installation_id, env_key)` 为准。
- `azp` 保留 client id；`client_id` 不再承担应用身份。
- 校验点同步改造：`application_access_token.rs`、`iam_session.rs`、`resolver.rs`、`runtime_auth_metadata.rs`、`api_key_lookup.rs`、`service_account_credentials.rs`。

## 5. 验收用例（必须全绿）

| # | 用例 | 期望 |
| --- | --- | --- |
| 1 | 创建部署应用 | IAM 自动产生 1 条安装 + N 条环境；重复调用幂等 |
| 2 | IAM 开通失败 | 部署应用进入 `pending_identity`，重试成功；不产生孤儿安装 |
| 3 | 同一部署应用重复开通 | 唯一约束拒绝，返回明确冲突 |
| 4 | 签发 token | `app_id` = 部署应用；`aud == app_id` |
| 5 | 跨应用 | 用 A 应用 token 访问 B 应用 → 拒绝 |
| 6 | 跨租户 | 用租户 A token 读租户 B 数据 → 拒绝 |
| 7 | 多环境 | dev 与 prod token 各自的域名与凭据互不串用 |
| 8 | 卸载 | token 吊销、凭据退休、域名释放 |

## 6. 结论

三段链路**各自可运行，但彼此未连接**：部署不触发注册，注册不引用部署，token 指向注册产物。因此"按已部署应用做多租户隔离与计费"目前不成立。

改造顺序不可颠倒：

1. **安装唯一权威落库**（部署应用唯一引用）；
2. **部署→开通**（幂等 + 状态机 + 补偿）；
3. **token 换对象**（`app_id` = 部署应用，双发过渡）；
4. **数据面补 `(tenant_id, app_id)`**；
5. 最后删除旧注册入口与 appstore 模板。
