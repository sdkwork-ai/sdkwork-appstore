import 'dart:async';

import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/discover_messages.dart';
import '../models/discover_models.dart';
import '../services/discover_service.dart';

/// Discover screen (canonical route `app.store.discover.index`).
///
/// Today-grade storefront mirroring the PC/H5 discover page and the shared
/// UI design spec (§5.1): a layered featured-app hero carousel (watermark
/// glyph + radial glow + glass badges), crafted app icons (gloss + inner
/// ring over the gradient), circular category entries, editorial collection
/// and event cards, recently updated rows, and a two-column recommendation
/// grid with real 获取 actions — each section rendering its own skeleton
/// while the feed loads. Screens stay in capability packages; the root keeps
/// only bootstrap, providers, route assembly, and shell registration
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
          // Creation hub: new app / new website / new promo app, each carrying
          // its store application type into the publisher create flow.
          PopupMenuButton<String>(
            tooltip: '新建',
            icon: Icon(
              Icons.add_circle,
              size: 28,
              color: Theme.of(context).colorScheme.primary,
            ),
            onSelected: (String type) =>
                Navigator.pushNamed(context, '/publisher/apps/new?type=$type'),
            itemBuilder: (BuildContext context) => const <PopupMenuEntry<String>>[
              PopupMenuItem<String>(
                value: 'app',
                child: ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.apps),
                  title: Text('新建应用'),
                  subtitle: Text('发布一个全新的应用'),
                ),
              ),
              PopupMenuItem<String>(
                value: 'website',
                child: ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.language),
                  title: Text('新建官网'),
                  subtitle: Text('搭建并发布官方网站'),
                ),
              ),
              PopupMenuItem<String>(
                value: 'promo',
                child: ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.campaign),
                  title: Text('新建宣传应用'),
                  subtitle: Text('创建宣传页应用'),
                ),
              ),
            ],
          ),
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
              padding: const EdgeInsets.only(bottom: 32),
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
                      background:
                          Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
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

/* ═══ design primitives (UI_DESIGN_SPEC §2 tokens, Today-grade craft) ══════ */

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

/// App icon with the full craft treatment: gradient base, top-left gloss,
/// inner hairline ring, and a confident letterform with a soft shadow.
class _CraftIcon extends StatelessWidget {
  const _CraftIcon({
    required this.title,
    this.size = 56,
    this.circle = false,
  });

  final String title;
  final double size;
  final bool circle;

