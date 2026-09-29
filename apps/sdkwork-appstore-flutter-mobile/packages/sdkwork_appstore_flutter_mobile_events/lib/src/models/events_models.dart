/// Domain models owned by the events capability.
class EventsRouteEntry {
  const EventsRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class EventsPageResult<TItem> {
  const EventsPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}

/// One listing card participating in a store event.
class EventAppEntry {
  const EventAppEntry({
    required this.id,
    required this.title,
    this.developer = '',
  });

  final String id;
  final String title;
  final String developer;
}

/// Store event detail: header, schedule, and participating listings.
class EventDetail {
  const EventDetail({
    required this.id,
    required this.title,
    this.description = '',
    this.startsAt = '',
    this.endsAt = '',
    this.status = '',
    required this.apps,
  });

  final String id;
  final String title;
  final String description;
  final String startsAt;
  final String endsAt;

  /// Catalog event lifecycle status (`active`, ...).
  final String status;
  final List<EventAppEntry> apps;
}
