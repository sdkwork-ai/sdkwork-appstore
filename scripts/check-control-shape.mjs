#!/usr/bin/env node
/**
 * Gate: every self-painted control uses the shared shape scale.
 *
 * `check-theme-tokens.mjs` guards *colour* (no hardcoded hex, no unpaired
 * light-only utility) and `check-token-utilities.mjs` guards that a token
 * class compiles and that one role has one spelling. Neither sees the drift
 * the user actually reported — "the buttons on different pages don't look the
 * same" — because that drift is *shape*: at the start of this pass 131
 * self-painted buttons carried 6 different radius values, 3 weights and two
 * text scales, chosen independently at each call site.
 *
 * This gate closes that hole by asserting, per control:
 *   - the corner is a shared scale value (`rounded-store-control`), a
 *     deliberate capsule (`rounded-full`), `rounded-none`, a directional
 *     radius, or an explicit `var(--sdk-radius-*)`/`var(--dsw-radius-*)`
 *     reference — never an ad-hoc `rounded-lg`/`rounded-xl`/`rounded-2xl`;
 *   - a control that paints a background also declares a corner;
 *   - the label has an explicit type size and an explicit weight, both from
 *     the shared recipe.
 *
 * …and, since the controls were only half of the complaint ("the buttons **and
 * the tags and the cards** don't look the same"), two more passes:
 *   - **tags**: every non-interactive painted label uses the shared `Tag`
 *     recipe — `rounded-full px-2.5 py-0.5 text-xs font-medium`. The shape test
 *     is corner-agnostic and tag-aware, so a tag cannot leave the vocabulary by
 *     choosing a square corner (23 had), and a clickable chip is judged as the
 *     control it is rather than by both passes at once.
 *   - **surfaces**: every other box that paints its own background takes its
 *     corner from the tier scale — `rounded-store-card` (16px),
 *     `rounded-store-modal` (20px, an overlay's own box) or
 *     `rounded-store-control` (12px inset tiles, rows, nav items). Before this
 *     pass one card role was spelled `rounded-2xl` on one page and
 *     `rounded-3xl` on the next.
 *
 * Padding and height are *not* yet gated on controls: they are the remaining
 * variance the `<Button>` adoption pass closes, so they are reported against a
 * budget that may only ratchet down. Pretending they are aligned would be a
 * lie; hiding them would lose the work item. Surfaces carry no such budget —
 * one tier per corner is a hard assertion — but a surface that paints a
 * background and declares no corner at all is only *reported*: a `header`, a
 * `nav` and a table row legitimately have no corner to round.
 *
 * Fails closed: an empty scan exits 2 rather than reporting success, and so
 * does a scan whose tag count has fallen below the tree's known floor.
 *
 * Usage: node scripts/check-control-shape.mjs [--root apps/sdkwork-appstore-pc] [--json out.json]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { classSegments, findTags, lineAt, scanTags, sourceFiles } from './lib/jsx-class-scan.mjs'
import {
  ANY_COLOR,
  BOXY,
  CHIP_CANON_X,
  CHIP_CANON_Y,
  CHIP_CANON_TEXT,
  CHIP_PILL,
  CHIP_SMALL_X,
  CHIP_SMALL_Y,
  CHIP_SMALL_TEXT,
  FIELD_FILL,
  FIELD_RECIPE,
  FIELD_RECIPE_CONSUMERS,
  FIELD_REQUIRED,
  FIELD_TEXT_ALLOWED,
  HAS_BG,
  H_TOKEN,
  PAINTS_BOX,
  PX_TOKEN,
  PY_TOKEN,
  RADIUS_TOKEN,
  SINGLE_LINE_FIELD,
  TEXT_ALLOWED,
  TEXT_FLOW_TOKEN,
  TEXT_SIZE,
  TEXT_SIZE_TOKEN,
  UNIFORM_TOKEN,
  WEIGHT,
  WEIGHT_ALLOWED,
  fieldRadiusAllowed,
  isChip,
  isContainerControl,
  isFormField,
  isSurface,
  radiusAllowed,
  surfaceRadiusAllowed,
} from './lib/control-shape-rules.mjs'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const rootArg = args.includes('--root') ? args[args.indexOf('--root') + 1] : 'apps/sdkwork-appstore-pc'
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null
const ROOT = resolve(REPO, rootArg)

/* ------------------------------------------------------------------ scan */

