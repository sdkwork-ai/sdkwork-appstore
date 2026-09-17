/// Domain models owned by the updates capability.
class UpdatesRouteEntry {
  const UpdatesRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class UpdatesPageResult<TItem> {
  const UpdatesPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
