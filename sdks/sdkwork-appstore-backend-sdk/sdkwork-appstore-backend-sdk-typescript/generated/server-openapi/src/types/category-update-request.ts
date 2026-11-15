import type { CategoryLocalizationInput } from './category-localization-input';

export interface CategoryUpdateRequest {
  parentCategoryId?: string;
  categoryLevel?: number;
  sortOrder?: number;
  iconMediaResourceId?: string;
  /** Category lifecycle status; deleted is a soft delete. */
  status?: 'active' | 'inactive' | 'deleted';
  localizations?: CategoryLocalizationInput[];
}
