export interface UserStoreShare {
  id: string;
  shareToken: string;
  title: string;
  description?: string;
  scope: 'all' | 'selected';
  selectedCategoryIds: string[];
  visibility: 'public' | 'unlisted';
  status: 'active' | 'revoked';
  expiresAt?: string;
  viewCount: string;
  createdAt: string;
  updatedAt: string;
}
