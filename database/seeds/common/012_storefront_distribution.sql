-- 012_storefront_distribution.sql — distribution projections for the seeded
-- storefront listings (locale-neutral).
--
-- Populates appstore_app.platforms (raw codes from appstore_platform_dictionary,
-- see 011_platform_dictionary.sql) and appstore_app.access_url so the
-- storefront can present every distribution type: PC desktop installers
-- (windows/macos/linux), PC web apps (web, direct open), H5 apps (h5, direct
-- open), mobile apps (android/ios/harmonyos, QR), and mini programs
-- (miniprogram-*, QR). Listings left untouched keep the PC-desktop default.

UPDATE appstore_app SET platforms = '["windows","macos","linux"]'::jsonb WHERE id IN ('app-cursor','app-comfyui','game-ai-arena','game-ai-story','game-ai-pet','game-ai-chess','game-ai-dungeon','game-ai-rpg','app-agent-workspace');

UPDATE appstore_app SET platforms = '["windows","macos","linux","android","ios"]'::jsonb WHERE id = 'app-wechat';
UPDATE appstore_app SET platforms = '["windows","macos","linux","android","ios","harmonyos"]'::jsonb WHERE id = 'app-baidunetdisk';
UPDATE appstore_app SET platforms = '["windows","linux","android","ios"]'::jsonb WHERE id = 'app-wps';
UPDATE appstore_app SET platforms = '["windows","macos","web"]'::jsonb, access_url = 'https://apps.sdkwork.com/agent-workspace' WHERE id = 'app-agent-workspace';

UPDATE appstore_app SET platforms = '["web","android","ios","miniprogram-wechat"]'::jsonb, access_url = 'https://tongyi.aliyun.com/qianwen' WHERE id = 'app-qwen';
UPDATE appstore_app SET platforms = '["web","android","ios"]'::jsonb, access_url = 'https://chat.deepseek.com' WHERE id = 'app-deepseek';
UPDATE appstore_app SET platforms = '["web","android","ios","miniprogram-wechat"]'::jsonb, access_url = 'https://kimi.moonshot.cn' WHERE id = 'app-kimi';
UPDATE appstore_app SET platforms = '["web","android","ios","miniprogram-douyin"]'::jsonb, access_url = 'https://www.doubao.com/chat/' WHERE id = 'app-doubao';
UPDATE appstore_app SET platforms = '["web","android","ios"]'::jsonb, access_url = 'https://www.perplexity.ai' WHERE id = 'app-perplexity';
UPDATE appstore_app SET platforms = '["web","android","ios"]'::jsonb, access_url = 'https://claude.ai' WHERE id = 'app-claude';
UPDATE appstore_app SET platforms = '["web"]'::jsonb, access_url = 'https://v0.dev' WHERE id = 'app-v0';
UPDATE appstore_app SET platforms = '["web"]'::jsonb, access_url = 'https://bolt.new' WHERE id = 'app-bolt';
UPDATE appstore_app SET platforms = '["web"]'::jsonb, access_url = 'https://manus.im' WHERE id = 'app-manus';
UPDATE appstore_app SET platforms = '["web","miniprogram-wechat","miniprogram-douyin","miniprogram-alipay"]'::jsonb, access_url = 'https://www.coze.cn' WHERE id = 'app-coze';
UPDATE appstore_app SET platforms = '["web"]'::jsonb, access_url = 'https://apps.sdkwork.com/code-playground' WHERE id = 'app-code-playground';
UPDATE appstore_app SET platforms = '["web"]'::jsonb, access_url = 'https://www.midjourney.com' WHERE id = 'app-midjourney';
UPDATE appstore_app SET platforms = '["web","android","ios"]'::jsonb, access_url = 'https://suno.com' WHERE id = 'app-suno';
UPDATE appstore_app SET platforms = '["web"]'::jsonb, access_url = 'https://runwayml.com' WHERE id = 'app-runway';
UPDATE appstore_app SET platforms = '["web"]'::jsonb, access_url = 'https://elevenlabs.io' WHERE id = 'app-elevenlabs';
UPDATE appstore_app SET platforms = '["web"]'::jsonb, access_url = 'https://blackforestlabs.ai' WHERE id = 'app-flux';
UPDATE appstore_app SET platforms = '["web","windows","macos","android","ios"]'::jsonb, access_url = 'https://www.notion.so' WHERE id = 'app-notion-ai';
UPDATE appstore_app SET platforms = '["web","windows"]'::jsonb, access_url = 'https://apps.sdkwork.com/rag-knowledge' WHERE id = 'app-rag-knowledge';
UPDATE appstore_app SET platforms = '["web"]'::jsonb, access_url = 'https://apps.sdkwork.com/saas-starter' WHERE id = 'app-saas-starter';
UPDATE appstore_app SET platforms = '["web","android","ios","harmonyos"]'::jsonb, access_url = 'https://www.douyin.com' WHERE id = 'app-douyin';
UPDATE appstore_app SET platforms = '["windows","macos","web","android","ios","harmonyos"]'::jsonb, access_url = 'https://ima.qq.com' WHERE id = 'app-tencent-ima';

