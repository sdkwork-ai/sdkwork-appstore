/**
 * One JSX class scanner for every theme gate.
 *
 * The three gates in this directory each grew their own extraction, and all
 * three were blind to the same construct — a `className` whose value is a
 * **template literal or a conditional expression**. That is not an edge case:
 * it is how conditional styling is written, so it is exactly where drift and
 * unpaired-light utilities live (the active vs inactive tab, the selected chip,
 * the `dark:`-less branch of a ternary).
 *
 *   check-theme-tokens    matched `className="…"`, `'…'`, `{`…`}` (no `${`),
 *                         `{'…'}`, `{"…"}` — so `className={a ? 'x' : 'y'}`
 *                         was invisible, i.e. the F5 pairing rule never looked
 *                         at the branch that usually lacks its `dark:` twin.
 *   check-token-utilities stopped at the first `}` and could not read a
 *                         template literal's static chunk.
 *   check-control-shape   parsed the tag with a hand-rolled brace walker that
 *                         mishandled `${`: it stepped back one character *and*
 *                         incremented the brace depth, so the `{` of `${` was
 *                         counted twice and the opening tag never saw its
 *                         closing `>`. An entire
 *                         `<button className={`… ${…}`}>` disappeared from the
 *                         scan — the controls most likely to have drifted.
 *
 * This module keeps one state machine for all of them, so a blind spot cannot
 * come back in one gate while another stays correct.
 *
 * ## The model
 *
 * A single left-to-right walk with an explicit context stack, because "am I in
 * template text" cannot be recovered from a quote flag alone:
 *
 *   - `'tpl'` frames are template-literal text. Nothing there is structural —
 *     a `}` or a `>` is just text — and only `` ` `` (close) and `${` (open an
 *     interpolation) mean anything.
 *   - number frames are `${ … }` interpolations, remembering the brace depth
 *     they opened at so the interpolation's own `}` can be told apart from an
 *     object literal's `}` inside it.
 *   - `quote` covers `'…'` and `"…"`, which are inert in both modes (a quoted
 *     interpolation is still an interpolation; a quoted brace is still text).
 *
 * Verified by `scripts/dev/jsx-class-scan.test.mjs`, which encodes every case
 * the old extractors got wrong.
 */
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Shared walker.
 * @param src - file source.
 * @param i - index to start at.
 * @param depth - brace depth to start with.
 * @param wantBraceClose - true: stop at the `}` that closes `depth` back to 0;
 *   false: stop at the `>` that ends an opening tag.
 * @returns index just past the terminating character, or -1.
 */
function scan(src, i, depth, wantBraceClose) {
  let quote = null
  const stack = []
  while (i < src.length) {
    const ch = src[i]
    if (quote !== null) {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === quote) quote = null
      i += 1
      continue
    }
    const top = stack.length > 0 ? stack[stack.length - 1] : null
    if (top === 'tpl') {
      // Template text: only the closing backtick and `${` are structural.
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === '`') {
        stack.pop()
        i += 1
        continue
      }
      if (ch === '$' && src[i + 1] === '{') {
        stack.push(depth)
        i += 2
        continue
      }
      i += 1
      continue
    }
    if (ch === "'" || ch === '"') {
      quote = ch
      i += 1
      continue
    }
    if (ch === '`') {
      stack.push('tpl')
      i += 1
      continue
    }
    if (ch === '{') {
      depth += 1
      i += 1
      continue
    }
    if (ch === '}') {
      if (typeof top === 'number' && depth === top) {
        // The `}` that closes `${`; we are back in template text.
        stack.pop()
        i += 1
        continue
      }
      depth -= 1
      i += 1
      if (wantBraceClose && depth === 0 && stack.length === 0) return i
      continue
    }
    if (ch === '>' && !wantBraceClose && depth === 0 && stack.length === 0) return i + 1
    i += 1
  }
  return -1
}

/**
 * Index just past the `>` closing the opening tag at `start`, or -1 when the
 * tag is unterminated. `>` inside a string, a brace expression or a template
 * literal does not end the tag.
 */
export function endOfOpeningTag(src, start) {
  return scan(src, start + 1, 0, false)
}

/**
 * Every opening tag in `src`, as `{ start, end, text, name }`. Closing tags are
 * skipped; `name` is the raw element name (`button`, `span`, `Tabs`, …).
 */
export function scanTags(src) {
  const out = []
  for (const m of src.matchAll(/<([A-Za-z][\w.$-]*)(?=[\s/>])/g)) {
    const end = endOfOpeningTag(src, m.index)
    if (end === -1) continue
    out.push({ start: m.index, end, text: src.slice(m.index, end), name: m[1] })
  }
  return out
}

/** Opening tags of one element name (case-sensitive). */
export function findTags(src, name) {
  return scanTags(src).filter((t) => t.name === name)
}

/**
 * Every editable string literal inside `[from, to)`, with absolute offsets.
 *
 * Quoted strings yield their content; a template literal yields each *static
 * chunk* separately, so a rewrite can address the text around `${…}` without
 * ever writing inside an interpolation. Values are the literal text as
 * written, so a caller can replace `[start, end)` in place.
 */
