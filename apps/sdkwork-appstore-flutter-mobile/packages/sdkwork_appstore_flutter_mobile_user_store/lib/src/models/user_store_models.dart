/// Domain models owned by the user-store capability.
class UserStoreRouteEntry {
  const UserStoreRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class UserStorePageResult<TItem> {
  const UserStorePageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}

/// One custom category of the personal appstore (owner view).
class UserStoreCategory {
  const UserStoreCategory({
    required this.id,
    required this.name,
    this.itemCount = 0,
  });

  final String id;
  final String name;
  final int itemCount;
}

/// One share link of the personal appstore (owner view).
class UserStoreShareLink {
  const UserStoreShareLink({
    required this.id,
    required this.shareToken,
    required this.title,
    this.status = 'active',
    this.viewCount = '0',
  });

  final String id;
  final String shareToken;
  final String title;

  /// `active` or `revoked`.
  final String status;

  /// int64 view count serialized as a decimal string (API_SPEC §13.6).
  final String viewCount;
}

/// Public personal-appstore view rendered for a share token.
class PublicUserStoreView {
  const PublicUserStoreView({
    required this.shareToken,
    required this.title,
    this.description = '',
    required this.categories,
  });

  final String shareToken;
  final String title;
  final String description;
  final List<PublicUserStoreCategory> categories;
}

/// One public category summary with its listing cards.
class PublicUserStoreCategory {
  const PublicUserStoreCategory({
    required this.id,
    required this.name,
    required this.apps,
  });

  final String id;
  final String name;
  final List<PublicUserStoreApp> apps;
}

/// One public listing card (no download count on the public surface).
class PublicUserStoreApp {
  const PublicUserStoreApp({
    required this.listingId,
    required this.title,
    this.subtitle = '',
  });

  final String listingId;
  final String title;
  final String subtitle;
}