/* Tag and class extraction live in `lib/jsx-class-scan.mjs`, shared with the
   other two gates. This gate used to carry its own walker, and that walker
   mishandled `${`: it stepped back one character *and* incremented the brace
   depth, so the `{` of `${` was counted twice, the opening tag never saw its
   closing `>`, and every `<button className={`… ${…}`}>` — the conditional
   styling, i.e. the controls most likely to have drifted — was absent from the
   scan. It reported 131 controls; the true figure is below, and the difference
   is controls it could not see. `scanner parity` asserts the invariant so this
   cannot silently come back. */

/* ------------------------------------------------------------- the rules */

/* All predicates live in `lib/control-shape-rules.mjs`, shared with
   `migrate-control-shape.mjs`, so the ruler and the fixer can never disagree
   about which elements are in scope. */

/* Budgets: may only ratchet down. The value is today's measured count, so a
   change that adds variance fails instead of passing silently. Two legitimate
   reasons for a budget to *rise*, both of which must be recorded here:
     - a stale metric: the first padding measurement used only the px/py form
       and read 18; adding the uniform `p-*` icon-button form (how 25 of the
       boxed controls are authored) raised it to 22 — the budget caught the
       stale metric, which is the point;
     - wider coverage: the shared scanner made 63 conditionally-styled controls
       visible for the first time, which raised padding combinations 22 → 28
       and explicit heights 3 → 6 without a single new author choice. This is
       coverage, not drift, and it is why the two numbers are re-derived after
       every extraction change rather than trusted. */
const BUDGET = {
  paddingCombos: 28,
  heightValues: 6,
}

/* Floors, not budgets: a count that falls below these means the extractor
   stopped seeing elements, which looks exactly like a clean tree. Set to
   today's measured values (see the gate's own output) — the number only ever
   moves with a deliberate extraction change, and must be re-derived then. */
const FLOOR = {
  files: 300,
  controls: 150,
  chips: 50,
  surfaces: 200,
  fieldBoxes: 60,
}

/* The field skin lives in two hand-written constants, and a merge that lands
   one side's version without the other's leaves two skins that differ by four
   pixels of corner. Both are asserted against `FIELD_RECIPE` — the single
   authority — plus their own shape delta, so "what a field looks like" cannot
   become three answers. Read from the source rather than imported: the gate
   must see what ships, not a compiled copy of it. */
const constantProblems = []
for (const { name, file, delta } of FIELD_RECIPE_CONSUMERS) {
  const abs = resolve(REPO, file)
  let src
  try {
    src = readFileSync(abs, 'utf8')
  } catch {
    constantProblems.push(`${name}: ${file} is missing`)
    continue
  }
  const literal = src.match(new RegExp(`(?:export\\s+)?const\\s+${name}\\s*=\\s*'([^']*)'`))?.[1]
  if (literal === undefined) {
    constantProblems.push(`${name}: no single-quoted string literal found in ${file}`)
    continue
  }
  const got = new Set(literal.trim().split(/\s+/))
  const want = new Set([...FIELD_RECIPE, ...delta])
  for (const t of want) if (!got.has(t)) constantProblems.push(`${name}: missing \`${t}\``)
  for (const t of got) if (!want.has(t)) constantProblems.push(`${name}: unexpected \`${t}\``)
}

/* ------------------------------------------------------------------ run */

const files = sourceFiles(ROOT)
const violations = []
const padding = new Map()
const heights = new Map()
const surfaceRadiusSpellings = new Map()
const cornerlessSurfaces = []
let controls = 0
let boxControls = 0
let containerControls = 0
let bareTextControls = 0
let chips = 0
let surfaces = 0
let surfacesWithoutCorner = 0
let fieldBoxes = 0
let fieldsWithoutBox = 0
let buttonNeedles = 0
let buttonsParsed = 0
const fieldRadiusSpellings = new Map()
const uncovered = []

/* The element names that own an interactive box. `motion.button` is spelled as
   one name by JSX, so the parity needle and the extracted tag name have to
   agree on it or an animated button escapes both. */
const CONTROL_NAMES = ['button', 'motion.button']

