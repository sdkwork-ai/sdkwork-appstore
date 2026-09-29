#!/usr/bin/env node
/**
 * Theme-token conformance scanner for the App Store PC application.
 *
 * `THEME_DARKMODE_SPEC.md` §9 runs F1/F2/F4 mechanically and leaves the
 * pairing/hexaudit (F5/F6) and style-isolation (F8) rules to the conformance
 * matrix and code review. This tool makes those three rules mechanical for this
 * repository so the alignment work can be measured and re-run instead of
 * eyeballed:
 *
 *   F5  a class list carries a raw light palette utility (`bg-white`,
 *       `text-gray-900`, `border-gray-200`, `bg-[#f…]`, …) with no `dark:`
 *       counterpart in the same class list and no semantic token class
 *   F6  a themeable role is written as a hardcoded hex — either an
 *       arbitrary-value utility (`bg-[#181a20]`) or a hex literal inside the
 *       style object of a themed element
 *   F8  a stylesheet that is compiled into a host document restyles `body`/
 *       `html`, or uses `!important` to win a theme cascade fight
 *
 * Usage:
 *   node scripts/check-theme-tokens.mjs [--root <app-root>] [--json] [--quiet]
 *
 * Exit: 0 = no findings, 1 = findings, 2 = refused (empty scan / bad root).
 * An empty scan never reports success — a wrong root must not read as clean.
 *
 * Allowlist: media/export surfaces that are mode-agnostic by design
 * (`THEME_DARKMODE_SPEC.md` §9 exemptions) plus the token definition file
 * itself. Keep it short and give every entry a reason.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { classSegments, scanTags } from './lib/jsx-class-scan.mjs'

const args = process.argv.slice(2)
let rootArg = null
let asJson = false
let quiet = false
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--root') rootArg = args[++i]
  else if (args[i] === '--json') asJson = true
  else if (args[i] === '--quiet') quiet = true
  else if (!args[i].startsWith('--')) rootArg = args[i]
}
if (rootArg === null) {
  console.error('usage: node scripts/check-theme-tokens.mjs --root <app-root> [--json] [--quiet]')
  process.exit(2)
}
const root = rootArg.replaceAll('\\', '/')

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'lib', 'coverage', '.workbuddy', 'target', 'generated', 'public'])

/**
 * Paths whose themeable hex is intentional, as `[path fragment, reason]`.
 *
 * Empty on purpose. `THEME_DARKMODE_SPEC.md` §9 exempts media/export surfaces
 * (photo and video canvases, PDF paper, print sheets) because there the medium,
 * not the theme, owns the colour; this app root has no such surface yet. Add an
 * entry only with a reason, so the exemption list stays auditable.
 */
const PATH_EXEMPTIONS = []

/** Raw palette utilities: any Tailwind palette name + step, i.e. layer-1 vocabulary. */
const PALETTE = 'white|black|gray|slate|zinc|neutral|stone|blue|indigo|sky|cyan|teal|emerald|green|lime|amber|orange|red|rose|pink|purple|violet|fuchsia'
const RAW_LIGHT = new RegExp(
  `^(?:bg|text|border|divide|ring|from|to|via|fill|stroke|placeholder|outline|shadow|accent|decoration|caret)-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?$`,
)
/** Semantic token classes the scanner accepts as a substitute for a dark: pair. */
const TOKEN_CLASS = /^(?:bg|text|border|divide|ring|fill|stroke|placeholder|outline|from|to|via)-(?:brand|surface|panel|canvas|elevated|overlay|field|primary|secondary|muted|inverse|danger|success|warning|info|border|subtle|raised|line|ink|on-brand)(?:-|$)/
/**
 * Ink that sits *on* a fill. `THEME_DARKMODE_SPEC.md` §9 exempts "badges on
 * colored fills", so `text-white` beside a background is not a pairing defect —
 * only a bare `text-white` on an unthemed surface is.
 */
const INK_ON_FILL = /^(?:text|fill|stroke)-(?:white|black)$/
const VARIANTS = /^(?:dark|light|hover|focus|focus-visible|active|disabled|enabled|visited|group-hover|group-focus|peer-checked|peer-focus|first|last|odd|even|sm|md|lg|xl|2xl|motion-safe|motion-reduce|rtl|ltr|sdk-dark)\:/
const ARB_HEX_UTILITY = new RegExp(`(?:bg|text|border|ring|from|to|via|fill|stroke|shadow|outline|placeholder|divide|accent|caret)-\\[#[0-9a-fA-F]{3,8}\\]`, 'g')

function stripVariants(t) {
  let out = t
  for (;;) {
    const next = out.replace(VARIANTS, '')
    if (next === out) return out
    out = next
  }
}

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.agents') continue
    if (SKIP_DIRS.has(e.name)) continue
    if (/^dist[-.\d]*$/.test(e.name) || /^node_modules/.test(e.name) || /^\.tmp/.test(e.name)) continue
    const full = join(dir, e.name)
    let isDir = e.isDirectory()
    if (!isDir && e.isSymbolicLink()) {
      try {
        isDir = statSync(full).isDirectory()
      } catch {
        continue
      }
    }
    if (isDir) walk(full, out)
    else out.push(full)
  }
  return out
}

/**
 * Class text in a source file, as `{ value, index }` with `index` pointing at
 * the literal so a finding can name its line.
 *
 * Uses the shared scanner rather than a set of literal regexes. The regexes
 * that used to live here matched `className="…"`, `'…'`, a template literal
 * with no interpolation, and a lone `{'…'}` / `{"…"}` — but **not**
 * `className={cond ? 'a' : 'b'}`, which is how a selected/unselected state is
 * written. So the pairing rule never looked at the branch that usually lacks
 * its `dark:` twin, and this gate's count was an undercount of exactly the
 * defect it exists to find.
 */
