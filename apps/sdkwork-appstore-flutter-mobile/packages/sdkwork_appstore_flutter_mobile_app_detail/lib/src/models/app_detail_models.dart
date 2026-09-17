/// Domain models owned by the app-detail capability.
class AppDetailRouteEntry {
  const AppDetailRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class AppDetailPageResult<TItem> {
  const AppDetailPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