export function collectLiterals(src, from, to) {
  const out = []
  const take = (a, b) => {
    if (b > a) out.push({ start: a, end: b, value: src.slice(a, b) })
  }
  let i = from
  let depth = 0
  let quote = null
  let quoteStart = -1
  let chunkStart = -1
  const stack = []
  while (i < to) {
    const ch = src[i]
    if (quote !== null) {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === quote) {
        take(quoteStart, i)
        quote = null
        i += 1
        continue
      }
      i += 1
      continue
    }
    const top = stack.length > 0 ? stack[stack.length - 1] : null
    if (top === 'tpl') {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === '`') {
        take(chunkStart, i)
        stack.pop()
        i += 1
        continue
      }
      if (ch === '$' && src[i + 1] === '{') {
        take(chunkStart, i)
        stack.push(depth)
        i += 2
        // The next static chunk begins after `${`; without this the closing
        // backtick would re-emit this chunk with `${…}` still inside it.
        chunkStart = i
        continue
      }
      i += 1
      continue
    }
    if (ch === "'" || ch === '"') {
      quote = ch
      quoteStart = i + 1
      i += 1
      continue
    }
    if (ch === '`') {
      stack.push('tpl')
      chunkStart = i + 1
      i += 1
      continue
    }
    if (ch === '{') {
      depth += 1
      i += 1
      continue
    }
    if (ch === '}') {
      if (typeof top === 'number' && depth === top) {
        stack.pop()
        i += 1
        // Back in template text: the next chunk starts after the `}`.
        chunkStart = i
        continue
      }
      depth -= 1
      i += 1
      continue
    }
    i += 1
  }
  return out
}

/* Attribute name to the left of the value: a bare `className`, not
   `myClassName` / `$className`, and not inside a longer word. */
const CLASS_ATTR = /(?:^|[\s{])(className|class)\s*=\s*/g

/**
 * Spans of the **attribute-level** brace expressions in a tag, as `[start,end)`.
 *
 * A JSX prop may carry a whole element: `<Topbar trailing={<span
 * className="…" />} />`. That span's `className` lives inside the outer tag's
 * text but belongs to a different element, and the outer tag is reported
 * separately — so reading it in both places counts the same element twice.
 * Attribute-level braces are the mask that separates the two.
 */
function braceRanges(src, tag) {
  const spans = []
  let i = tag.start + 1
  let depth = 0
  let open = -1
  let quote = null
  const stack = []
  while (i < tag.end) {
    const ch = src[i]
    if (quote !== null) {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === quote) quote = null
      i += 1
      continue
    }
    const top = stack.length > 0 ? stack[stack.length - 1] : null
    if (top === 'tpl') {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === '`') stack.pop()
      else if (ch === '$' && src[i + 1] === '{') {
        stack.push(depth)
        i += 2
        continue
      }
      i += 1
      continue
    }
    if (ch === "'" || ch === '"') {
      quote = ch
      i += 1
      continue
    }
    if (ch === '`') {
      stack.push('tpl')
      i += 1
      continue
    }
    if (ch === '{') {
      if (depth === 0) open = i
      depth += 1
      i += 1
      continue
    }
    if (ch === '}') {
      if (typeof top === 'number' && depth === top) {
        stack.pop()
        i += 1
        continue
      }
      depth -= 1
      i += 1
      if (depth === 0 && open !== -1) {
        spans.push([open, i])
        open = -1
      }
      continue
    }
    if (ch === '>' && depth === 0 && stack.length === 0) break
    i += 1
  }
  return spans
}

/**
 * Editable class-text segments of every `className` (or `class`) attribute **of
 * this tag**, with absolute offsets into `src`. Attributes of elements nested
 * inside a JSX-valued prop are excluded — they belong to their own tag.
 *
 * Handles `className="…"`, `className='…'`, `className={expr}` and everything
 * inside `expr` — string literals, template static chunks, ternary branches,
 * call arguments. Returns `{ start, end, value }[]` in source order.
 *
 * @param src - file source.
 * @param tag - a tag record from `scanTags` / `findTags`.
 */
export function classSegments(src, tag) {
  const out = []
  const masked = braceRanges(src, tag)
  const inside = (at) => masked.some(([a, b]) => at >= a && at < b)
  for (const m of tag.text.matchAll(CLASS_ATTR)) {
    /* A match that starts on the `{` of a prop value is inside the mask too,
       because the mask's range begins at that same `{`. */
    const attrAt = tag.start + m.index
    if (inside(attrAt)) continue
    const at = attrAt + m[0].length
    const ch = src[at]
    if (ch === '"' || ch === "'") {
      // A quoted JSX attribute value cannot contain its own delimiter.
      const close = src.indexOf(ch, at + 1)
      if (close === -1) continue
      if (close > at + 1) out.push({ start: at + 1, end: close, value: src.slice(at + 1, close) })
      continue
    }
    if (ch === '{') {
      const end = scan(src, at + 1, 1, true)
      if (end === -1) continue
      out.push(...collectLiterals(src, at + 1, end - 1))
      continue
    }
    // `className=…` with no recognizable value (a spread, a bare identifier).
  }
  return out
}

/** The class text of a tag as one string (`''` when it has no className). */
export function classText(src, tag) {
  return classSegments(src, tag)
    .map((s) => s.value)
    .join(' ')
}

/** 1-based line number of an offset. */
export function lineAt(src, offset) {
  let line = 1
  for (let i = 0; i < offset && i < src.length; i += 1) if (src[i] === '\n') line += 1
  return line
}

/** Recursive `.tsx`/`.ts` sources under `dir`, skipping build and vendored trees. */
export function sourceFiles(dir, { extensions = ['.tsx'], skip = ['node_modules', 'lib', 'dist', 'tmp', '.workbuddy-tmp'] } = {}) {
  const out = []
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (skip.includes(e.name)) continue
      const p = join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (!e.name.endsWith('.d.ts') && extensions.some((x) => e.name.endsWith(x))) out.push(p)
    }
  }
  walk(dir)
  return out.sort()
}
