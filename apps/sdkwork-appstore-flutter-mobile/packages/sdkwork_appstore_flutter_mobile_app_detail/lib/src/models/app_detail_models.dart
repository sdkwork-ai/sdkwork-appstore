/// Domain models owned by the app-detail capability.
class AppDetailRouteEntry {
  const AppDetailRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class AppDetailPageResult<TItem> {
  const AppDetailPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}

/// Latest release notes block (PC AppWhatsNew).
class AppWhatsNew {
  const AppWhatsNew({
    this.version = '',
    this.date = '',
    this.notes = '',
  });

  final String version;
  final String date;
  final String notes;
}

/// One key/value info row (PC AppInfo).
class AppInfoRow {
  const AppInfoRow({required this.label, required this.value});

  final String label;
  final String value;
}

/// One in-app purchase entry (PC AppInAppPurchases).
class AppIapEntry {
  const AppIapEntry({required this.name, required this.price});

  final String name;
  final String price;
}

/// One related listing row (more by developer / similar recommendations).
class AppRelatedEntry {
  const AppRelatedEntry({
    required this.id,
    required this.title,
    this.developer = '',
  });

  final String id;
  final String title;
  final String developer;
}

/// App detail view model mirroring the PC AppDetail blocks: header, stats,
/// screenshots, description, what's new, reviews, info, IAP, privacy, more by
/// developer, and similar recommendations.
class AppDetail {
  const AppDetail({
    required this.id,
    required this.name,
    required this.developer,
    this.rating = 0,
    this.ratingCount = 0,
    this.pricingModel = 'FREE',
    this.inWishlist = false,
    this.chartRank = 0,
    this.ageRating = '',
    this.size = '',
    this.screenshots = const <String>[],
    this.description = '',
    this.whatsNew = const AppWhatsNew(),
    this.infoRows = const <AppInfoRow>[],
    this.iapEntries = const <AppIapEntry>[],
    this.privacyLinked = false,
    this.moreByDeveloper = const <AppRelatedEntry>[],
    this.similarApps = const <AppRelatedEntry>[],
  });

  final String id;
  final String name;
  final String developer;
  final double rating;
  final int ratingCount;
  final String pricingModel;
  final bool inWishlist;

  /// Board position when the listing is charted (PC AppHeaderStatsBar).
  final int chartRank;
  final String ageRating;
  final String size;
  final List<String> screenshots;
  final String description;
  final AppWhatsNew whatsNew;
  final List<AppInfoRow> infoRows;
  final List<AppIapEntry> iapEntries;

  /// Privacy label linked state (PC AppPrivacy).
  final bool privacyLinked;
  final List<AppRelatedEntry> moreByDeveloper;
  final List<AppRelatedEntry> similarApps;
}