  @override
  Widget build(BuildContext context) {
    final double radius = circle ? size / 2 : size * 0.2237;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(radius),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: _gradientFor(title),
        ),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Stack(
        children: <Widget>[
          // Top-left gloss.
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(radius),
                gradient: RadialGradient(
                  center: const Alignment(-0.68, -0.88),
                  radius: 1.5,
                  colors: <Color>[
                    Colors.white.withValues(alpha: 0.4),
                    Colors.white.withValues(alpha: 0),
                  ],
                  stops: const <double>[0, 0.56],
                ),
              ),
            ),
          ),
          // Inner hairline ring.
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(radius),
                border: Border.all(color: Colors.white.withValues(alpha: 0.26)),
              ),
            ),
          ),
          Center(
            child: Text(
              title.isNotEmpty ? title.characters.first.toUpperCase() : '应',
              style: TextStyle(
                color: Colors.white,
                fontSize: size * 0.4,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
                shadows: <Shadow>[
                  Shadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 3,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Layered feature card: gradient base + radial glow + oversized rotated
/// watermark glyph behind the content. Used by the hero and the compact
/// collection/event cards.
class _FeatureCard extends StatelessWidget {
  const _FeatureCard({
    required this.title,
    required this.onTap,
    required this.children,
    this.gradient,
    this.borderRadius = 24,
  });

  final String title;
  final VoidCallback onTap;
  final List<Widget> children;
  final Gradient? gradient;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(borderRadius),
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(borderRadius),
          gradient: gradient ??
              LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: _gradientFor(title),
              ),
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.14),
              blurRadius: 22,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(borderRadius),
          child: Stack(
            children: <Widget>[
              // Radial glow, anchored top-right.
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: const Alignment(0.82, -0.92),
                      radius: 1.3,
                      colors: <Color>[
                        Colors.white.withValues(alpha: 0.24),
                        Colors.white.withValues(alpha: 0),
                      ],
                      stops: const <double>[0, 0.62],
                    ),
                  ),
                ),
              ),
              // Oversized watermark glyph.
              Positioned(
                right: -12,
                bottom: -30,
                child: Transform.rotate(
                  angle: -0.21,
                  child: Text(
                    title.isNotEmpty ? title.characters.first.toUpperCase() : 'S',
                    style: TextStyle(
                      fontSize: 150,
                      fontWeight: FontWeight.w800,
                      height: 1,
                      color: Colors.white.withValues(alpha: 0.13),
                    ),
                  ),
                ),
              ),
              // Content.
              Positioned.fill(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: children,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Frosted badge over feature cards.
class _GlassBadge extends StatelessWidget {
  const _GlassBadge(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.22),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 2,
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
          fontWeight: FontWeight.w700,
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
        Icon(
          Icons.star_rounded,
          size: 14,
          color: onDark ? const Color(0xFFFFD60A) : const Color(0xFFFFCE00),
        ),
        const SizedBox(width: 2),
        Text(
          rating.toStringAsFixed(1),
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: onDark ? Colors.white : Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

/* ═══ hero carousel (§4.3: 5s auto-rotation + swipe + progress dots) ═══════ */

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
          onPanDown: (DragDownDetails details) => _startTimer(),
          child: SizedBox(
            height: 232,
            child: PageView.builder(
              controller: _controller,
              itemCount: widget.entries.length,
              onPageChanged: (int index) => setState(() => _index = index),
              itemBuilder: (BuildContext context, int index) {
                final entry = widget.entries[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: _FeatureCard(
                    title: entry.title,
                    onTap: () => widget.onOpen(entry.id),
                    children: <Widget>[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: <Widget>[
                          _GlassBadge(index == 0 ? '今日精选' : '编辑推荐'),
                          if (entry.rating > 0)
                            _RatingBadge(rating: entry.rating, onDark: true),
                        ],
                      ),
                      const Spacer(),
                      Row(
                        children: <Widget>[
                          _CraftIcon(title: entry.title, size: 58),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  entry.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: -0.6,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  entry.subtitle,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.82),
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      if (entry.subtitle.length > 24) ...<Widget>[
                        const SizedBox(height: 10),
                        Text(
                          entry.subtitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.85),
                            fontSize: 13,
                          ),
                        ),
                      ],
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Text(
                          '立即查看',
                          style: TextStyle(
                            color: Color(0xFF1D1D1F),
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
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
                width: index == _index ? 20 : 6,
                height: 4,
                decoration: BoxDecoration(
                  color: index == _index
                      ? Theme.of(context).colorScheme.primary
                      : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

/* ═══ circular category rail ════════════════════════════════════════════════ */

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
          height: 92,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (BuildContext context, int index) => const SizedBox(width: 14),
            itemBuilder: (BuildContext context, int index) {
              final category = categories[index];
              return InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () => Navigator.pushNamed(context, '/category/${category.id}'),
                child: SizedBox(
                  width: 62,
                  child: Column(
                    children: <Widget>[
                      _CraftIcon(title: category.title, size: 58, circle: true),
                      const SizedBox(height: 6),
                      Text(
                        category.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
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

/* ═══ editorial collection rail ═════════════════════════════════════════════ */

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
          height: 150,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: collections.length,
            separatorBuilder: (BuildContext context, int index) => const SizedBox(width: 12),
            itemBuilder: (BuildContext context, int index) {
              final collection = collections[index];
              return SizedBox(
                width: 200,
                child: _FeatureCard(
                  title: collection.title,
                  borderRadius: 20,
                  onTap: () => onOpen(collection.id),
                  children: <Widget>[
                    _GlassBadge('合集'),
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
                    const SizedBox(height: 2),
                    Text(
                      collection.subtitle.isNotEmpty ? collection.subtitle : '编辑精心挑选',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.75),
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

/* ═══ limited-time event rail ═══════════════════════════════════════════════ */

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
          height: 150,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: events.length,
            separatorBuilder: (BuildContext context, int index) => const SizedBox(width: 12),
            itemBuilder: (BuildContext context, int index) {
              final event = events[index];
              return SizedBox(
                width: 200,
                child: _FeatureCard(
                  title: event.title,
                  borderRadius: 20,
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: <Color>[Color(0xFFFF9500), Color(0xFFFF3B30)],
                  ),
                  onTap: () => onOpen(event.id),
                  children: <Widget>[
                    const _GlassBadge('限时'),
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
                    const SizedBox(height: 2),
                    Text(
                      event.endsAt.isNotEmpty ? '截止 ${event.endsAt}' : '正在进行',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.85),
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

/* ═══ recently-updated rows ═════════════════════════════════════════════════ */

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

/* ═══ recommendation grid ═══════════════════════════════════════════════════ */

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
              childAspectRatio: 1.5,
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
                          _CraftIcon(title: entry.title, size: 44),
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
                          // 免费 price pill.
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF34C759).withValues(alpha: 0.13),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: const Text(
                              '免费',
                              style: TextStyle(
                                color: Color(0xFF34C759),
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          // 获取 filled action.
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                            decoration: BoxDecoration(
                              color: colorScheme.primary,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              '获取',
                              style: TextStyle(
                                color: colorScheme.onPrimary,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
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

/* ═══ skeleton (§4.9: no blank flash while loading) ═════════════════════════ */

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
        block(double.infinity, 232, radius: 24),
        const SizedBox(height: 28),
        Row(
          children: <Widget>[
            for (var index = 0; index < 5; index++) ...<Widget>[
              block(58, 58, radius: 29),
              const SizedBox(width: 14),
            ],
          ],
        ),
        const SizedBox(height: 28),
        Row(
          children: <Widget>[
            Expanded(child: block(double.infinity, 150, radius: 20)),
            const SizedBox(width: 12),
            Expanded(child: block(double.infinity, 150, radius: 20)),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: <Widget>[
            Expanded(child: block(double.infinity, 100)),
            const SizedBox(width: 12),
            Expanded(child: block(double.infinity, 100)),
          ],
        ),
      ],
    );
  }
}
