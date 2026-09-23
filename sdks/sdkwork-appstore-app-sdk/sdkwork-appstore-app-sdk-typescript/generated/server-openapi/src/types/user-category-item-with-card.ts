import type { ListingCard } from './listing-card';
import type { UserCategoryItem } from './user-category-item';

export interface UserCategoryItemWithCard {
  item: UserCategoryItem;
  listingCard?: ListingCard;
}
