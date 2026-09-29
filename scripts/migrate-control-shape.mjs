#!/usr/bin/env node
/**
 * Converge the *shape* of self-painted controls and tags onto the shared scale.
 *
 * Why a class-string migration rather than a JSX rewrite onto `<Button>`: the
 * call sites carry dozens of distinct (height, padding, radius, type, weight)
 * combinations. Restructuring every JSX site in one pass is where regressions
 * come from; normalising the class tokens is mechanical, reviewable and
 * reversible, and it removes the drift the user actually sees. Primitive
 * adoption then closes the remaining padding/height variance, which the shape
 * gate tracks as a ratcheting budget instead of pretending it is done.
 *
 * It shares the scanner and the predicates with `check-control-shape.mjs`, so
 * it rewrites exactly the set of elements the gate measures. The first version
 * of this tool carried its own extractor and therefore normalised 131 controls
 * while 63 conditionally-styled ones — the ones whose state differences the
 * user was actually looking at — stayed untouched.
 *
 * Rules (each counted, so the report states what happened):
 *   R1 radius  ad-hoc `rounded-{sm,md,lg,xl,2xl,3xl,[…]}` and bare `rounded`
 *              become `rounded-store-control`, variant prefixes preserved.
 *              `rounded-full`, `rounded-none`, `rounded-store-*` and
 *              directional radii are deliberate shapes and stay.
 *   R2 radius  a control that paints a background but declares no corner gets
 *              `rounded-store-control`.
 *   R3 type    a control with no explicit size gets `text-xs` when its metrics
 *              are compact, else `text-sm` — two tiers, not four.
 *   R4 weight  a control with no weight gets `font-medium`.
 *   R5 weight  an existing non-medium weight becomes `font-medium`: the app's
 *              single button primitive declares `font-medium`, so a page that
 *              picks `bold`/`semibold` for "the same" action is the
 *              cross-page drift this pass removes. Emphasis belongs to the
 *              variant, not to a weight chosen per call site.
 *   R6 space   runs of whitespace inside a class literal collapse.
 *   R7 chip x  a tag's horizontal padding becomes `px-2.5`.
 *   R8 chip y  its vertical padding becomes `py-0.5`.
 *   R9 chip ty its type becomes `text-xs font-medium`.
 *   R10 chip w a tag with no weight at all gets `font-medium`. (`font-mono` is
 *              a family, not a weight — a mono chip still needs one.)
 *   R11 ctl ty a control whose label uses a type step outside the control scale
 *              (`text-base` and up, or an arbitrary length) is brought onto it,
 *              `text-xs` when its metrics are compact else `text-sm`. Per
 *              `UI_DESIGN_SPEC.md` §2.2 the label tiers are Body (16/14) and
 *              Caption (13/12); a larger step is a heading, not a control.
 *
 * The controls were only half of the complaint, so three more rule groups cover
 * everything else that paints its own box:
 *   R12 surf   a **surface** corner becomes a tier token: an overlay's own box
 *              (a dialog) `rounded-store-modal`, a value of 16px or more
 *              `rounded-store-card`, anything smaller `rounded-store-control`.
 *              Variant prefixes are preserved. `rounded-full` and `rounded-none`
 *              are deliberate shapes and stay.
 *   R13 surf d a direction-specific ad-hoc corner (`rounded-t-2xl`) keeps its
 *              direction and takes the same tier decision.
 *   R14 chip c a tag with a square corner becomes `rounded-full` — the corner
 *              the shared `Tag` recipe specifies. Before this, a tag that chose
 *              a square corner left the chip vocabulary entirely and was never
 *              inspected again.
 *
 * A form field's own box was governed by nothing at all — the control pass
 * only looks at `button` and `isSurface` steps aside for a form field — so 76
 * of them carried four corner spellings, four fills, five type sizes and no
 * height between them. Seven rules close that:
 *   R15 field r an ad-hoc corner becomes `rounded-store-control`. 64 of the 76
 *              already rendered the right 12px as `rounded-xl`; the value was
 *              right and the spelling was the raw palette. A capsule search
 *              keeps `rounded-full`.
 *   R16 field t a field's type size lands on §2.2's Body steps — `text-sm`, or
 *              `text-base` for a size of 16px and up (the store's hero search).
 *   R17 field f the fill becomes `bg-store-field`. Three of the four fills this
 *              replaces are white in light mode and four luminance steps apart
 *              in dark, so the drift was invisible where review happens.
 *   R18 field o one focus border (`focus:border-store-brand`), one ring width
 *              and colour, one border colour, and no `dark:` twin — the token
 *              already carries both modes, so the prefix is an F5 pairing
 *              violation as well as a second spelling.
 *   R19 field m `px-3`, plus the shape split: a single-line field's height is
 *              the same 36px as `Button size="md"` (`h-9`) so its vertical
 *              padding goes; a textarea keeps `py-2`.
 *   R20 field k the required recipe tokens a call site never declared
 *              (`text-store-ink`, the placeholder ink, the outline and ring,
 *              `transition-colors`), counted one per token.
 *   R21 field s the recipe was completed on an element.
 *
 * Usage: node scripts/migrate-control-shape.mjs [--write] [--json out.json] [--sample n]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { classSegments, scanTags, sourceFiles, lineAt } from './lib/jsx-class-scan.mjs'
import {
  ANY_COLOR,
  CHIP_PILL,
  CHIP_SMALL_TEXT,
  CHIP_SMALL_X,
  CHIP_SMALL_Y,
  COMPACT,
  FIELD_FILL,
  FIELD_RADIUS,
  FIELD_REQUIRED,
  HAS_BG,
  HAS_RADIUS,
  HAS_WEIGHT,
  PAINTS_BOX,
  RADIUS_TOKEN,
  SINGLE_LINE_FIELD,
  SURFACE_TIERS,
  TEXT_SIZE,
  TEXT_FLOW_TOKEN,
  TEXT_SIZE_TOKEN,
  fieldRadiusAllowed,
  isBareTextControl,
  isChip,
  isContainerControl,
  isDialogSurface,
  isFormField,
  isSurface,
} from './lib/control-shape-rules.mjs'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const rootArg = args.includes('--root') ? args[args.indexOf('--root') + 1] : 'apps/sdkwork-appstore-pc'
const APP = resolve(REPO, rootArg)
const write = args.includes('--write')
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null
const sampleN = args.includes('--sample') ? Number(args[args.indexOf('--sample') + 1]) : 6

const counts = { R1: 0, R2: 0, R3: 0, R4: 0, R5: 0, R6: 0, R7: 0, R8: 0, R9: 0, R10: 0, R11: 0, R12: 0, R13: 0, R14: 0, R15: 0, R16: 0, R17: 0, R18: 0, R19: 0, R20: 0, R21: 0, R22: 0, files: 0, controls: 0, chips: 0, surfaces: 0, fields: 0 }
const samples = []
const perFile = {}

/* Ad-hoc radius tokens, in one pass so a variant prefix is preserved and
   `rounded-store-*`, `rounded-full`, `rounded-none` and an explicit
   `rounded-[var(--sdk-radius-*)]` reference are not matched. */
