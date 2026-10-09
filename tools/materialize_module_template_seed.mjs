#!/usr/bin/env node
// materialize_module_template_seed.mjs — regenerate the SDKWork module app
// template seed (database/seeds/common/015_module_app_templates.sql) from the
// sibling module checkouts under the sdkwork-space workspace root.
//
// The 应用模板库 (appstore_app_template) must carry one listing application per
// standalone module's H5 / PC / Flutter / mini-program application root, and
// the initialization must stay complete as modules gain or lose app roots.
// Hand-written INSERTs drift the moment a module lands a new client, so this
// generator scans `../sdkwork-*/apps/<module>-{pc,h5,flutter-mobile,
// mini-program}` and materializes deterministic, idempotent seed SQL.
//
// Usage (from the repository root):
//   node tools/materialize_module_template_seed.mjs           # regenerate
//   node tools/materialize_module_template_seed.mjs --check   # verify no drift
//
// Determinism contract: ids and uuids are derived from the template code with
// FNV-1a (BigInt math only — ids exceed Number.MAX_SAFE_INTEGER), rows are
// emitted in (module, form) order, and the only wall-clock value is
// CURRENT_TIMESTAMP inside the SQL itself. Re-running the generator on the
// same workspace state must produce byte-identical output.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const workspaceRoot = path.dirname(repoRoot);
const seedRelative = path.join('database', 'seeds', 'common', '015_module_app_templates.sql');
const seedPath = path.join(repoRoot, seedRelative);

const TENANT_ID = 100001;
const OWNER_USER_ID = 1;
const CATEGORY_CODE = '官方应用';

// App-root form suffix → template_platform vocabulary shared with the
// storefront platform filter and the catalog API (H5 | PC | FLUTTER |
// MINIPROGRAM).
const FORMS = [
  { suffix: 'pc', platform: 'PC', label: 'PC 应用' },
  { suffix: 'h5', platform: 'H5', label: 'H5 应用' },
  { suffix: 'flutter-mobile', platform: 'FLUTTER', label: 'Flutter 应用' },
  { suffix: 'mini-program', platform: 'MINIPROGRAM', label: '小程序应用' },
];

function fnv1a64(text) {
  let hash = 0xcbf29ce484222325n;
  const fnvPrime = 0x100000001b3n;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= BigInt(text.charCodeAt(i));
    hash = (hash * fnvPrime) & 0xffffffffffffffffn;
  }
  return hash;
}

function deriveTemplateId(code) {
  // Range [6.4e17, 6.41e17): inside BIGINT, above the demo seed id block, and
  // computed in BigInt space because the values exceed 2^53.
  const id = 640000000000000000n + (fnv1a64(`id:${code}`) % 1000000000000000n);
  return id.toString();
}

function deriveTemplateUuid(code) {
  const slug = code.replace(/[^a-z0-9]/g, '').slice(0, 23).padEnd(23, '0');
  const digest = fnv1a64(`uuid:${code}`).toString(36).slice(0, 6).padStart(6, '0');
  return `tpl${slug}${digest}`;
}

