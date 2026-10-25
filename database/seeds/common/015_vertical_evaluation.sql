-- 015_vertical_evaluation.sql — vertical evaluation modules below the AI model
-- evaluation category (REQ-2026-0002/0003/0004): education experiment,
-- culture & tourism, and healthcare storefront categories, apps, listings and
-- media references (locale-neutral plus zh/en category display names).

INSERT INTO appstore_category
    (id, tenant_id, category_code, parent_category_id, category_level, category_status, sort_order, icon_media_resource_id, created_at, updated_at)
VALUES
    ('cat-edu-experiment', '100001', 'edu-experiment', NULL, 1, 'active', 146, 'mr-cat-edu-experiment-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-culture-tourism', '100001', 'culture-tourism', NULL, 1, 'active', 147, 'mr-cat-culture-tourism-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-healthcare', '100001', 'healthcare', NULL, 1, 'active', 148, 'mr-cat-healthcare-icon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    category_status = EXCLUDED.category_status,
    sort_order = EXCLUDED.sort_order,
    updated_at = EXCLUDED.updated_at;

INSERT INTO appstore_category_localization
    (id, tenant_id, category_id, locale, display_name, description, created_at, updated_at)
VALUES
    ('catloc-edu-experiment', '100001', 'cat-edu-experiment', 'zh-CN', '教育实验应用', '覆盖 K12、大学与专业应用的教育实验测评，按学段与学科分类，每个 AI 规格独立评分与评论', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-edu-experiment-en', '100001', 'cat-edu-experiment', 'en-US', 'Education Experiment Apps', 'Education-experiment evaluations across K12, university and professional stages, organized by subject, with per-spec ratings and reviews', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-culture-tourism', '100001', 'cat-culture-tourism', 'zh-CN', '文旅应用', '覆盖旅游景点智能导览、行程规划与多语言讲解的文旅测评，以及文博场馆、城市漫游、非遗民俗与研学旅行', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-culture-tourism-en', '100001', 'cat-culture-tourism', 'en-US', 'Culture & Tourism Apps', 'Tourism evaluations covering attraction guides, itinerary planning and multilingual narration, plus museums, city walks, heritage and study tours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-healthcare', '100001', 'cat-healthcare', 'zh-CN', '医疗卫生应用', '覆盖临床辅助、公共卫生、健康管理、医药器械与医学教育的医疗测评，安全性维度单列呈现', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-healthcare-en', '100001', 'cat-healthcare', 'en-US', 'Healthcare Apps', 'Healthcare evaluations covering clinical assistance, public health, health management, pharma and devices, and medical education, with safety as its own dimension', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = EXCLUDED.updated_at;

INSERT INTO appstore_app
    (id, tenant_id, organization_id, publisher_id, app_no, app_key, app_slug, display_name, default_locale, app_type, runtime_family, runtime_framework, app_status, distribution_status, review_status, monetization_mode, primary_category_id, age_rating_code, created_at, updated_at)
VALUES
    ('app-edu-k12-virtual-lab', '100001', '0', 'appstore-publisher-default-0', 'app-app-edu-k12-virtual-lab', 'app-edu-k12-virtual-lab', 'app-edu-k12-virtual-lab', 'K12 虚拟实验测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-edu-experiment', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-edu-university-physics-lab', '100001', '0', 'appstore-publisher-default-0', 'app-app-edu-university-physics-lab', 'app-edu-university-physics-lab', 'app-edu-university-physics-lab', '大学物理实验测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-edu-experiment', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-edu-professional-skills', '100001', '0', 'appstore-publisher-default-0', 'app-app-edu-professional-skills', 'app-edu-professional-skills', 'app-edu-professional-skills', '专业技能实训测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-edu-experiment', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-tour-attraction-guide', '100001', '0', 'appstore-publisher-default-0', 'app-app-tour-attraction-guide', 'app-tour-attraction-guide', 'app-tour-attraction-guide', '景区智能导览测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-culture-tourism', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-tour-itinerary-planner', '100001', '0', 'appstore-publisher-default-0', 'app-app-tour-itinerary-planner', 'app-tour-itinerary-planner', 'app-tour-itinerary-planner', '行程规划测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-culture-tourism', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-tour-multilingual-guide', '100001', '0', 'appstore-publisher-default-0', 'app-app-tour-multilingual-guide', 'app-tour-multilingual-guide', 'app-tour-multilingual-guide', '多语言讲解测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-culture-tourism', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-health-medical-qa', '100001', '0', 'appstore-publisher-default-0', 'app-app-health-medical-qa', 'app-health-medical-qa', 'app-health-medical-qa', '医学知识问答测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-healthcare', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-health-emr-quality', '100001', '0', 'appstore-publisher-default-0', 'app-app-health-emr-quality', 'app-health-emr-quality', 'app-health-emr-quality', '病历质控测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-healthcare', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-health-health-education', '100001', '0', 'appstore-publisher-default-0', 'app-app-health-health-education', 'app-health-health-education', 'app-health-health-education', '健康宣教测评', 'zh-CN', 'app', 'PC', 'React', 'active', 'active', 'approved', 'FREE', 'cat-healthcare', '4+', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO appstore_listing
    (id, tenant_id, organization_id, publisher_id, listing_no, app_id, app_key, listing_slug, listing_type, pricing_model, listing_status, storefront_visibility, review_status, primary_category_id, default_locale, age_rating_code, comments_thread_id, featured_score, download_count, average_rating, rating_count, submitted_at, published_at, created_at, updated_at)
VALUES
    ('app-edu-k12-virtual-lab', '100001', '0', 'appstore-publisher-default-0', 'L-app-edu-k12-virtual-lab', 'app-edu-k12-virtual-lab', 'app-edu-k12-virtual-lab', 'app-edu-k12-virtual-lab', 'APP', 'FREE', 'published', 'visible', 'approved', 'cat-edu-experiment', 'zh-CN', '4+', 'thread-app-edu-k12-virtual-lab', 0, 4200, '4.6', 42000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-edu-university-physics-lab', '100001', '0', 'appstore-publisher-default-0', 'L-app-edu-university-physics-lab', 'app-edu-university-physics-lab', 'app-edu-university-physics-lab', 'app-edu-university-physics-lab', 'APP', 'FREE', 'published', 'visible', 'approved', 'cat-edu-experiment', 'zh-CN', '4+', 'thread-app-edu-university-physics-lab', 0, 3600, '4.7', 36000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-edu-professional-skills', '100001', '0', 'appstore-publisher-default-0', 'L-app-edu-professional-skills', 'app-edu-professional-skills', 'app-edu-professional-skills', 'app-edu-professional-skills', 'APP', 'FREE', 'published', 'visible', 'approved', 'cat-edu-experiment', 'zh-CN', '4+', 'thread-app-edu-professional-skills', 0, 2800, '4.5', 28000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-tour-attraction-guide', '100001', '0', 'appstore-publisher-default-0', 'L-app-tour-attraction-guide', 'app-tour-attraction-guide', 'app-tour-attraction-guide', 'app-tour-attraction-guide', 'APP', 'FREE', 'published', 'visible', 'approved', 'cat-culture-tourism', 'zh-CN', '4+', 'thread-app-tour-attraction-guide', 0, 5200, '4.6', 52000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-tour-itinerary-planner', '100001', '0', 'appstore-publisher-default-0', 'L-app-tour-itinerary-planner', 'app-tour-itinerary-planner', 'app-tour-itinerary-planner', 'app-tour-itinerary-planner', 'APP', 'FREE', 'published', 'visible', 'approved', 'cat-culture-tourism', 'zh-CN', '4+', 'thread-app-tour-itinerary-planner', 0, 4100, '4.7', 41000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-tour-multilingual-guide', '100001', '0', 'appstore-publisher-default-0', 'L-app-tour-multilingual-guide', 'app-tour-multilingual-guide', 'app-tour-multilingual-guide', 'app-tour-multilingual-guide', 'APP', 'FREE', 'published', 'visible', 'approved', 'cat-culture-tourism', 'zh-CN', '4+', 'thread-app-tour-multilingual-guide', 0, 3300, '4.5', 33000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-health-medical-qa', '100001', '0', 'appstore-publisher-default-0', 'L-app-health-medical-qa', 'app-health-medical-qa', 'app-health-medical-qa', 'app-health-medical-qa', 'APP', 'FREE', 'published', 'visible', 'approved', 'cat-healthcare', 'zh-CN', '4+', 'thread-app-health-medical-qa', 0, 4600, '4.6', 46000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-health-emr-quality', '100001', '0', 'appstore-publisher-default-0', 'L-app-health-emr-quality', 'app-health-emr-quality', 'app-health-emr-quality', 'app-health-emr-quality', 'APP', 'FREE', 'published', 'visible', 'approved', 'cat-healthcare', 'zh-CN', '4+', 'thread-app-health-emr-quality', 0, 2900, '4.5', 29000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('app-health-health-education', '100001', '0', 'appstore-publisher-default-0', 'L-app-health-health-education', 'app-health-health-education', 'app-health-health-education', 'app-health-health-education', 'APP', 'FREE', 'published', 'visible', 'approved', 'cat-healthcare', 'zh-CN', '4+', 'thread-app-health-health-education', 0, 3200, '4.6', 32000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO appstore_listing_media
    (id, tenant_id, organization_id, listing_id, media_role, media_resource_id, drive_node_id, platform_scope, sort_order, locale, created_at, updated_at)
VALUES
    ('media-app-edu-k12-virtual-lab-icon', '100001', '0', 'app-edu-k12-virtual-lab', 'ICON', 'mr-app-edu-k12-virtual-lab-icon', 'drive://appstore/app-edu-k12-virtual-lab/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-edu-k12-virtual-lab-shot1', '100001', '0', 'app-edu-k12-virtual-lab', 'SCREENSHOT', 'mr-app-edu-k12-virtual-lab-shot1', 'drive://appstore/app-edu-k12-virtual-lab/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-edu-k12-virtual-lab-shot2', '100001', '0', 'app-edu-k12-virtual-lab', 'SCREENSHOT', 'mr-app-edu-k12-virtual-lab-shot2', 'drive://appstore/app-edu-k12-virtual-lab/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-edu-university-physics-lab-icon', '100001', '0', 'app-edu-university-physics-lab', 'ICON', 'mr-app-edu-university-physics-lab-icon', 'drive://appstore/app-edu-university-physics-lab/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-edu-university-physics-lab-shot1', '100001', '0', 'app-edu-university-physics-lab', 'SCREENSHOT', 'mr-app-edu-university-physics-lab-shot1', 'drive://appstore/app-edu-university-physics-lab/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-edu-university-physics-lab-shot2', '100001', '0', 'app-edu-university-physics-lab', 'SCREENSHOT', 'mr-app-edu-university-physics-lab-shot2', 'drive://appstore/app-edu-university-physics-lab/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-edu-professional-skills-icon', '100001', '0', 'app-edu-professional-skills', 'ICON', 'mr-app-edu-professional-skills-icon', 'drive://appstore/app-edu-professional-skills/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-edu-professional-skills-shot1', '100001', '0', 'app-edu-professional-skills', 'SCREENSHOT', 'mr-app-edu-professional-skills-shot1', 'drive://appstore/app-edu-professional-skills/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-edu-professional-skills-shot2', '100001', '0', 'app-edu-professional-skills', 'SCREENSHOT', 'mr-app-edu-professional-skills-shot2', 'drive://appstore/app-edu-professional-skills/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-tour-attraction-guide-icon', '100001', '0', 'app-tour-attraction-guide', 'ICON', 'mr-app-tour-attraction-guide-icon', 'drive://appstore/app-tour-attraction-guide/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-tour-attraction-guide-shot1', '100001', '0', 'app-tour-attraction-guide', 'SCREENSHOT', 'mr-app-tour-attraction-guide-shot1', 'drive://appstore/app-tour-attraction-guide/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-tour-attraction-guide-shot2', '100001', '0', 'app-tour-attraction-guide', 'SCREENSHOT', 'mr-app-tour-attraction-guide-shot2', 'drive://appstore/app-tour-attraction-guide/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-tour-itinerary-planner-icon', '100001', '0', 'app-tour-itinerary-planner', 'ICON', 'mr-app-tour-itinerary-planner-icon', 'drive://appstore/app-tour-itinerary-planner/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-tour-itinerary-planner-shot1', '100001', '0', 'app-tour-itinerary-planner', 'SCREENSHOT', 'mr-app-tour-itinerary-planner-shot1', 'drive://appstore/app-tour-itinerary-planner/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-tour-itinerary-planner-shot2', '100001', '0', 'app-tour-itinerary-planner', 'SCREENSHOT', 'mr-app-tour-itinerary-planner-shot2', 'drive://appstore/app-tour-itinerary-planner/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-tour-multilingual-guide-icon', '100001', '0', 'app-tour-multilingual-guide', 'ICON', 'mr-app-tour-multilingual-guide-icon', 'drive://appstore/app-tour-multilingual-guide/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-tour-multilingual-guide-shot1', '100001', '0', 'app-tour-multilingual-guide', 'SCREENSHOT', 'mr-app-tour-multilingual-guide-shot1', 'drive://appstore/app-tour-multilingual-guide/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-tour-multilingual-guide-shot2', '100001', '0', 'app-tour-multilingual-guide', 'SCREENSHOT', 'mr-app-tour-multilingual-guide-shot2', 'drive://appstore/app-tour-multilingual-guide/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-health-medical-qa-icon', '100001', '0', 'app-health-medical-qa', 'ICON', 'mr-app-health-medical-qa-icon', 'drive://appstore/app-health-medical-qa/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-health-medical-qa-shot1', '100001', '0', 'app-health-medical-qa', 'SCREENSHOT', 'mr-app-health-medical-qa-shot1', 'drive://appstore/app-health-medical-qa/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-health-medical-qa-shot2', '100001', '0', 'app-health-medical-qa', 'SCREENSHOT', 'mr-app-health-medical-qa-shot2', 'drive://appstore/app-health-medical-qa/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-health-emr-quality-icon', '100001', '0', 'app-health-emr-quality', 'ICON', 'mr-app-health-emr-quality-icon', 'drive://appstore/app-health-emr-quality/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-health-emr-quality-shot1', '100001', '0', 'app-health-emr-quality', 'SCREENSHOT', 'mr-app-health-emr-quality-shot1', 'drive://appstore/app-health-emr-quality/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-health-emr-quality-shot2', '100001', '0', 'app-health-emr-quality', 'SCREENSHOT', 'mr-app-health-emr-quality-shot2', 'drive://appstore/app-health-emr-quality/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-health-health-education-icon', '100001', '0', 'app-health-health-education', 'ICON', 'mr-app-health-health-education-icon', 'drive://appstore/app-health-health-education/icon', 'ALL', 0, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-health-health-education-shot1', '100001', '0', 'app-health-health-education', 'SCREENSHOT', 'mr-app-health-health-education-shot1', 'drive://appstore/app-health-health-education/shot1', 'ALL', 1, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('media-app-health-health-education-shot2', '100001', '0', 'app-health-health-education', 'SCREENSHOT', 'mr-app-health-health-education-shot2', 'drive://appstore/app-health-health-education/shot2', 'ALL', 2, 'zh-CN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
