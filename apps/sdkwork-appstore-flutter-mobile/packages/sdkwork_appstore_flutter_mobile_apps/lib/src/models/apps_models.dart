/// Domain models owned by the apps capability.
class AppsRouteEntry {
  const AppsRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class AppsPageResult<TItem> {
  const AppsPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
