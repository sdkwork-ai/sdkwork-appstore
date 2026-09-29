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

/// One listing row of the apps browse page.
class AppsListEntry {
  const AppsListEntry({
    required this.id,
    required this.title,
    this.subtitle = '',
    this.category = '',
  });

  final String id;
  final String title;
  final String subtitle;
  final String category;
}

/// One keyset page of the apps browse list.
class AppsListPage {
  const AppsListPage({required this.items, this.nextCursor});

  final List<AppsListEntry> items;
  final String? nextCursor;
}
