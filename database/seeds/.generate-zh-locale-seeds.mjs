import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const seedsRoot = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const read = (relativePath) => fs.readFileSync(path.join(seedsRoot, relativePath), 'utf8');

function sqlEscape(value) {
  return value.replace(/'/g, "''");
}

function extractSingleLineInsertRows(sql, tableName) {
  const marker = `INSERT INTO ${tableName}`;
  const start = sql.indexOf(marker);
  if (start < 0) return [];
  const valuesStart = sql.indexOf('VALUES', start);
  const valuesBody = sql.slice(valuesStart + 'VALUES'.length);
  const end = valuesBody.search(/\r?\nON CONFLICT|\r?\n-- /);
  const block = end >= 0 ? valuesBody.slice(0, end) : valuesBody;
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('('))
    .map((line) => line.replace(/,\s*$/, ''));
}

function extractReleaseNoteRows(sql) {
  const marker = 'INSERT INTO appstore_release_note_localization';
  const start = sql.indexOf(marker);
  if (start < 0) return [];
  const valuesStart = sql.indexOf('VALUES', start);
  const valuesBody = sql.slice(valuesStart + 'VALUES'.length);
  const end = valuesBody.search(/\r?\nON CONFLICT|\r?\n-- /);
  const block = end >= 0 ? valuesBody.slice(0, end) : valuesBody;
  const pattern =
    /\('(note-[^']+)',\s*'100001',\s*'0',\s*'(rel-[^']+)',\s*'zh-CN',\s*'([\s\S]*?)',\s*CURRENT_TIMESTAMP,\s*CURRENT_TIMESTAMP\)/g;
  const rows = [];
  for (const match of block.matchAll(pattern)) {
    const [full, id, releaseId, notes] = match;
    const normalizedNotes = notes.replace(/\r\n/g, '\n').trim();
    rows.push(
      `('${id}', '100001', '0', '${releaseId}', 'zh-CN', '${sqlEscape(normalizedNotes)}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    );
  }
  return rows;
}

const handReinforcedRows = [
  `('loc-app-qwen', '100001', '0', 'app-qwen', 'zh-CN', '千问 AI', '通义千问桌面客户端', '通义千问桌面客户端，支持深度思考、多轮对话与长文档解析。', '通义千问桌面客户端，支持深度思考、多轮对话、长文档理解、代码辅助与文档总结。', '新增 AI 深度思考推理模式与大文档解析能力。', '["千问 AI","AI 助手与对话"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
  `('loc-app-deepseek', '100001', '0', 'app-deepseek', 'zh-CN', 'DeepSeek R1 深度思考', '开源推理大模型客户端', '开源推理大模型客户端，擅长数学推导、代码推理与复杂逻辑分析。', '开源推理大模型客户端，擅长数学推导、算法设计与复杂逻辑分析。', '新增可展开的实时推理链路展示。', '["DeepSeek R1","AI 助手与对话"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
  `('loc-app-cursor', '100001', '0', 'app-cursor', 'zh-CN', 'Cursor AI', 'AI 原生代码编辑器', 'AI 原生代码编辑器，支持多模型补全、自然语言改代码与跨文件重构。', 'AI 原生代码编辑器，支持多模型补全、自然语言改代码、项目级索引与跨文件重构。', '新增 Agent 并行任务与更丰富仓库索引。', '["Cursor AI","AI 编程与 Agent"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
  `('loc-app-midjourney', '100001', '0', 'app-midjourney', 'zh-CN', 'Midjourney', 'AI 图像生成工具', 'AI 图像生成工具，支持高质量风格化出图与图生图。', 'AI 图像生成工具，支持高质量风格化出图、图生图与细粒度参数控制。', '新增风格参考与角色一致性能力。', '["Midjourney","AI 创意与音视频"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
  `('loc-app-wechat', '100001', '0', 'app-wechat', 'zh-CN', '微信', '国民级社交应用', '国民级社交应用，提供聊天、支付、小程序与视频号。', '国民级社交应用，提供聊天、支付、小程序、视频号与生活服务能力。', '新增视频号直播功能优化。', '["微信","实用程序与工具"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
  `('loc-game-mobile-ys', '100001', '0', 'game-mobile-ys', 'zh-CN', '原神', '开放世界冒险手游', '开放世界冒险手游，探索提瓦特大陆并收集角色。', '开放世界冒险手游，支持探索、角色养成、元素战斗与联机玩法。', '新增区域与角色内容。', '["原神","精品手游"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
];

const reinforcedZh = new Map(
  handReinforcedRows
    .map((row) => {
      const listingId = row.match(/,\s*'([^']+)',\s*'zh-CN'/)?.[1];
      return listingId ? [listingId, row] : null;
    })
    .filter(Boolean),
);

function firstSentence(text) {
  const match = text.match(/^[^。！？]{12,140}[。！？]/);
  if (match) return match[0];
  return text.length <= 120 ? text : `${text.slice(0, 117)}...`;
}

function normalizeListingRow(row) {
  if (!row.includes("'zh-CN'")) return row;
  const parts = row.split("', '");
  if (parts.length < 11) return row;
  const shortDescription = parts[7];
  const fullDescription = parts[8];
  if (!/[。！？]$/.test(shortDescription.trim()) || shortDescription.trim().length < 20) {
    parts[7] = sqlEscape(firstSentence(fullDescription));
  }
  return parts.join("', '");
}

const listingRows = extractSingleLineInsertRows(
  read('common/005_storefront_listings.sql'),
  'appstore_listing_localization',
).map((row) => {
  const listingId = row.match(/,\s*'([^']+)',\s*'zh-CN'/)?.[1];
  if (listingId && reinforcedZh.has(listingId)) {
    return reinforcedZh.get(listingId);
  }
  return normalizeListingRow(row);
});

const releaseRows = extractReleaseNoteRows(read('common/006_storefront_releases.sql'));

const listingsSql = `-- zh-CN listing localizations for storefront apps and games (tenant 100001).
-- Locale seed pipeline reinforcement aligned with common/005_storefront_listings.sql.

INSERT INTO appstore_listing_localization
    (id, tenant_id, organization_id, listing_id, locale, display_name, subtitle, short_description, full_description, whats_new_summary, keywords_json, created_at, updated_at)
VALUES
${listingRows.map((row) => `    ${row}`).join(',\n')}
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    subtitle = EXCLUDED.subtitle,
    short_description = EXCLUDED.short_description,
    full_description = EXCLUDED.full_description,
    whats_new_summary = EXCLUDED.whats_new_summary,
    keywords_json = EXCLUDED.keywords_json,
    updated_at = EXCLUDED.updated_at;
`;

const releasesSql = `-- zh-CN release notes for storefront releases (tenant 100001).

INSERT INTO appstore_release_note_localization
    (id, tenant_id, organization_id, release_id, locale, release_notes, created_at, updated_at)
VALUES
${releaseRows.map((row) => `    ${row}`).join(',\n')}
ON CONFLICT (id) DO UPDATE SET
    release_notes = EXCLUDED.release_notes,
    updated_at = EXCLUDED.updated_at;
`;

const catalogSql = `-- zh-CN editorial catalog localizations and trending terms (tenant 100001).

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
`;

fs.writeFileSync(path.join(seedsRoot, 'locales/zh-CN/001_storefront_listings_zh.sql'), listingsSql, 'utf8');
fs.writeFileSync(path.join(seedsRoot, 'locales/zh-CN/002_storefront_releases_zh.sql'), releasesSql, 'utf8');
fs.writeFileSync(path.join(seedsRoot, 'locales/zh-CN/003_storefront_catalog_zh.sql'), catalogSql, 'utf8');

function sha256Files(files) {
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(read(file));
  }
  return `sha256:${hash.digest('hex')}`;
}

const manifestPath = path.join(seedsRoot, 'seed.manifest.json');
const manifest = JSON.parse(read('seed.manifest.json'));
const zhFiles = [
  'locales/zh-CN/001_storefront_listings_zh.sql',
  'locales/zh-CN/002_storefront_releases_zh.sql',
  'locales/zh-CN/003_storefront_catalog_zh.sql',
];

manifest.localeSets['zh-CN'].files = zhFiles;
manifest.localeSets['zh-CN'].checksum = sha256Files(zhFiles);
manifest.profiles.standard.locales['zh-CN'] = zhFiles;

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`Generated zh-CN locale seeds: ${listingRows.length} listings, ${releaseRows.length} release notes.`);
