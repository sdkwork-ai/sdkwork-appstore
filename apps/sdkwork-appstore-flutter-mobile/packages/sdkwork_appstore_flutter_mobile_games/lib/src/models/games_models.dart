/// Domain models owned by the games capability.
class GamesRouteEntry {
  const GamesRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class GamesPageResult<TItem> {
  const GamesPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}

/// One listing card of a games section.
class GamesEntry {
  const GamesEntry({
    required this.id,
    required this.title,
    this.subtitle = '',
  });

  final String id;
  final String title;
  final String subtitle;
}

/// One games hall section (PC: 桌游大厅 / 小游戏 / 掌机游戏 / PC 游戏).
class GamesSection {
  const GamesSection({required this.key, required this.title, required this.items});

  /// Stable section key: board, mini, handheld, pc.
  final String key;
  final String title;
  final List<GamesEntry> items;
}

/// Games hall feed.
class GamesFeed {
  const GamesFeed({required this.sections, required this.boardSubFilters});

  final List<GamesSection> sections;

  /// Sub-filter chips of the board-game hall (PC boardSubFilter).
  final List<String> boardSubFilters;
}
