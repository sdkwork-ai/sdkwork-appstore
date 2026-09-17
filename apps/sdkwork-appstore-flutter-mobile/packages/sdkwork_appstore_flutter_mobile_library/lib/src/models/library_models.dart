/// Domain models owned by the library capability.
class LibraryRouteEntry {
  const LibraryRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class LibraryPageResult<TItem> {
  const LibraryPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
