/// Domain models owned by the search capability.
class SearchRouteEntry {
  const SearchRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class SearchPageResult<TItem> {
  const SearchPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
