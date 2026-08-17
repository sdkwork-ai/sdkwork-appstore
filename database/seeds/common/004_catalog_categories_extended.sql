-- 004_catalog_categories_extended.up.sql 语义: storefront category catalog (zh-CN)
-- Storefront AI + game categories aligned with the PC storefront UI.

INSERT INTO appstore_category
    (id, tenant_id, category_code, parent_category_id, category_level, category_status, sort_order, icon_media_resource_id, created_at, updated_at)
VALUES
    ('cat-ai-assistants', '100001', 'ai-assistants', NULL, 1, 'active', 100, 'mr-cat-ai-assistants-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-ai-coding', '100001', 'ai-coding', NULL, 1, 'active', 110, 'mr-cat-ai-coding-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-ai-creative', '100001', 'ai-creative', NULL, 1, 'active', 120, 'mr-cat-ai-creative-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-ai-productivity', '100001', 'ai-productivity', NULL, 1, 'active', 130, 'mr-cat-ai-productivity-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-ai-games', '100001', 'ai-games', NULL, 1, 'active', 140, 'mr-cat-ai-games-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-board-games', '100001', 'board-games', NULL, 1, 'active', 150, 'mr-cat-board-games-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-mini-games', '100001', 'mini-games', NULL, 1, 'active', 160, 'mr-cat-mini-games-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-mobile-games', '100001', 'mobile-games', NULL, 1, 'active', 170, 'mr-cat-mobile-games-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-utilities', '100001', 'utilities', NULL, 1, 'active', 180, 'mr-cat-utilities-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    category_status = EXCLUDED.category_status,
    sort_order = EXCLUDED.sort_order,
    updated_at = EXCLUDED.updated_at;

INSERT INTO appstore_category_localization
    (id, tenant_id, category_id, locale, display_name, description, created_at, updated_at)
VALUES
    ('catloc-ai-assistants', '100001', 'cat-ai-assistants', 'zh-CN', 'AI 助手与对话', 'AI 助手、对话与大模型客户端', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-ai-coding', '100001', 'cat-ai-coding', 'zh-CN', 'AI 编程与 Agent', 'AI 编程工具与智能体平台', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-ai-creative', '100001', 'cat-ai-creative', 'zh-CN', 'AI 创意与音视频', 'AI 创意设计、图像与音视频生成', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-ai-productivity', '100001', 'cat-ai-productivity', 'zh-CN', 'AI 生产力与知识库', 'AI 生产力工具与知识库', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-ai-games', '100001', 'cat-ai-games', 'zh-CN', 'AI 智能体游戏', 'AI 驱动的智能体游戏', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-board-games', '100001', 'cat-board-games', 'zh-CN', '棋牌游戏', '棋牌与休闲对弈游戏', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-mini-games', '100001', 'cat-mini-games', 'zh-CN', '微信小游戏', '微信小游戏合集', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-mobile-games', '100001', 'cat-mobile-games', 'zh-CN', '精品手游', '精品移动端游戏', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-utilities', '100001', 'cat-utilities', 'zh-CN', '实用程序与工具', '效率工具与实用程序', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = EXCLUDED.updated_at;
