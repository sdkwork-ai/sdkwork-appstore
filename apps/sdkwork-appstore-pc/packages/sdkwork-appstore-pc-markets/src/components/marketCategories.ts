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
