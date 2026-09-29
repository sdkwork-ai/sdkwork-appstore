/**
 * The control/tag shape vocabulary, in one place.
 *
 * `check-control-shape.mjs` asserts these and `migrate-control-shape.mjs`
 * rewrites towards them. When the two carried their own copies of the
 * predicates, "what counts as a control" could drift between the ruler and the
 * fixer — and a fixer that normalises a different set of elements than the gate
 * measures leaves the gate red for reasons nobody can see. They import from
 * here instead.
 *
 * The scale itself is `docs/product/design/UI_DESIGN_SPEC.md` §2.3 (spacing and
 * radius) projected onto the host's radius variables: `rounded-store-control`
 * is the 12px control tier, `rounded-store-card` 16px, `rounded-store-modal`
 * 20px — see `src/index.css` for the bridging declaration and why it must sit
 * on the mode-marked element rather than in `@theme`.
 */

/* ---------------------------------------------------------------- controls */

/** Any colour-bearing utility, from the token vocabulary or the raw palette. */
export const ANY_COLOR =
  /\b(?:bg|from|via|to|text|border|ring|fill|stroke|shadow)-(?:store|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-[\w./]+)?/

/** A utility that paints a surface (as opposed to transparent/none/current). */
export const HAS_BG = /\b(?:bg|from|via|to)-(?!transparent\b|none\b|current\b|inherit\b)\S/

/** No fill and no box metrics: an inline text button ("link"), whose typography
 *  belongs to the sentence around it — a documented exemption, not an oversight. */
export const BOXY = /\b(?:px-|py-|p-|h-|size-|min-h-)\d/

export const RADIUS_TOKEN = /\brounded(?:-[a-z0-9]+)*(?:-\[[^\]]+\])?(?![\w-])/g

/* Test-only twins of the two global patterns above. A `/g` regex used with
   `.test()` carries `lastIndex` between calls and starts alternating true and
   false — the classic stateful-regex bug. Global copies exist for `matchAll`;
   these exist for `.test()` and must stay non-global. */
export const HAS_RADIUS = /\brounded(?:-[a-z0-9]+)*(?:-\[[^\]]+\])?(?![\w-])/
export const HAS_WEIGHT = /\bfont-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/

/* A font size is either a named step or an arbitrary *length*. The arbitrary
   form must be recognised: `text-[11px]` is a size while `text-[#0A84FF]` is a
   colour, and treating the former as "no size" appends `text-xs` beside it —
   two font-size utilities fighting over one property. */
