import fs from 'fs';
import path from 'path';

const ROOT = 'E:/sdkwork-space/sdkwork-appstore/apps/sdkwork-appstore-pc';
const SCAN_ROOTS = [
  'src/pages',
  'src/components',
  'src/auth',
  'packages',
];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== 'node_modules') walk(p, acc);
    else if (ent.name.endsWith('.tsx')) acc.push(p);
  }
  return acc;
}

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) keys.push(...flattenKeys(v, key));
    else keys.push(key);
  }
  return keys;
}

function loadLocaleExports(localeDir) {
  const map = {};
  function walkLocale(dir, nsPrefix = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walkLocale(p, nsPrefix);
      else if (ent.name.endsWith('.ts') && ent.name !== 'index.ts') {
        const content = fs.readFileSync(p, 'utf8');
        const m = content.match(/export const (\w+) = ({[\s\S]*});?\s*$/);
        if (!m) continue;
        try {
          const obj = Function(`return (${m[1] === 'consoleLocales' ? content.match(/export const consoleLocales = ({[\s\S]*});?\s*$/)[1] : m[2]})`)();
          const rel = path.relative(path.join(ROOT, 'src/i18n', path.basename(localeDir)), p).replace(/\\/g, '/');
          const parts = rel.split('/');
          const ns = parts[parts.length - 1].replace('.ts', '');
          map[ns] = obj;
        } catch {}
      }
    }
  }
  walkLocale(localeDir);
  return map;
}

const zh = loadLocaleExports(path.join(ROOT, 'src/i18n/zh-CN'));
const en = loadLocaleExports(path.join(ROOT, 'src/i18n/en'));

const allLocaleKeys = new Set();
for (const ns of Object.keys(zh)) {
  for (const k of flattenKeys(zh[ns])) allLocaleKeys.add(`${ns}.${k}`);
}

const files = SCAN_ROOTS.flatMap((r) => walk(path.join(ROOT, r)));

const noI18n = [];
const hardcoded = [];
const fallbackKeys = [];
const defaultValueKeys = [];

const tFallbackRe = /t\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g;
const tDefaultRe = /t\(\s*['"]([^'"]+)['"][^)]*defaultValue:\s*`([^`]+)`/g;
const chineseRe = /['"`][^'"`]*[\u4e00-\u9fff][^'"`]*['"`]/g;
const jsxTextRe = />([^<{][^<]{1,100})</g;

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  const hasI18n = /useTranslation|Trans\b|i18n\.t\(/.test(content);

  let m;
  while ((m = tFallbackRe.exec(content))) {
    const key = m[1];
    const fb = m[2];
    const ns = key.split('.')[0];
    const subKey = key.slice(ns.length + 1);
    const inLocale = zh[ns] && flattenKeys(zh[ns]).includes(subKey);
    fallbackKeys.push({ file: rel, line: content.slice(0, m.index).split('\n').length, key, fallback: fb, inLocale });
  }
  while ((m = tDefaultRe.exec(content))) {
    defaultValueKeys.push({ file: rel, line: content.slice(0, m.index).split('\n').length, key: m[1], defaultValue: m[2] });
  }

  if (!hasI18n) {
    const issues = [];
    if (/[\u4e00-\u9fff]/.test(content)) issues.push('chinese');
    if (/>[A-Za-z][^<{]{2,}</.test(content)) issues.push('english-jsx');
    if (/placeholder=["'][^"']+["']/.test(content)) issues.push('placeholder');
    if (/(aria-label|title)=["'][^"']+["']/.test(content)) issues.push('attr');
    if (issues.length) noI18n.push({ file: rel, issues });
  }

  // hardcoded Chinese in JSX spans not in t()
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('//') || line.includes('console.')) return;
    if (/[\u4e00-\u9fff]/.test(line) && !/t\(/.test(line) && !/import /.test(line) && !/\/\*|\*\//.test(line)) {
      if (/>([^<{]*[\u4e00-\u9fff][^<{]*)</.test(line) || /placeholder=/.test(line) || /title=/.test(line) || /aria-label=/.test(line) || /setSubmitError|setError|alert\(/.test(line)) {
        hardcoded.push({ file: rel, line: i + 1, content: line.trim().slice(0, 120), type: 'hardcoded-zh' });
      }
    }
    if (!hasI18n && />[A-Za-z][^<{]{3,}</.test(line) && !/className|http|www|import|export|type |interface /.test(line)) {
      hardcoded.push({ file: rel, line: i + 1, content: line.trim().slice(0, 120), type: 'hardcoded-en-no-i18n' });
    }
  });
}

// locale mismatches
const localeMismatch = [];
for (const ns of new Set([...Object.keys(zh), ...Object.keys(en)])) {
  if (!zh[ns] || !en[ns]) {
    localeMismatch.push({ ns, type: !zh[ns] ? 'missing-zh' : 'missing-en' });
    continue;
  }
  const zk = new Set(flattenKeys(zh[ns]));
  const ek = new Set(flattenKeys(en[ns]));
  const onlyZh = [...zk].filter((k) => !ek.has(k));
  const onlyEn = [...ek].filter((k) => !zk.has(k));
  if (onlyZh.length || onlyEn.length) localeMismatch.push({ ns, onlyZh, onlyEn });
}

console.log(JSON.stringify({ localeMismatch, noI18n, fallbackKeysCount: fallbackKeys.length, fallbackKeysMissing: fallbackKeys.filter(f => !f.inLocale), defaultValueKeys, noI18nCount: noI18n.length, hardcodedSample: hardcoded.slice(0, 200), hardcodedTotal: hardcoded.length }, null, 2));
