/// Domain models owned by the collection capability.
class CollectionRouteEntry {
  const CollectionRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class CollectionPageResult<TItem> {
  const CollectionPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