const ADHOC_RADIUS = /((?:[\w-]+:)*)\brounded-(?!store-)(?!full\b)(?!none\b)(?!\[var\(--(?:sdk|dsw)-radius-)(?:sm|md|lg|xl|2xl|3xl|\[[^\]]+\])(?![\w-])/g
const BARE_RADIUS = /((?:[\w-]+:)*)\brounded(?![\w-])/g
const DIRECTIONAL_ADHOC = /((?:[\w-]+:)*)\brounded-(t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee)-(?!store-)(?!none\b)(?:sm|md|lg|xl|2xl|3xl|\[[^\]]+\])(?![\w-])/g
const OFF_WEIGHT = /\b((?:[\w-]+:)*)font-(?:thin|extralight|light|normal|semibold|bold|extrabold|black)\b/g
/* A label size outside the control scale: a named step above `sm`, or any
   arbitrary length. */
const OFF_SIZE = /\btext-(?:base|lg|xl|2xl|3xl|4xl)\b|\btext-\[[^\]]*(?:px|rem|em|ch|ex|vw|vh|%|var\(--)[^\]]*\]/g

/* Field tokens. Every one of these matches a whole utility *and* refuses a
   variant prefix, because the rules below are about the element's resting
   state: `py-2` beside a fixed height is dead weight, but `hover:py-2` is a
   utility the recipe says nothing about and rewriting it would change a state
   nobody asked about. `(?<![\w:.-])` is that clause. */
