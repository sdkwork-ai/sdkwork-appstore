import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/discover_messages.dart';
import '../models/discover_models.dart';
import '../services/discover_service.dart';

/// Discover screen (canonical route `app.store.discover.index`).
///
/// Storefront blocks mirror the PC discover page: hero picks, category
/// navigation, editorial collections, active events, recently updated, and
/// recommendations, with the empty-store state when no rail has content.
/// Screens stay in capability packages; the root keeps only bootstrap,
/// providers, route assembly, and shell registration
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({required this.service, super.key});

  final DiscoverService service;

  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  late Future<DiscoverFeed> _feedFuture;

  @override
  void initState() {
    super.initState();
    _feedFuture = widget.service.loadFeed();
  }

  void _reload() {
    setState(() {
      _feedFuture = widget.service.loadFeed();
    });
  }

  void _openApp(String id) => Navigator.pushNamed(context, '/app/$id');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(discoverMessages['titleZh'] ?? discoverMessages['title'] ?? '发现'),
        actions: <Widget>[
          IconButton(
            icon: const Icon(Icons.search),
            tooltip: '搜索',
            onPressed: () => Navigator.pushNamed(context, '/search'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => _reload(),
        child: FutureBuilder<DiscoverFeed>(
          future: _feedFuture,
          builder: (BuildContext context, AsyncSnapshot<DiscoverFeed> snapshot) {
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
            if (feed.isEmpty) {
              return AppstoreScreenState(
                kind: AppstoreScreenStateKind.empty,
                message: '店铺还没有上架内容，先去应用列表看看吧',
              );
            }
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: <Widget>[
                if (feed.heroApps.isNotEmpty)
                  _EntryRail(
                    header: '编辑精选',
                    entries: feed.heroApps,
                    onTap: _openApp,
                    heroStyle: true,
                  ),
                if (feed.categories.isNotEmpty)
                  _CategoryChips(categories: feed.categories),
                if (feed.collections.isNotEmpty)
                  _EntryRail(
                    header: '编辑合集',
                    entries: feed.collections,
                    onTap: (String id) =>
                        Navigator.pushNamed(context, '/collection/$id'),
                  ),
                if (feed.events.isNotEmpty)
                  _EntryRail(
                    header: '限时活动',
                    entries: feed.events,
                    onTap: (String id) => Navigator.pushNamed(context, '/events/$id'),
                    showEndsAt: true,
                  ),
                if (feed.recentlyUpdated.isNotEmpty)
                  _EntryList(header: '最近更新', entries: feed.recentlyUpdated, onTap: _openApp),
                if (feed.recommendations.isNotEmpty)
                  _EntryList(header: '为你推荐', entries: feed.recommendations, onTap: _openApp),
                const SizedBox(height: 24),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _EntryRail extends StatelessWidget {
  const _EntryRail({
    required this.header,
    required this.entries,
    required this.onTap,
    this.heroStyle = false,
    this.showEndsAt = false,
  });

  final String header;
  final List<DiscoverEntry> entries;
  final void Function(String id) onTap;
  final bool heroStyle;
  final bool showEndsAt;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        AppstoreSectionHeader(title: header),
        SizedBox(
          height: heroStyle || showEndsAt ? 132 : 112,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: entries.length,
            separatorBuilder: (BuildContext context, int index) => const SizedBox(width: 12),
            itemBuilder: (BuildContext context, int index) {
              final entry = entries[index];
              return Card(
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => onTap(entry.id),
                  child: SizedBox(
                    width: heroStyle ? 200 : 168,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Row(
                            children: <Widget>[
                              CircleAvatar(
                                radius: 16,
                                backgroundColor: colorScheme.primaryContainer,
                                child: Text(
                                  entry.title.isNotEmpty
                                      ? entry.title.characters.first.toUpperCase()
                                      : '?',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: colorScheme.onPrimaryContainer,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  entry.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context).textTheme.titleSmall,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Expanded(
                            child: Text(
                              showEndsAt && entry.endsAt.isNotEmpty
                                  ? '截止 ${entry.endsAt}'
                                  : entry.subtitle,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _CategoryChips extends StatelessWidget {
  const _CategoryChips({required this.categories});

  final List<DiscoverEntry> categories;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        AppstoreSectionHeader(title: '分类'),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              for (final category in categories)
                ActionChip(
                  label: Text(category.title),
                  onPressed: () => Navigator.pushNamed(context, '/category/${category.id}'),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _EntryList extends StatelessWidget {
  const _EntryList({required this.header, required this.entries, required this.onTap});

  final String header;
  final List<DiscoverEntry> entries;
  final void Function(String id) onTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        AppstoreSectionHeader(title: header),
        for (final entry in entries)
          AppstoreListTileCard(
            title: entry.title,
            subtitle: entry.subtitle,
            onTap: () => onTap(entry.id),
          ),
      ],
    );
  }
}
