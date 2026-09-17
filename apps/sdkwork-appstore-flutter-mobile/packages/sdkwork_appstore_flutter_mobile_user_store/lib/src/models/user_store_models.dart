/// Domain models owned by the user-store capability.
class UserStoreRouteEntry {
  const UserStoreRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class UserStorePageResult<TItem> {
  const UserStorePageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