function classStrings(src) {
  const out = []
  for (const tag of scanTags(src)) {
    for (const seg of classSegments(src, tag)) out.push({ value: seg.value, index: seg.start })
  }
  return out
}

const findings = []
const perPackageF5 = new Map()
let scanned = 0

for (const file of walk(root)) {
  const rel = relative(root, file).split(sep).join('/')
  const isCss = /\.css$/.test(file)
  // Sources are TS/TSX. Compiled `.js`/`.d.ts` siblings are emitted in place next
  // to their sources and are gitignored (492 of them in this app root), so
  // scanning them would count every finding twice.
  const isCode = /\.(tsx|ts)$/.test(file) && !file.endsWith('.d.ts')
  if (!isCss && !isCode) continue

  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  scanned += 1
  const hexExempt = PATH_EXEMPTIONS.some(([frag]) => rel.includes(frag))

  if (isCss) {
    // F8: host-compiled sheets must not restyle the document root or win theme
    // fights with !important. Only sheets that compile `dark:` are in scope.
    //
    // §7.3 lets the application's own page sheet (`src/index.css`) own
    // `html`/`body` — that is the standalone page — provided the host compile
    // neutralizes those rules for embedding, which the harness does by wrapping
    // the sheet in the embedded-app cascade layer. Feature sheets under
    // `packages/*/src` have no such guarantee, so the rule bites there.
    const isPageSheet = rel === 'src/index.css'
    if (text.includes('dark')) {
      const lines = text.split('\n')
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i]
        const documentRootRule = /^\s*(?:html(?:\.\S+)?\s*)?body\s*(?:,|\{)/.test(line) || /^\s*html\s*(?:,|\{)/.test(line)
        if (documentRootRule && !isPageSheet) {
          findings.push({ rule: 'F8', severity: 'P1', path: rel, line: i + 1, detail: `document-root rule in a feature sheet (page sheets may own html/body): ${line.trim().slice(0, 80)}` })
        }
        if (/!important/.test(line) && /(?:color|background|border|--)/.test(line)) {
          findings.push({ rule: 'F8', severity: 'P1', path: rel, line: i + 1, detail: `!important theme declaration: ${line.trim().slice(0, 80)}` })
        }
      }
    }
    continue
  }

  const pkg = rel.split('/').slice(0, 2).join('/')
  for (const { value: cls, index } of classStrings(text)) {
    const tokens = cls.split(/\s+/).filter(Boolean)
    if (tokens.length === 0) continue
    const hasDark = tokens.some(t => t.includes('dark:') || t.includes('sdk-dark:'))
    const hasToken = tokens.some(t => TOKEN_CLASS.test(stripVariants(t)))
    const fills = tokens.some(t => /^bg-/.test(stripVariants(t)))
    const rawLight = tokens.filter(t => {
      const bare = stripVariants(t)
      if (!RAW_LIGHT.test(bare)) return false
      // Ink on a fill is the documented exemption, not an unpaired utility.
      return !(fills && INK_ON_FILL.test(bare))
    })
    if (rawLight.length > 0 && !hasDark && !hasToken) {
      const line = text.slice(0, index).split('\n').length
      findings.push({ rule: 'F5', severity: 'P1', path: rel, line, detail: `unpaired light utili${rawLight.length > 1 ? 'ties' : 'ty'}: ${rawLight.slice(0, 4).join(' ')}` })
      perPackageF5.set(pkg, (perPackageF5.get(pkg) ?? 0) + 1)
    }
    if (!hexExempt) for (const m of cls.matchAll(ARB_HEX_UTILITY)) {
      const line = text.slice(0, index).split('\n').length
      findings.push({ rule: 'F6', severity: 'P1', path: rel, line, detail: `arbitrary hex utility for a themeable role: ${m[0]}` })
    }
  }

  // F6 (inline style): themeable hex inside a style object literal.
  if (!hexExempt) for (const m of text.matchAll(/style=\{\{([^}]*)\}\}/gs)) {
    if (!/#[0-9a-fA-F]{3,8}/.test(m[1])) continue
    const line = text.slice(0, m.index).split('\n').length
    findings.push({ rule: 'F6', severity: 'P1', path: rel, line, detail: `hardcoded hex in inline style: ${m[1].trim().slice(0, 60)}` })
  }
}

if (scanned === 0) {
  console.error(`theme-tokens: no source files found under ${root}`)
  console.error('theme-tokens: refusing to report success on an empty scan (check --root)')
  process.exit(2)
}

const byRule = findings.reduce((acc, f) => ({ ...acc, [f.rule]: (acc[f.rule] ?? 0) + 1 }), {})

if (asJson) {
  console.log(JSON.stringify({
    root,
    scanned,
    totals: { all: findings.length, ...byRule },
    byPackageF5: Object.fromEntries([...perPackageF5.entries()].sort((a, b) => b[1] - a[1])),
    findings,
  }, null, 2))
} else if (!quiet) {
  console.log(`theme-tokens: scanned ${scanned} files under ${root}`)
  console.log(`theme-tokens: F5 ${byRule.F5 ?? 0} | F6 ${byRule.F6 ?? 0} | F8 ${byRule.F8 ?? 0} | total ${findings.length}`)
  const worstPkgs = [...perPackageF5.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
  if (worstPkgs.length > 0) {
    console.log('  F5 by package:')
    for (const [p, n] of worstPkgs) console.log(`    ${String(n).padStart(4)}  ${p}`)
  }
  const worst = findings.filter(f => f.rule !== 'F5').slice(0, 15)
  for (const f of worst) console.log(`  ${f.severity} ${f.rule} ${f.path}:${f.line} — ${f.detail}`)
}

process.exit(findings.length === 0 ? 0 : 1)
