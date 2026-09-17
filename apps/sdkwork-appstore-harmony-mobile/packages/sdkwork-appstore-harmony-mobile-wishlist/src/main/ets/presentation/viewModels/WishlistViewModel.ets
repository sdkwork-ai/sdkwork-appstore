import { WishlistState } from '../../state/WishlistState';

/** Presentation view model for the wishlist capability. */
@Observed
export class WishlistViewModel {
  readonly state: WishlistState = new WishlistState();

  get capability(): string {
    return 'wishlist';
  }
}
