import { useMemo, useState } from 'react';

import { ALL_CATEGORY, toCategoryOptions, toRegistryCategoryOptions } from '../components/marketCategories';
import type { CatalogCategorySource, CategoryOption } from '../components/marketCategories';

export interface UseCatalogCategoryFilterOptions<T> {
  /**
   * The owning module's category registry. When it is present it wins over the
   * values derived from the loaded records, so a registry category with nothing
   * filed under it stays a real (empty-state) filter and retired categories do
   * not appear.
   */
  registry?: readonly CatalogCategorySource[];
  /** Label of the leading "all" chip, from the page's locale dictionary. */
  allLabel: string;
  /** Categories the loaded records carry, used when there is no registry. */
  fallbackValues?: readonly string[];
  /** True when a record belongs to the given category value. */
  matches: (record: T, category: string) => boolean;
}

export interface CatalogCategoryFilter<T> {
  categories: CategoryOption[];
  selectedCategory: string;
  /** Selects a chip value (`ALL_CATEGORY` clears the category filter). */
  selectCategory: (category: string) => void;
  /** Applies the selected category to a catalog page. */
  filter: (records: readonly T[]) => T[];
}

/**
 * The catalog category filter every marketplace page shares.
 *
 * One hook gives a page its chip row, its selection, and the record predicate,
 * so the four catalogs (plugins, skills, MCP servers, experts) cannot drift on
 * what "all" means, where the chips come from, or how a record is matched.
 * Extending the catalog is the caller's job: pass a registry and a `matches`
 * predicate, and the page keeps no category bookkeeping of its own.
 */
export function useCatalogCategoryFilter<T>({
  registry,
  allLabel,
  fallbackValues,
  matches,
}: UseCatalogCategoryFilterOptions<T>): CatalogCategoryFilter<T> {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);

  const categories = useMemo<CategoryOption[]>(() => {
    if (registry && registry.length > 0) {
      return toRegistryCategoryOptions(registry, allLabel);
    }
    return toCategoryOptions(fallbackValues ?? [], allLabel);
  }, [registry, fallbackValues, allLabel]);

  const filter = useMemo(
    () => (records: readonly T[]) =>
      selectedCategory === ALL_CATEGORY
        ? [...records]
        : records.filter((record) => matches(record, selectedCategory)),
    [selectedCategory, matches],
  );

  return {
    categories,
    selectedCategory,
    selectCategory: setSelectedCategory,
    filter,
  };
}
