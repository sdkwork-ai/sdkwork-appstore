# zh-CN locale seeds

Locale-specific seed SQL referenced from `seeds/seed.manifest.json`.

- `001_storefront_listings_zh.sql` — 47 listing localizations (`ON CONFLICT DO UPDATE`)
- `002_storefront_releases_zh.sql` — 47 release note localizations
- `003_storefront_catalog_zh.sql` — editorial collection copy and trending terms

Regenerate with `node database/seeds/.generate-zh-locale-seeds.mjs`.
