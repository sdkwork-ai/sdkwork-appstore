export interface UserStoreShareUpdateRequest {
  title?: string;
  description?: string;
  scope?: 'all' | 'selected';
  selectedCategoryIds?: string[];
  visibility?: 'public' | 'unlisted';
}
