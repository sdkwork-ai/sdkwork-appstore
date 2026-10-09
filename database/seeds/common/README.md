# Common seed scripts

Locale-agnostic seed SQL referenced from `seeds/seed.manifest.json` profiles.

- `001_bootstrap.sql` finalizes market channel, category bindings, compliance, regional availability, market releases, and media/thread references.
- `010_download_capabilities.sql` initializes release artifacts, paid entitlements, download grants, and install events for end-to-end download capability flows.
- `016_workspace_applications.sql` registers every H5 / PC / Flutter / mini-program (and HarmonyOS) application declared across the sdkwork-space sibling repositories. It is generated — do not hand-edit; refresh with `node database/seeds/.generate-workspace-applications.mjs` (scans `<workspace>/sdkwork-*/apps/*/sdkwork.app.config.json`) and verify with `node database/seeds/.generate-workspace-applications.mjs --check`. Its localized copy lives in the partner files `locales/zh-CN/004_workspace_applications_zh.sql` and `locales/en-US/004_workspace_applications_en.sql`; refresh the manifest checksums afterwards with `node database/seeds/.update-locale-checksums.mjs`.

Run `node database/seeds/.audit-seeds.mjs` or `pnpm run db:audit-seeds` to verify listing/release/catalog/download reference integrity and non-empty storefront content.
