-- 017_ai_model_benchmark_apps.sql — industry-standard AI benchmark evaluation
-- apps under the AI 模型测评 category (cat-ai-model-eval). Each listing is a
-- multi-spec evaluation surface: curated model/agent specs and their benchmark
-- baselines are resolved in the PC storefront commons (aiEvaluation.ts), so
-- these rows only carry the catalog entities the detail page needs.
--
-- The apps intentionally have no runnable client code yet: they expose their
-- spec leaderboards and per-spec review threads through the storefront detail
-- page, which is what "先把规格创建了，能够点击进入应用详情页" requires.

INSERT INTO appstore_category
    (id, tenant_id, category_code, parent_category_id, category_level, category_status, sort_order, icon_media_resource_id, created_at, updated_at)
VALUES
    ('cat-ai-model-eval', '100001', 'ai-model-eval', NULL, 1, 'active', 145, 'mr-cat-ai-model-eval-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    category_status = EXCLUDED.category_status,
    sort_order = EXCLUDED.sort_order,
    updated_at = EXCLUDED.updated_at;

INSERT INTO appstore_category_localization
    (id, tenant_id, category_id, locale, display_name, description, created_at, updated_at)
VALUES
    ('catloc-ai-model-eval', '100001', 'cat-ai-model-eval', 'zh-CN', 'AI模型测评', '多规格 AI 模型与 Agent 能力测评：覆盖通用竞技、中文知识、逻辑陷阱、代码与创作生成、Agent 任务、多模态长文本、安全与事实性，每个规格独立评分与评论', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-ai-model-eval-en', '100001', 'cat-ai-model-eval', 'en-US', 'AI Model Evaluation', 'Multi-spec AI model and agent evaluations across general arenas, Chinese knowledge, logic traps, coding and creative generation, agent tasks, multimodal and long context, safety and factuality, with per-spec ratings and reviews', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = EXCLUDED.updated_at;

INSERT INTO appstore_app
    (id, tenant_id, organization_id, publisher_id, app_no, app_key, app_slug, display_name, default_locale, app_type, runtime_family, runtime_framework, app_status, distribution_status, review_status, monetization_mode, primary_category_id, age_rating_code, created_at, updated_at)
VALUES
    ('app-eval-chinese-eval', '100001', '0', 'appstore-publisher-default-0', 'app-app-eval-chinese-eval', 'app-eval-chinese-eval', 'app-eval-chinese-eval', '中文知识测评（C-Eval）', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-ai-model-eval', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-ridiculous', '100001', '0', 'appstore-publisher-default-0', 'app-app-eval-ridiculous', 'app-eval-ridiculous', 'app-eval-ridiculous', '弱智吧逻辑测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-ai-model-eval', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-instruction-following', '100001', '0', 'appstore-publisher-default-0', 'app-app-eval-instruction-following', 'app-eval-instruction-following', 'app-eval-instruction-following', '指令遵循测评（IFEval）', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-ai-model-eval', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-swe-bench', '100001', '0', 'appstore-publisher-default-0', 'app-app-eval-swe-bench', 'app-eval-swe-bench', 'app-eval-swe-bench', '真实仓库修复（SWE-bench）', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-ai-model-eval', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-pelican-bike', '100001', '0', 'appstore-publisher-default-0', 'app-app-eval-pelican-bike', 'app-eval-pelican-bike', 'app-eval-pelican-bike', '醍醐骑单车 · SVG 空间推理', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-ai-model-eval', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-forbidden-city', '100001', '0', 'appstore-publisher-default-0', 'app-app-eval-forbidden-city', 'app-eval-forbidden-city', 'app-eval-forbidden-city', '紫禁城 · 3D 场景生成', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-ai-model-eval', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-webdev-arena', '100001', '0', 'appstore-publisher-default-0', 'app-app-eval-webdev-arena', 'app-eval-webdev-arena', 'app-eval-webdev-arena', '前端作品竞技场', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-ai-model-eval', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-gaia', '100001', '0', 'appstore-publisher-default-0', 'app-app-eval-gaia', 'app-eval-gaia', 'app-eval-gaia', '通用助手任务（GAIA）', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-ai-model-eval', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-safety', '100001', '0', 'appstore-publisher-default-0', 'app-app-eval-safety', 'app-eval-safety', 'app-eval-safety', '安全对齐测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-ai-model-eval', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-hallucination', '100001', '0', 'appstore-publisher-default-0', 'app-app-eval-hallucination', 'app-eval-hallucination', 'app-eval-hallucination', '事实性幻觉测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-ai-model-eval', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO appstore_listing
    (id, tenant_id, organization_id, publisher_id, listing_no, app_id, app_key, listing_slug, listing_type, pricing_model, listing_status, storefront_visibility, review_status, primary_category_id, default_locale, age_rating_code, comments_thread_id, featured_score, download_count, average_rating, rating_count, submitted_at, published_at, created_at, updated_at)
VALUES
    ('app-eval-chinese-eval', '100001', '0', 'appstore-publisher-default-0', 'L-app-eval-chinese-eval', 'app-eval-chinese-eval', 'app-eval-chinese-eval', 'app-eval-chinese-eval', 'APP', 'FREE', 'active', 'visible', 'approved', 'cat-ai-model-eval', 'zh-CN', '4+', 'thread-app-eval-chinese-eval', 0, 12800, '4.8', 128000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-ridiculous', '100001', '0', 'appstore-publisher-default-0', 'L-app-eval-ridiculous', 'app-eval-ridiculous', 'app-eval-ridiculous', 'app-eval-ridiculous', 'APP', 'FREE', 'active', 'visible', 'approved', 'cat-ai-model-eval', 'zh-CN', '4+', 'thread-app-eval-ridiculous', 0, 15600, '4.7', 156000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-instruction-following', '100001', '0', 'appstore-publisher-default-0', 'L-app-eval-instruction-following', 'app-eval-instruction-following', 'app-eval-instruction-following', 'app-eval-instruction-following', 'APP', 'FREE', 'active', 'visible', 'approved', 'cat-ai-model-eval', 'zh-CN', '4+', 'thread-app-eval-instruction-following', 0, 8600, '4.6', 86000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-swe-bench', '100001', '0', 'appstore-publisher-default-0', 'L-app-eval-swe-bench', 'app-eval-swe-bench', 'app-eval-swe-bench', 'app-eval-swe-bench', 'APP', 'FREE', 'active', 'visible', 'approved', 'cat-ai-model-eval', 'zh-CN', '4+', 'thread-app-eval-swe-bench', 0, 9400, '4.8', 94000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-pelican-bike', '100001', '0', 'appstore-publisher-default-0', 'L-app-eval-pelican-bike', 'app-eval-pelican-bike', 'app-eval-pelican-bike', 'app-eval-pelican-bike', 'APP', 'FREE', 'active', 'visible', 'approved', 'cat-ai-model-eval', 'zh-CN', '4+', 'thread-app-eval-pelican-bike', 0, 21000, '4.9', 210000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-forbidden-city', '100001', '0', 'appstore-publisher-default-0', 'L-app-eval-forbidden-city', 'app-eval-forbidden-city', 'app-eval-forbidden-city', 'app-eval-forbidden-city', 'APP', 'FREE', 'active', 'visible', 'approved', 'cat-ai-model-eval', 'zh-CN', '4+', 'thread-app-eval-forbidden-city', 0, 18600, '4.8', 186000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-webdev-arena', '100001', '0', 'appstore-publisher-default-0', 'L-app-eval-webdev-arena', 'app-eval-webdev-arena', 'app-eval-webdev-arena', 'app-eval-webdev-arena', 'APP', 'FREE', 'active', 'visible', 'approved', 'cat-ai-model-eval', 'zh-CN', '4+', 'thread-app-eval-webdev-arena', 0, 11200, '4.7', 112000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-gaia', '100001', '0', 'appstore-publisher-default-0', 'L-app-eval-gaia', 'app-eval-gaia', 'app-eval-gaia', 'app-eval-gaia', 'APP', 'FREE', 'active', 'visible', 'approved', 'cat-ai-model-eval', 'zh-CN', '4+', 'thread-app-eval-gaia', 0, 7300, '4.6', 73000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-safety', '100001', '0', 'appstore-publisher-default-0', 'L-app-eval-safety', 'app-eval-safety', 'app-eval-safety', 'app-eval-safety', 'APP', 'FREE', 'active', 'visible', 'approved', 'cat-ai-model-eval', 'zh-CN', '4+', 'thread-app-eval-safety', 0, 6800, '4.5', 68000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-eval-hallucination', '100001', '0', 'appstore-publisher-default-0', 'L-app-eval-hallucination', 'app-eval-hallucination', 'app-eval-hallucination', 'app-eval-hallucination', 'APP', 'FREE', 'active', 'visible', 'approved', 'cat-ai-model-eval', 'zh-CN', '4+', 'thread-app-eval-hallucination', 0, 8100, '4.6', 81000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO appstore_listing_media
    (id, tenant_id, organization_id, listing_id, media_role, media_resource_id, drive_node_id, platform_scope, sort_order, locale, created_at, updated_at)
VALUES
    ('media-app-eval-chinese-eval-icon', '100001', '0', 'app-eval-chinese-eval', 'ICON', 'mr-app-eval-chinese-eval-icon', 'drive://appstore/app-eval-chinese-eval/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-chinese-eval-shot1', '100001', '0', 'app-eval-chinese-eval', 'SCREENSHOT', 'mr-app-eval-chinese-eval-shot1', 'drive://appstore/app-eval-chinese-eval/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-chinese-eval-shot2', '100001', '0', 'app-eval-chinese-eval', 'SCREENSHOT', 'mr-app-eval-chinese-eval-shot2', 'drive://appstore/app-eval-chinese-eval/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-ridiculous-icon', '100001', '0', 'app-eval-ridiculous', 'ICON', 'mr-app-eval-ridiculous-icon', 'drive://appstore/app-eval-ridiculous/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-ridiculous-shot1', '100001', '0', 'app-eval-ridiculous', 'SCREENSHOT', 'mr-app-eval-ridiculous-shot1', 'drive://appstore/app-eval-ridiculous/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-ridiculous-shot2', '100001', '0', 'app-eval-ridiculous', 'SCREENSHOT', 'mr-app-eval-ridiculous-shot2', 'drive://appstore/app-eval-ridiculous/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-instruction-following-icon', '100001', '0', 'app-eval-instruction-following', 'ICON', 'mr-app-eval-instruction-following-icon', 'drive://appstore/app-eval-instruction-following/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-instruction-following-shot1', '100001', '0', 'app-eval-instruction-following', 'SCREENSHOT', 'mr-app-eval-instruction-following-shot1', 'drive://appstore/app-eval-instruction-following/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-instruction-following-shot2', '100001', '0', 'app-eval-instruction-following', 'SCREENSHOT', 'mr-app-eval-instruction-following-shot2', 'drive://appstore/app-eval-instruction-following/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-swe-bench-icon', '100001', '0', 'app-eval-swe-bench', 'ICON', 'mr-app-eval-swe-bench-icon', 'drive://appstore/app-eval-swe-bench/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-swe-bench-shot1', '100001', '0', 'app-eval-swe-bench', 'SCREENSHOT', 'mr-app-eval-swe-bench-shot1', 'drive://appstore/app-eval-swe-bench/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-swe-bench-shot2', '100001', '0', 'app-eval-swe-bench', 'SCREENSHOT', 'mr-app-eval-swe-bench-shot2', 'drive://appstore/app-eval-swe-bench/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-pelican-bike-icon', '100001', '0', 'app-eval-pelican-bike', 'ICON', 'mr-app-eval-pelican-bike-icon', 'drive://appstore/app-eval-pelican-bike/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-pelican-bike-shot1', '100001', '0', 'app-eval-pelican-bike', 'SCREENSHOT', 'mr-app-eval-pelican-bike-shot1', 'drive://appstore/app-eval-pelican-bike/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-pelican-bike-shot2', '100001', '0', 'app-eval-pelican-bike', 'SCREENSHOT', 'mr-app-eval-pelican-bike-shot2', 'drive://appstore/app-eval-pelican-bike/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-forbidden-city-icon', '100001', '0', 'app-eval-forbidden-city', 'ICON', 'mr-app-eval-forbidden-city-icon', 'drive://appstore/app-eval-forbidden-city/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-forbidden-city-shot1', '100001', '0', 'app-eval-forbidden-city', 'SCREENSHOT', 'mr-app-eval-forbidden-city-shot1', 'drive://appstore/app-eval-forbidden-city/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-forbidden-city-shot2', '100001', '0', 'app-eval-forbidden-city', 'SCREENSHOT', 'mr-app-eval-forbidden-city-shot2', 'drive://appstore/app-eval-forbidden-city/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-webdev-arena-icon', '100001', '0', 'app-eval-webdev-arena', 'ICON', 'mr-app-eval-webdev-arena-icon', 'drive://appstore/app-eval-webdev-arena/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-webdev-arena-shot1', '100001', '0', 'app-eval-webdev-arena', 'SCREENSHOT', 'mr-app-eval-webdev-arena-shot1', 'drive://appstore/app-eval-webdev-arena/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-webdev-arena-shot2', '100001', '0', 'app-eval-webdev-arena', 'SCREENSHOT', 'mr-app-eval-webdev-arena-shot2', 'drive://appstore/app-eval-webdev-arena/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-gaia-icon', '100001', '0', 'app-eval-gaia', 'ICON', 'mr-app-eval-gaia-icon', 'drive://appstore/app-eval-gaia/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-gaia-shot1', '100001', '0', 'app-eval-gaia', 'SCREENSHOT', 'mr-app-eval-gaia-shot1', 'drive://appstore/app-eval-gaia/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-gaia-shot2', '100001', '0', 'app-eval-gaia', 'SCREENSHOT', 'mr-app-eval-gaia-shot2', 'drive://appstore/app-eval-gaia/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-safety-icon', '100001', '0', 'app-eval-safety', 'ICON', 'mr-app-eval-safety-icon', 'drive://appstore/app-eval-safety/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-safety-shot1', '100001', '0', 'app-eval-safety', 'SCREENSHOT', 'mr-app-eval-safety-shot1', 'drive://appstore/app-eval-safety/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-safety-shot2', '100001', '0', 'app-eval-safety', 'SCREENSHOT', 'mr-app-eval-safety-shot2', 'drive://appstore/app-eval-safety/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-hallucination-icon', '100001', '0', 'app-eval-hallucination', 'ICON', 'mr-app-eval-hallucination-icon', 'drive://appstore/app-eval-hallucination/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-hallucination-shot1', '100001', '0', 'app-eval-hallucination', 'SCREENSHOT', 'mr-app-eval-hallucination-shot1', 'drive://appstore/app-eval-hallucination/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-eval-hallucination-shot2', '100001', '0', 'app-eval-hallucination', 'SCREENSHOT', 'mr-app-eval-hallucination-shot2', 'drive://appstore/app-eval-hallucination/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 005_storefront_listings.sql ships its original evaluation listings with
-- listing_status = 'published', while the catalog read path only returns
-- 'active' rows. Rows already present in long-lived databases were normalized
-- by earlier deliveries; a seed replay re-inserts the evaluation listings as
-- 'published', so normalize them here to keep the category reachable.
UPDATE appstore_listing
SET listing_status = 'active',
    storefront_visibility = 'visible',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    'app-eval-model-arena',
    'app-eval-math-arena',
    'app-eval-agent-arena',
    'app-eval-longctx-arena',
    'app-eval-multimodal-arena',
    'app-eval-tools-arena'
)
AND listing_status <> 'active';

