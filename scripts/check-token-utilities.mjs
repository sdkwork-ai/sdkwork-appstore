#!/usr/bin/env node
/**
 * Token-utility gate for the App Store PC application.
 *
 * `check-theme-tokens.mjs` proves no hardcoded colour is left. It cannot prove
 * the reverse failure: a className that names a token utility **Tailwind never
 * generates** produces no CSS at all, so the element renders unstyled while the
 * counter reads clean. This gate closes that hole and adds the consistency
 * measurement the alignment work exists for:
 *
 *   1. Compile the application with the REAL sources and the real Tailwind
 *      engine, then assert every `*-store-*` utility the components use is
 *      actually emitted. A typo, a renamed role, or a role that was never added
 *      to `src/index.css` shows up here.
 *   2. For every (css property family, token role) pair, assert there is
 *      exactly ONE bare token spelling. Two spellings for one pair means the
 *      same role is still being named two ways — the drift this gate forbids.
 *
 * Exits 0 only when both hold; 2 on a refused (empty) scan so a wrong `--root`
 * cannot read as clean.
 *
 * Usage: node scripts/check-token-utilities.mjs [--root apps/sdkwork-appstore-pc] [--json]
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, sep, dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { classSegments, scanTags } from './lib/jsx-class-scan.mjs'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const rootArg = args.includes('--root') ? args[args.indexOf('--root') + 1] : 'apps/sdkwork-appstore-pc'
const asJson = args.includes('--json')
const APP = resolve(REPO, rootArg)
const SKIP = new Set(['node_modules', 'dist', 'lib', '.git', 'build'])

/** Resolve a Tailwind engine entry the way the app's own build does: through
 *  `@tailwindcss/vite`, which is the package the app actually depends on. A
 *  bare `require.resolve` from the app root fails — the engines are only
 *  reachable transitively, and pnpm's store path carries a version suffix. */
function resolveEngine(name) {
  for (const from of [`${APP}/package.json`, `${REPO}/package.json`]) {
    try {
      const req = createRequire(from)
      const viaVite = req.resolve('@tailwindcss/vite/package.json')
      const engine = createRequire(viaVite).resolve(`${name}/package.json`)
      return dirname(engine)
    } catch { /* try the next anchor */ }
  }
  const store = `${REPO}/node_modules/.pnpm`
  const prefix = `@tailwindcss+${name.replace('@tailwindcss/', '')}@`
  const hit = readdirSync(store).filter((d) => d.startsWith(prefix)).sort().at(-1)
  if (!hit) throw new Error(`cannot locate ${name}`)
  return `${store}/${hit}/node_modules/${name}`
}

function walk(dir, out = []) {
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(join(dir, e.name), out) }
    else if (/\.tsx?$/.test(e.name) && !/\.d\.ts$/.test(e.name)) out.push(join(dir, e.name))
  }
  return out
}

/* Class text comes from the shared scanner. The regex that used to live here
   (`\{([\s\S]*?)\}\s*(?=[\s/>])`) stopped at the first `}` — for a template
   literal that is the `}` of `${`, so the literal's static chunk was cut off
   and its token classes never entered the "is it generated?" set. */
const TOKEN = /(?:^|\s)((?:[a-z-]+:)*([a-z-]+)-store-([a-z-]+)(?:\/\d+)?)(?=\s|$)/g

const files = walk(APP)
const used = new Map() // class -> Set(files)
const rolePairs = new Map() // "property/role" -> Set(bare token)
for (const f of files) {
  const rel = relative(APP, f).split(sep).join('/')
  const text = readFileSync(f, 'utf8')
  const values = []
  for (const tag of scanTags(text)) {
    for (const seg of classSegments(text, tag)) values.push(seg.value)
  }
  for (const v of values) {
    for (const m of v.matchAll(TOKEN)) {
      if (!used.has(m[1])) used.set(m[1], new Set())
      used.get(m[1]).add(rel)
      const pair = `${m[2]}-${m[3]}`
      if (!rolePairs.has(pair)) rolePairs.set(pair, new Set())
      rolePairs.get(pair).add(`${m[2]}-store-${m[3]}`)
    }
  }
}

if (files.length === 0 || used.size === 0) {
  console.error(`token-utilities: refusing to report success on an empty scan (root=${rootArg})`)
  process.exit(2)
}

const { compile } = await import(pathToFileURL(`${resolveEngine('@tailwindcss/node')}/dist/index.mjs`).href)
const { Scanner } = await import(pathToFileURL(`${resolveEngine('@tailwindcss/oxide')}/index.js`).href)
const compiler = await compile(readFileSync(`${APP}/src/index.css`, 'utf8'), { base: APP, onDependency: () => {} })
const candidates = new Scanner({ sources: [{ base: APP, pattern: '**/*.{ts,tsx}', negated: false }] }).scan()
const css = compiler.build(candidates)

// Tailwind escapes non-word selector characters (`focus:` -> `.focus\:`), so a
// search for the unescaped spelling reports a false MISS for every variant and
// every alpha class.
const cssEscape = (c) => c.replace(/[^\w-]/g, (m) => '\\' + m)
const regexEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const missing = [...used.keys()].sort().filter((cls) => {
  const sel = regexEscape('.' + cssEscape(cls))
  return !new RegExp(`${sel}(?![\\w-])`).test(css)
})
const drifted = [...rolePairs.entries()].filter(([, s]) => s.size > 1).sort()

if (asJson) {
  console.log(JSON.stringify({ root: rootArg, files: files.length, candidates: candidates.length, bytes: css.length, used: used.size, missing, drifted: drifted.map(([p, s]) => [p, [...s]]) }, null, 2))
} else {
  console.log(`token-utilities: ${files.length} source files, ${candidates.length} candidates, ${css.length} css bytes`)
  console.log(`token-utilities: ${used.size} distinct *-store-* utilities used; ${missing.length} not generated`)
  for (const m of missing) console.log(`  MISSING ${m}  (used in ${[...used.get(m)].slice(0, 3).join(', ')})`)
  console.log(`token-utilities: ${rolePairs.size} (property, role) pairs; ${drifted.length} spelled more than one way`)
  for (const [pair, s] of drifted) console.log(`  DRIFT ${pair}: ${[...s].join(' ')}`)
}
process.exit(missing.length === 0 && drifted.length === 0 ? 0 : 1)
