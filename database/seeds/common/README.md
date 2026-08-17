# Common seed scripts

Locale-agnostic seed SQL referenced from `seeds/seed.manifest.json` profiles.

- `001_bootstrap.sql` finalizes market channel, category bindings, compliance, regional availability, market releases, and media/thread references.
- `010_download_capabilities.sql` initializes release artifacts, paid entitlements, download grants, and install events for end-to-end download capability flows.

Run `node database/seeds/.audit-seeds.mjs` or `pnpm run db:audit-seeds` to verify listing/release/catalog/download reference integrity and non-empty storefront content.
