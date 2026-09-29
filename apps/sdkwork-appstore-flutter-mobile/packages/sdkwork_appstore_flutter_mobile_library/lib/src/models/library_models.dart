/// Domain models owned by the library capability.
class LibraryRouteEntry {
  const LibraryRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class LibraryPageResult<TItem> {
  const LibraryPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}

/// One installed listing row.
class LibraryEntry {
  const LibraryEntry({
    required this.listingId,
    required this.title,
    this.libraryItemId = '',
    this.developer = '',
    this.installedVersion = '',
  });

  final String listingId;
  final String title;

  /// Library item id used by the uninstall surface.
  final String libraryItemId;
  final String developer;
  final String installedVersion;
}
