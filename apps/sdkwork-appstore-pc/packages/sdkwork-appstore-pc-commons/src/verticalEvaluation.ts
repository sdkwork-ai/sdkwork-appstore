import type { AppItem } from '@sdkwork/appstore-pc-core'
import type { EvalSampleUnit } from './aiEvaluation'

/**
 * Shared plumbing of the vertical evaluation modules (教育实验应用 / 文旅应用 /
 * 医疗卫生应用) below the AI 模型测评 category. Each vertical owns its taxonomy
 * and curated listings in its own file (`eduExperiment.ts`, `tourism.ts`,
 * `healthcare.ts`); this module only carries the pieces all three share.
 */

/** Discriminator of one vertical evaluation module. */
export type VerticalEvaluationKind = 'edu-experiment' | 'tourism' | 'healthcare'

/**
 * One per-dimension score of a vertical benchmark. `id` is the i18n key of the
 * dimension label inside the owning module's namespace, so dimension copy stays
 * locale-owned instead of baking zh strings into the data (unlike the legacy
 * AI 模型测评 curated set, whose `name` fields carry display text directly).
 */
export interface VerticalDimensionScore {
  /** i18n key of the dimension label, resolved through `t(id, { defaultValue: id })`. */
  id: string
  score: number
}

/** Curated official baseline of one vertical evaluation spec (0-100). */
export interface VerticalBenchmark {
  /** Composite benchmark score, 0-100 with one decimal. */
  score: number
  /** Sample volume backing the score. */
  sampleSize?: number
  sampleUnit?: EvalSampleUnit
  dimensions: VerticalDimensionScore[]
}

/** A curated evaluation spec of a vertical module. Structurally an AppSpec. */
export interface VerticalEvalSpec {
  id: string
  kind: 'model' | 'agent'
  name: string
  publisher: string
  summary?: string
  benchmark?: VerticalBenchmark
}

/** Listing fields the vertical resolvers match against. */
export type VerticalListingInput = Pick<AppItem, 'id' | 'name' | 'category'>

/** A curated vertical entry: one seeded evaluation listing with its taxonomy. */
export interface CuratedVerticalListing {
  listingIds: string[]
  listingNames: string[]
  specs: VerticalEvalSpec[]
}

/**
 * Match a listing's category against a vertical's display-name set. Mirrors
 * `aiEvaluation.isAiModelEvalApp`: catalog summaries carry the category as a
 * display name, so matching stays name-based.
 */
export function categoryIn(app: VerticalListingInput, names: readonly string[]): boolean {
  return names.includes(app.category)
}

/** Curated entry lookup: by listing id first, then by display name. */
export function curatedEntryOf<T extends CuratedVerticalListing>(
  entries: readonly T[],
  app: VerticalListingInput,
): T | undefined {
  return entries.find((entry) => entry.listingIds.includes(app.id) || entry.listingNames.includes(app.name))
}
