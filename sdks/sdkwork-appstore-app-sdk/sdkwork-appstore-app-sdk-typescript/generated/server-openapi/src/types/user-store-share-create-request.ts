export interface UserStoreShareCreateRequest {
  title: string;
  description?: string;
  scope?: 'all' | 'selected';
  selectedCategoryIds?: string[];
  visibility?: 'public' | 'unlisted';
}
