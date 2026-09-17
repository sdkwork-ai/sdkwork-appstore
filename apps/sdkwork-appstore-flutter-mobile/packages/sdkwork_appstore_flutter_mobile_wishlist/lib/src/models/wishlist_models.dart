/// Domain models owned by the wishlist capability.
class WishlistRouteEntry {
  const WishlistRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class WishlistPageResult<TItem> {
  const WishlistPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