for (const file of files) {
  const src = readFileSync(file, 'utf8')

  /* Coverage invariant. A scan that drops a tag looks exactly like a clean
     tree, so the tag count is asserted against the raw needles: every needle
     that is followed by a delimiter must appear in the scan. `motion.button`
     is a control too — the extractor reports it under its own name, and one
     animated button in this tree was being judged as a surface before. */
  const buttons = CONTROL_NAMES.flatMap((name) => findTags(src, name))
  buttonsParsed += buttons.length
  for (const name of CONTROL_NAMES) {
    const needle = `<${name}`
    for (let at = src.indexOf(needle); at !== -1; at = src.indexOf(needle, at + needle.length)) {
      if (!/[\s/>]/.test(src[at + needle.length] ?? '')) continue
      buttonNeedles += 1
      if (!buttons.some((t) => t.start === at)) uncovered.push(`${relative(REPO, file)}:${lineAt(src, at)}`)
    }
  }

  for (const tag of buttons) {
    const cls = classSegments(src, tag)
      .map((s) => s.value)
      .join(' ')
      .trim()
    if (cls.length === 0) continue
    if (!ANY_COLOR.test(cls)) continue
    /* A chip-shaped button is governed by the tag recipe — its corner, its
       padding, its type and its weight are all asserted there. Counting it here
       as well would double-count the element and pull the recipe's `px-2.5
       py-0.5` into the control padding budget, where it does not belong. */
    if (isChip(cls, tag.name)) continue
    controls += 1
    const at = `${relative(REPO, file)}:${lineAt(src, tag.start)}`

    const bareText = !HAS_BG.test(cls) && !BOXY.test(cls)
    const container = !bareText && isContainerControl(cls)
    if (bareText) bareTextControls += 1
    else {
      boxControls += 1
      if (container) containerControls += 1
    }

    const radii = [...cls.matchAll(RADIUS_TOKEN)].map((m) => m[0])
    for (const r of radii) {
      /* A clickable card is a surface by shape, so its corner comes from the
         same tier scale every other card uses — not from the control tier. */
      const allowed = container ? surfaceRadiusAllowed(r) : radiusAllowed(r)
      if (!allowed) violations.push({ rule: container ? 'ad-hoc-surface-radius' : 'ad-hoc-radius', at, detail: r })
    }
    if (!bareText && HAS_BG.test(cls) && radii.length === 0) {
      violations.push({ rule: 'background-without-corner', at, detail: cls.slice(0, 120) })
    }

    /* A container control's typography belongs to its descendants and its
       padding is a container decision, so neither is a control metric. */
    if (!bareText && !container) {
      const size = cls.match(TEXT_SIZE)?.[0]
      if (size === undefined) violations.push({ rule: 'control-without-type-size', at, detail: cls.slice(0, 120) })
      else if (!TEXT_ALLOWED.test(size)) violations.push({ rule: 'off-scale-type-size', at, detail: size })

      const weights = [...cls.matchAll(WEIGHT)].map((m) => m[0])
      if (weights.length === 0) violations.push({ rule: 'control-without-weight', at, detail: cls.slice(0, 120) })
      else for (const w of weights) if (!WEIGHT_ALLOWED.test(w)) violations.push({ rule: 'off-scale-weight', at, detail: w })

      /* Padding as authored: the px/py pair when present, otherwise the
         uniform `p-*` form an icon button uses. Reporting only px/py would
         hide the icon buttons behind an empty bucket and understate the
         variance the primitive adoption pass still has to close. */
      const px = cls.match(PX_TOKEN)?.[0]
      const py = cls.match(PY_TOKEN)?.[0]
      const uniform = cls.match(UNIFORM_TOKEN)?.[0]
      const padKey = px !== undefined || py !== undefined ? `${px ?? 'px-—'}/${py ?? 'py-—'}` : (uniform ?? 'no-padding')
      padding.set(padKey, (padding.get(padKey) ?? 0) + 1)
      const h = cls.match(H_TOKEN)?.[0]
      if (h !== undefined) heights.set(h, (heights.get(h) ?? 0) + 1)
    }
  }

  /* Tag and surface pass. Both are "any element", so they share one walk.
     The predicates are disjoint by construction: `isInteractive` sends
     interactive boxes to the control pass, `isChip` takes the non-interactive
     painted labels, and the surface pass takes whatever is left. The old chip
     predicate ignored the tag and required `rounded-full`, so a clickable chip
     was counted twice and a square-cornered tag was counted never. */
  for (const tag of scanTags(src)) {
    const cls = classSegments(src, tag)
      .map((s) => s.value)
      .join(' ')
      .trim()
    if (cls.length === 0) continue
    const at = `${relative(REPO, file)}:${lineAt(src, tag.start)}`

    /* The field pass. A form field's own box was governed by neither the
       control pass (it is not a button) nor the surface pass (`isSurface`
       steps aside for it) — so 76 fields carried four corner spellings, four
       fills, five type sizes and *no height at all* between them, and the
       drift was invisible in light mode because three of the four fills are
       white there and 4 luminance steps apart in dark.

       `PAINTS_BOX` is the boundary, and it is a real one rather than a
       convenience: a checkbox, a radio, a file input and a naked inline select
       own no box, so writing a corner or a fill onto them would round and
       repaint something that has neither. They are counted, not silently
       dropped. */
    if (isFormField(tag.name)) {
      if (!PAINTS_BOX.test(cls)) {
        fieldsWithoutBox += 1
        continue
      }
      fieldBoxes += 1
      const toks = new Set(cls.split(/\s+/))

      const radii = [...cls.matchAll(RADIUS_TOKEN)].map((m) => m[0])
      if (radii.length === 0) violations.push({ rule: 'field-without-corner', at, detail: cls.slice(0, 120) })
      for (const r of radii) {
        fieldRadiusSpellings.set(r, (fieldRadiusSpellings.get(r) ?? 0) + 1)
        if (!fieldRadiusAllowed(r)) violations.push({ rule: 'field-off-scale-radius', at, detail: r })
      }

      const fills = [...cls.matchAll(/(?<![\w:.-])bg-(?!transparent\b|none\b|current\b|inherit\b)\S+/g)].map((m) => m[0])
      if (!fills.includes(FIELD_FILL)) violations.push({ rule: 'field-off-recipe-fill', at, detail: fills.join(' ') || '(no fill)' })

      const size = cls.match(TEXT_SIZE)?.[0]
      if (size === undefined) violations.push({ rule: 'field-without-type-size', at, detail: cls.slice(0, 120) })
      else if (!FIELD_TEXT_ALLOWED.test(size)) violations.push({ rule: 'field-off-scale-size', at, detail: size })

      /* A field has exactly two kinds of unprefixed `text-*`: its size step
         and its ink. 11 of these 76 had a third — a near-white palette ink
         written for a dark fill — which the fill rule turns unreadable in
         light mode. The two rules are one change, so they are asserted
         together. */
      for (const m of cls.matchAll(/(?<![\w:.-])text-[^\s]+/g)) {
        if (TEXT_SIZE_TOKEN.test(m[0]) || TEXT_FLOW_TOKEN.test(m[0]) || m[0] === 'text-store-ink') continue
        violations.push({ rule: 'field-off-recipe-ink', at, detail: m[0] })
      }

      /* Shape: a single-line field fixes its height and the browser centres
         the text, so a vertical padding beside it is dead weight that also
         makes the box taller than the `Button` it sits next to. A multi-line
         field has no fixed height, so its vertical padding is the only thing
         separating the first line from the border. */
      const single = SINGLE_LINE_FIELD.test(tag.name)
      const barePy = /(?<![\w:.-])py-[\d.]+(?![\w.])/.test(cls)
      const bareP = /(?<![\w:.-])p-[\d.]+(?![\w.])/.test(cls)
      if (single) {
        if (!/(?<![\w:.-])h-\d/.test(cls)) violations.push({ rule: 'field-without-fixed-height', at, detail: cls.slice(0, 120) })
        if (barePy) violations.push({ rule: 'field-height-and-padding', at, detail: 'py-* on a height-fixed field' })
      } else if (!barePy) {
        violations.push({ rule: 'field-without-vertical-padding', at, detail: cls.slice(0, 120) })
      }
      if (bareP) violations.push({ rule: 'field-uniform-padding', at, detail: 'p-* on a field' })

      /* A leading glyph needs its own inset; every other field shares `px-3`. */
      const inset = /(?<![\w:.-])px-3(?![\w.])/.test(cls) || /(?<![\w:.-])(?:pl|pr)-\S+/.test(cls)
      if (!inset) violations.push({ rule: 'field-without-inline-inset', at, detail: cls.slice(0, 120) })

      /* The focus state is half of what a user compares between two forms: a
         field that flashes a grey border on one page and a brand ring on the
         next reads as two different components. A `dark:` twin is forbidden
         separately — the token already carries both modes (F5). */
      for (const m of cls.matchAll(/[\w:.-]*focus:border-\S+/g)) {
        if (m[0] === 'focus:border-store-brand') continue
        violations.push({ rule: 'field-off-recipe-focus', at, detail: m[0] })
      }
      for (const m of cls.matchAll(/(?<![\w:.-])dark:focus:\S+/g)) violations.push({ rule: 'field-dark-focus', at, detail: m[0] })
      for (const m of cls.matchAll(/(?<![\w:.-])disabled:bg-\S+/g)) violations.push({ rule: 'field-disabled-fill', at, detail: m[0] })

      for (const token of FIELD_REQUIRED) if (!toks.has(token)) violations.push({ rule: 'field-missing-token', at, detail: token })
      continue
    }

    if (isChip(cls, tag.name)) {
      chips += 1
      const corner = [...cls.matchAll(RADIUS_TOKEN)].map((m) => m[0]).join('&')
      if (!CHIP_PILL.test(cls)) violations.push({ rule: 'chip-without-pill-corner', at, detail: corner || '(no corner)' })
      if (!CHIP_CANON_X.test(cls)) violations.push({ rule: 'off-recipe-chip-padding-x', at, detail: cls.match(CHIP_SMALL_X)?.[0] ?? '' })
      if (!CHIP_CANON_Y.test(cls)) violations.push({ rule: 'off-recipe-chip-padding-y', at, detail: cls.match(CHIP_SMALL_Y)?.[0] ?? '' })
      if (!CHIP_CANON_TEXT.test(cls)) violations.push({ rule: 'off-recipe-chip-size', at, detail: cls.match(CHIP_SMALL_TEXT)?.[0] ?? '' })
      if (!/\bfont-medium\b/.test(cls)) violations.push({ rule: 'off-recipe-chip-weight', at, detail: cls.match(WEIGHT)?.[0] ?? '(none)' })
      continue
    }

    /* A surface paints its own box: not a control, not a form field, not a
       tag. See `isSurface` for why `Link`/`NavLink` count and why a PascalCase
       component does not. */
    if (!isSurface(cls, tag.name)) continue
    surfaces += 1
    const radii = [...cls.matchAll(RADIUS_TOKEN)].map((m) => m[0])
    if (radii.length === 0) {
      /* Reported, not failed: a `header`, a `nav` and a table row paint a
         background and legitimately have no corner to round. */
      surfacesWithoutCorner += 1
      if (cornerlessSurfaces.length < 20) cornerlessSurfaces.push(at)
      continue
    }
    for (const r of radii) {
      surfaceRadiusSpellings.set(r, (surfaceRadiusSpellings.get(r) ?? 0) + 1)
      if (!surfaceRadiusAllowed(r)) violations.push({ rule: 'ad-hoc-surface-radius', at, detail: r })
    }
  }
}

