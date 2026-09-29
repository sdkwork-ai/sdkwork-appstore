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

/// One publisher-owned listing row (console overview).
class PublisherListingRow {
  const PublisherListingRow({
    required this.id,
    required this.title,
    this.status = '',
    this.currentVersion = '',
  });

  final String id;
  final String title;
  final String status;
  final String currentVersion;
}

/// One release row of a managed listing.
class PublisherReleaseRow {
  const PublisherReleaseRow({
    required this.id,
    required this.version,
    this.status = '',
    this.notes = '',
  });

  final String id;
  final String version;
  final String status;
  final String notes;
}