const F_BG = /(?<![\w:.-])bg-(?!transparent\b|none\b|current\b|inherit\b)[^\s]+/g
const F_PX = /(?<![\w:.-])px-[\d.]+(?![\w.])/g
const F_PY = /(?<![\w:.-])py-[\d.]+(?![\w.])/g
const F_P = /(?<![\w:.-])p-[\d.]+(?![\w.])/g
/* A size token, matched *whole*: the arbitrary branch must swallow its own
   `]` or the rewrite would leave the bracket behind, and it must be a length
   rather than a colour (`text-[#fff]` is a colour, `text-[11px]` is a size). */
const F_SIZE = /\btext-(?:xs|sm|base|lg|xl|2xl|3xl|4xl)(?![\w-])|\btext-\[(?=[\d.]|var\(--)[^\]]*\](?![\w-])/g
const F_DARK_FOCUS = /(?<![\w:.-])dark:focus:[^\s]+/g
const F_FOCUS_BORDER = /(?<![\w:.-])focus:border-[^\s]+/g
const F_FOCUS_RING_WIDTH = /(?<![\w:.-])focus:ring-(?:\d|\[[^\]]+\])(?![\w-])/g
const F_FOCUS_RING_COLOUR = /(?<![\w:.-])focus:ring-(?!\d|\\)(?!offset-)([^\s/]+)(?:\/\d+)?/g
const F_DARK_PLACEHOLDER = /(?<![\w:.-])dark:placeholder:[^\s]+/g
/* Every unprefixed `text-*`. A field's only such tokens are its size step and
   its ink, so the callback can decide without a colour-name list — and a
   colour-name list is exactly what goes stale when the palette changes. */
const F_TEXT_ANY = /(?<![\w:.-])text-[^\s]+/g
/* A border *colour* — `border-store-line-strong` and the raw palette both name
   a colour the field recipe does not have. Width utilities (`border`, `border-2`)
   and `border-none` are not colours and are left alone. */
const F_BORDER_COLOUR = /(?<![\w:.-])border-(?!store-line(?![\w-]))(?:store|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)[\w./-]*/g

/* Tailwind's default type steps in px, for the one decision the field pass
   makes about size: which of §2.2's two Body steps a declared size lands on. */
const FIELD_SIZE_PX = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36 }

/* Tailwind's default corner values, used to decide which tier an ad-hoc value
   belongs to. An arbitrary `[Npx]` is read as its own length, so
   `rounded-[24px]` resolves to the card tier rather than to "some number". */
const RADIUS_PX = { sm: 2, md: 6, lg: 8, xl: 12, '2xl': 16, '3xl': 24 }

/**
 * Which surface tier an ad-hoc corner resolves to.
 *
 * A dialog's own box is the modal tier whatever value it carried; otherwise the
 * value decides — 16px and up is a card (`UI_DESIGN_SPEC.md` §2.3 puts cards at
 * 16–24px), anything smaller is the inset tier. This is where the "one card
 * role written `rounded-2xl` on one page and `rounded-3xl` on the next" defect
 * collapses: both land on `rounded-store-card`.
 */
function surfaceTier(joined, token, filePath) {
  if (isDialogSurface(joined, filePath)) return SURFACE_TIERS.modal
  const named = token.match(/-(\w+)$/)?.[1]
  let px = named !== undefined ? RADIUS_PX[named] : undefined
  if (px === undefined) {
    const arbitrary = token.match(/\[(\d+(?:\.\d+)?)px\]/)
    px = arbitrary ? Number(arbitrary[1]) : 12
  }
  return px >= 16 ? SURFACE_TIERS.card : SURFACE_TIERS.control
}

