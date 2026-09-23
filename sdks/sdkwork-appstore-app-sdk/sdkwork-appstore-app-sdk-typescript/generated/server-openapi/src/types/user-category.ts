export interface UserCategory {
  id: string;
  name: string;
  description?: string;
  iconMediaResourceId?: string;
  sortOrder: number;
  itemCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
