-- zh-CN listing localizations for the industry-standard AI benchmark evaluation
-- apps seeded in common/017_ai_model_benchmark_apps.sql (tenant 100001).

INSERT INTO appstore_listing_localization
    (id, tenant_id, organization_id, listing_id, locale, display_name, subtitle, short_description, full_description, whats_new_summary, keywords_json, created_at, updated_at)
VALUES
    ('loc-app-eval-chinese-eval', '100001', '0', 'app-eval-chinese-eval', 'zh-CN', '中文知识测评（C-Eval）', '52 学科中文知识基准', '基于 C-Eval 与 CMMLU 的 52 个学科、四档难度，测评模型的中文知识与学科推理能力。', '中文知识测评覆盖 C-Eval（13948 道多选、52 个学科、四档难度）与 CMMLU 的学科题目，按人文、社科、STEM 与专业考试分层统计准确率，对比 DeepSeek-V3.2、GLM-4.7、Qwen3-Max、Kimi K2、Doubao-1.6、GPT-5、Claude Sonnet 4.5 的中文知识掌握度，每个规格独立评分与评论。', '• 首发 C-Eval 与 CMMLU 双题库', '["中文知识测评","C-Eval","AI模型测评"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-app-eval-ridiculous', '100001', '0', 'app-eval-ridiculous', 'zh-CN', '弱智吧逻辑测评', '中文反直觉推理压力测试', '以弱智吧经典问题测评模型的语义歧义、反直觉陷阱与常识纠错能力。', '弱智吧问题是中文社区广泛使用的大模型压力测试集：题干看似简单，却包含语义歧义、反直觉前提与谐音陷阱。测评按反直觉陷阱、语义歧义、常识纠错、多轮追问四个维度统计准确率，并记录模型是否被题干带偏、是否给出自洽解释，每个规格独立评分与评论。', '• 新增多轮追问与带偏检测', '["弱智吧逻辑测评","反直觉推理","AI模型测评"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-app-eval-instruction-following', '100001', '0', 'app-eval-instruction-following', 'zh-CN', '指令遵循测评（IFEval）', '可程序验证的指令遵循基准', '以 IFEval 的可验证指令测评格式、长度、关键词与多约束组合的遵循率。', '指令遵循测评基于 IFEval 的 541 条可程序验证指令，覆盖 JSON 与列表格式约束、字数与段落长度约束、关键词包含与排除、以及多约束组合。统计严格遵循率与逐维得分，避免只看回答质量而忽略格式与硬约束，每个规格独立评分与评论。', '• 新增多约束组合遵循率', '["指令遵循测评","IFEval","AI模型测评"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-app-eval-swe-bench', '100001', '0', 'app-eval-swe-bench', 'zh-CN', '真实仓库修复（SWE-bench）', '真实 GitHub 仓库缺陷修复基准', '以 SWE-bench Verified 的真实仓库 issue 测评模型定位、修复与回归验证能力。', '真实仓库修复测评采用 SWE-bench Verified 的 500 个人工确认 GitHub issue，模型需在真实仓库中定位缺陷、修改代码并通过既有测试。按自主定位、补丁正确性、回归通过率与改动最小性打分，与编程 Agent 评测互为补充，每个规格独立评分与评论。', '• 首发 SWE-bench Verified 基准', '["真实仓库修复","SWE-bench","AI模型测评"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-app-eval-pelican-bike', '100001', '0', 'app-eval-pelican-bike', 'zh-CN', '醍醐骑单车 · SVG 空间推理', '经典空间推理与 SVG 生成测试', '以「醍醐骑单车」经典提示词测评空间理解与 SVG 代码生成：是否坐稳车座、双轮成对、脚踩踏板。', '源自 Simon Willison 的 pelican riding a bicycle 民间测试，中文社区演化为「醍醐骑单车」。同一提示词要求不写 JavaScript、只用原生 SVG 与 animateTransform 生成循环动画，按物体组合、空间关系、肢体连贯与代码自洽打分，对比 GPT-5、Claude Sonnet 4.5、Gemini 2.5 Pro、DeepSeek-V3.2、Qwen3-Max、GLM-4.7 的空间理解与代码生成能力，每个规格独立评分与评论。', '• 新增循环动画与踏板连贯性检查', '["醍醐骑单车","鹈鹕骑车","SVG 空间推理","AI模型测评"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-app-eval-forbidden-city', '100001', '0', 'app-eval-forbidden-city', 'zh-CN', '紫禁城 · 3D 场景生成', '中式古建 3D 生成基准', '以「紫禁城」为提示词测评前端 3D 场景生成：太和殿比例、斗拱细节、雪景光影与交互性能。', '紫禁城与故宫 3D 场景是中文社区常用的 AI 编程测试：模型需在无外部素材的前提下，用 Three.js 或原生 WebGL 搭建太和殿、汉白玉台基、檐角与飘雪，并保证相机交互流畅。按建筑还原、比例结构、材质光影与交互性能打分，每个规格独立评分与评论。', '• 新增雪景光影与性能评分', '["紫禁城","3D 场景生成","AI模型测评"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-app-eval-webdev-arena', '100001', '0', 'app-eval-webdev-arena', 'zh-CN', '前端作品竞技场', '前端生成两两对战基准', '以 WebDev Arena 式两两对战测评前端生成：视觉还原、交互完整、响应式与代码质量。', '前端作品竞技场采用盲测两两对战：同一需求交给两个模型生成可运行页面，由评审比较视觉还原、交互完整性、响应式适配与代码质量，按对战票数计算 Elo 式基准分，每个规格独立评分与评论。', '• 新增响应式与可访问性维度', '["前端作品竞技场","WebDev Arena","AI模型测评"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-app-eval-gaia', '100001', '0', 'app-eval-gaia', 'zh-CN', '通用助手任务（GAIA）', '真实世界通用助手基准', '以 GAIA 的 466 个真实世界问题测评多步推理、工具编排、网页检索与多模态能力。', 'GAIA 包含 466 个对人类概念简单、对当前 AI 极具挑战的真实问题，需要组合网页浏览、多模态理解、文件处理与多步推理才能完成。测评按多步推理、工具编排、网页检索与多模态四个维度统计任务成功率，对比 BirdCoder、Manus Agent、Claude Code、Codex CLI、Gemini CLI、Cursor Agent 等 Agent 规格，每个规格独立评分与评论。', '• 首发 GAIA 466 题助手基准', '["通用助手任务","GAIA","Agent 规格","AI模型测评"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-app-eval-safety', '100001', '0', 'app-eval-safety', 'zh-CN', '安全对齐测评', '越狱与有害内容拒答基准', '以 HarmBench 与 JailbreakBench 测评越狱抵抗、有害内容拒答、隐私保护与过度拒答率。', '安全对齐测评汇聚 HarmBench、JailbreakBench 等公开安全基准，覆盖越狱提示、有害内容请求、隐私提取与高风险建议。除拒答率外单列过度拒答率，避免把一律拒答误判为安全能力，每个规格独立评分与评论。', '• 新增过度拒答率维度', '["安全对齐测评","HarmBench","JailbreakBench","AI模型测评"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('loc-app-eval-hallucination', '100001', '0', 'app-eval-hallucination', 'zh-CN', '事实性幻觉测评', '事实准确与校准度基准', '以 SimpleQA 与 TruthfulQA 测评事实准确、校准度、恰当拒答与引用可溯性。', '事实性幻觉测评结合 OpenAI SimpleQA 的短事实问答与 TruthfulQA 的常见误解题，统计事实准确率、置信校准度、未知问题的恰当拒答率与引用可溯性，重点暴露自信胡说而非仅仅答错，每个规格独立评分与评论。', '• 新增置信校准度统计', '["事实性幻觉测评","SimpleQA","TruthfulQA","AI模型测评"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    subtitle = EXCLUDED.subtitle,
    short_description = EXCLUDED.short_description,
    full_description = EXCLUDED.full_description,
    whats_new_summary = EXCLUDED.whats_new_summary,
    keywords_json = EXCLUDED.keywords_json,
    updated_at = EXCLUDED.updated_at;
