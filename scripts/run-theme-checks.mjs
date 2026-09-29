#!/usr/bin/env node
/**
 * Run every theme gate and aggregate the result.
 *
 * Why a wrapper instead of `a && b` in package.json: these scripts run through
 * `cmd.exe` on Windows, where a `;`-separated sequence is not a sequence at all
 * — the second command is passed to the first as arguments and silently never
 * runs. A gate that silently runs half of itself is worse than no gate.
 *
 * Every gate runs even when an earlier one fails, so a report shows all rules
 * at once; the exit code is non-zero if any gate failed.
 *
 * Usage: node scripts/run-theme-checks.mjs [--root apps/sdkwork-appstore-pc] [--all]
 *        --all also runs the workspace-level §4 integration check (slow).
 */
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const root = args.includes('--root') ? args[args.indexOf('--root') + 1] : 'apps/sdkwork-appstore-pc'
const all = args.includes('--all')

/* The extractor runs first. Every gate below reads class text through it, and
   its failure mode is silence: a tag it cannot parse is missing from the
   numbers, so the report looks *cleaner*, not broken. The shared scanner
   dropped 65 of 198 `<button>` tags in the tree before its `${` handling was
   fixed, which made the shape gate report 0 violations on a tree with 178.
   The self-test plus the gate's own parity assertion are what make that
   failure loud; run them before anything that depends on them. */
const gates = [
  ['jsx-class-scan (the shared extractor, on the constructs it got wrong)', 'scripts/dev/jsx-class-scan.test.mjs', []],
  ['theme-tokens   (no hardcoded colour left)', 'scripts/check-theme-tokens.mjs', ['--root', root]],
  ['token-utilities (every token class compiles, one spelling per role)', 'scripts/check-token-utilities.mjs', ['--root', root]],
  ['control-shape  (one shape scale for every control)', 'scripts/check-control-shape.mjs', ['--root', root]],
]
if (all) {
  gates.push(['tailwind-integration (§4 single bootstrap, workspace-wide)', '../sdkwork-specs/tools/check-tailwind-integration.mjs', ['--workspace', '..']])
}

const results = []
for (const [label, script, scriptArgs] of gates) {
  console.log(`\n=== ${label} ===`)
  const r = spawnSync(process.execPath, [resolve(REPO, script), ...scriptArgs], { cwd: REPO, stdio: 'inherit' })
  results.push([label, r.status])
}

console.log('\n=== summary ===')
let failed = 0
for (const [label, status] of results) {
  const ok = status === 0
  if (!ok) failed += 1
  console.log(`  ${ok ? 'PASS' : `FAIL(exit ${status})`}  ${label}`)
}
process.exit(failed === 0 ? 0 : 1)
