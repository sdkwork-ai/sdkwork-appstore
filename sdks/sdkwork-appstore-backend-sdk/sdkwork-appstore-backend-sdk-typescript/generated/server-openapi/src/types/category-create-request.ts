import type { CategoryLocalizationInput } from './category-localization-input';

export interface CategoryCreateRequest {
  categoryCode: string;
  parentCategoryId?: string;
  categoryLevel?: number;
  sortOrder?: number;
  iconMediaResourceId?: string;
  localizations?: CategoryLocalizationInput[];
}
