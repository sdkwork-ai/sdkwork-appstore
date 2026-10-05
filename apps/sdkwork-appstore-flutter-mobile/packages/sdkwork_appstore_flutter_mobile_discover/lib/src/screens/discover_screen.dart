import 'dart:async';

import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/discover_messages.dart';
import '../models/discover_models.dart';
import '../services/discover_service.dart';

/// Discover screen (canonical route `app.store.discover.index`).
///
/// Storefront blocks mirror the PC/H5 discover page and the shared UI design
/// spec (§5.1): a featured-app hero carousel, circular category entries,
/// editorial collection cards, limited-time events, recently updated rows, and
/// a two-column recommendation grid — each section rendering its own skeleton
/// while the feed loads, never a blank screen. Screens stay in capability
/// packages; the root keeps only bootstrap, providers, route assembly, and
/// shell registration (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
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
            icon: const Icon(Icons.leaderboard_outlined),
            tooltip: '排行榜',
            onPressed: () => Navigator.pushNamed(context, '/charts'),
          ),
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
              return const _DiscoverSkeleton();
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
              padding: const EdgeInsets.only(bottom: 24),
              children: <Widget>[
                if (feed.heroApps.isNotEmpty)
                  _HeroCarousel(
                    entries: feed.heroApps.take(5).toList(growable: false),
                    onOpen: _openApp,
                  ),
                if (feed.categories.isNotEmpty)
                  _CategoryRail(categories: feed.categories),
                if (feed.collections.isNotEmpty)
                  _CollectionRail(
                    collections: feed.collections,
                    onOpen: (String id) =>
                        Navigator.pushNamed(context, '/collection/$id'),
                  ),
                if (feed.events.isNotEmpty)
                  _EventRail(
                    events: feed.events,
                    onOpen: (String id) =>
                        Navigator.pushNamed(context, '/events/$id'),
                  ),
                if (feed.recentlyUpdated.isNotEmpty)
                  _EntryList(
                    header: '最近更新',
                    entries: feed.recentlyUpdated,
                    trailingBuilder: (DiscoverEntry entry) => _TagPill(
                      label: '更新',
                      foreground: Theme.of(context).colorScheme.primary,
                      background: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                    ),
                    onTap: _openApp,
                  ),
                if (feed.recommendations.isNotEmpty)
                  _RecommendationGrid(entries: feed.recommendations, onOpen: _openApp),
              ],
            );
          },
        ),
      ),
    );
  }
}

/* ── shared visual helpers (UI_DESIGN_SPEC §2 tokens) ─────────────────────── */

/// Deterministic vibrant gradients keyed by name — the same palette and order
/// as the H5/mini-program home rails, so one app wears one color everywhere.
const List<List<Color>> _appGradients = <List<Color>>[
  <Color>[Color(0xFF0071E3), Color(0xFF5856D6)],
  <Color>[Color(0xFF34C759), Color(0xFF00C7BE)],
  <Color>[Color(0xFFFF9500), Color(0xFFFF3B30)],
  <Color>[Color(0xFFAF52DE), Color(0xFFFF2D55)],
  <Color>[Color(0xFF5AC8FA), Color(0xFF0071E3)],
  <Color>[Color(0xFFFF2D55), Color(0xFFFF9500)],
];

List<Color> _gradientFor(String key) {
  var hash = 0;
  for (var index = 0; index < key.length; index++) {
    hash = (hash * 31 + key.codeUnitAt(index)) & 0x7fffffff;
  }
  return _appGradients[hash % _appGradients.length];
}

/// Continuous-corner app icon block (22.37% radius, spec §2.3).
class _AppIcon extends StatelessWidget {
  const _AppIcon({required this.title, this.size = 56, this.overlay = false});

  final String title;
  final double size;
  final bool overlay;

