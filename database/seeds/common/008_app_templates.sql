-- 008_app_templates.sql — app templates and PLUGIN-type plugins (BIGINT id tables).

INSERT INTO appstore_app_template
    (id, uuid, tenant_id, organization_id, data_scope, status, created_at, updated_at, version, metadata, template_no, template_code, template_name, description, category_code, template_type, framework, language, icon_media_resource_id, visibility, publish_status, featured, sort_weight, owner_user_id, git_repo_url, capability_manifest, published_at)
VALUES
    (524395315516020247, 'tplsaasstarter000000000000000000', 100001, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, '{"authorName": "SDKWork Templates", "category": "SaaS 全栈", "tags": ["saas", "starter", "auth"], "isOfficial": true, "license": "MIT", "features": ["认证与授权", "Stripe 计费", "多租户", "AI 集成"], "techStack": ["React", "Vite", "Tailwind", "Node.js"], "architecture": "前后端一体", "usageCount": 1200, "rating": 4.8, "previewImage": "", "screenshots": [], "relatedAppId": "app-saas-starter"}', 'tpl-saas-starter', 'tpl-saas-starter', 'SaaS Starter 全栈模板', '内置认证、计费、多租户与 AI 集成的 SaaS 快速启动模板。', 'SaaS 全栈', 'APP', 'React + Vite + Tailwind', 'TypeScript', '', 1, 1, TRUE, 1, 1, 'https://github.com/sdkwork/template-saas-starter', '{"templateType": "APP", "capabilities": []}', CURRENT_TIMESTAMP),
    (524395315514971762, 'tplragkb000000000000000000000000', 100001, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, '{"authorName": "SDKWork Templates", "category": "知识库系统", "tags": ["rag", "kb", "vector"], "isOfficial": true, "license": "MIT", "features": ["文档解析", "向量检索", "混合重排", "权限隔离"], "techStack": ["Next.js", "FastAPI", "pgvector"], "architecture": "前后端分离", "usageCount": 860, "rating": 4.7, "previewImage": "", "screenshots": [], "relatedAppId": "app-rag-knowledge"}', 'tpl-rag-kb', 'tpl-rag-kb', 'RAG 知识库模板', '企业级 RAG 知识库应用模板，内置向量检索、文档解析与权限隔离。', '知识库系统', 'APP', 'Next.js + Python FastAPI', 'TypeScript/Python', '', 1, 1, TRUE, 2, 1, 'https://github.com/sdkwork/template-rag-kb', '{"templateType": "APP", "capabilities": []}', CURRENT_TIMESTAMP),
    (524395315497170518, 'tplagentworkspace000000000000000', 100001, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, '{"authorName": "SDKWork Templates", "category": "Agent 协同", "tags": ["agent", "workspace", "orchestration"], "isOfficial": true, "license": "MIT", "features": ["任务编排", "Agent 市场", "团队协作", "版本管理"], "techStack": ["React", "Python", "LangGraph"], "architecture": "前后端分离", "usageCount": 640, "rating": 4.7, "previewImage": "", "screenshots": [], "relatedAppId": "app-agent-workspace"}', 'tpl-agent-workspace', 'tpl-agent-workspace', 'Agent 协同工作台模板', 'AI Agent 统一协同工作台模板，支持任务编排、Agent 市场与团队协作。', 'Agent 协同', 'APP', 'React + Python', 'TypeScript', '', 1, 1, FALSE, 3, 1, 'https://github.com/sdkwork/template-agent-workspace', '{"templateType": "APP", "capabilities": []}', CURRENT_TIMESTAMP),
    (524395315499300422, 'tplcodeplayground000000000000000', 100001, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, '{"authorName": "SDKWork Templates", "category": "开发者工具", "tags": ["code", "sandbox", "playground"], "isOfficial": false, "license": "MIT", "features": ["多语言运行", "共享链接", "AI 代码提示"], "techStack": ["React", "Monaco", "WASM"], "architecture": "纯前端", "usageCount": 480, "rating": 4.5, "previewImage": "", "screenshots": [], "relatedAppId": "app-code-playground"}', 'tpl-code-playground', 'tpl-code-playground', '代码游乐场模板', '浏览器内代码实验沙箱模板，支持 40+ 语言运行环境与共享链接。', '开发者工具', 'APP', 'React + Monaco', 'TypeScript', '', 1, 1, FALSE, 4, 1, 'https://github.com/sdkwork/template-code-playground', '{"templateType": "APP", "capabilities": []}', CURRENT_TIMESTAMP),
    (524395315501348598, 'tplecommerceai000000000000000000', 100001, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, '{"authorName": "SDKWork Templates", "category": "电商应用", "tags": ["ecommerce", "ai", "assistant"], "isOfficial": false, "license": "MIT", "features": ["商品推荐", "智能客服", "订单分析"], "techStack": ["React", "Node.js", "Redis"], "architecture": "前后端分离", "usageCount": 350, "rating": 4.4, "previewImage": "", "screenshots": [], "relatedAppId": "app-qwen"}', 'tpl-ecommerce-ai', 'tpl-ecommerce-ai', '电商 AI 助手模板', '面向电商场景的 AI 助手应用模板，集成商品推荐、客服对话与订单分析。', '电商应用', 'APP', 'React + Node.js', 'TypeScript', '', 1, 1, FALSE, 5, 1, 'https://github.com/sdkwork/template-ecommerce-ai', '{"templateType": "APP", "capabilities": []}', CURRENT_TIMESTAMP),
    (506311182233569175, 'plugpythonsandbox000000000000000', 100001, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, '{"authorName": "SDKWork Plugins", "category": "代码与开发", "apiSchemaType": "REST", "capabilities": ["代码执行", "依赖安装", "沙箱隔离"], "docUrl": "https://docs.sdkwork.com/plugins/python-sandbox", "downloadsCount": 8600, "rating": 4.8, "version": "1.2.0"}', 'plug-python-sandbox', 'plug-python-sandbox', 'Python 沙箱执行器', '在隔离容器中安全执行 Python 代码，支持依赖安装与超时控制。', '代码与开发', 'PLUGIN', '', 'Python', '', 1, 1, FALSE, 6, 1, 'https://github.com/sdkwork/plugin-python-sandbox', '{"templateType": "PLUGIN", "capabilities": ["代码执行", "依赖安装", "沙箱隔离"]}', CURRENT_TIMESTAMP),
    (506311182233585175, 'plugtavilysearch0000000000000000', 100001, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, '{"authorName": "SDKWork Plugins", "category": "搜索与信息", "apiSchemaType": "OpenAPI", "capabilities": ["实时搜索", "新闻检索", "来源引用"], "docUrl": "https://docs.sdkwork.com/plugins/tavily-search", "downloadsCount": 5200, "rating": 4.7, "version": "1.0.4"}', 'plug-tavily-search', 'plug-tavily-search', 'Tavily 联网搜索', '集成 Tavily API 的实时联网搜索插件，返回带来源引用的搜索结果。', '搜索与信息', 'PLUGIN', '', 'TypeScript', '', 1, 1, FALSE, 7, 1, 'https://github.com/sdkwork/plugin-tavily-search', '{"templateType": "PLUGIN", "capabilities": ["实时搜索", "新闻检索", "来源引用"]}', CURRENT_TIMESTAMP),
    (506311182233527958, 'plugfileparser000000000000000000', 100001, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, '{"authorName": "SDKWork Plugins", "category": "数据处理", "apiSchemaType": "REST", "capabilities": ["PDF 解析", "Office 解析", "结构化提取"], "docUrl": "https://docs.sdkwork.com/plugins/file-parser", "downloadsCount": 4300, "rating": 4.6, "version": "2.0.1"}', 'plug-file-parser', 'plug-file-parser', '通用文件解析器', '解析 PDF、Word、Excel、Markdown 等 20+ 格式文件为结构化文本。', '数据处理', 'PLUGIN', '', 'TypeScript', '', 1, 1, FALSE, 8, 1, 'https://github.com/sdkwork/plugin-file-parser', '{"templateType": "PLUGIN", "capabilities": ["PDF 解析", "Office 解析", "结构化提取"]}', CURRENT_TIMESTAMP),
    (506311182233519650, 'plugdbconnector00000000000000000', 100001, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, '{"authorName": "SDKWork Plugins", "category": "数据与存储", "apiSchemaType": "GraphQL", "capabilities": ["SQL 查询", "多数据库", "结果集导出"], "docUrl": "https://docs.sdkwork.com/plugins/db-connector", "downloadsCount": 3100, "rating": 4.5, "version": "1.4.0"}', 'plug-db-connector', 'plug-db-connector', '数据库连接器', '安全连接 PostgreSQL/MySQL/SQLite 执行查询并返回结果集。', '数据与存储', 'PLUGIN', '', 'TypeScript', '', 1, 1, FALSE, 9, 1, 'https://github.com/sdkwork/plugin-db-connector', '{"templateType": "PLUGIN", "capabilities": ["SQL 查询", "多数据库", "结果集导出"]}', CURRENT_TIMESTAMP),
    (506311182233564727, 'plugocrreader0000000000000000000', 100001, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, '{"authorName": "SDKWork Plugins", "category": "图像与识别", "apiSchemaType": "REST", "capabilities": ["OCR 识别", "表格还原", "多语言"], "docUrl": "https://docs.sdkwork.com/plugins/ocr", "downloadsCount": 2800, "rating": 4.4, "version": "1.1.3"}', 'plug-ocr-reader', 'plug-ocr-reader', 'OCR 文字识别', '图片 OCR 文字识别插件，支持中英文混合识别与表格还原。', '图像与识别', 'PLUGIN', '', 'TypeScript', '', 1, 1, FALSE, 10, 1, 'https://github.com/sdkwork/plugin-ocr', '{"templateType": "PLUGIN", "capabilities": ["OCR 识别", "表格还原", "多语言"]}', CURRENT_TIMESTAMP),
    (506311182233581383, 'plugstripepay0000000000000000000', 100001, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, '{"authorName": "SDKWork Plugins", "category": "支付与电商", "apiSchemaType": "OpenAPI", "capabilities": ["支付收款", "订阅管理", "退款处理"], "docUrl": "https://docs.sdkwork.com/plugins/stripe", "downloadsCount": 1900, "rating": 4.6, "version": "1.0.8"}', 'plug-stripe-pay', 'plug-stripe-pay', 'Stripe 支付网关', '集成 Stripe 的支付网关插件，支持订阅、退款与对账。', '支付与电商', 'PLUGIN', '', 'TypeScript', '', 1, 1, FALSE, 11, 1, 'https://github.com/sdkwork/plugin-stripe', '{"templateType": "PLUGIN", "capabilities": ["支付收款", "订阅管理", "退款处理"]}', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

UPDATE appstore_app_template
SET icon_media_resource_id = 'mr-' || template_code || '-icon'
WHERE tenant_id = 100001
  AND (icon_media_resource_id IS NULL OR icon_media_resource_id = '');

UPDATE appstore_app_template
SET metadata = jsonb_set(
    metadata,
    '{previewImage}',
    to_jsonb('mr-' || COALESCE(metadata->>'relatedAppId', template_code) || '-shot1'),
    true
)
WHERE tenant_id = 100001
  AND COALESCE(metadata->>'previewImage', '') = '';

UPDATE appstore_app_template
SET metadata = jsonb_set(
    metadata,
    '{screenshots}',
    to_jsonb(ARRAY[
      'mr-' || COALESCE(metadata->>'relatedAppId', template_code) || '-shot1',
      'mr-' || COALESCE(metadata->>'relatedAppId', template_code) || '-shot2'
    ]),
    true
)
WHERE tenant_id = 100001
  AND (
    metadata->'screenshots' IS NULL
    OR jsonb_typeof(metadata->'screenshots') <> 'array'
    OR jsonb_array_length(metadata->'screenshots') = 0
  );

UPDATE appstore_app_template
SET capability_manifest = jsonb_set(
    capability_manifest,
    '{capabilities}',
    '["发布部署","版本管理","监控告警"]'::jsonb,
    true
)
WHERE tenant_id = 100001
  AND template_type = 'APP'
  AND (
    capability_manifest->'capabilities' IS NULL
    OR jsonb_typeof(capability_manifest->'capabilities') <> 'array'
    OR jsonb_array_length(capability_manifest->'capabilities') = 0
  );
