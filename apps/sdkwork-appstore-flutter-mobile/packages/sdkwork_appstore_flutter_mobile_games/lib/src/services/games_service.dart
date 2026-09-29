import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/games_models.dart';

/// Games hall service.
///
/// Injected clients only; data flows through the generated Dart target of
/// `sdkwork-appstore-app-sdk`. Sections mirror the PC halls: the catalog
/// result set for the 游戏 keyword is split by hall keywords, and unknown
/// rows land in the board hall so nothing is silently dropped.
class GamesService {
  const GamesService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'games';

  static const List<String> boardSubFilters = <String>[
    '策略', '聚会', '家庭', '卡牌',
  ];

  /// Loads the games hall feed.
  Future<GamesFeed> loadFeed() async {
    clients.ensureTransportBound(capability);
    final response = await clients.requireAppClient.catalog
        .appstoreCatalogListingsList('游戏', null, null, null, 100);
    final rows = AppstoreAppSdkClients.itemsOf(response?.data);
    GamesEntry toEntry(Map<String, dynamic> row) => GamesEntry(
          id: _text(row['listingSlug'], _text(row['id'])),
          title: _text(row['displayName'], _text(row['title'], '游戏')),
          subtitle: _text(row['developerName'], _text(row['publisherName'], '')),
        );
    bool matchesKeyword(Map<String, dynamic> row, List<String> keywords) {
      final haystack = _text(row['displayName']) +
          _text(row['subtitle']) +
          _text(row['description']);
      return keywords.any(haystack.contains);
    }

    const miniKeywords = <String>['小游戏', '休闲', '益智'];
    const handheldKeywords = <String>['掌机', '像素', '复古'];
    const pcKeywords = <String>['PC', '端游', 'Steam'];
    final sections = <GamesSection>[
      GamesSection(
        key: 'board',
        title: '桌游大厅',
        items: <GamesEntry>[
          for (final row in rows)
            if (!matchesKeyword(row, miniKeywords) &&
                !matchesKeyword(row, handheldKeywords) &&
                !matchesKeyword(row, pcKeywords))
              toEntry(row),
        ],
      ),
      GamesSection(
        key: 'mini',
        title: '小游戏',
        items: <GamesEntry>[
          for (final row in rows)
            if (matchesKeyword(row, miniKeywords)) toEntry(row),
        ],
      ),
      GamesSection(
        key: 'handheld',
        title: '掌机游戏',
        items: <GamesEntry>[
          for (final row in rows)
            if (matchesKeyword(row, handheldKeywords)) toEntry(row),
        ],
      ),
      GamesSection(
        key: 'pc',
        title: 'PC 游戏',
        items: <GamesEntry>[
          for (final row in rows)
            if (matchesKeyword(row, pcKeywords)) toEntry(row),
        ],
      ),
    ];
    return GamesFeed(sections: sections, boardSubFilters: boardSubFilters);
  }
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
