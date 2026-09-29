import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/charts_models.dart';

/// Charts service.
///
/// Injected clients only; data flows through the generated Dart target of
/// `sdkwork-appstore-app-sdk`. Ranking ids come from the chart snapshot and
/// are resolved back in listing order (PC getTopCharts pattern).
class ChartsService {
  const ChartsService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'charts';

  /// Loads the free or paid top chart; `kind` is `free` or `paid`.
  Future<List<ChartEntry>> loadChart(String kind) async {
    clients.ensureTransportBound(capability);
    final client = clients.requireAppClient;
    final chart = await client.catalog.appstoreCatalogChartsRetrieve(kind);
    final chartRow = AppstoreAppSdkClients.itemOf(chart?.data);
    final ranking = chartRow?['rankingJson'] ?? chartRow?['ranking'];
    final rankedIds = <String>[
      if (ranking is List)
        for (final entry in ranking)
          if (entry is Map) (entry['listingId'] ?? '').toString(),
    ].where((id) => id.isNotEmpty).toList();
    if (rankedIds.isEmpty) {
      return const <ChartEntry>[];
    }
    final listingResponse = await client.catalog.appstoreCatalogListingsList(
      null,
      null,
      rankedIds.join(','),
      null,
      rankedIds.length,
    );
    final bySlug = <String, Map<String, dynamic>>{
      for (final row in AppstoreAppSdkClients.itemsOf(listingResponse?.data))
        _text(row['listingSlug'], _text(row['id'])): row,
    };
    final entries = <ChartEntry>[];
    for (var index = 0; index < rankedIds.length; index++) {
      final row = bySlug[rankedIds[index]];
      if (row == null) {
        continue;
      }
      entries.add(
        ChartEntry(
          rank: index + 1,
          id: _text(row['listingSlug'], _text(row['id'])),
          title: _text(row['displayName'], _text(row['title'], '应用')),
          developer: _text(row['developerName'], _text(row['publisherName'], '')),
          pricingModel: _text(row['pricingModel'], 'FREE'),
        ),
      );
    }
    return entries;
  }
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
