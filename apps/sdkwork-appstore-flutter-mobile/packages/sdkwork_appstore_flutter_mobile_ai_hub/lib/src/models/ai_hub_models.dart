/// Domain models owned by the ai-hub capability.
class AiHubRouteEntry {
  const AiHubRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class AiHubPageResult<TItem> {
  const AiHubPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}
