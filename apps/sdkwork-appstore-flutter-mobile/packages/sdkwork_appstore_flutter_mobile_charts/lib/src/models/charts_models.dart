/// Domain models owned by the charts capability.
class ChartsRouteEntry {
  const ChartsRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class ChartsPageResult<TItem> {
  const ChartsPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}

/// One ranked row of a chart snapshot.
class ChartEntry {
  const ChartEntry({
    required this.rank,
    required this.id,
    required this.title,
    this.developer = '',
    this.pricingModel = 'FREE',
  });

  final int rank;
  final String id;
  final String title;
  final String developer;
  final String pricingModel;
}
