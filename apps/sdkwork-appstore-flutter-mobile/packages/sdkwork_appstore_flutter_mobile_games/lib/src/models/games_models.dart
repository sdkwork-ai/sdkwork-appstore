/// Domain models owned by the games capability.
class GamesRouteEntry {
  const GamesRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class GamesPageResult<TItem> {
  const GamesPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
