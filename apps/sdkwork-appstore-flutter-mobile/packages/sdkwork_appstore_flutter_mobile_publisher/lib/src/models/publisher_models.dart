/// Domain models owned by the publisher capability.
class PublisherRouteEntry {
  const PublisherRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class PublisherPageResult<TItem> {
  const PublisherPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
