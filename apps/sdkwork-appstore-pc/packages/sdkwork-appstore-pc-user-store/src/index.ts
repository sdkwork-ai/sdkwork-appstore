export {
  UserStorePage,
  PublicUserStorePage,
  UserCategoryCard,
  CreateCategoryDialog,
  ShareManageDialog,
  UserStoreEmptyState,
  CategoryItemsDialog,
  AddToCategoryPopover,
} from '@sdkwork/appstore-pc-product';

/** Authenticated management surface for the owner's custom categories. */
export const userStoreRoute = {
  path: '/user-store',
  title: 'My Appstore',
  id: 'user-store',
};

/** Anonymous public share view rendered for visitors holding a share token. */
export const publicUserStoreRoute = {
  path: '/store/:shareToken',
  title: 'Public Appstore',
  id: 'public-user-store',
};
