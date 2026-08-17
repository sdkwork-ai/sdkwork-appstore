import fs from 'fs';
import path from 'path';

const ROOT = 'E:/sdkwork-space/sdkwork-appstore/apps/sdkwork-appstore-pc';

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) keys.push(...flattenKeys(v, key));
    else keys.push(key);
  }
  return keys;
}

function parseExport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const m = content.match(/export const \w+ = (\{[\s\S]*\});?\s*$/);
  if (!m) return null;
  try { return eval('(' + m[1] + ')'); } catch { return null; }
}

const zh = {};
for (const dir of ['appstore/storefront', 'appstore/console', 'appstore/system']) {
  const base = path.join(ROOT, 'src/i18n/zh-CN', dir);
  if (!fs.existsSync(base)) continue;
  for (const f of fs.readdirSync(base)) {
    if (!f.endsWith('.ts')) continue;
    const obj = parseExport(path.join(base, f));
    if (obj) zh[f.replace('.ts', '') === 'console' ? 'console' : f.replace('.ts', '')] = obj;
  }
}
// fix console export name
const consoleFile = path.join(ROOT, 'src/i18n/zh-CN/appstore/console/console.ts');
if (fs.existsSync(consoleFile)) zh.console = parseExport(consoleFile);

const localeKeys = new Set();
for (const [ns, obj] of Object.entries(zh)) {
  for (const k of flattenKeys(obj)) localeKeys.add(`${ns}.${k}`);
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== 'node_modules') walk(p, acc);
    else if (ent.name.endsWith('.tsx')) acc.push(p);
  }
  return acc;
}

const scanDirs = ['src/pages', 'src/components', 'src/auth', 'packages'].map(d => path.join(ROOT, d));
const files = scanDirs.flatMap((d) => walk(d, []));

const missingKeys = [];
const withFallback = [];
const noI18nFiles = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  const hasI18n = /useTranslation|Trans\b|i18n\.t\(/.test(content);

  const re = /t\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]*)['"]/g;
  let m;
  while ((m = re.exec(content))) {
    const key = m[1];
    const fb = m[2];
    const inLocale = localeKeys.has(key);
    withFallback.push({ file: rel, line: content.slice(0, m.index).split('\n').length, key, fallback: fb, inLocale });
    if (!inLocale) missingKeys.push({ file: rel, line: content.slice(0, m.index).split('\n').length, key, fallback: fb });
  }

  if (!hasI18n && (/[\u4e00-\u9fff]/.test(content) || />[A-Za-z][^<{]{3,}</.test(content) || /placeholder=["'][^"']+["']/.test(content) || /(aria-label|title)=["'][^"']+["']/.test(content))) {
    noI18nFiles.push(rel);
  }
}

console.log('MISSING_KEYS', JSON.stringify(missingKeys, null, 2));
console.log('NO_I18N', JSON.stringify(noI18nFiles.sort(), null, 2));
