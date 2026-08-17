-- en-US editorial catalog localizations and trending terms (tenant 100001).

INSERT INTO appstore_catalog_collection_localization
    (id, tenant_id, collection_id, locale, display_name, description, created_at, updated_at)
VALUES
    ('loc-col-1-en', '100001', 'col-1', 'en-US', 'Weekly Picks: AI Productivity Revolution', 'Editor picks for AI productivity apps', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-col-2-en', '100001', 'col-2', 'en-US', 'AI Coding & Agent Essentials', 'Tools that boost engineering efficiency from editors to agents', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-col-3-en', '100001', 'col-3', 'en-US', 'AI Creative & Multimedia Reimagined', 'AI image, music, and video creation', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-col-4-en', '100001', 'col-4', 'en-US', 'Board & Card Game Hall', 'Landlord, mahjong, xiangqi, and other classics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = EXCLUDED.updated_at;

INSERT INTO appstore_catalog_trending_term
    (id, tenant_id, term, locale, rank, score, snapshot_date, created_at, updated_at)
VALUES
    ('trend-1-en', '100001', 'DeepSeek R1', 'en-US', 1, 100.0, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-2-en', '100001', 'Qwen AI', 'en-US', 2, 94.5, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-3-en', '100001', 'Cursor', 'en-US', 3, 89.0, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-4-en', '100001', 'Kimi', 'en-US', 4, 83.5, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-5-en', '100001', 'Midjourney', 'en-US', 5, 78.0, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-6-en', '100001', 'Suno AI', 'en-US', 6, 72.5, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-7-en', '100001', 'Manus Agent', 'en-US', 7, 67.0, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-8-en', '100001', 'Tencent ima', 'en-US', 8, 61.5, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-9-en', '100001', 'Notion AI', 'en-US', 9, 56.0, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-10-en', '100001', 'ComfyUI', 'en-US', 10, 50.5, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    term = EXCLUDED.term,
    rank = EXCLUDED.rank,
    score = EXCLUDED.score,
    updated_at = EXCLUDED.updated_at;
