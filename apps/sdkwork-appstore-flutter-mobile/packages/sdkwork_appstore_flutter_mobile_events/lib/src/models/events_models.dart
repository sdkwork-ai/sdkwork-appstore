/// Domain models owned by the events capability.
class EventsRouteEntry {
  const EventsRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class EventsPageResult<TItem> {
  const EventsPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
