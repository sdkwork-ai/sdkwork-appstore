# SDKWork Appstore Agents Dependency Boundary Specification

- Version: `1.0.0`
- Status: active architecture constraint
- Owner: `sdkwork-appstore`
- Dependency: `sdkwork-agents`
- Related:
  - `../../sdkwork-agents/specs/AGENTS_APPSTORE_CONSUMER_BOUNDARY_SPEC.md` (provider-side contract)
  - `../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md`
  - `../sdkwork-specs/PNPM_WORKSPACE_DEPENDENCY_SPEC.md`
  - `../sdkwork-specs/DEPENDENCY_MANAGEMENT_SPEC.md`

## 1. Dependency Direction

```text
sdkwork-appstore -> sdkwork-agents -> sdkwork-kernel
```

The appstore consumes Agents exclusively through the generated
`@sdkwork/agents-app-sdk` TypeScript client. The appstore never imports Agents
Rust crates, never mounts Agents runtime code, never reads or writes
`agents_*` tables, and never adds raw HTTP, manual auth headers, local SDK
proxies, or DTO forks in place of the generated client. The reverse dependency
`sdkwork-agents -> sdkwork-appstore` is forbidden.

## 2. Workspace Federation

The dependency is declared through the dual-track model and MUST stay
consistent:

- Local development: the root `pnpm-workspace.yaml` declares
  `../sdkwork-agents/sdks/sdkwork-agents-app-sdk/sdkwork-agents-app-sdk-typescript`
  exactly once; workspace members consume it with `workspace:*`.
- CI / release packaging: `sdkwork.workflow.json` declares a matching
  `sdkwork-agents` `dependencies[]` entry so CI checks out the sibling into the
  same `../sdkwork-agents` layout.
- Never use `file:`, `link:`, or git-URL specifiers for `@sdkwork/agents-app-sdk`;
  never add a Vite alias to redirect or rename the package.

## 3. Import Closure

- Only appstore `*-core` packages (for example `sdkwork-appstore-pc-core`) may
  import `@sdkwork/agents-app-sdk` and construct the client
  (`createAgentsAppClient`) inside the SDK client inventory.
- Page, capability, shell, and product packages consume Agents types and
  clients only through `*-core` exports and appstore-owned service ports.
- Never deep-import `@sdkwork/agents-app-sdk/generated/**` internals; consume
  only the package's public `exports` surface.
- Client construction binds `agentsAppApiBaseUrl` from the deployable root's
  `etc/` source configuration; runtime values never move into app manifests.
- Agents `int64` identifiers stay strings end to end (`API_SPEC.md` §13.6);
  never coerce them to `number`.

## 4. Storefront Composition Ownership

The appstore owns its storefront composition. The AI Lab sidebar group orders
its independent pages as 专家 (`/experts`), 扩展插件 (`/plugins`), 技能中心
(`/skills`), MCP 服务 (`/mcp`), 应用模板 (`/templates`).

- The 专家 page is an independent appstore page: its own route in the PC host
  route tree, its own page component in `sdkwork-appstore-pc-product`, and its
  own subcomponents/i18n namespaces. Its layout mirrors the 应用模板 page
  (header banner, search bar, category filter, card grid, empty state) so the
  display effect stays consistent.
- Storefront curated expert catalog data is appstore-owned presentation
  content. It is not an Agents contract and must not be forked from or written
  into Agents tables.
- Any agent execution a storefront expert participates in (sessions, turns,
  items, interactions, model providers) flows through the Agents SDK services;
  the appstore never persists Agents runtime state in its own stores.
- When Agents exposes a new API surface (for example an expert catalog API),
  consume it by regenerating `sdkwork-agents-app-sdk` on the Agents side and
  binding it through `sdkwork-appstore-pc-core`; never hand-write the client.

## 5. Verification

```powershell
node ../sdkwork-specs/tools/check-app-sdk-consumer-imports.mjs --workspace .
node ../sdkwork-specs/tools/check-workspace-member-protocol.mjs --root .
node ../sdkwork-specs/tools/check-api-operation-patterns.mjs --workspace .
pnpm check:api-envelope
pnpm typecheck && pnpm test && pnpm lint
```
