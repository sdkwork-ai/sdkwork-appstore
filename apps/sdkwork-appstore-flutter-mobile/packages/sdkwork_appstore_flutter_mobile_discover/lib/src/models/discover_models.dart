/// Domain models owned by the discover capability.
class DiscoverRouteEntry {
  const DiscoverRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class DiscoverPageResult<TItem> {
  const DiscoverPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}

/// One storefront card rendered by discover rails.
class DiscoverEntry {
  const DiscoverEntry({
    required this.id,
    required this.title,
    this.subtitle = '',
    this.endsAt = '',
    this.rating = 0,
  });

  final String id;
  final String title;
  final String subtitle;

  /// Event deadline label (`endsAt`), empty for non-event entries.
  final String endsAt;

  /// Aggregate star rating (0 = unrated; rails hide the star row then).
  final double rating;
}

/// Discover feed mirroring the PC storefront blocks: hero picks, category
/// navigation, editorial collections, active events, recently updated, and
/// recommendations.
class DiscoverFeed {
  const DiscoverFeed({
    required this.heroApps,
    required this.categories,
    required this.collections,
    required this.events,
    required this.recentlyUpdated,
    required this.recommendations,
  });

  final List<DiscoverEntry> heroApps;
  final List<DiscoverEntry> categories;
  final List<DiscoverEntry> collections;
  final List<DiscoverEntry> events;
  final List<DiscoverEntry> recentlyUpdated;
  final List<DiscoverEntry> recommendations;

  /// Empty-store判定 used by the discover empty state (PC EmptyState):
  /// no rail carries any entry.
  bool get isEmpty =>
      heroApps.isEmpty &&
      categories.isEmpty &&
      collections.isEmpty &&
      events.isEmpty &&
      recentlyUpdated.isEmpty &&
      recommendations.isEmpty;
}
