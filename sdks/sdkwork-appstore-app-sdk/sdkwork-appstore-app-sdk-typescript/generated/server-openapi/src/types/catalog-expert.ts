/** One curated AI expert of the storefront roster. The roster has its own catalog store, so reading it is independent of any marketplace shelf. */
export interface CatalogExpert {
  id: string;
  /** Stable public code of the expert (for example exp-senior-dev). */
  expertCode: string;
  expertName: string;
  description?: string;
  /** Scenario card the expert is grouped under, derived from the stored catalog rows. */
  categoryCode?: string;
  /** Presentation payload the storefront renders (nickname, tags, prompts, avatar icon, popularity, rating, badge, usage counters). */
  profile: Record<string, unknown>;
  featured: boolean;
  /** Editorial weight the roster is ordered by. */
  sortWeight: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
