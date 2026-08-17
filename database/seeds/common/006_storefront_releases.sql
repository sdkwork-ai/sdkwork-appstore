-- 006_storefront_releases.sql — storefront release channels and published releases.

INSERT INTO appstore_release_channel
    (id, tenant_id, channel_code, channel_type, channel_status, audience_scope, created_at, updated_at)
VALUES
    ('ch-prod', '100001', 'production', 'stable', 'active', 'public', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO appstore_release
    (id, tenant_id, organization_id, listing_id, release_no, channel_id, version_name, version_code, build_number, release_status, minimum_os_version, release_notes_default_locale, manifest_snapshot_json, submitted_at, approved_at, published_at, created_at, updated_at)
VALUES
    ('rel-app-qwen-320', '100001', '0', 'app-qwen', 'R-app-qwen-320', 'ch-prod', '3.2.0', '320', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-deepseek-150', '100001', '0', 'app-deepseek', 'R-app-deepseek-150', 'ch-prod', '1.5.0', '150', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-kimi-281', '100001', '0', 'app-kimi', 'R-app-kimi-281', 'ch-prod', '2.8.1', '281', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-cursor-0420', '100001', '0', 'app-cursor', 'R-app-cursor-0420', 'ch-prod', '0.42.0', '0420', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-tencent-ima-260', '100001', '0', 'app-tencent-ima', 'R-app-tencent-ima-260', 'ch-prod', '2.6.0', '260', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-midjourney-610', '100001', '0', 'app-midjourney', 'R-app-midjourney-610', 'ch-prod', '6.1.0', '610', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-doubao-230', '100001', '0', 'app-doubao', 'R-app-doubao-230', 'ch-prod', '2.3.0', '230', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-perplexity-461', '100001', '0', 'app-perplexity', 'R-app-perplexity-461', 'ch-prod', '4.6.1', '461', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-suno-400', '100001', '0', 'app-suno', 'R-app-suno-400', 'ch-prod', '4.0.0', '400', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-v0-240', '100001', '0', 'app-v0', 'R-app-v0-240', 'ch-prod', '2.4.0', '240', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-bolt-310', '100001', '0', 'app-bolt', 'R-app-bolt-310', 'ch-prod', '3.1.0', '310', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-manus-200', '100001', '0', 'app-manus', 'R-app-manus-200', 'ch-prod', '2.0.0', '200', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-coze-350', '100001', '0', 'app-coze', 'R-app-coze-350', 'ch-prod', '3.5.0', '350', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-code-playground-182', '100001', '0', 'app-code-playground', 'R-app-code-playground-182', 'ch-prod', '1.8.2', '182', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-runway-370', '100001', '0', 'app-runway', 'R-app-runway-370', 'ch-prod', '3.7.0', '370', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-elevenlabs-290', '100001', '0', 'app-elevenlabs', 'R-app-elevenlabs-290', 'ch-prod', '2.9.0', '290', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-comfyui-035', '100001', '0', 'app-comfyui', 'R-app-comfyui-035', 'ch-prod', '0.3.5', '035', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-flux-120', '100001', '0', 'app-flux', 'R-app-flux-120', 'ch-prod', '1.2.0', '120', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-notion-ai-390', '100001', '0', 'app-notion-ai', 'R-app-notion-ai-390', 'ch-prod', '3.9.0', '390', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-rag-knowledge-210', '100001', '0', 'app-rag-knowledge', 'R-app-rag-knowledge-210', 'ch-prod', '2.1.0', '210', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-saas-starter-140', '100001', '0', 'app-saas-starter', 'R-app-saas-starter-140', 'ch-prod', '1.4.0', '140', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-agent-workspace-220', '100001', '0', 'app-agent-workspace', 'R-app-agent-workspace-220', 'ch-prod', '2.2.0', '220', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-claude-190', '100001', '0', 'app-claude', 'R-app-claude-190', 'ch-prod', '1.9.0', '190', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-ai-arena-190', '100001', '0', 'game-ai-arena', 'R-game-ai-arena-190', 'ch-prod', '1.9.0', '190', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-ai-story-200', '100001', '0', 'game-ai-story', 'R-game-ai-story-200', 'ch-prod', '2.0.0', '200', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-ai-pet-330', '100001', '0', 'game-ai-pet', 'R-game-ai-pet-330', 'ch-prod', '3.3.0', '330', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-ai-chess-170', '100001', '0', 'game-ai-chess', 'R-game-ai-chess-170', 'ch-prod', '1.7.0', '170', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-ai-dungeon-250', '100001', '0', 'game-ai-dungeon', 'R-game-ai-dungeon-250', 'ch-prod', '2.5.0', '250', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-ai-rpg-160', '100001', '0', 'game-ai-rpg', 'R-game-ai-rpg-160', 'ch-prod', '1.6.0', '160', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-doudizhu-820', '100001', '0', 'game-doudizhu', 'R-game-doudizhu-820', 'ch-prod', '8.2.0', '820', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-xiangqi-510', '100001', '0', 'game-xiangqi', 'R-game-xiangqi-510', 'ch-prod', '5.1.0', '510', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-mahjong-740', '100001', '0', 'game-mahjong', 'R-game-mahjong-740', 'ch-prod', '7.4.0', '740', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-gomoku-300', '100001', '0', 'game-gomoku', 'R-game-gomoku-300', 'ch-prod', '3.0.0', '300', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-junqi-420', '100001', '0', 'game-junqi', 'R-game-junqi-420', 'ch-prod', '4.2.0', '420', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-guandan-600', '100001', '0', 'game-guandan', 'R-game-guandan-600', 'ch-prod', '6.0.0', '600', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-mini-jump-240', '100001', '0', 'game-mini-jump', 'R-game-mini-jump-240', 'ch-prod', '2.4.0', '240', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-mini-2048-190', '100001', '0', 'game-mini-2048', 'R-game-mini-2048-190', 'ch-prod', '1.9.0', '190', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-mini-fruit-210', '100001', '0', 'game-mini-fruit', 'R-game-mini-fruit-210', 'ch-prod', '2.1.0', '210', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-mini-bird-150', '100001', '0', 'game-mini-bird', 'R-game-mini-bird-150', 'ch-prod', '1.5.0', '150', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-mobile-mc-1205', '100001', '0', 'game-mobile-mc', 'R-game-mobile-mc-1205', 'ch-prod', '1.20.5', '1205', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-mobile-ys-470', '100001', '0', 'game-mobile-ys', 'R-game-mobile-ys-470', 'ch-prod', '4.7.0', '470', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-mobile-honor-860', '100001', '0', 'game-mobile-honor', 'R-game-mobile-honor-860', 'ch-prod', '8.6.0', '860', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-game-mobile-cf-790', '100001', '0', 'game-mobile-cf', 'R-game-mobile-cf-790', 'ch-prod', '7.9.0', '790', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-wps-1280', '100001', '0', 'app-wps', 'R-app-wps-1280', 'ch-prod', '12.8.0', '1280', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-baidunetdisk-1120', '100001', '0', 'app-baidunetdisk', 'R-app-baidunetdisk-1120', 'ch-prod', '11.2.0', '1120', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-wechat-8030', '100001', '0', 'app-wechat', 'R-app-wechat-8030', 'ch-prod', '8.0.30', '8030', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('rel-app-douyin-2760', '100001', '0', 'app-douyin', 'R-app-douyin-2760', 'ch-prod', '27.6.0', '2760', '1', 'published', '10.0', 'zh-CN', '{"targets": ["pc"]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- zh-CN release notes: locales/zh-CN/002_storefront_releases_zh.sql


-- Bind each listing to its latest published release for storefront version display.
UPDATE appstore_listing l
SET current_release_id = (
    SELECT r.id
    FROM appstore_release r
    WHERE r.listing_id = l.id AND r.release_status = 'published'
    ORDER BY r.published_at DESC
    LIMIT 1
)
WHERE l.tenant_id = '100001'
  AND EXISTS (
    SELECT 1 FROM appstore_release r
    WHERE r.listing_id = l.id AND r.release_status = 'published'
  );
