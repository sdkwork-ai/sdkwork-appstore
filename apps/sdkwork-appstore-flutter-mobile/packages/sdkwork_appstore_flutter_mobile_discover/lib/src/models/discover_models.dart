/// Domain models owned by the discover capability.
class DiscoverRouteEntry {
  const DiscoverRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class DiscoverPageResult<TItem> {
  const DiscoverPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