function sqlString(value) {
  return `'${String(value ?? '').replace(/'/g, "''")}'`;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function readPubspec(appRoot) {
  try {
    return fs.readFileSync(path.join(appRoot, 'pubspec.yaml'), 'utf8');
  } catch {
    return null;
  }
}

function moduleGitUrl(moduleRoot, moduleName) {
  const fallback = `https://github.com/sdkwork-ai/${moduleName}.git`;
  try {
    const url = execFileSync('git', ['-C', moduleRoot, 'remote', 'get-url', 'origin'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return url || fallback;
  } catch {
    return fallback;
  }
}

function detectFramework(appRoot, config, packageJson) {
  const appType = config?.app?.appType ?? '';
  if (appType === 'APP_FLUTTER' || readPubspec(appRoot)) return 'Flutter';
  if (appType === 'APP_UNIAPP') return 'uni-app';
  const deps = { ...(packageJson?.dependencies ?? {}), ...(packageJson?.devDependencies ?? {}) };
  if (deps['@dcloudio/uni-app']) return 'uni-app';
  if (deps.vue) return 'Vue';
  if (deps.react) return 'React';
  return '';
}

function detectLanguage(appRoot, framework, packageJson) {
  if (framework === 'Flutter') return 'Dart';
  if (fs.existsSync(path.join(appRoot, 'tsconfig.json'))) return 'TypeScript';
  const deps = { ...(packageJson?.dependencies ?? {}), ...(packageJson?.devDependencies ?? {}) };
  return deps.typescript ? 'TypeScript' : '';
}

function detectRuntime(config) {
  return config?.runtime?.family ?? '';
}

function templateDisplayName(displayName, label, platform) {
  const keyword = { PC: 'pc', H5: 'h5', FLUTTER: 'flutter', MINIPROGRAM: 'mini' }[platform];
  if (displayName.toLowerCase().includes(keyword)) return displayName;
  return `${displayName} · ${label}`;
}

function scanModuleApps() {
  const rows = [];
  const moduleDirs = fs
    .readdirSync(workspaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('sdkwork-'))
    .map((entry) => entry.name)
    .sort();

  for (const moduleName of moduleDirs) {
    const moduleRoot = path.join(workspaceRoot, moduleName);
    const appsRoot = path.join(moduleRoot, 'apps');
    if (!fs.existsSync(appsRoot)) continue;

    for (const form of FORMS) {
      const appRoot = path.join(appsRoot, `${moduleName}-${form.suffix}`);
      if (!fs.existsSync(appRoot)) continue;

      const config = readJson(path.join(appRoot, 'sdkwork.app.config.json'));
      const packageJson = readJson(path.join(appRoot, 'package.json'));

      const appKey = config?.app?.key ?? packageJson?.name ?? `${moduleName}-${form.suffix}`;
      const rawName = config?.app?.displayName ?? config?.app?.name ?? packageJson?.name ?? appKey;
      const description =
        config?.app?.description ?? packageJson?.description ?? '';
      const framework = detectFramework(appRoot, config, packageJson);
      const language = detectLanguage(appRoot, framework, packageJson);
      const runtime = detectRuntime(config);
      const templateCode = `tpl-mod-${moduleName.replace(/^sdkwork-/, '')}-${form.suffix}`;
      const templateName = templateDisplayName(rawName, form.label, form.platform);
      const fallbackDescription = `${rawName} — ${moduleName} ${form.label}。`;
      const metadata = {
        authorName: 'SDKWork Modules',
        isOfficial: true,
        tags: [moduleName.replace(/^sdkwork-/, ''), form.suffix],
        moduleKey: moduleName,
        appKey,
        appType: config?.app?.appType ?? '',
        sourcePath: `${moduleName}/apps/${moduleName}-${form.suffix}`,
        relatedAppId: templateCode,
        usageCount: 0,
        rating: 0,
        previewImage: '',
        screenshots: [],
      };

      rows.push({
        moduleName,
        form,
        appRoot,
        templateCode,
        templateName: templateName.slice(0, 255),
        description: (description || fallbackDescription).slice(0, 2000),
        categoryCode: CATEGORY_CODE,
        templateType: 'APP',
        framework,
        language,
        runtime,
        gitRepoUrl: moduleGitUrl(moduleRoot, moduleName),
        gitRef: 'main',
        metadata,
      });
    }
  }

  return rows;
}

function renderSeedSql(rows) {
  const lines = [];
  lines.push('-- 015_module_app_templates.sql — SDKWork module application templates.');
  lines.push('-- GENERATED by tools/materialize_module_template_seed.mjs; do not hand-edit.');
  lines.push('-- Regenerate with: node tools/materialize_module_template_seed.mjs');
  lines.push('-- One listing per standalone module application root under sdkwork-space:');
  lines.push('-- apps/<module>-{pc,h5,flutter-mobile,mini-program} → template_platform');
  lines.push('-- PC | H5 | FLUTTER | MINIPROGRAM. Idempotent upsert on (id); ids and');
  lines.push('-- uuids are deterministic FNV-1a derivations of template_code.');
  lines.push('');
  lines.push('INSERT INTO appstore_app_template');
  lines.push('    (id, uuid, tenant_id, organization_id, data_scope, status, created_at, updated_at, version, metadata, template_no, template_code, template_name, description, category_code, template_type, template_platform, framework, language, icon_media_resource_id, visibility, publish_status, featured, sort_weight, owner_user_id, git_repo_url, git_ref, capability_manifest, published_at)');
  lines.push('VALUES');

  const seenIds = new Map();
  const seenUuids = new Map();
  const moduleIndex = new Map();
  const valueRows = [];

  for (const row of rows) {
    const id = deriveTemplateId(row.templateCode);
    const uuid = deriveTemplateUuid(row.templateCode);
    if (seenIds.has(id)) {
      throw new Error(`template id collision between ${seenIds.get(id)} and ${row.templateCode}`);
    }
    if (seenUuids.has(uuid)) {
      throw new Error(`template uuid collision between ${seenUuids.get(uuid)} and ${row.templateCode}`);
    }
    seenIds.set(id, row.templateCode);
    seenUuids.set(uuid, row.templateCode);

    if (!moduleIndex.has(row.moduleName)) {
      moduleIndex.set(row.moduleName, moduleIndex.size + 1);
    }

    const values = [
      id,
      sqlString(uuid),
      String(TENANT_ID),
      '0',
      '0',
      '1',
      'CURRENT_TIMESTAMP',
      'CURRENT_TIMESTAMP',
      '0',
      `${sqlString(JSON.stringify(row.metadata))}::jsonb`,
      sqlString(row.templateCode),
      sqlString(row.templateCode),
      sqlString(row.templateName),
      sqlString(row.description),
      sqlString(row.categoryCode),
      sqlString(row.templateType),
      sqlString(row.form.platform),
      sqlString(row.framework),
      sqlString(row.language),
      sqlString(`mr-${row.templateCode}-icon`),
      '1',
      '1',
      'FALSE',
      String(moduleIndex.get(row.moduleName)),
      String(OWNER_USER_ID),
      sqlString(row.gitRepoUrl),
      sqlString(row.gitRef),
      `'{\"templateType\": \"APP\", \"capabilities\": [\"模块应用\", \"独立部署\"]}'::jsonb`,
      'CURRENT_TIMESTAMP',
    ];
    valueRows.push(`    (${values.join(', ')})`);
  }
  lines.push(valueRows.join(',\n'));
  lines.push('ON CONFLICT (id) DO UPDATE SET');
  lines.push('    uuid = EXCLUDED.uuid,');
  lines.push('    metadata = EXCLUDED.metadata,');
  lines.push('    template_no = EXCLUDED.template_no,');
  lines.push('    template_code = EXCLUDED.template_code,');
  lines.push('    template_name = EXCLUDED.template_name,');
  lines.push('    description = EXCLUDED.description,');
  lines.push('    category_code = EXCLUDED.category_code,');
  lines.push('    template_type = EXCLUDED.template_type,');
  lines.push('    template_platform = EXCLUDED.template_platform,');
  lines.push('    framework = EXCLUDED.framework,');
  lines.push('    language = EXCLUDED.language,');
  lines.push('    icon_media_resource_id = EXCLUDED.icon_media_resource_id,');
  lines.push('    visibility = EXCLUDED.visibility,');
  lines.push('    publish_status = EXCLUDED.publish_status,');
  lines.push('    featured = EXCLUDED.featured,');
  lines.push('    sort_weight = EXCLUDED.sort_weight,');
  lines.push('    owner_user_id = EXCLUDED.owner_user_id,');
  lines.push('    git_repo_url = EXCLUDED.git_repo_url,');
  lines.push('    git_ref = EXCLUDED.git_ref,');
  lines.push('    capability_manifest = EXCLUDED.capability_manifest,');
  lines.push('    published_at = EXCLUDED.published_at,');
  lines.push('    deleted_at = NULL,');
  lines.push('    updated_at = CURRENT_TIMESTAMP;');
  lines.push('');
  return `${lines.join('\n')}`;
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const rows = scanModuleApps();

  const byForm = new Map(FORMS.map((form) => [form.platform, 0]));
  const modules = new Set();
  for (const row of rows) {
    byForm.set(row.form.platform, byForm.get(row.form.platform) + 1);
    modules.add(row.moduleName);
  }

  const sql = renderSeedSql(rows);
  if (checkOnly) {
    const committed = fs.readFileSync(seedPath, 'utf8');
    if (committed !== sql) {
      console.error(
        `seed drift: ${seedRelative} does not match the current sdkwork-space scan (${rows.length} templates). Re-run: node tools/materialize_module_template_seed.mjs`,
      );
      process.exitCode = 1;
      return;
    }
    console.log(`seed ok: ${rows.length} module app templates across ${modules.size} modules match ${seedRelative}`);
    return;
  }

  fs.writeFileSync(seedPath, sql, 'utf8');
  console.log(
    `wrote ${seedRelative}: ${rows.length} templates across ${modules.size} modules ` +
      `(PC ${byForm.get('PC')}, H5 ${byForm.get('H5')}, FLUTTER ${byForm.get('FLUTTER')}, MINIPROGRAM ${byForm.get('MINIPROGRAM')})`,
  );
}

main();
