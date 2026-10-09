#!/usr/bin/env node
/**
 * Generate storefront seed rows for every H5 / PC / Flutter / mini-program
 * (and HarmonyOS) application declared across the sdkwork-space sibling
 * repositories.
 *
 * Source of truth: `<workspace>/sdkwork-[repo]/apps/[app]/sdkwork.app.config.json`
 * (kind `sdkwork.app`). Each declared platform application becomes one
 * `appstore_app` + `appstore_listing` pair with complete storefront data:
 * media references, a published release on the production channel,
 * zh-CN/en-US localizations, release-note localizations, category binding,
 * compliance profile, CN/US regional availability, market-channel release,
 * and platform delivery rows for mobile/mini-program platforms.
 *
 * Generated files (do not hand-edit; re-run this script to refresh):
 * - common/016_workspace_applications.sql
 * - locales/zh-CN/004_workspace_applications_zh.sql
 * - locales/en-US/004_workspace_applications_en.sql
 *
 * Usage:
 *   node database/seeds/.generate-workspace-applications.mjs           # write
 *   node database/seeds/.generate-workspace-applications.mjs --check   # verify
 */

import fs from 'node:fs';
import path from 'node:path';

const seedsRoot = path.dirname(path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')));
const repoRoot = path.resolve(seedsRoot, '..', '..');

const TENANT_ID = '100001';
const ORGANIZATION_ID = '0';
const PUBLISHER_ID = 'appstore-publisher-default-0';
const RELEASE_CHANNEL_ID = 'ch-prod';
const MARKET_CHANNEL_ID = 'mch-sdkwork-pc';
const DEFAULT_VERSION = '0.1.0';

const OUTPUT_FILES = {
  common: 'common/016_workspace_applications.sql',
  zh: 'locales/zh-CN/004_workspace_applications_zh.sql',
  en: 'locales/en-US/004_workspace_applications_en.sql',
};

// Directory-suffix -> application family. Families outside the requested
// H5/PC/Flutter/mini-program set (HarmonyOS mobile) are included as well;
// drop the entry here to exclude them from generation.
const FAMILY_BY_SUFFIX = [
  ['-flutter-mobile', 'flutter'],
  ['-harmony-mobile', 'harmony'],
  ['-mini-program', 'mp'],
  ['-flutter', 'flutter'],
  ['-h5', 'h5'],
  ['-pc', 'pc'],
];

const FAMILY_PROFILE = {
  pc: {
    runtimeFamily: 'WEB',
    platforms: ['web'],
    releaseTargets: ['web'],
    accessUrl: (appId) => `https://apps.sdkwork.com/${appId}/`,
    labelZh: 'PC 端',
    labelEn: 'PC (desktop web)',
  },
  h5: {
    runtimeFamily: 'H5',
    platforms: ['web'],
    releaseTargets: ['h5'],
    accessUrl: (appId) => `https://apps.sdkwork.com/${appId}/`,
    labelZh: 'H5 移动网页端',
    labelEn: 'H5 mobile web',
  },
  flutter: {
    runtimeFamily: 'APP',
    platforms: ['android', 'ios'],
    releaseTargets: ['mobile'],
    accessUrl: () => null,
    labelZh: 'Flutter 移动端',
    labelEn: 'Flutter mobile',
  },
  harmony: {
    runtimeFamily: 'APP',
    platforms: ['harmonyos'],
    releaseTargets: ['mobile'],
    accessUrl: () => null,
    labelZh: '鸿蒙移动端',
    labelEn: 'HarmonyOS mobile',
  },
  mp: {
    runtimeFamily: 'MINI_PROGRAM',
    platforms: ['miniprogram-wechat'],
    releaseTargets: ['miniprogram'],
    accessUrl: () => null,
    labelZh: '小程序端',
    labelEn: 'mini program',
  },
};

// Module -> storefront category. Keys are sdkwork-space repository names.
// Unknown modules fall back to `appstore-category-apps` with a warning.
const REPO_CATEGORY = {
  'sdkwork-agents': 'cat-ai-coding',
  'sdkwork-agentstudio': 'cat-ai-coding',
  'sdkwork-codebox': 'cat-ai-coding',
  'sdkwork-github': 'cat-ai-coding',
  'sdkwork-terminal': 'appstore-category-tools',
  'sdkwork-browser': 'appstore-category-tools',
  'sdkwork-llm': 'cat-ai-productivity',
  'sdkwork-prompts': 'cat-ai-productivity',
  'sdkwork-mcp': 'cat-ai-productivity',
  'sdkwork-skills': 'cat-ai-productivity',
  'sdkwork-modelkit': 'cat-ai-productivity',
  'sdkwork-models': 'cat-ai-productivity',
  'sdkwork-memory': 'cat-ai-productivity',
  'sdkwork-knowledgebase': 'cat-ai-productivity',
  'sdkwork-generations': 'cat-ai-productivity',
  'sdkwork-search': 'cat-ai-productivity',
  'sdkwork-local-router': 'appstore-category-tools',
  'sdkwork-appstore': 'appstore-category-apps',
  'sdkwork-whatseek': 'cat-ai-assistants',
  'sdkwork-canvas': 'cat-ai-creative',
  'sdkwork-image': 'cat-ai-creative',
  'sdkwork-music': 'cat-ai-creative',
  'sdkwork-video': 'cat-ai-creative',
  'sdkwork-video-cut': 'cat-ai-creative',
  'sdkwork-audio': 'cat-ai-creative',
  'sdkwork-tts': 'cat-ai-creative',
  'sdkwork-voice': 'cat-ai-creative',
  'sdkwork-drama': 'appstore-category-entertainment',
  'sdkwork-news': 'appstore-category-entertainment',
  'sdkwork-feeds': 'appstore-category-entertainment',
  'sdkwork-missory': 'appstore-category-apps',
  'sdkwork-documents': 'cat-office',
  'sdkwork-mail': 'cat-office',
  'sdkwork-drive': 'cat-office',
  'sdkwork-notes': 'cat-office',
  'sdkwork-cms': 'appstore-category-productivity',
  'sdkwork-account': 'appstore-category-productivity',
  'sdkwork-iam': 'appstore-category-productivity',
  'sdkwork-settings': 'appstore-category-productivity',
  'sdkwork-manager': 'appstore-category-productivity',
  'sdkwork-portal': 'appstore-category-productivity',
  'sdkwork-deployments': 'appstore-category-productivity',
  'sdkwork-cloudrouter': 'appstore-category-productivity',
  'sdkwork-webserver': 'appstore-category-productivity',
  'sdkwork-web-framework': 'appstore-category-productivity',
  'sdkwork-kernel': 'appstore-category-productivity',
  'sdkwork-payment': 'appstore-category-productivity',
  'sdkwork-order': 'appstore-category-productivity',
  'sdkwork-mall': 'appstore-category-productivity',
  'sdkwork-merchandise': 'appstore-category-productivity',
  'sdkwork-shop': 'appstore-category-productivity',
  'sdkwork-inventory': 'appstore-category-productivity',
  'sdkwork-invoice': 'appstore-category-productivity',
  'sdkwork-membership': 'appstore-category-productivity',
  'sdkwork-promotion': 'appstore-category-productivity',
  'sdkwork-partner': 'appstore-category-productivity',
  'sdkwork-im': 'appstore-category-apps',
  'sdkwork-community': 'appstore-category-apps',
  'sdkwork-company': 'appstore-category-apps',
  'sdkwork-forum': 'appstore-category-apps',
  'sdkwork-customerservice': 'appstore-category-apps',
  'sdkwork-messaging': 'appstore-category-apps',
  'sdkwork-rtc': 'appstore-category-apps',
  'sdkwork-aiot': 'appstore-category-apps',
  'sdkwork-assets': 'appstore-category-apps',
  'sdkwork-notary': 'appstore-category-apps',
  'sdkwork-notes': 'cat-office',
  'sdkwork-course': 'appstore-category-education',
  'sdkwork-zhiya': 'appstore-category-education',
  'sdkwork-doudizhu': 'cat-board-games',
  'sdkwork-mahjong': 'cat-board-games',
  'sdkwork-xiangqi': 'cat-board-games',
  'sdkwork-dezhou': 'cat-board-games',
  'sdkwork-birdcoder': 'cat-mini-games',
  'sdkwork-birdcoder2': 'cat-mini-games',
  'sdkwork-games': 'cat-mini-games',
  'sdkwork-gameengine': 'cat-mini-games',
};

const DEFAULT_CATEGORY = 'appstore-category-apps';

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sqlText(value) {
  return String(value).replace(/'/g, "''");
}

function singleLine(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function classifyFamily(appDirName) {
  for (const [suffix, family] of FAMILY_BY_SUFFIX) {
    if (appDirName.endsWith(suffix)) {
      return family;
    }
  }
  return null;
}

function versionCode(version) {
  const parts = String(version).split('.');
  if (parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }
  return parts.join('');
}

function scanWorkspaceApplications(workspaceRoot) {
  const entries = fs
    .readdirSync(workspaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('sdkwork-'))
    .map((entry) => entry.name)
    .sort();

  const applications = [];
  const skipped = [];

  for (const repo of entries) {
    const repoRootPath = path.join(workspaceRoot, repo);
    const appsDir = path.join(repoRootPath, 'apps');
    if (!fs.existsSync(appsDir)) {
      continue;
    }

    let rootConfig = null;
    const rootConfigPath = path.join(repoRootPath, 'sdkwork.app.config.json');
    if (fs.existsSync(rootConfigPath)) {
      try {
        rootConfig = readJson(rootConfigPath);
      } catch (error) {
        skipped.push({ repo, reason: `root config unreadable: ${error.message}` });
      }
    }

    const appDirs = fs
      .readdirSync(appsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const appDir of appDirs) {
      const configPath = path.join(appsDir, appDir, 'sdkwork.app.config.json');
      if (!fs.existsSync(configPath)) {
        continue;
      }
      const family = classifyFamily(appDir);
      if (!family) {
        skipped.push({ repo, app: appDir, reason: 'unrecognized application family' });
        continue;
      }
      let config;
      try {
        config = readJson(configPath);
      } catch (error) {
        skipped.push({ repo, app: appDir, reason: `config unreadable: ${error.message}` });
        continue;
      }
      const rootApp = rootConfig?.app ?? {};
      const app = config.app ?? {};
      const version = config.release?.currentVersion || DEFAULT_VERSION;
      const code = versionCode(version);
      if (!code) {
        skipped.push({ repo, app: appDir, reason: `non-numeric version: ${version}` });
        continue;
      }
      const displayName = singleLine(app.displayName) || singleLine(rootApp.displayName) || appDir;
      const moduleDisplayName = singleLine(rootApp.displayName) || repo;
      const moduleDescription = singleLine(rootApp.description) || '';
      applications.push({
        repo,
        appDir,
        family,
        appId: appDir,
        displayName,
        moduleDisplayName,
        moduleDescription,
        moduleWebsiteUrl: singleLine(rootApp.officialWebsiteUrl) || null,
        runtimeFramework:
          singleLine(config.runtime?.framework) ||
          { pc: 'react', h5: 'react-h5', flutter: 'flutter', harmony: 'arkts', mp: 'uni-app' }[family],
        version,
        versionCode: code,
        category: REPO_CATEGORY[repo] ?? DEFAULT_CATEGORY,
        profile: FAMILY_PROFILE[family],
      });
    }
  }

  return { applications, skipped };
}

function quote(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  return `'${sqlText(value)}'`;
}

function quoteJson(value) {
  return quote(JSON.stringify(value));
}

function now() {
  return 'CURRENT_TIMESTAMP';
}

function applicationRow(app) {
  const platforms = app.profile.platforms;
  return [
    quote(app.appId),
    quote(TENANT_ID),
    quote(ORGANIZATION_ID),
    quote(PUBLISHER_ID),
    quote(`app-${app.appId}`),
    quote(app.appId),
    quote(app.appId),
    quote(app.displayName),
    quote('zh-CN'),
    quote('app'),
    quote(app.profile.runtimeFamily),
    quote(app.runtimeFramework),
    quote('active'),
    quote('active'),
    quote('approved'),
    quote('FREE'),
    quote(app.category),
    quote('4+'),
    quote(app.moduleWebsiteUrl),
    quote(app.profile.accessUrl(app.appId)),
    quoteJson(platforms),
    quote(app.moduleDescription || null),
    now(),
    now(),
  ].join(', ');
}

function listingRow(app) {
  return [
    quote(app.appId),
    quote(TENANT_ID),
    quote(ORGANIZATION_ID),
    quote(PUBLISHER_ID),
    quote(`L-${app.appId}`),
    quote(app.appId),
    quote(app.appId),
    quote(app.appId),
    quote('APP'),
    quote('FREE'),
    quote('active'),
    quote('visible'),
    quote('approved'),
    quote(app.category),
    quote('zh-CN'),
    quote('4+'),
    quote(`thread-${app.appId}`),
    '0',
    '0',
    'NULL',
    '0',
    now(),
    now(),
    now(),
    now(),
  ].join(', ');
}

function mediaRows(app) {
  const roles = [
    ['icon', 'ICON', 0],
    ['shot1', 'SCREENSHOT', 1],
    ['shot2', 'SCREENSHOT', 2],
  ];
  return roles.map(([suffix, role, sortOrder]) =>
    [
      quote(`media-${app.appId}-${suffix}`),
      quote(TENANT_ID),
      quote(ORGANIZATION_ID),
      quote(app.appId),
      quote(role),
      quote(`mr-${app.appId}-${suffix}`),
      quote(`drive://appstore/${app.appId}/${suffix}`),
      quote('ALL'),
      String(sortOrder),
      quote('zh-CN'),
      now(),
      now(),
    ].join(', '),
  );
}

function releaseRow(app) {
  return [
    quote(`rel-${app.appId}-${app.versionCode}`),
    quote(TENANT_ID),
    quote(ORGANIZATION_ID),
    quote(app.appId),
    quote(`R-${app.appId}-${app.versionCode}`),
    quote(RELEASE_CHANNEL_ID),
    quote(app.version),
    quote(app.versionCode),
    quote('1'),
    quote('published'),
    quote('10.0'),
    quote('zh-CN'),
    quoteJson({ targets: app.profile.releaseTargets }),
    now(),
    now(),
    now(),
    now(),
    now(),
  ].join(', ');
}

function appPlatformRows(app) {
  return app.profile.platforms.map((platformCode) =>
    [
      quote(`appplat-${app.appId}-${platformCode}`),
      quote(TENANT_ID),
      quote(ORGANIZATION_ID),
      quote(app.appId),
      quote(platformCode),
      quote('active'),
      quote(`com.sdkwork.${app.appId}.${platformCode}`),
      quote('external'),
      quoteJson({
        qrUrl:
          platformCode.startsWith('miniprogram-')
            ? `https://apps.sdkwork.com/mp/${platformCode}/${app.appId}`
            : `https://apps.sdkwork.com/m/${app.appId}`,
      }),
      now(),
      now(),
    ].join(', '),
  );
}

function localizationRow(app, locale) {
  const profile = app.profile;
  const isZh = locale === 'zh-CN';
  const displayName = app.displayName;
  const subtitle = isZh
    ? `${app.moduleDisplayName} · ${profile.labelZh}`
    : `${app.moduleDisplayName} · ${profile.labelEn}`;
  const moduleClause = isZh
    ? `${app.moduleDisplayName}（${app.repo} 模块）`
    : `${app.moduleDisplayName} (module ${app.repo})`;
  const familyClause = isZh ? profile.labelZh : profile.labelEn;
  const shortDescription = singleLine(
    isZh
      ? `${moduleClause}的 ${familyClause}应用，由 SDKWork 应用商店统一分发。`
      : `The ${familyClause} application of ${moduleClause}, distributed through the SDKWork App Store.`,
  );
  const fullDescription = singleLine(
    isZh
      ? `${moduleClause}的 ${familyClause}应用，随 SDKWork 工作区统一构建与发布。${app.moduleDescription}`.trim()
      : `The ${familyClause} application of ${moduleClause}, built and released with the SDKWork workspace. ${app.moduleDescription}`.trim(),
  );
  const whatsNew = isZh ? `• ${app.version} 初始上架。` : `• Initial store release ${app.version}.`;
  const keywords = isZh
    ? [app.displayName, app.moduleDisplayName, 'SDKWork']
    : [app.displayName, app.moduleDisplayName, 'SDKWork'];
  return [
    quote(`loc-${app.appId}${isZh ? '' : '-en'}`),
    quote(TENANT_ID),
    quote(ORGANIZATION_ID),
    quote(app.appId),
    quote(locale),
    quote(displayName),
    quote(subtitle),
    quote(shortDescription),
    quote(fullDescription),
    quote(whatsNew),
    quoteJson(keywords),
    now(),
    now(),
  ].join(', ');
}

function releaseNoteRow(app, locale) {
  const isZh = locale === 'zh-CN';
  const notes = isZh
    ? `• ${app.version} 初始上架。`
    : `• Initial store release ${app.version}.`;
  return [
    quote(`note-${app.appId}${locale === 'zh-CN' ? '' : '-en'}`),
    quote(TENANT_ID),
    quote(ORGANIZATION_ID),
    quote(`rel-${app.appId}-${app.versionCode}`),
    quote(locale),
    quote(notes),
    now(),
    now(),
  ].join(', ');
}

function valuesBlock(header, rows, conflictClause) {
  const body = rows.map((row) => `    (${row})`);
  const last = body.length - 1;
  return body
    .map((line, index) => (index === last ? `${line}${conflictClause};` : `${line},`))
    .join('\n')
    .replace(/^/, `${header}\nVALUES\n`);
}

function buildCommonSql(applications) {
  const sections = [];
  sections.push(
    '-- 015_workspace_applications.sql — workspace module applications (H5 / PC / Flutter /\n' +
      '-- mini-program / HarmonyOS) generated from sibling repositories\u2019\n' +
      '-- `apps/*/sdkwork.app.config.json` declarations.\n' +
      '-- Generated by `node database/seeds/.generate-workspace-applications.mjs`; do not hand-edit.\n',
  );

  sections.push(
    valuesBlock(
      'INSERT INTO appstore_app\n' +
        '    (id, tenant_id, organization_id, publisher_id, app_no, app_key, app_slug, display_name, default_locale, app_type, runtime_family, runtime_framework, app_status, distribution_status, review_status, monetization_mode, primary_category_id, age_rating_code, official_website_url, access_url, platforms, description, created_at, updated_at)',
      applications.map(applicationRow),
      '\nON CONFLICT (id) DO NOTHING',
    ),
  );

  sections.push(
    valuesBlock(
      'INSERT INTO appstore_listing\n' +
        '    (id, tenant_id, organization_id, publisher_id, listing_no, app_id, app_key, listing_slug, listing_type, pricing_model, listing_status, storefront_visibility, review_status, primary_category_id, default_locale, age_rating_code, comments_thread_id, featured_score, download_count, average_rating, rating_count, submitted_at, published_at, created_at, updated_at)',
      applications.map(listingRow),
      '\nON CONFLICT (id) DO NOTHING',
    ),
  );

  sections.push(
    valuesBlock(
      'INSERT INTO appstore_listing_media\n' +
        '    (id, tenant_id, organization_id, listing_id, media_role, media_resource_id, drive_node_id, platform_scope, sort_order, locale, created_at, updated_at)',
      applications.flatMap(mediaRows),
      '\nON CONFLICT (id) DO NOTHING',
    ),
  );

  sections.push(
    valuesBlock(
      'INSERT INTO appstore_release\n' +
        '    (id, tenant_id, organization_id, listing_id, release_no, channel_id, version_name, version_code, build_number, release_status, minimum_os_version, release_notes_default_locale, manifest_snapshot_json, submitted_at, approved_at, published_at, created_at, updated_at)',
      applications.map(releaseRow),
      '\nON CONFLICT (id) DO NOTHING',
    ),
  );

  sections.push(
    valuesBlock(
      'INSERT INTO appstore_app_platform\n' +
        '    (id, tenant_id, organization_id, app_id, platform_code, platform_status, package_identity, distribution_mode, config_json, created_at, updated_at)',
      applications.flatMap(appPlatformRows),
      '\nON CONFLICT (id) DO NOTHING',
    ),
  );

  const idList = applications.map((app) => `'${sqlText(app.appId)}'`).join(',\n    ');
  sections.push(
    `-- Bind each generated listing to its latest published release.\n` +
      `UPDATE appstore_listing l\n` +
      `SET current_release_id = (\n` +
      `    SELECT r.id FROM appstore_release r\n` +
      `    WHERE r.listing_id = l.id AND r.release_status = 'published'\n` +
      `    ORDER BY r.published_at DESC LIMIT 1\n` +
      `)\n` +
      `WHERE l.tenant_id = '${TENANT_ID}'\n` +
      `  AND l.id IN (\n    ${idList}\n)\n` +
      `  AND EXISTS (\n` +
      `    SELECT 1 FROM appstore_release r\n` +
      `    WHERE r.listing_id = l.id AND r.release_status = 'published'\n` +
      `  );`,
  );

  sections.push(
    `-- Primary category bindings for catalog filters (mirrors common/001_bootstrap.sql\n` +
      `-- but scoped to the generated listings, which use listing_status 'active').\n` +
      `INSERT INTO appstore_listing_category_binding\n` +
      `    (id, tenant_id, listing_id, category_id, is_primary, created_at)\n` +
      `SELECT\n` +
      `    'lcb-' || l.id,\n` +
      `    l.tenant_id,\n` +
      `    l.id,\n` +
      `    l.primary_category_id,\n` +
      `    1,\n` +
      `    CURRENT_TIMESTAMP\n` +
      `FROM appstore_listing l\n` +
      `WHERE l.tenant_id = '${TENANT_ID}'\n` +
      `  AND l.id IN (\n    ${idList}\n)\n` +
      `  AND l.primary_category_id IS NOT NULL\n` +
      `  AND l.primary_category_id <> ''\n` +
      `ON CONFLICT (tenant_id, listing_id, category_id) DO NOTHING;`,
  );

  sections.push(
    `-- Approved compliance profiles for the generated listings.\n` +
      `INSERT INTO appstore_compliance_profile\n` +
      `    (id, tenant_id, organization_id, listing_id, compliance_version, privacy_nutrition_json, content_rating_questionnaire_json, data_safety_json, target_audience_json, compliance_status, reviewed_by, reviewed_at, created_at, updated_at)\n` +
      `SELECT\n` +
      `    'compliance-' || l.id,\n` +
      `    l.tenant_id,\n` +
      `    l.organization_id,\n` +
      `    l.id,\n` +
      `    1,\n` +
      `    '{"dataCollected": ["usage", "diagnostics"], "dataLinkedToUser": false}',\n` +
      `    '{"ageRating": "' || l.age_rating_code || '"}',\n` +
      `    '{"encryptionInTransit": true, "encryptionAtRest": true}',\n` +
      `    '{"audience": "general"}',\n` +
      `    'approved',\n` +
      `    'seed-bootstrap',\n` +
      `    CURRENT_TIMESTAMP,\n` +
      `    CURRENT_TIMESTAMP,\n` +
      `    CURRENT_TIMESTAMP\n` +
      `FROM appstore_listing l\n` +
      `WHERE l.tenant_id = '${TENANT_ID}'\n` +
      `  AND l.id IN (\n    ${idList}\n)\n` +
      `ON CONFLICT (tenant_id, listing_id, compliance_version) DO NOTHING;`,
  );

  for (const region of ['CN', 'US']) {
    sections.push(
      `-- Regional availability (${region}) for the generated listings.\n` +
        `INSERT INTO appstore_regional_availability\n` +
        `    (id, tenant_id, organization_id, listing_id, region_code, availability_status, effective_at, expires_at, created_at, updated_at)\n` +
        `SELECT\n` +
        `    'region-' || l.id || '-${region.toLowerCase()}',\n` +
        `    l.tenant_id,\n` +
        `    l.organization_id,\n` +
        `    l.id,\n` +
        `    '${region}',\n` +
        `    'available',\n` +
        `    CURRENT_TIMESTAMP,\n` +
        `    NULL,\n` +
        `    CURRENT_TIMESTAMP,\n` +
        `    CURRENT_TIMESTAMP\n` +
        `FROM appstore_listing l\n` +
        `WHERE l.tenant_id = '${TENANT_ID}'\n` +
        `  AND l.id IN (\n    ${idList}\n)\n` +
        `ON CONFLICT (tenant_id, listing_id, region_code) DO NOTHING;`,
    );
  }

  sections.push(
    `-- Market-channel releases on the SDKWork storefront channel.\n` +
      `INSERT INTO appstore_market_release\n` +
      `    (id, tenant_id, organization_id, app_id, listing_id, release_id, channel_id, market_release_no, external_app_id, external_release_id, external_track, market_status, rollout_percent, countries_json, store_url, external_status_json, submitted_at, approved_at, released_at, rejected_at, last_synced_at, created_at, updated_at)\n` +
      `SELECT\n` +
      `    'mrel-' || r.id,\n` +
      `    r.tenant_id,\n` +
      `    r.organization_id,\n` +
      `    l.app_id,\n` +
      `    r.listing_id,\n` +
      `    r.id,\n` +
      `    '${MARKET_CHANNEL_ID}',\n` +
      `    'MR-' || UPPER(REPLACE(r.id, '-', '')),\n` +
      `    l.app_key,\n` +
      `    r.version_code,\n` +
      `    'production',\n` +
      `    'published',\n` +
      `    100,\n` +
      `    '["CN", "US"]',\n` +
      `    'https://appstore.sdkwork.local/apps/' || l.listing_slug,\n` +
      `    '{"syncState": "seeded"}',\n` +
      `    r.submitted_at,\n` +
      `    r.approved_at,\n` +
      `    r.published_at,\n` +
      `    NULL,\n` +
      `    CURRENT_TIMESTAMP,\n` +
      `    CURRENT_TIMESTAMP,\n` +
      `    CURRENT_TIMESTAMP\n` +
      `FROM appstore_release r\n` +
      `JOIN appstore_listing l\n` +
      `  ON l.id = r.listing_id\n` +
      ` AND l.tenant_id = r.tenant_id\n` +
      `WHERE r.tenant_id = '${TENANT_ID}'\n` +
      `  AND r.release_status = 'published'\n` +
      `  AND r.id IN (\n    ${applications.map((app) => `'${sqlText(`rel-${app.appId}-${app.versionCode}`)}'`).join(',\n    ')}\n)\n` +
      `ON CONFLICT (tenant_id, market_release_no) DO NOTHING;`,
  );

  return sections.join('\n\n') + '\n';
}

function buildLocaleSql(applications, locale) {
  const localeLabel = locale === 'zh-CN' ? 'zh-CN' : 'en-US';
  const sections = [];
  sections.push(
    `-- ${localeLabel} localizations for workspace module applications (generated).\n` +
      '-- Source: sibling repositories\u2019 `apps/*/sdkwork.app.config.json`; partner file of\n' +
      '-- common/016_workspace_applications.sql. Do not hand-edit.\n',
  );
  sections.push(
    valuesBlock(
      'INSERT INTO appstore_listing_localization\n' +
        '    (id, tenant_id, organization_id, listing_id, locale, display_name, subtitle, short_description, full_description, whats_new_summary, keywords_json, created_at, updated_at)',
      applications.map((app) => localizationRow(app, localeLabel)),
      '\nON CONFLICT (tenant_id, listing_id, locale) DO NOTHING',
    ),
  );
  sections.push(
    valuesBlock(
      'INSERT INTO appstore_release_note_localization\n' +
        '    (id, tenant_id, organization_id, release_id, locale, release_notes, created_at, updated_at)',
      applications.map((app) => releaseNoteRow(app, localeLabel)),
      '\nON CONFLICT (tenant_id, release_id, locale) DO NOTHING',
    ),
  );
  return sections.join('\n') + '\n';
}

function main() {
  const checkMode = process.argv.includes('--check');
  const workspaceIndex = process.argv.indexOf('--workspace');
  const workspaceRoot = workspaceIndex >= 0
    ? path.resolve(process.argv[workspaceIndex + 1])
    : path.resolve(repoRoot, '..');

  const { applications, skipped } = scanWorkspaceApplications(workspaceRoot);
  if (applications.length === 0) {
    console.error(`[workspace-applications] no applications found under ${workspaceRoot}`);
    process.exit(1);
  }

  const outputs = new Map([
    [OUTPUT_FILES.common, buildCommonSql(applications)],
    [OUTPUT_FILES.zh, buildLocaleSql(applications, 'zh-CN')],
    [OUTPUT_FILES.en, buildLocaleSql(applications, 'en-US')],
  ]);

  let drift = false;
  for (const [relativePath, content] of outputs) {
    const target = path.join(seedsRoot, relativePath);
    if (checkMode) {
      const existing = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
      if (existing !== content) {
        console.error(`[workspace-applications] drift: ${relativePath} is stale; re-run the generator`);
        drift = true;
      }
    } else {
      fs.writeFileSync(target, content, 'utf8');
    }
  }

  const familyCounts = {};
  for (const app of applications) {
    familyCounts[app.family] = (familyCounts[app.family] ?? 0) + 1;
  }
  console.log(
    `[workspace-applications] ${applications.length} applications from scan: ` +
      Object.entries(familyCounts)
        .sort()
        .map(([family, count]) => `${family}=${count}`)
        .join(', '),
  );
  for (const item of skipped) {
    const label = item.app ? `${item.repo}/${item.app}` : item.repo;
    console.warn(`[workspace-applications] skipped ${label}: ${item.reason}`);
  }
  if (drift) {
    process.exit(1);
  }
}

main();
