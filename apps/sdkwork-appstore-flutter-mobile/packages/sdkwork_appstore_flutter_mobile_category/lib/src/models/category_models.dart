/// Domain models owned by the category capability.
class CategoryRouteEntry {
  const CategoryRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class CategoryPageResult<TItem> {
  const CategoryPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}

/// One listing card inside a category page.
class CategoryAppEntry {
  const CategoryAppEntry({
    required this.id,
    required this.title,
    this.developer = '',
  });

  final String id;
  final String title;
  final String developer;
}

/// Category detail: localized header plus its listing page.
class CategoryDetail {
  const CategoryDetail({
    required this.id,
    required this.name,
    this.description = '',
    required this.apps,
  });

  final String id;
  final String name;
  final String description;
  final List<CategoryAppEntry> apps;
}
