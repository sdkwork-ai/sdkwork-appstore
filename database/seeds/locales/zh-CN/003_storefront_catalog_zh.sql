-- zh-CN editorial catalog localizations and trending terms (tenant 100001).

INSERT INTO appstore_catalog_collection_localization
    (id, tenant_id, collection_id, locale, display_name, description, created_at, updated_at)
VALUES
    ('loc-col-1', '100001', 'col-1', 'zh-CN', '本期精选 - AI 生产力革命', '编辑部精选的 AI 生产力应用', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-col-2', '100001', 'col-2', 'zh-CN', 'AI 编程与 Agent 神器 - 从编辑器到智能体', '全面提升研发效率的 AI 工具', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-col-3', '100001', 'col-3', 'zh-CN', 'AI 创意与多媒体重构 - 灵感无限', 'AI 图像、音乐与视频创作', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-col-4', '100001', 'col-4', 'zh-CN', '棋牌游戏大厅 - 经典棋牌一网打尽', '斗地主、麻将、象棋等经典棋牌', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = EXCLUDED.updated_at;

INSERT INTO appstore_catalog_trending_term
    (id, tenant_id, term, locale, rank, score, snapshot_date, created_at, updated_at)
VALUES
    ('trend-1', '100001', 'DeepSeek R1', 'zh-CN', 1, 100.0, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-2', '100001', '千问 AI', 'zh-CN', 2, 94.5, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-3', '100001', 'Cursor AI', 'zh-CN', 3, 89.0, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-4', '100001', 'Kimi 智能助手', 'zh-CN', 4, 83.5, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-5', '100001', 'Midjourney', 'zh-CN', 5, 78.0, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-6', '100001', 'Suno AI', 'zh-CN', 6, 72.5, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-7', '100001', 'Manus Agent', 'zh-CN', 7, 67.0, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-8', '100001', '腾讯 ima', 'zh-CN', 8, 61.5, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-9', '100001', 'Notion AI', 'zh-CN', 9, 56.0, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('trend-10', '100001', 'ComfyUI', 'zh-CN', 10, 50.5, '2026-08-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    term = EXCLUDED.term,
    rank = EXCLUDED.rank,
    score = EXCLUDED.score,
    updated_at = EXCLUDED.updated_at;
