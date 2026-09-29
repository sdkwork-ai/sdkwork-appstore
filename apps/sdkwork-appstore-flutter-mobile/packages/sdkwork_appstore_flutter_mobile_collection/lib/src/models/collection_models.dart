/// Domain models owned by the collection capability.
class CollectionRouteEntry {
  const CollectionRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class CollectionPageResult<TItem> {
  const CollectionPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}

/// One listing card of an editorial collection.
class CollectionAppEntry {
  const CollectionAppEntry({
    required this.id,
    required this.title,
    this.developer = '',
  });

  final String id;
  final String title;
  final String developer;
}

/// Editorial collection detail: localized header plus ordered listing cards.
class CollectionDetail {
  const CollectionDetail({
    required this.id,
    required this.name,
    this.description = '',
    required this.apps,
  });

  final String id;
  final String name;
  final String description;
  final List<CollectionAppEntry> apps;
}
