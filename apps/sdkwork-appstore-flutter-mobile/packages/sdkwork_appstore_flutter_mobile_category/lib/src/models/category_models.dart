/// Domain models owned by the category capability.
class CategoryRouteEntry {
  const CategoryRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class CategoryPageResult<TItem> {
  const CategoryPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