/* A scan that has lost elements is indistinguishable from a clean tree, so an
   empty or suspiciously small result fails instead of reporting success. The
   floors are today's measured counts; they move only with a deliberate
   extraction change, and must be re-derived when one happens. */
const belowFloor = []
if (files.length < FLOOR.files) belowFloor.push(`files ${files.length} < ${FLOOR.files}`)
if (controls < FLOOR.controls) belowFloor.push(`controls ${controls} < ${FLOOR.controls}`)
if (chips < FLOOR.chips) belowFloor.push(`chips ${chips} < ${FLOOR.chips}`)
if (surfaces < FLOOR.surfaces) belowFloor.push(`surfaces ${surfaces} < ${FLOOR.surfaces}`)
if (fieldBoxes < FLOOR.fieldBoxes) belowFloor.push(`field boxes ${fieldBoxes} < ${FLOOR.fieldBoxes}`)

if (files.length === 0 || controls === 0 || chips === 0 || surfaces === 0 || fieldBoxes === 0) {
  console.error(`control-shape: refusing to report success on an empty scan (root=${rootArg}, files=${files.length}, controls=${controls}, chips=${chips}, surfaces=${surfaces}, fields=${fieldBoxes})`)
  process.exit(2)
}
if (belowFloor.length > 0) {
  console.error('control-shape: scan below floor — the extractor has lost elements:')
  for (const m of belowFloor) console.error(`  ${m}`)
  process.exit(2)
}

