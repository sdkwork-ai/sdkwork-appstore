# SDKWork App Store Specs

Local contracts that narrow root standards for this repository.

| File | Purpose |
| --- | --- |
| `component.spec.json` | Repository workspace component manifest |
| `domain.yaml` | Bounded context record for appstore |
| `AGENTS_DEPENDENCY_BOUNDARY_SPEC.md` | Mandatory `sdkwork-appstore -> sdkwork-agents` consumer direction, `@sdkwork/agents-app-sdk` import closure, and storefront/runtime ownership boundary |
| `database/schema-registry.yaml` | Portable table contracts (source of truth before DDL) |
| `database/migrations/` | Versioned SQL migrations derived from registry |

When a local spec conflicts with `../sdkwork-specs/`, the root spec wins unless a governance exception is recorded.