/**
 * Converge one control's class literals.
 *
 * The rules split into two kinds and they must not be confused:
 *   - *token rewrites* (R1 radius, R5 weight) are local: they apply inside
 *     whichever literal the bad token sits in, branch or static chunk.
 *   - *decisions* (does this control have a corner? a size? a weight?) are
 *     properties of the whole class list, and their remedy is a single append.
 *
 * The first version of this function evaluated everything per literal. A
 * conditional branch such as `'bg-store-brand text-white'` then looked like "a
 * control that paints a background but has no corner", and every branch of
 * every conditional control got its own duplicated `rounded-store-control`
 * (110 bogus appends on a 194-control tree).
 *
 * @param values - the tag's class literals, in source order.
 * @returns the rewritten literals, or null when nothing changes.
 */
function convergeControl(values, container, filePath) {
  const before = values.slice()
  const out = values.slice()

  /* A card-shaped control takes a *surface* tier corner, because that is what
     it is by shape; a labelled control takes the control tier. The tier is
     decided against the list as written (`isDialogSurface` reads only static
     tokens, so a rewrite inside the loop cannot change the answer). */
  const tier = (token) => (container ? surfaceTier(values.join(' '), token, filePath) : 'rounded-store-control')

  for (let i = 0; i < out.length; i += 1) {
    out[i] = out[i]
      .replace(ADHOC_RADIUS, (m, p) => {
        counts.R1 += 1
        return `${p}${tier(m)}`
      })
      .replace(BARE_RADIUS, (m, p) => {
        counts.R1 += 1
        return `${p}${tier(m)}`
      })
  }

  /* Decisions read the whole list, joined exactly as the gate joins it. */
  const joined = out.join(' ')
  const bareText = isBareTextControl(joined)
  const append = []
  if (!HAS_RADIUS.test(joined) && HAS_BG.test(joined)) {
    append.push(container ? SURFACE_TIERS.card : 'rounded-store-control')
    counts.R2 += 1
  }
  if (!bareText && !container && !TEXT_SIZE.test(joined)) {
    append.push(COMPACT.test(joined) ? 'text-xs' : 'text-sm')
    counts.R3 += 1
  }
  if (!bareText && !container && !HAS_WEIGHT.test(joined)) {
    append.push('font-medium')
    counts.R4 += 1
  }
  if (!bareText && !container) {
    for (let i = 0; i < out.length; i += 1) {
      out[i] = out[i].replace(OFF_WEIGHT, (_m, p) => {
        counts.R5 += 1
        return `${p}font-medium`
      })
    }
    /* R11 — a label size outside the control scale. Decided on the whole list
       (the compact test needs the padding, which may live in another literal)
       and applied per literal. */
    if (OFF_SIZE.test(joined)) {
      const tier = COMPACT.test(joined) ? 'text-xs' : 'text-sm'
      for (let i = 0; i < out.length; i += 1) {
        out[i] = out[i].replace(OFF_SIZE, () => {
          counts.R11 += 1
          return tier
        })
      }
    }
  }

  if (append.length > 0) {
    /* Append where the box metrics live: the static prefix in a conditional
       class list, the only literal otherwise. */
    let anchor = out.findIndex((v) => /\b(?:px-|py-|p-|h-|size-|rounded)\d|\b(?:px|py|p|h|size)-/.test(v))
    if (anchor === -1) anchor = 0
    const glue = /\s$/.test(out[anchor]) ? '' : ' '
    out[anchor] = `${out[anchor]}${glue}${append.join(' ')}`
  }

  /* R6 spacing — a class list is a token list, so runs of whitespace are only
     noise; they appear where an append landed after a literal that already
     ended in a space. */
  for (let i = 0; i < out.length; i += 1) {
    const collapsed = out[i].replace(/\s{2,}/g, ' ')
    if (collapsed !== out[i]) counts.R6 += 1
    out[i] = collapsed
  }

  return out.every((v, i) => v === before[i]) ? null : out
}

/**
 * Converge one surface's class literals (R12 / R13).
 *
 * Same split as `convergeControl`: every radius token is rewritten where it
 * sits, the tier decision is a property of the element. A direction-specific
 * corner keeps its direction — the tier scale has no directional utilities of
 * its own beyond what `@theme inline` generates, and splitting a card's corners
 * is a deliberate shape (a snippet box with a header and a body).
 */