/* The two field-skin constants disagreeing is a code defect, not a scan
   problem, but it is the same kind of failure: two answers to one question,
   with every utility still compiling. Fails closed like the rest. */
if (constantProblems.length > 0) {
  console.error(`control-shape: the field skin has ${constantProblems.length} definition problems — the constants no longer equal FIELD_RECIPE + their shape delta:`)
  for (const m of constantProblems) console.error(`  ${m}`)
  process.exit(2)
}

/* A tag the scanner cannot parse is a control the gate cannot see, and an
   unparsed tag is indistinguishable from a clean one in the numbers. Fail the
   run rather than report a smaller, greener tree. */
if (uncovered.length > 0) {
  console.error(`control-shape: scanner parity broken — ${uncovered.length} of ${buttonNeedles} <button> tags not parsed`)
  for (const u of uncovered.slice(0, 10)) console.error(`  ${u}`)
  process.exit(2)
}

const overBudget = []
if (padding.size > BUDGET.paddingCombos) overBudget.push(`padding combinations ${padding.size} > budget ${BUDGET.paddingCombos}`)
if (heights.size > BUDGET.heightValues) overBudget.push(`explicit heights ${heights.size} > budget ${BUDGET.heightValues}`)

const byRule = {}
for (const v of violations) byRule[v.rule] = (byRule[v.rule] ?? 0) + 1

