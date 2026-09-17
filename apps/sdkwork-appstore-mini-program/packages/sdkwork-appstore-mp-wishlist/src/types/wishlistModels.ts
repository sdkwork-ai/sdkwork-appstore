/** Domain models owned by the wishlist capability. */
export interface WishlistRouteEntry {
  readonly routeId: string;
  readonly path: string;
}

export interface WishlistPageResult<TItem> {
  readonly items: readonly TItem[];
  readonly nextCursor?: string;
}