UPDATE appstore_app SET platforms = '["h5","miniprogram-wechat"]'::jsonb, access_url = 'https://apps.sdkwork.com/h5/game-mini-jump' WHERE id = 'game-mini-jump';
UPDATE appstore_app SET platforms = '["h5","miniprogram-wechat","miniprogram-alipay"]'::jsonb, access_url = 'https://apps.sdkwork.com/h5/game-mini-2048' WHERE id = 'game-mini-2048';
UPDATE appstore_app SET platforms = '["h5","miniprogram-wechat"]'::jsonb, access_url = 'https://apps.sdkwork.com/h5/game-mini-fruit' WHERE id = 'game-mini-fruit';
UPDATE appstore_app SET platforms = '["h5"]'::jsonb, access_url = 'https://apps.sdkwork.com/h5/game-mini-bird' WHERE id = 'game-mini-bird';
UPDATE appstore_app SET platforms = '["h5","miniprogram-wechat","android","ios"]'::jsonb, access_url = 'https://apps.sdkwork.com/h5/game-doudizhu' WHERE id = 'game-doudizhu';
UPDATE appstore_app SET platforms = '["h5","miniprogram-wechat"]'::jsonb, access_url = 'https://apps.sdkwork.com/h5/game-xiangqi' WHERE id = 'game-xiangqi';
UPDATE appstore_app SET platforms = '["h5","miniprogram-wechat","miniprogram-qq"]'::jsonb, access_url = 'https://apps.sdkwork.com/h5/game-mahjong' WHERE id = 'game-mahjong';
UPDATE appstore_app SET platforms = '["h5","miniprogram-wechat"]'::jsonb, access_url = 'https://apps.sdkwork.com/h5/game-gomoku' WHERE id = 'game-gomoku';
UPDATE appstore_app SET platforms = '["h5"]'::jsonb, access_url = 'https://apps.sdkwork.com/h5/game-junqi' WHERE id = 'game-junqi';
UPDATE appstore_app SET platforms = '["h5","miniprogram-wechat"]'::jsonb, access_url = 'https://apps.sdkwork.com/h5/game-guandan' WHERE id = 'game-guandan';

UPDATE appstore_app SET platforms = '["android","ios","harmonyos"]'::jsonb WHERE id IN ('game-mobile-mc','game-mobile-ys','game-mobile-honor');
UPDATE appstore_app SET platforms = '["android","ios"]'::jsonb WHERE id = 'game-mobile-cf';