export const TEXT_SIZE = /\btext-(?:xs|sm|base|lg|xl|2xl|3xl|4xl)\b|\btext-\[[^\]]*(?:px|rem|em|ch|ex|vw|vh|%|var\(--)/

export const WEIGHT = /\bfont-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g

export const PX_TOKEN = /\bpx-\d+(?:\.\d+)?\b/
export const PY_TOKEN = /\bpy-\d+(?:\.\d+)?\b/
export const H_TOKEN = /\bh-\d+(?:\.\d+)?\b/
export const UNIFORM_TOKEN = /\bp-\d+(?:\.\d+)?\b/

/** Compact metrics, i.e. the small type tier rather than the base tier. */
export const COMPACT = /\b(?:py-0\.5|py-1|py-1\.5|h-5|h-6|h-7|h-8|p-0\.5|p-1|p-1\.5|p-2)\b/

/** A radius token the shared scale produces, an intentional capsule/none, a
 *  direction-specific rounding, or an explicit reference to a scale variable. */
export function radiusAllowed(token) {
  if (/^rounded-(?:full|none)$/.test(token)) return true
  if (/^rounded-store-(?:control|card|modal)$/.test(token)) return true
  if (/^rounded-\[var\(--(?:sdk|dsw)-radius-/.test(token)) return true
  if (/^rounded-(?:t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee)-/.test(token)) return true
  return false
}

export const TEXT_ALLOWED = /^(?:text-(?:xs|sm)$|text-\[[^\]]*(?:px|rem|em|ch|ex|vw|vh|%|var\(--))/
export const WEIGHT_ALLOWED = /^font-medium$/

/* -------------------------------------------------------------------- tags */

/* ⚠ `\b` after `]` can never match: `]` and the space that usually follows are
   both non-word characters, so a boundary between them does not exist. Two
   rules used to end their arbitrary-value branch with `\b` and were therefore
   dead for exactly the sites they existed for — `text-[11px]` chips were never
   recognised as chips, and `rounded-[var(--sdk-radius-control)]` was read as a
   bare `rounded` (i.e. an ad-hoc corner). Use `(?![\w-])` instead. */

/* A chip is a pill with small metrics and the small type step; its recipe is
   the one the shared `Tag` primitive specifies
   (`sdkwork-appstore-pc-commons/src/components/ui/Tag.tsx`):
   `rounded-full px-2.5 py-0.5 text-xs font-medium`. Measured before the
   alignment pass: 19 chips in 5 recipes — two padding sets, three weights —
   the same "same thing looks different per page" defect, and one a
   control-only gate would never see. */
export const CHIP_PILL = /\brounded-full\b/
export const CHIP_SMALL_X = /\bpx-(?:1\.5|2|2\.5|3)(?![\d.])/
export const CHIP_SMALL_Y = /\bpy-(?:0\.5|1|1\.5)(?![\d.])/
export const CHIP_SMALL_TEXT = /\btext-(?:xs|sm)(?![\w-])|\btext-\[(?:9|10|11|12)px\](?![\w-])/
export const CHIP_CANON_X = /\bpx-2\.5(?![\d.])/
export const CHIP_CANON_Y = /\bpy-0\.5(?![\d.])/
/* The recipe's type size. `CHIP_SMALL_TEXT` above is the *recognition* set and
   admits the 9–12px arbitrary values on purpose, so a tag written that way is
   still a tag and gets judged; this is the *asserted* step. Before the pass 14
   of the tree's tags sat at 9/10/11px, under the Caption floor
   `UI_DESIGN_SPEC.md` §2.2 sets. */
export const CHIP_CANON_TEXT = /\btext-xs(?![\w-])/

/** Shape of a painted tag/label, without saying anything about its corner. */
export function isChipShape(cls) {
  return HAS_BG.test(cls) && CHIP_SMALL_X.test(cls) && CHIP_SMALL_Y.test(cls) && CHIP_SMALL_TEXT.test(cls)
}

/**
 * Is this element a tag/chip?
 *
 * The **corner-agnostic** half is the correction. The old predicate required
 * `rounded-full` to even *recognise* a chip, so a tag that chose a square corner
 * did not fail the chip rules — it left the chip vocabulary and was never
 * inspected again. 23 of this tree's 69 non-interactive tags had done exactly
 * that: `rounded-md px-2 py-0.5 text-[10px]` badges, permission keycaps,
 * `@trigger` tokens. The corner is asserted as part of the recipe, not as the
 * price of admission.
 *
 * Two boundaries the old predicate left implicit, and which the tree forced:
 *
 *   - **form fields are not tags.** An `<input>` with small padding is a field;
 *     writing the recipe onto one rounds a text box into a capsule.
 *   - **a small *square* interactive box is a button, not a tag.** 43 of them
 *     already read `rounded-store-control px-3 py-1.5 text-xs font-medium` —
 *     small buttons that had converged correctly. Only an interactive element
 *     that *already presents as a pill* is a tag (a clickable filter chip), so
 *     the interactive side has to opt in. Interactive → the control tier;
 *     non-interactive labels → the tag recipe. That is the app's own split
 *     (`Tabs` and `Button` live on the control tier; `Tag` is the pill).
 */
export function isChip(cls, tagName) {
  if (isFormField(tagName)) return false
  if (!isChipShape(cls)) return false
  if (isButtonElement(tagName) || /^(?:a|Link|NavLink)$/.test(tagName)) return CHIP_PILL.test(cls)
  return true
}

/* ------------------------------------------------------------------ fields */

/* A form field that paints a box of its own — its own fill or its own border.
 * Something has to own the corner before a corner can be converged.
 *
 * The boundary is not cosmetic. A checkbox, a radio and a file input paint no
 * box: they carry `accent-*` and keep their native appearance, so a control
 * corner written onto them rounds nothing. A naked inline select in a toolbar
 * (`bg-transparent outline-none cursor-pointer`) is the surrounding chrome, not
 * a surface either. 15 of this tree's 91 inline fields are one of those; the
 * remaining 76 own a box and are the ones a field recipe applies to.
 */
export const PAINTS_BOX =
  /\bbg-(?!transparent\b|none\b|current\b|inherit\b)\S|\bborder(?![\w-])|\bborder-(?!transparent\b|none\b|current\b|inherit\b)\S/

/**
 * The one field skin, as a token list.
 *
 * `FIELD_CONTROL` in the shared `commons` primitive
 * (`sdkwork-appstore-pc-commons/src/components/ui/Field.tsx`) is the only
 * hand-written definition of it. This list is what the gate judges that
 * definition *against*, and what the migrator converges call sites towards, so
 * "what a field looks like" has one authority instead of three copies that can
 * drift apart.
 */
export const FIELD_RECIPE = [
  'w-full',
  'rounded-store-control',
  'bg-store-field',
  'border',
  'border-store-line',
  'px-3',
  'text-sm',
  'text-store-ink',
  'placeholder:text-store-ink-faint',
  'outline-none',
  'transition-colors',
  'focus:border-store-brand',
  'focus:ring-2',
  'focus:ring-store-brand/25',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
]

/* The shape delta the primitive adds per element kind: a single-line field
 * fixes its height and lets the browser centre the text, a multi-line one has
 * no fixed height and therefore needs its own vertical padding. Both live on
 * `TextInput` / `SelectInput` and `TextArea`. */
export const FIELD_SINGLE_DELTA = ['h-9']
export const FIELD_MULTI_DELTA = ['py-2', 'leading-5', 'resize-y']

/** The elements that take the single-line shape delta. `option` is a form
 *  field for ownership purposes but never carries a class of its own recipe. */
export const SINGLE_LINE_FIELD = /^(?:input|select)$/

/** The single corner and fill of a field. `rounded-full` stays: a capsule
 *  search box is a deliberate shape (§4.5 uses the same capsule for the
 *  acquire call to action), and `rounded-none` stays for the same reason a
 *  card may be square. */
export function fieldRadiusAllowed(token) {
  if (/^rounded-(?:full|none)$/.test(token)) return true
  if (/^rounded-store-control$/.test(token)) return true
  if (/^rounded-\[var\(--(?:sdk|dsw)-radius-/.test(token)) return true
  return false
}

/* §2.2 puts labels at Body 16/14. A field's own text is the standard step, or
 * the large one for the store's hero search; nothing below Caption's 12px and
 * nothing above 16. */
export const FIELD_TEXT_ALLOWED = /^text-(?:sm|base)$/

/* Two whole-token tests a field's `text-*` utilities are sorted by. Both are
 * non-global on purpose: these are used with `.test()`, and a `/g` regex
 * carries `lastIndex` between calls and starts alternating true and false —
 * the classic stateful-regex bug that makes a rule silently stop matching. */
/** Is this whole token a type size (named step or length)? */
export const TEXT_SIZE_TOKEN = /^text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl)(?![\w-])$|^text-\[(?=[\d.]|var\(--)[^\]]*\](?![\w-])$/
/** Text flow, not ink. `text-left` is not a colour and must never be
 *  rewritten into one. */
export const TEXT_FLOW_TOKEN = /^text-(?:left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)$/

/** The fill every field box takes. */
export const FIELD_FILL = 'bg-store-field'

/** The corner every field box takes. */
export const FIELD_RADIUS = 'rounded-store-control'

/* The recipe splits into three lists so a token cannot fall between the
 * cracks: `FIELD_RECIPE` is exactly their union, `check-control-shape.mjs`
 * asserts every contract token on every field box, and
 * `scripts/dev/jsx-class-scan.test.mjs` asserts the union holds. Adding a
 * token to the recipe without putting it in one of the lists is a token
 * nobody checks — the same defect as a predicate that encodes its answer.
 */

/** Tokens every field box must carry verbatim. This is what makes two fields
 *  on two pages the same element. */
export const FIELD_REQUIRED = [
  'text-store-ink',
  'placeholder:text-store-ink-faint',
  'outline-none',
  'transition-colors',
  'focus:border-store-brand',
  'focus:ring-2',
  'focus:ring-store-brand/25',
]

/** Recipe tokens a call site may legitimately drop: `w-full` (an inline filter
 *  field is narrow), the border pair (the store's hero search is deliberately
 *  soft — `border-none`), and the disabled pair (a field that can never be
 *  disabled does not need them). */
export const FIELD_OPTIONAL = [
  'w-full',
  'border',
  'border-store-line',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
]

/** Tokens asserted *structurally* — each has an alternative that is equally
 *  correct (`rounded-full` for a capsule search, `text-base` for the large
 *  tier, `pl-*`/`pr-*` for a field with a leading glyph), so a plain presence
 *  test would either miss them or over-constrain them. */
export const FIELD_STRUCTURAL = ['rounded-store-control', 'bg-store-field', 'px-3', 'text-sm']

/**
 * The two source constants that carry the field skin, and the shape delta each
 * is expected to add on top of `FIELD_RECIPE`.
 *
 * They are checked *against the files*, not against each other: a merge that
 * lands upstream's version of the admin constant and keeps the fork's copy of
 * the primitive (or the reverse) leaves two field skins that differ by four
 * pixels of corner, and nothing else in the toolchain would notice — the
 * utilities all compile, and the drift only shows on the page. One is a
 * `commons` primitive the whole app renders through; the other is the admin
 * shell's copy of the same role on 66 call sites.
 */
export const FIELD_RECIPE_CONSUMERS = [
  {
    name: 'FIELD_CONTROL',
    file: 'apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-commons/src/components/ui/Field.tsx',
    delta: [],
  },
  {
    name: 'ADMIN_INPUT_CLASS',
    file: 'apps/sdkwork-appstore-pc/packages/sdkwork-appstore-pc-admin-shell/src/ui/AdminFormField.tsx',
    /* One string serves `input`, `select` and `textarea`: `h-9` fixes the
       single-line height and is overridden by a textarea's `min-h-*`, while
       `py-2` supplies the padding a textarea cannot get from a fixed height. */
    delta: ['h-9', 'py-2'],
  },
]

/* ----------------------------------------------------------------- surfaces */

/* Which element owns the box its `className` describes.
 *
 *   - `button` / `motion.button` are controls; their corner is the control
 *     tier's business (or, for a card-shaped one, the surface tier's).
 *   - form fields paint their own box too, and are currently governed by
 *     neither pass — a tracked gap, reported by the gate rather than hidden.
 *   - `Link` / `NavLink` render an anchor, so their className *is* the box.
 *     Excluding every interactive element instead would have left 16 linked
 *     cards ungoverned.
 *   - any other PascalCase name is a component whose box is defined in its own
 *     file, which the scan already visits; reading the call site as well would
 *     attribute one element's corner to two places.
 */
export function isFormField(tagName) {
  return /^(?:input|select|textarea|option|motion\.(?:input|select|textarea))$/.test(tagName)
}

export function isButtonElement(tagName) {
  return /^(?:button|motion\.button)$/.test(tagName)
}

export function ownsItsBox(tagName) {
  const base = tagName.replace(/^motion\./, '')
  if (base === 'Link' || base === 'NavLink') return true
  return /^[a-z]/.test(base)
}

/** A box that paints a background, is not a control or form field, and is not
 *  a tag — so it takes its corner from the tier scale. */
export function isSurface(cls, tagName) {
  if (isButtonElement(tagName) || isFormField(tagName)) return false
  if (!ownsItsBox(tagName)) return false
  return HAS_BG.test(cls) && !isChipShape(cls)
}

/**
 * The three surface corners, from `UI_DESIGN_SPEC.md` §2.3 (cards 16–24px,
 * buttons 9999px or 12px) projected onto the host radius scale in
 * `src/index.css` (12 / 16 / 20). One spelling per tier is the whole point: the
 * defect this pass removes is one card role written `rounded-2xl` on one page
 * and `rounded-3xl` on the next.
 */
export const SURFACE_TIERS = {
  control: 'rounded-store-control',
  card: 'rounded-store-card',
  modal: 'rounded-store-modal',
}

/** Corner allowed on a surface: a tier token, a deliberate capsule or none, a
 *  direction-specific **tier** (or a squared/capsule corner — a chat bubble
 *  squares the one corner that points at its speaker), or an explicit
 *  host-scale reference. A bare directional ad-hoc value (`rounded-t-2xl`) is
 *  not allowed: the direction is fine, the value still has to come from the
 *  scale. */
export function surfaceRadiusAllowed(token) {
  if (/^rounded-(?:full|none)$/.test(token)) return true
  if (/^rounded-store-(?:control|card|modal)$/.test(token)) return true
  if (/^rounded-\[var\(--(?:sdk|dsw)-radius-/.test(token)) return true
  if (/^rounded-(?:t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee)-(?:none|full|store-(?:control|card|modal)|\[var\(--(?:sdk|dsw)-radius-)/.test(token)) return true
  return false
}

/** An overlay's own box: a dialog/drawer surface.
 *
 *  `shadow-2xl` alone is not enough — screenshot tiles and lightbox images
 *  carry it. A width cap alone is not enough either: a screenshot tile in
 *  `TemplateScreenshotsTab` carries `max-w-3xl` among its device-size variants
 *  and was read as a dialog, which would have lifted a 12px tile to the 20px
 *  modal tier while its siblings stayed at 12px — the exact class of mismatch
 *  this pass exists to remove. The file name is the signal that survives: a
 *  dialog is the box a `*Modal`/`*Dialog`/`*Drawer`/`*Sheet`/`*Popover`
 *  component renders.
 *
 *  A dialog living in a differently-named file would fall to the card tier —
 *  4px low, caught by review, and never the other way round. */
const DIALOG_FILE = /(?:Modal|Dialog|Drawer|Sheet|Popover)[^/\\]*\.tsx$/i

export function isDialogSurface(cls, filePath = '') {
  return /\bshadow-2xl\b/.test(cls) && /\bmax-w-/.test(cls) && DIALOG_FILE.test(filePath)
}

/** Is the control an inline text link, exempt from the control type scale? */
export function isBareTextControl(cls) {
  return !HAS_BG.test(cls) && !BOXY.test(cls)
}

/**
 * A boxed control laid out as a container rather than a label box — a clickable
 * **card** (`<motion.button className="flex items-center gap-3 p-4 rounded-2xl
 * bg-store-surface border …">` wrapping an icon tile and a `<span>` label).
 *
 * It is a control by behaviour and a surface by shape, so it takes a surface
 * tier corner and its typography belongs to its descendants. Without this the
 * gate demanded an explicit font size and weight *on the card itself*, which is
 * a rule about buttons, not about containers — the same distinction
 * `isBareTextControl` draws at the inline end of the scale.
 *
 * The signal is a container-scale uniform padding with no type size of its own:
 * a genuinely labelled control declares its size, and a small one declares
 * `px-*`/`py-*` instead of a uniform `p-*`.
 */
export function isContainerControl(cls) {
  return HAS_BG.test(cls) && /\bp-(?:3|4|5|6|8)(?![\d.])/.test(cls) && !TEXT_SIZE.test(cls)
}
