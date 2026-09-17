/// Domain models owned by the charts capability.
class ChartsRouteEntry {
  const ChartsRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class ChartsPageResult<TItem> {
  const ChartsPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