-- Office & collaboration expansion (013 storefront catalog): desktop
-- installers, direct-open web surfaces, and scan-to-continue mobile clients.
UPDATE appstore_app SET platforms = '["windows","macos","linux","android","ios","harmonyos","web"]'::jsonb, access_url = 'https://www.feishu.cn' WHERE id = 'app-feishu';
UPDATE appstore_app SET platforms = '["windows","macos","linux","android","ios","harmonyos","web"]'::jsonb, access_url = 'https://www.dingtalk.com' WHERE id = 'app-dingtalk';
UPDATE appstore_app SET platforms = '["windows","macos","android","ios","harmonyos"]'::jsonb, access_url = 'https://work.weixin.qq.com' WHERE id = 'app-wecom';
UPDATE appstore_app SET platforms = '["windows","macos","android","ios","harmonyos","miniprogram-wechat"]'::jsonb, access_url = 'https://meeting.tencent.com' WHERE id = 'app-tencent-meeting';
UPDATE appstore_app SET platforms = '["web","windows","android","ios","miniprogram-wechat"]'::jsonb, access_url = 'https://docs.qq.com' WHERE id = 'app-tencent-docs';
UPDATE appstore_app SET platforms = '["web","android","ios","miniprogram-wechat"]'::jsonb, access_url = 'https://shimo.im' WHERE id = 'app-shimo';
UPDATE appstore_app SET platforms = '["web","windows","macos","android","ios"]'::jsonb, access_url = 'https://www.yuque.com' WHERE id = 'app-yuque';
UPDATE appstore_app SET platforms = '["windows","macos","linux","android","ios"]'::jsonb, access_url = 'https://xmind.cn' WHERE id = 'app-xmind';
UPDATE appstore_app SET platforms = '["windows","macos","linux","android","ios"]'::jsonb, access_url = 'https://obsidian.md' WHERE id = 'app-obsidian';
UPDATE appstore_app SET platforms = '["windows","macos","android","ios"]'::jsonb, access_url = 'https://mail.163.com/dashi' WHERE id = 'app-mailmaster';
UPDATE appstore_app SET platforms = '["windows","macos","linux","android","ios","web"]'::jsonb, access_url = 'https://www.jianguoyun.com' WHERE id = 'app-nutstore';
UPDATE appstore_app SET platforms = '["windows","macos","android","ios","harmonyos","miniprogram-alipay"]'::jsonb, access_url = 'https://www.alipan.com' WHERE id = 'app-aliyundrive';
UPDATE appstore_app SET platforms = '["windows","macos","linux","android","ios","web"]'::jsonb, access_url = 'https://zoom.us' WHERE id = 'app-zoom';
UPDATE appstore_app SET platforms = '["windows","macos","android","ios","web"]'::jsonb, access_url = 'https://www.adobe.com/acrobat.html' WHERE id = 'app-acrobat';

-- AI expansion.
UPDATE appstore_app SET platforms = '["web","android","ios","macos","windows"]'::jsonb, access_url = 'https://chatgpt.com' WHERE id = 'app-chatgpt';
UPDATE appstore_app SET platforms = '["web","android","ios"]'::jsonb, access_url = 'https://gemini.google.com' WHERE id = 'app-gemini';
UPDATE appstore_app SET platforms = '["web","android","ios","miniprogram-wechat"]'::jsonb, access_url = 'https://chatglm.cn' WHERE id = 'app-chatglm';
UPDATE appstore_app SET platforms = '["web","android","ios","harmonyos"]'::jsonb, access_url = 'https://xinghuo.xfyun.cn' WHERE id = 'app-spark';
UPDATE appstore_app SET platforms = '["web","android","ios","miniprogram-wechat"]'::jsonb, access_url = 'https://yuanbao.tencent.com' WHERE id = 'app-yuanbao';
UPDATE appstore_app SET platforms = '["windows","macos","linux","web"]'::jsonb, access_url = 'https://github.com/features/copilot' WHERE id = 'app-copilot';
UPDATE appstore_app SET platforms = '["windows","macos","linux"]'::jsonb WHERE id = 'app-windsurf';
UPDATE appstore_app SET platforms = '["web","android","ios"]'::jsonb, access_url = 'https://app.klingai.com' WHERE id = 'app-kling';
UPDATE appstore_app SET platforms = '["web","android","ios"]'::jsonb, access_url = 'https://jimeng.jianying.com' WHERE id = 'app-jimeng';
UPDATE appstore_app SET platforms = '["web","android","ios"]'::jsonb, access_url = 'https://hailuoai.com' WHERE id = 'app-hailuo';
UPDATE appstore_app SET platforms = '["web"]'::jsonb, access_url = 'https://notebooklm.google.com' WHERE id = 'app-notebooklm';
UPDATE appstore_app SET platforms = '["web","android","ios","miniprogram-wechat"]'::jsonb, access_url = 'https://metaso.cn' WHERE id = 'app-metaso';

-- Utilities expansion.
UPDATE appstore_app SET platforms = '["windows","macos","linux"]'::jsonb, access_url = 'https://zh.snipaste.com' WHERE id = 'app-snipaste';
UPDATE appstore_app SET platforms = '["windows","linux","macos"]'::jsonb, access_url = 'https://www.7-zip.org' WHERE id = 'app-7zip';
UPDATE appstore_app SET platforms = '["windows","macos","linux"]'::jsonb, access_url = 'https://obsproject.com' WHERE id = 'app-obs-studio';
UPDATE appstore_app SET platforms = '["windows","macos","linux","android","ios"]'::jsonb, access_url = 'https://www.videolan.org' WHERE id = 'app-vlc';
UPDATE appstore_app SET platforms = '["windows","macos","linux","android","ios","harmonyos","web"]'::jsonb, access_url = 'https://music.163.com' WHERE id = 'app-netease-music';