function convergeSurface(values, filePath) {
  const before = values.slice()
  const out = values.slice()
  const joined = values.join(' ')
  for (let i = 0; i < out.length; i += 1) {
    out[i] = out[i]
      .replace(DIRECTIONAL_ADHOC, (m, p, dir) => {
        counts.R13 += 1
        return `${p}rounded-${dir}-${surfaceTier(joined, m, filePath).replace('rounded-store-', 'store-')}`
      })
      .replace(ADHOC_RADIUS, (m, p) => {
        counts.R12 += 1
        return `${p}${surfaceTier(joined, m, filePath)}`
      })
      .replace(BARE_RADIUS, (m, p) => {
        counts.R12 += 1
        return `${p}${surfaceTier(joined, m, filePath)}`
      })
  }
  for (let i = 0; i < out.length; i += 1) {
    const collapsed = out[i].replace(/\s{2,}/g, ' ')
    if (collapsed !== out[i]) counts.R6 += 1
    out[i] = collapsed
  }
  return out.every((v, i) => v === before[i]) ? null : out
}

/**
 * Which of `UI_DESIGN_SPEC.md` §2.2's two Body steps a field's declared size
 * lands on. §2.2 puts labels at Body 16/14, so the ceiling is `text-base` — a
 * 17px hero search becomes the 16px step rather than staying a one-off, and an
 * 11px field label rises to the 14px standard step.
 * @param token - a `text-*` size token as written.
 * @returns `text-sm` or `text-base`.
 */
function fieldSizeFor(token) {
  const named = token.match(/^text-([a-z0-9]+)(?![\w-])/)?.[1]
  let px = named !== undefined ? FIELD_SIZE_PX[named] : undefined
  if (px === undefined) {
    const rem = token.match(/\[([\d.]+)rem\]/)
    const arb = token.match(/\[([\d.]+)px\]/)
    px = rem ? Number(rem[1]) * 16 : arb ? Number(arb[1]) : 14
  }
  return px >= 16 ? 'text-base' : 'text-sm'
}

/**
 * Converge one form field's class literals onto the shared field skin
 * (R15–R21).
 *
 * The field pass exists because a field was governed by nothing: the control
 * pass only looks at `button`, and `isSurface` steps aside for a form field.
 * 76 fields therefore carried four corner spellings, four fills, five type
 * sizes and *no height at all* between them.
 *
 * The one judgement it makes is the shape split, and it is a real one rather
 * than a rule for its own sake: a single-line field's height is the same 36px
 * as `Button size="md"`, `TextInput` and `SelectInput` (`h-9`), and once the
 * height is fixed the browser centres the text — so a vertical padding beside
 * it is dead weight that also makes the box taller than the button next to it.
 * A textarea has no fixed height, so its vertical padding is the only thing
 * separating the first line from the border.
 *
 * @param values - the tag's class literals, in source order.
 * @param tagName - the raw element name.
 * @returns the rewritten literals, or null when nothing changes.
 */