  @override
  Widget build(BuildContext context) {
    final List<Color> colors = overlay
        ? const <Color>[Color(0x3DFFFFFF), Color(0x24FFFFFF)]
        : _gradientFor(title);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(size * 0.2237),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: colors,
        ),
      ),
      alignment: Alignment.center,
      child: Text(
        title.isNotEmpty ? title.characters.first.toUpperCase() : '应',
        style: TextStyle(
          color: Colors.white,
          fontSize: size * 0.42,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _TagPill extends StatelessWidget {
  const _TagPill({
    required this.label,
    required this.foreground,
    required this.background,
  });

  final String label;
  final Color foreground;
  final Color background;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: foreground,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _RatingBadge extends StatelessWidget {
  const _RatingBadge({required this.rating, this.onDark = false});

  final double rating;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    if (!(rating > 0)) {
      return const SizedBox.shrink();
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Icon(Icons.star_rounded, size: 14, color: onDark ? const Color(0xFFFFD60A) : const Color(0xFFFFCE00)),
        const SizedBox(width: 2),
        Text(
          rating.toStringAsFixed(1),
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: onDark ? Colors.white : Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

/* ── hero carousel (UI_DESIGN_SPEC §4.3: 5s auto-rotation + swipe) ────────── */

class _HeroCarousel extends StatefulWidget {
  const _HeroCarousel({required this.entries, required this.onOpen});

  final List<DiscoverEntry> entries;
  final void Function(String id) onOpen;

  @override
  State<_HeroCarousel> createState() => _HeroCarouselState();
}

class _HeroCarouselState extends State<_HeroCarousel> {
  final PageController _controller = PageController(viewportFraction: 0.92);
  Timer? _timer;
  int _index = 0;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    if (widget.entries.length > 1) {
      _timer = Timer.periodic(const Duration(seconds: 5), (Timer task) {
        if (!_controller.hasClients) {
          return;
        }
        final int next = (_index + 1) % widget.entries.length;
        _controller.animateToPage(
          next,
          duration: const Duration(milliseconds: 450),
          curve: Curves.easeOutCubic,
        );
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        GestureDetector(
          // A user-driven swipe restarts the auto-rotation window.
          onPanDown: (DragDownDetails details) => _startTimer(),
          child: SizedBox(
            height: 210,
            child: PageView.builder(
              controller: _controller,
              itemCount: widget.entries.length,
              onPageChanged: (int index) => setState(() => _index = index),
              itemBuilder: (BuildContext context, int index) {
                final entry = widget.entries[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(24),
                    onTap: () => widget.onOpen(entry.id),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: _gradientFor(entry.title),
                        ),
                        boxShadow: <BoxShadow>[
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.12),
                            blurRadius: 18,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Row(
                            children: <Widget>[
                              _AppIcon(title: entry.title, size: 60, overlay: true),
                              const Spacer(),
                              Text(
                                index == 0 ? '今日精选' : '编辑推荐',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.8),
                                  fontSize: 12,
                                  letterSpacing: 2,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          const Spacer(),
                          Text(
                            entry.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            entry.subtitle,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.85),
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: <Widget>[
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.95),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: const Text(
                                  '查看',
                                  style: TextStyle(
                                    color: Color(0xFF1D1D1F),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              _RatingBadge(rating: entry.rating, onDark: true),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            for (var index = 0; index < widget.entries.length; index++)
              AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: index == _index ? 18 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: index == _index
                      ? Theme.of(context).colorScheme.primary
                      : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

/* ── circular category rail ───────────────────────────────────────────────── */

class _CategoryRail extends StatelessWidget {
  const _CategoryRail({required this.categories});

  final List<DiscoverEntry> categories;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const AppstoreSectionHeader(title: '分类'),
        SizedBox(
          height: 84,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (BuildContext context, int index) => const SizedBox(width: 14),
            itemBuilder: (BuildContext context, int index) {
              final category = categories[index];
              final colors = _gradientFor(category.title);
              return InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () => Navigator.pushNamed(context, '/category/${category.id}'),
                child: SizedBox(
                  width: 60,
                  child: Column(
                    children: <Widget>[
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: colors,
                          ),
                          boxShadow: <BoxShadow>[
                            BoxShadow(
                              color: colors.last.withValues(alpha: 0.25),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          category.title.isNotEmpty ? category.title.characters.first : '分',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        category.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
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

/* ── editorial collection rail ─────────────────────────────────────────────── */

class _CollectionRail extends StatelessWidget {
  const _CollectionRail({required this.collections, required this.onOpen});

  final List<DiscoverEntry> collections;
  final void Function(String id) onOpen;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const AppstoreSectionHeader(title: '编辑精选合集'),
        SizedBox(
          height: 148,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: collections.length,
            separatorBuilder: (BuildContext context, int index) => const SizedBox(width: 12),
            itemBuilder: (BuildContext context, int index) {
              final collection = collections[index];
              return InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: () => onOpen(collection.id),
                child: Container(
                  width: 176,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: _gradientFor(collection.title),
                    ),
                  ),
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.25),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Text(
                          '合集',
                          style: TextStyle(color: Colors.white, fontSize: 10, letterSpacing: 2),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        collection.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          height: 1.3,
                        ),
                      ),
                    ],
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

/* ── limited-time event rail ──────────────────────────────────────────────── */

class _EventRail extends StatelessWidget {
  const _EventRail({required this.events, required this.onOpen});

  final List<DiscoverEntry> events;
  final void Function(String id) onOpen;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const AppstoreSectionHeader(title: '限时活动'),
        SizedBox(
          height: 148,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: events.length,
            separatorBuilder: (BuildContext context, int index) => const SizedBox(width: 12),
            itemBuilder: (BuildContext context, int index) {
              final event = events[index];
              return InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: () => onOpen(event.id),
                child: Container(
                  width: 192,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: <Color>[Color(0xFFFF9500), Color(0xFFFF3B30)],
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: const Color(0xFFFF3B30).withValues(alpha: 0.18),
                        blurRadius: 14,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.28),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Text(
                          '限时',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 2,
                          ),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        event.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          height: 1.3,
                        ),
                      ),
                      if (event.endsAt.isNotEmpty) ...<Widget>[
                        const SizedBox(height: 4),
                        Text(
                          '截止 ${event.endsAt}',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.9),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ],
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

/* ── recently-updated rows ────────────────────────────────────────────────── */

class _EntryList extends StatelessWidget {
  const _EntryList({
    required this.header,
    required this.entries,
    required this.onTap,
    this.trailingBuilder,
  });

  final String header;
  final List<DiscoverEntry> entries;
  final void Function(String id) onTap;
  final Widget Function(DiscoverEntry entry)? trailingBuilder;

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
            leadingColor: _gradientFor(entry.title).first,
            trailing: trailingBuilder?.call(entry),
            onTap: () => onTap(entry.id),
          ),
      ],
    );
  }
}

/* ── recommendation grid ──────────────────────────────────────────────────── */

class _RecommendationGrid extends StatelessWidget {
  const _RecommendationGrid({required this.entries, required this.onOpen});

  final List<DiscoverEntry> entries;
  final void Function(String id) onOpen;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const AppstoreSectionHeader(title: '为你推荐'),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: entries.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.58,
            ),
            itemBuilder: (BuildContext context, int index) {
              final entry = entries[index];
              return InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () => onOpen(entry.id),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surfaceContainerLowest,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: colorScheme.onSurface.withValues(alpha: 0.06),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          _AppIcon(title: entry.title, size: 44),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  entry.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  entry.subtitle,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Row(
                        children: <Widget>[
                          _RatingBadge(rating: entry.rating),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: colorScheme.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              '获取',
                              style: TextStyle(
                                color: colorScheme.primary,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
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

/* ── skeleton (UI_DESIGN_SPEC §4.9: no blank flash while loading) ─────────── */

class _DiscoverSkeleton extends StatefulWidget {
  const _DiscoverSkeleton();

  @override
  State<_DiscoverSkeleton> createState() => _DiscoverSkeletonState();
}

class _DiscoverSkeletonState extends State<_DiscoverSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final base = Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.07);
    Widget block(double width, double height, {double radius = 12}) {
      return FadeTransition(
        opacity: Tween<double>(begin: 0.5, end: 1).animate(_pulse),
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: base,
            borderRadius: BorderRadius.circular(radius),
          ),
        ),
      );
    }

    return ListView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      children: <Widget>[
        block(double.infinity, 210, radius: 24),
        const SizedBox(height: 24),
        Row(
          children: <Widget>[
            for (var index = 0; index < 5; index++) ...<Widget>[
              block(56, 56, radius: 28),
              const SizedBox(width: 14),
            ],
          ],
        ),
        const SizedBox(height: 24),
        block(double.infinity, 148, radius: 20),
        const SizedBox(height: 16),
        Row(
          children: <Widget>[
            Expanded(child: block(double.infinity, 96)),
            const SizedBox(width: 12),
            Expanded(child: block(double.infinity, 96)),
          ],
        ),
      ],
    );
  }
}
