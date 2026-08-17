import fs from 'fs';
import path from 'path';

const ROOT = 'E:/sdkwork-space/sdkwork-appstore/apps/sdkwork-appstore-pc';
const scanDirs = ['src/pages', 'src/components', 'src/auth', 'src/providers', 'packages'].map((d) =>
  path.join(ROOT, d),
);

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
  try {
    return eval('(' + m[1] + ')');
  } catch {
    return null;
  }
}

const zh = {};
for (const dir of ['appstore/storefront', 'appstore/console', 'appstore/system']) {
  const base = path.join(ROOT, 'src/i18n/zh-CN', dir);
  if (!fs.existsSync(base)) continue;
  for (const f of fs.readdirSync(base)) {
    if (!f.endsWith('.ts')) continue;
    const ns = f.replace('.ts', '') === 'console' ? 'console' : f.replace('.ts', '');
    const obj = parseExport(path.join(base, f));
    if (obj) zh[ns] = obj;
  }
}

const localeKeys = new Set();
for (const [ns, obj] of Object.entries(zh)) {
  for (const k of flattenKeys(obj)) localeKeys.add(`${ns}.${k}`);
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && !['node_modules', 'dist', 'i18n'].includes(ent.name)) walk(p, acc);
    else if (ent.name.endsWith('.tsx')) acc.push(p);
  }
  return acc;
}

const files = scanDirs.flatMap((d) => walk(d, []));
const missingKeys = [];
const hardcoded = [];
const tKeyRe = /t\(\s*['"]([^'"]+)['"]/g;

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  let m;
  while ((m = tKeyRe.exec(content))) {
    const key = m[1];
    const ns = key.split('.')[0];
    if (!localeKeys.has(key) && zh[ns]) {
      missingKeys.push({ file: rel, line: content.slice(0, m.index).split('\n').length, key });
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import ')) return;
    if (trimmed.includes('t(')) return;
    if (/status\s*===/.test(trimmed)) return;
    if (/value:\s*['"][\u4e00-\u9fff]/.test(trimmed)) return;
    if (/setState\(['"][\u4e00-\u9fff]/.test(trimmed)) return;

    if (/[\u4e00-\u9fff]/.test(line)) {
      hardcoded.push({ file: rel, line: idx + 1, kind: 'zh', snippet: trimmed.slice(0, 100) });
    }

    const jsxEn = line.match(/>([A-Za-z][A-Za-z0-9 ,.'!?&/-]{4,})</);
    if (jsxEn) {
      hardcoded.push({ file: rel, line: idx + 1, kind: 'en-jsx', snippet: trimmed.slice(0, 100) });
    }

    const attr = line.match(/(placeholder|aria-label|title|alt)=["']([^"{\n]+)["']/);
    if (attr && !/^(https:|1\.0\.0|1\.2\.0|12$|thumb|Full view|Preview|MIT|app\.preview|m\.preview)/.test(attr[2])) {
      hardcoded.push({ file: rel, line: idx + 1, kind: 'attr', attr: attr[1], snippet: attr[2].slice(0, 80) });
    }
  });
}

console.log('MISSING_KEYS', JSON.stringify(missingKeys, null, 2));
console.log('HARDCODED', JSON.stringify(hardcoded, null, 2));