function convergeField(values, tagName) {
  const before = values.slice()
  const out = values.slice()
  const single = SINGLE_LINE_FIELD.test(tagName)
  const radiusRe = new RegExp(RADIUS_TOKEN.source, 'g')
  const swap = (re, to, rule) => (s) => s.replace(re, (m) => {
    if (m === to) return m
    counts[rule] += 1
    return to
  })

  for (let i = 0; i < out.length; i += 1) {
    let v = out[i]
    /* R15 corner. 64 of these 76 already rendered the right 12px as
       `rounded-xl`: the value was right and the spelling was the raw palette,
       which is why it never showed up as a mismatch on screen. */
    v = v.replace(radiusRe, (m) => {
      if (fieldRadiusAllowed(m)) return m
      counts.R15 += 1
      return FIELD_RADIUS
    })
    /* R16 size, onto §2.2's Body steps. */
    v = v.replace(F_SIZE, (m) => {
      const to = fieldSizeFor(m)
      if (m === to) return m
      counts.R16 += 1
      return to
    })
    /* R17 fill. Three of the four fills this replaces are white in light mode
       and four luminance steps apart in dark — a drift that is invisible in
       the mode most review happens in. */
    v = v.replace(F_BG, (m) => {
      if (m === FIELD_FILL) return m
      counts.R17 += 1
      return FIELD_FILL
    })
    /* R18 focus. One border colour and one ring, and no `dark:` twin: the
       token already carries both modes, so a `dark:` prefix is a pairing
       violation (F5) as well as a second spelling. */
    v = v.replace(F_DARK_FOCUS, () => {
      counts.R18 += 1
      return ''
    })
    v = swap(F_FOCUS_BORDER, 'focus:border-store-brand', 'R18')(v)
    v = swap(F_FOCUS_RING_WIDTH, 'focus:ring-2', 'R18')(v)
    v = swap(F_FOCUS_RING_COLOUR, 'focus:ring-store-brand/25', 'R18')(v)
    v = swap(F_BORDER_COLOUR, 'border-store-line', 'R18')(v)
    v = v.replace(F_DARK_PLACEHOLDER, () => {
      counts.R18 += 1
      return ''
    })
    /* R22 ink. 11 of these 76 carried a near-white ink (`text-slate-100`,
       `text-gray-100`) chosen for the dark fill they used to have. The fill is
       now the mode-aware field token, so that ink would be white on white in
       light mode — the colour rule and the fill rule are one change, not two. */
    v = v.replace(F_TEXT_ANY, (m) => {
      if (TEXT_SIZE_TOKEN.test(m) || TEXT_FLOW_TOKEN.test(m) || m === 'text-store-ink') return m
      counts.R22 += 1
      return 'text-store-ink'
    })
    /* R19 metrics. */
    if (single) v = swap(F_PY, '', 'R19')(v)
    v = swap(F_P, '', 'R19')(v)
    v = swap(F_PX, 'px-3', 'R19')(v)
    out[i] = v.replace(/\s{2,}/g, ' ').trim()
  }

  /* Decisions read the whole list, joined exactly as the gate joins it.
     Presence in a class list is a set-membership question and is asked as one:
     a `/g` regex used with `.test()` carries `lastIndex` between calls and
     starts alternating true and false, which made the first version of this
     block append a *second* `h-9` on every other run. */
  const append = []
  const joined = out.join(' ')
  const have = new Set(joined.split(/\s+/))
  const anyToken = (re) => [...have].some((t) => re.test(t))
  if (single && !anyToken(/^h-[\d.]+$/)) append.push('h-9')
  if (!single && !anyToken(/^py-[\d.]+$/)) append.push('py-2')
  /* An inset is either the shared `px-3` or a leading/trailing one for a field
     with a glyph in it. Only the first is added here: appending `px-3` beside
     an existing `pl-10` would leave two utilities fighting over one side. */
  if (!anyToken(/^px-[\d.]+$/) && !anyToken(/^p[lr]-/)) append.push('px-3')
  counts.R19 += append.length
  if (!HAS_RADIUS.test(joined)) {
    append.push(FIELD_RADIUS)
    counts.R15 += 1
  }
  if (!TEXT_SIZE.test(joined)) {
    append.push('text-sm')
    counts.R16 += 1
  }
  /* R20 recipe completion — the tokens that make two fields on two pages the
     same element, counted per token so the report says which one was absent. */
  for (const token of FIELD_REQUIRED) {
    if (have.has(token)) continue
    append.push(token)
    counts.R20 += 1
  }

  if (append.length > 0) {
    let anchor = out.findIndex((v) => /\b(?:px-|py-|p-|h-|size-|rounded|bg-|border|text-)\S/.test(v))
    if (anchor === -1) anchor = 0
    out[anchor] = `${out[anchor]}${/\s$/.test(out[anchor]) ? '' : ' '}${append.join(' ')}`
    counts.R21 += 1
  }

  for (let i = 0; i < out.length; i += 1) {
    const collapsed = out[i].replace(/\s{2,}/g, ' ')
    if (collapsed !== out[i]) counts.R6 += 1
    out[i] = collapsed
  }
  return out.every((v, i) => v === before[i]) ? null : out
}

/**
 * Converge one tag/chip's class literals, with the same split as
 * `convergeControl`: token rewrites per literal, decisions on the whole list.
 */
