import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/games_messages.dart';
import '../models/games_models.dart';
import '../services/games_service.dart';

/// Games hall screen (canonical route `app.store.games.index`).
///
/// Mirrors the PC GamesPage: per-hall tab sections — 桌游大厅 (with sub
/// filters), 小游戏, 掌机游戏, PC 游戏 — over a cursor-paged catalog feed.
class GamesScreen extends StatefulWidget {
  const GamesScreen({required this.service, super.key});

  final GamesService service;

  @override
  State<GamesScreen> createState() => _GamesScreenState();
}

class _GamesScreenState extends State<GamesScreen> {
  late Future<GamesFeed> _feedFuture;

  @override
  void initState() {
    super.initState();
    _feedFuture = widget.service.loadFeed();
  }

  void _reload() {
    setState(() => _feedFuture = widget.service.loadFeed());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(gamesMessages['titleZh'] ?? '游戏')),
      body: FutureBuilder<GamesFeed>(
        future: _feedFuture,
        builder: (BuildContext context, AsyncSnapshot<GamesFeed> snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const AppstoreScreenState(
              kind: AppstoreScreenStateKind.loading,
              message: AppstoreScreenStateMessages.loading,
            );
          }
          if (snapshot.hasError) {
            return AppstoreScreenState(
              kind: AppstoreScreenStateKind.error,
              message: AppstoreScreenStateMessages.error,
              onRetry: _reload,
            );
          }
          final feed = snapshot.data!;
          if (feed.sections.isEmpty) {
            return const AppstoreScreenState(
              kind: AppstoreScreenStateKind.empty,
              message: AppstoreScreenStateMessages.empty,
            );
          }
          return DefaultTabController(
            length: feed.sections.length,
            child: Column(
              children: <Widget>[
                TabBar(
                  isScrollable: true,
                  tabAlignment: TabAlignment.start,
                  tabs: <Widget>[
                    for (final section in feed.sections) Tab(text: section.title),
                  ],
                ),
                Expanded(
                  child: TabBarView(
                    children: <Widget>[
                      for (final section in feed.sections)
                        _SectionList(section: section, subFilters: feed.boardSubFilters),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SectionList extends StatelessWidget {
  const _SectionList({required this.section, required this.subFilters});

  final GamesSection section;
  final List<String> subFilters;

  @override
  Widget build(BuildContext context) {
    final isBoard = section.key == 'board';
    return ListView(
      children: <Widget>[
        if (isBoard && subFilters.isNotEmpty)
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: <Widget>[
                for (final filter in subFilters)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(filter),
                      selected: false,
                      onSelected: (bool selected) {},
                    ),
                  ),
              ],
            ),
          ),
        if (section.items.isEmpty)
          const AppstoreScreenState(
            kind: AppstoreScreenStateKind.empty,
            message: AppstoreScreenStateMessages.empty,
          )
        else
          for (final item in section.items)
            AppstoreListTileCard(
              title: item.title,
              subtitle: item.subtitle,
              onTap: () => Navigator.pushNamed(context, '/app/${item.id}'),
            ),
      ],
    );
  }
}
