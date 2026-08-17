import fs from 'node:crypto';
import fsSync from 'node:fs';
import path from 'node:path';

const seedsRoot = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

const releaseNotesEn = [
  ['note-app-qwen-320-en', 'rel-app-qwen-320', '• Added deep reasoning mode\n• Drag-and-drop parsing for PDF/Word/Excel and codebases\n• Performance improvements and sidebar quick wake'],
  ['note-app-deepseek-150-en', 'rel-app-deepseek-150', '• Live expandable reasoning traces\n• Stronger math and code unit-test support\n• Faster multi-threaded inference'],
  ['note-app-kimi-281-en', 'rel-app-kimi-281', '• Upgraded Kimi Explore multi-step search\n• Long PDF comparison and table reconstruction'],
  ['note-app-cursor-0420-en', 'rel-app-cursor-0420', '• Parallel Agent mode tasks\n• More repository index types supported'],
  ['note-app-tencent-ima-260-en', 'rel-app-tencent-ima-260', '• Personal knowledge-base deep Q&A\n• Multi-format document import'],
  ['note-app-midjourney-610-en', 'rel-app-midjourney-610', '• Style reference and character consistency\n• Improved 4K output resolution'],
  ['note-app-doubao-230-en', 'rel-app-doubao-230', '• Image understanding and document Q&A\n• Better multi-turn context management'],
  ['note-app-perplexity-461-en', 'rel-app-perplexity-461', '• Focused search and pro research mode\n• Research notes workspace'],
  ['note-app-suno-400-en', 'rel-app-suno-400', '• Full album generation mode\n• Custom lyrics and cover versions'],
  ['note-app-v0-240-en', 'rel-app-v0-240', '• Multi-page app generation\n• Design system templates'],
  ['note-app-bolt-310-en', 'rel-app-bolt-310', '• Database schema auto-generation\n• One-click deployment integration'],
  ['note-app-manus-200-en', 'rel-app-manus-200', '• Task sandbox and approval flows\n• Shared team agents'],
  ['note-app-coze-350-en', 'rel-app-coze-350', '• Plugin marketplace\n• Improved workflow debugging'],
  ['note-app-code-playground-182-en', 'rel-app-code-playground-182', '• Python 3.12 runtime\n• Shareable run links'],
  ['note-app-runway-370-en', 'rel-app-runway-370', '• Gen-3 video model\n• Multi-shot script generation'],
  ['note-app-elevenlabs-290-en', 'rel-app-elevenlabs-290', '• 32-language support\n• Lower-latency streaming synthesis'],
  ['note-app-comfyui-035-en', 'rel-app-comfyui-035', '• Workflow template library\n• Multi-model parallel queue'],
  ['note-app-flux-120-en', 'rel-app-flux-120', '• FLUX.1 Pro integration\n• Batch generation and prompt optimization'],
  ['note-app-notion-ai-390-en', 'rel-app-notion-ai-390', '• AI meeting notes summaries\n• Database Q&A'],
  ['note-app-rag-knowledge-210-en', 'rel-app-rag-knowledge-210', '• Hybrid retrieval and reranking\n• Multi-tenant knowledge isolation'],
  ['note-app-saas-starter-140-en', 'rel-app-saas-starter-140', '• Stripe billing integration\n• One-click deploy templates'],
  ['note-app-agent-workspace-220-en', 'rel-app-agent-workspace-220', '• Agent marketplace\n• Workflow version management'],
  ['note-app-claude-190-en', 'rel-app-claude-190', '• Claude 3.7 hybrid reasoning\n• Long codebase understanding and refactoring'],
  ['note-game-ai-arena-190-en', 'rel-game-ai-arena-190', '• League mode\n• Custom agent strategies'],
  ['note-game-ai-story-200-en', 'rel-game-ai-story-200', '• Multi-ending achievement system\n• Custom world settings'],
  ['note-game-ai-pet-330-en', 'rel-game-ai-pet-330', '• Pet emotion system\n• Cross-device companion sync'],
  ['note-game-ai-chess-170-en', 'rel-game-ai-chess-170', '• Game database search\n• Adaptive AI difficulty'],
  ['note-game-ai-dungeon-250-en', 'rel-game-ai-dungeon-250', '• Random event system\n• Co-op exploration'],
  ['note-game-ai-rpg-160-en', 'rel-game-ai-rpg-160', '• Long-term NPC memory\n• Dynamic open-world economy'],
  ['note-game-doudizhu-820-en', 'rel-game-doudizhu-820', '• AI practice mode\n• Better matchmaking and anti-cheat'],
  ['note-game-xiangqi-510-en', 'rel-game-xiangqi-510', '• Endgame challenge levels\n• Game record import/export'],
  ['note-game-mahjong-740-en', 'rel-game-mahjong-740', '• Blood-flow mahjong mode\n• Improved reconnect handling'],
  ['note-game-gomoku-300-en', 'rel-game-gomoku-300', '• Undo and replay\n• Stronger AI play'],
  ['note-game-junqi-420-en', 'rel-game-junqi-420', '• Ranked seasons\n• Improved movement rules'],
  ['note-game-guandan-600-en', 'rel-game-guandan-600', '• AI practice partner\n• Better play hints'],
  ['note-game-mini-jump-240-en', 'rel-game-mini-jump-240', '• Daily challenge mode'],
  ['note-game-mini-2048-190-en', 'rel-game-mini-2048-190', '• Endless mode'],
  ['note-game-mini-fruit-210-en', 'rel-game-mini-fruit-210', '• Fruit skin system'],
  ['note-game-mini-bird-150-en', 'rel-game-mini-bird-150', '• Night mode'],
  ['note-game-mobile-mc-1205-en', 'rel-game-mobile-mc-1205', '• Caves & Cliffs biomes'],
  ['note-game-mobile-ys-470-en', 'rel-game-mobile-ys-470', '• New regions and characters'],
  ['note-game-mobile-honor-860-en', 'rel-game-mobile-honor-860', '• New heroes and season skins'],
  ['note-game-mobile-cf-790-en', 'rel-game-mobile-cf-790', '• Bio-hazard chase mode'],
  ['note-app-wps-1280-en', 'rel-app-wps-1280', '• AI document assistant\n• Improved PDF editing'],
  ['note-app-baidunetdisk-1120-en', 'rel-app-baidunetdisk-1120', '• AI photo organization'],
  ['note-app-wechat-8030-en', 'rel-app-wechat-8030', '• Channels live streaming features'],
  ['note-app-douyin-2760-en', 'rel-app-douyin-2760', '• AI video editing tools'],
];

function sqlEscape(value) {
  return value.replace(/'/g, "''");
}

const releaseSql = `-- en-US release notes for storefront releases (tenant 100001).

INSERT INTO appstore_release_note_localization
    (id, tenant_id, organization_id, release_id, locale, release_notes, created_at, updated_at)
VALUES
${releaseNotesEn
  .map(
    ([id, releaseId, notes]) =>
      `    ('${id}', '100001', '0', '${releaseId}', 'en-US', '${sqlEscape(notes)}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
  )
  .join(',\n')}
ON CONFLICT (id) DO UPDATE SET
    release_notes = EXCLUDED.release_notes,
    updated_at = EXCLUDED.updated_at;
`;

const catalogSql = `-- en-US editorial catalog localizations and trending terms (tenant 100001).

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
`;

fsSync.writeFileSync(path.join(seedsRoot, 'locales/en-US/002_storefront_releases_en.sql'), releaseSql, 'utf8');
fsSync.writeFileSync(path.join(seedsRoot, 'locales/en-US/003_storefront_catalog_en.sql'), catalogSql, 'utf8');

console.log('Generated en-US release and catalog locale seeds.');