console.log(`control-shape: ${files.length} source files`)
console.log(`  controls: ${controls} self-painted (${boxControls} boxed of which ${containerControls} card-shaped, ${bareTextControls} inline text)`)
console.log(`  tags    : ${chips} non-interactive labels`)
console.log(`  surfaces: ${surfaces} painted boxes (${surfacesWithoutCorner} with no corner, reported only)`)
console.log(`  fields  : ${fieldBoxes} boxes (of ${fieldBoxes + fieldsWithoutBox} inline fields; ${fieldsWithoutBox} own no box — checkbox, radio, naked inline select)`)
console.log(`  scanner parity: ${buttonsParsed}/${buttonNeedles} interactive <button> tags parsed`)
console.log(`  shape violations: ${violations.length}`)
for (const [rule, n] of Object.entries(byRule).sort()) console.log(`      P1 ${rule}: ${n}`)
console.log(`  tracked, not yet gated (budget may only ratchet down):`)
console.log(`      padding combinations  : ${padding.size} / budget ${BUDGET.paddingCombos}  ${[...padding.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}×${n}`).join('  ')}`)
console.log(`      explicit heights      : ${heights.size} / budget ${BUDGET.heightValues}  ${[...heights.entries()].map(([k, n]) => `${k}×${n}`).join('  ')}`)
console.log(`      surface corner spellings: ${surfaceRadiusSpellings.size}  ${[...surfaceRadiusSpellings.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}×${n}`).join('  ')}`)
console.log(`      field corner spellings  : ${fieldRadiusSpellings.size}  ${[...fieldRadiusSpellings.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}×${n}`).join('  ')}`)
if (cornerlessSurfaces.length > 0) {
  console.log(`      e.g. cornerless surfaces:`)
  for (const s of cornerlessSurfaces.slice(0, 6)) console.log(`          ${s}`)
}
for (const v of violations.slice(0, 25)) console.log(`  P1 ${v.rule} ${v.at} — ${v.detail}`)
if (violations.length > 25) console.log(`  … ${violations.length - 25} more`)

if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ controls, boxControls, containerControls, bareTextControls, chips, surfaces, surfacesWithoutCorner, cornerlessSurfaces, fieldBoxes, fieldsWithoutBox, buttonNeedles, buttonsParsed, violations, padding: Object.fromEntries(padding), heights: Object.fromEntries(heights), surfaceRadiusSpellings: Object.fromEntries(surfaceRadiusSpellings), fieldRadiusSpellings: Object.fromEntries(fieldRadiusSpellings) }, null, 2))

if (violations.length > 0 || overBudget.length > 0) {
  for (const m of overBudget) console.error(`control-shape: budget exceeded — ${m}`)
  process.exit(1)
}
console.log('control-shape: OK')