function convergeChip(values) {
  const before = values.slice()
  const out = values.slice()
  /* Each rule counts a *change*, not a match: `px-2.5` is itself in the
     "small x" set, so counting matches would report work on a re-run that
     changes nothing and make the idempotency check meaningless. */
  const swap = (re, to, rule) => (s) => s.replace(re, (m) => {
    if (m === to) return m
    counts[rule] += 1
    return to
  })
  const smallX = new RegExp(CHIP_SMALL_X.source, 'g')
  const smallY = new RegExp(CHIP_SMALL_Y.source, 'g')
  const smallText = new RegExp(CHIP_SMALL_TEXT.source, 'g')
  const anyRadius = new RegExp(RADIUS_TOKEN.source, 'g')

  /* R14 — the recipe's corner. A tag that chose a square corner (or declared no
     corner at all) gets the pill: in this design system a tag *is* a pill, and
     the shared `Tag` primitive says so. Counted once per tag, as a change, not
     per token. */
  if (!CHIP_PILL.test(out.join(' '))) {
    let replaced = false
    for (let i = 0; i < out.length; i += 1) {
      out[i] = out[i].replace(anyRadius, () => {
        replaced = true
        return 'rounded-full'
      })
    }
    if (!replaced) {
      let anchor = out.findIndex((v) => /\b(?:px|py|p|text)-/.test(v))
      if (anchor === -1) anchor = 0
      out[anchor] = `${out[anchor]}${/\s$/.test(out[anchor]) ? '' : ' '}rounded-full`
    }
    counts.R14 += 1
  }
  for (let i = 0; i < out.length; i += 1) {
    let v = swap(smallX, 'px-2.5', 'R7')(out[i])
    v = swap(smallY, 'py-0.5', 'R8')(v)
    v = swap(smallText, 'text-xs', 'R9')(v)
    out[i] = v
  }
  for (let i = 0; i < out.length; i += 1) {
    out[i] = out[i].replace(OFF_WEIGHT, (m, p) => {
      if (m === `${p}font-medium`) return m
      counts.R9 += 1
      return `${p}font-medium`
    })
  }
  /* R10 — a tag with no weight at all. The recipe's weight is part of what
     makes two chips on two pages read as the same element, and a chip carrying
     only `font-mono` (a family) still has no weight. Decided on the whole
     list, so a chip whose weight sits in another literal is not given a
     second one. */
  if (!HAS_WEIGHT.test(out.join(' '))) {
    let anchor = out.findIndex((v) => /\b(?:px|py|p|text|rounded)-/.test(v))
    if (anchor === -1) anchor = 0
    out[anchor] = `${out[anchor]}${/\s$/.test(out[anchor]) ? '' : ' '}font-medium`
    counts.R10 += 1
  }
  for (let i = 0; i < out.length; i += 1) {
    const collapsed = out[i].replace(/\s{2,}/g, ' ')
    if (collapsed !== out[i]) counts.R6 += 1
    out[i] = collapsed
  }
  return out.every((v, i) => v === before[i]) ? null : out
}

