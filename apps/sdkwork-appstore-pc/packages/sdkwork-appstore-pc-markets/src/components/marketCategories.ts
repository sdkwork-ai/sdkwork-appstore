/** Sentinel category value that selects every marketplace entry. */
export const ALL_CATEGORY = '__all__';

/**
 * One category filter chip.
 *
 * `value` is the catalog's own category string (the value the service filters
 * on); `label` is what the user sees. Keeping them apart lets a page name a
 * category through the locale dictionary without sending translated text to
 * the catalog, where it would match no record.
 */
export interface CategoryOption {
  value: string;
  label: string;
}

/**
 * The category projection every owning module's registry exposes.
 *
 * `SkillCategoryOption` and `McpCategoryOption` are structurally assignable to
 * it, so a page does not have to convert one into the other just to build the
 * chip row, and a future domain registry plugs in without touching the chips.
 */
export interface CatalogCategorySource {
  /** Category code the catalog records are filed under. */
  code: string;
  /** Operator-facing category name. */
  name: string;
}

/**
 * Builds the chip list for a catalog whose categories are plain values.
 *
 * Used when the owning module has no registry to load (a catalog that only
 * publishes category labels on its records) and as the fallback when the
 * registry read fails: the page then offers exactly the categories the loaded
 * records carry, so the filter row never disappears.
 */
export function toCategoryOptions(
  values: Iterable<string>,
  allLabel: string,
): CategoryOption[] {
  const unique = [...new Set([...values].filter((value) => value.trim().length > 0))];
  unique.sort((left, right) => left.localeCompare(right));
  return [
    { value: ALL_CATEGORY, label: allLabel },
    ...unique.map((value) => ({ value, label: value })),
  ];
}

/**
 * Builds the chip list from an owning module's category registry.
 *
 * The registry order wins (it is the operator's ordering), and the "all" chip
 * leads. An empty registry yields just the "all" chip, which the caller may
 * replace with {@link toCategoryOptions} when the catalog page has no registry.
 */
export function toRegistryCategoryOptions(
  registry: readonly CatalogCategorySource[],
  allLabel: string,
): CategoryOption[] {
  return [
    { value: ALL_CATEGORY, label: allLabel },
    ...registry.map((category) => ({ value: category.code, label: category.name })),
  ];
}