for (const file of sourceFiles(APP)) {
  const src = readFileSync(file, 'utf8')
  const edits = []
  const relPath = relative(REPO, file)

  for (const tag of scanTags(src)) {
    const segs = classSegments(src, tag)
    if (segs.length === 0) continue
    const cls = segs.map((s) => s.value).join(' ')
    /* The three predicates mirror the gate's, one for one, so the fixer rewrites
       exactly what the ruler measures. A chip-shaped button is a tag, not a
       control — the gate steps aside for it, and so does this. */
    const chip = isChip(cls, tag.name)
    const field = isFormField(tag.name) && PAINTS_BOX.test(cls)
    const control = !chip && !field && /^(?:button|motion\.button)$/.test(tag.name) && ANY_COLOR.test(cls) && !isBareTextControl(cls)
    const container = control && isContainerControl(cls)
    const surface = !control && !chip && !field && isSurface(cls, tag.name)
    if (!control && !chip && !surface && !field) continue
    let touched = false
    let values = segs.map((s) => s.value)
    if (field) {
      const fieldNext = convergeField(values, tag.name)
      if (fieldNext !== null) {
        values = fieldNext
        touched = true
      }
    }
    const controlNext = control ? convergeControl(values, container, relPath) : null
    if (controlNext !== null) {
      values = controlNext
      touched = true
    }
    if (chip) {
      const chipNext = convergeChip(values)
      if (chipNext !== null) {
        values = chipNext
        touched = true
      }
    }
    if (surface) {
      const surfaceNext = convergeSurface(values, relPath)
      if (surfaceNext !== null) {
        values = surfaceNext
        touched = true
      }
    }
    if (touched) {
      for (let i = 0; i < segs.length; i += 1) {
        if (values[i] === segs[i].value) continue
        edits.push({ start: segs[i].start, end: segs[i].end, value: values[i] })
      }
      if (samples.length < sampleN) {
        samples.push({
          at: `${relative(REPO, file)}:${lineAt(src, tag.start)}`,
          kind: field ? 'field' : container ? 'card-shaped control' : control ? 'control' : chip ? 'tag' : 'surface',
          before: cls,
          after: values.join(' '),
        })
      }
    }
    if (control) counts.controls += 1
    if (chip) counts.chips += 1
    if (surface) counts.surfaces += 1
    if (field) counts.fields += 1
  }

  if (edits.length === 0) continue
  counts.files += 1
  perFile[relative(REPO, file)] = edits.length

  /* Edits are applied back-to-front. Two edits may legitimately share an
     offset; anything else overlapping would corrupt the source silently, so
     refuse rather than guess. */
  const ordered = edits.slice().sort((a, b) => b.start - a.start || a.end - b.end)
  for (let i = 1; i < ordered.length; i += 1) {
    if (ordered[i].end > ordered[i - 1].start) {
      throw new Error(`overlapping edits in ${relative(REPO, file)}: ${JSON.stringify(ordered[i - 1])} / ${JSON.stringify(ordered[i])}`)
    }
  }
  const out = ordered.reduce((acc, e) => acc.slice(0, e.start) + e.value + acc.slice(e.end), src)
  if (write) writeFileSync(file, out)
}

console.log(`${write ? 'WROTE' : 'DRY RUN'}: ${counts.files} files, ${counts.controls} controls, ${counts.chips} tags, ${counts.surfaces} surfaces, ${counts.fields} fields examined`)
console.log(`  R1 radius normalised : ${counts.R1}`)
console.log(`  R2 radius added      : ${counts.R2}`)
console.log(`  R3 type scale set    : ${counts.R3}`)
console.log(`  R4 weight added      : ${counts.R4}`)
console.log(`  R5 weight normalised : ${counts.R5}`)
console.log(`  R6 spacing collapsed : ${counts.R6}`)
console.log(`  R7 chip x normalised : ${counts.R7}`)
console.log(`  R8 chip y normalised : ${counts.R8}`)
console.log(`  R9 chip type/weight  : ${counts.R9}`)
console.log(`  R10 chip weight added : ${counts.R10}`)
console.log(`  R11 control type set  : ${counts.R11}`)
console.log(`  R12 surface corner    : ${counts.R12}`)
console.log(`  R13 surface dir corner: ${counts.R13}`)
console.log(`  R14 chip corner       : ${counts.R14}`)
console.log(`  R15 field corner      : ${counts.R15}`)
console.log(`  R16 field type size   : ${counts.R16}`)
console.log(`  R17 field fill        : ${counts.R17}`)
console.log(`  R18 field focus/border: ${counts.R18}`)
console.log(`  R19 field metrics     : ${counts.R19}`)
console.log(`  R20 field recipe token: ${counts.R20}`)
console.log(`  R21 field recipe set  : ${counts.R21}`)
console.log(`  R22 field ink         : ${counts.R22}`)
if (samples.length > 0) {
  console.log('\n=== samples (before → after) ===')
  for (const s of samples) {
    console.log(`\n  [${s.kind}] ${s.at}`)
    console.log(`  - ${s.before}`)
    console.log(`  + ${s.after}`)
  }
}
const top = Object.entries(perFile).sort((a, b) => b[1] - a[1]).slice(0, 12)
if (top.length) {
  console.log('\n=== busiest files ===')
  for (const [f, n] of top) console.log(`  ${String(n).padStart(3)}  ${f}`)
}
if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify({ counts, perFile }, null, 2))
  console.log(`wrote ${jsonOut}`)
}
