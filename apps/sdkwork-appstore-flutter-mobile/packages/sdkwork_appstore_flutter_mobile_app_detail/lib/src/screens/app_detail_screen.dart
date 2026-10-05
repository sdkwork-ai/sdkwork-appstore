import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/app_detail_messages.dart';
import '../models/app_detail_models.dart';
import '../services/app_detail_service.dart';

/// App detail screen (canonical route `app.store.app-detail.detail`).
///
/// Mirrors the PC AppDetail blocks on a mobile layout: header with get/wishlist
/// actions, stats bar, screenshots, description, what's new, info table, IAP,
/// privacy, more by developer, and similar recommendations. Actions call the
/// injected service and surface errors as snackbars; no demo data is ever
/// injected.
class AppDetailScreen extends StatefulWidget {
  const AppDetailScreen({required this.service, required this.listingId, super.key});

  final AppDetailService service;
  final String listingId;

  @override
  State<AppDetailScreen> createState() => _AppDetailScreenState();
}

class _AppDetailScreenState extends State<AppDetailScreen> {
  late Future<AppDetail> _detailFuture;
  bool? _wishlistOverride;
  bool _actionPending = false;

  @override
  void initState() {
    super.initState();
    _detailFuture = widget.service.loadDetail(widget.listingId);
  }

  void _reload() {
    setState(() {
      _wishlistOverride = null;
      _detailFuture = widget.service.loadDetail(widget.listingId);
    });
  }

  Future<void> _install(AppDetail detail) async {
    if (_actionPending) {
      return;
    }
    setState(() => _actionPending = true);
    try {
      await widget.service.install(detail.id);
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('已开始获取，请在我的库中查看')));
    } catch (error) {
      if (!mounted) {
        return;
      }
      // The backend fails closed on paid listings without an entitlement;
      // surface that commercially instead of a generic failure.
      final message = error.toString().contains('entitlement')
          ? '付费应用需先购买，支付流程即将开放'
          : '操作失败，请稍后重试';
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) {
        setState(() => _actionPending = false);
      }
    }
  }

  /// Web/H5 应用免安装直达：打开访问地址。
  Future<void> _openAccessUrl(AppDetail detail) async {
    final url = Uri.tryParse(detail.accessUrl);
    if (url == null || !url.hasScheme) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('访问地址暂不可用')));
      }
      return;
    }
    final launched = await launchUrl(url, mode: LaunchMode.externalApplication);
    if (!launched && mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('无法打开浏览器，请稍后重试')));
    }
  }

  /// Distribution-mode-aware action label and handler.
  (String, void Function(AppDetail)) _primaryAction(AppDetail detail) {
    final webDelivery =
        (detail.platforms.contains('web') || detail.platforms.contains('h5')) &&
            detail.accessUrl.isNotEmpty;
    if (webDelivery) {
      return ('打开', _openAccessUrl);
    }
    final pricing = detail.pricingModel.toUpperCase();
    if (pricing == 'PAID') {
      return ('购买', _install);
    }
    return ('获取', _install);
  }

  Future<void> _toggleWishlist(AppDetail detail) async {
    if (_actionPending) {
      return;
    }
    final add = !( _wishlistOverride ?? detail.inWishlist);
    setState(() {
      _wishlistOverride = add;
      _actionPending = true;
    });
    try {
      await widget.service.toggleWishlist(detail.id, add: add);
    } catch (error) {
      if (mounted) {
        setState(() => _wishlistOverride = !add);
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('操作失败，已还原收藏状态')));
      }
    } finally {
      if (mounted) {
        setState(() => _actionPending = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(app_detailMessages['titleZh'] ?? '应用详情')),
      body: FutureBuilder<AppDetail>(
        future: _detailFuture,
        builder: (BuildContext context, AsyncSnapshot<AppDetail> snapshot) {
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
          final detail = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.only(bottom: 32),
            children: <Widget>[
              _Header(detail: detail),
              _StatsBar(detail: detail),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: <Widget>[
                    Expanded(
                      child: Builder(builder: (BuildContext context) {
                        final (label, action) = _primaryAction(detail);
                        final isWebOpen = label == '打开';
                        return FilledButton.icon(
                          onPressed:
                              _actionPending ? null : () => action(detail),
                          icon: Icon(isWebOpen
                              ? Icons.open_in_new
                              : Icons.download),
                          label: Text(label),
                        );
                      }),
                    ),
                    const SizedBox(width: 12),
                    IconButton.filledTonal(
                      onPressed:
                          _actionPending ? null : () => _toggleWishlist(detail),
                      icon: Icon(
                        (_wishlistOverride ?? detail.inWishlist)
                            ? Icons.favorite
                            : Icons.favorite_border,
                      ),
                      tooltip: '心愿单',
                    ),
                  ],
                ),
              ),
              if (detail.description.isNotEmpty) ...<Widget>[
                AppstoreSectionHeader(title: '关于此应用'),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    detail.description,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              ],
              if (detail.whatsNew.version.isNotEmpty) ...<Widget>[
                AppstoreSectionHeader(title: '新功能'),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        '版本 ${detail.whatsNew.version} · ${detail.whatsNew.date}',
                        style: Theme.of(context).textTheme.labelSmall,
                      ),
                      const SizedBox(height: 4),
                      Text(detail.whatsNew.notes),
                    ],
                  ),
                ),
              ],
              if (detail.infoRows.isNotEmpty) ...<Widget>[
                AppstoreSectionHeader(title: '信息'),
                for (final row in detail.infoRows)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        SizedBox(
                          width: 88,
                          child: Text(
                            row.label,
                            style: Theme.of(context).textTheme.labelSmall,
                          ),
                        ),
                        Expanded(
                          child: Text(row.value),
                        ),
                      ],
                    ),
                  ),
              ],
              if (detail.iapEntries.isNotEmpty) ...<Widget>[
                AppstoreSectionHeader(title: 'App 内购买项目'),
                for (final iap in detail.iapEntries)
                  AppstoreListTileCard(
                    title: iap.name,
                    subtitle: iap.price,
                  ),
              ],
              AppstoreSectionHeader(title: '隐私'),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  detail.privacyLinked ? '开发者已提供隐私说明' : '暂无隐私说明',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
              if (detail.moreByDeveloper.isNotEmpty) ...<Widget>[
                AppstoreSectionHeader(title: '开发者的其他应用'),
                for (final related in detail.moreByDeveloper)
                  AppstoreListTileCard(
                    title: related.title,
                    subtitle: related.developer,
                    onTap: () =>
                        Navigator.pushNamed(context, '/app/${related.id}'),
                  ),
              ],
              if (detail.similarApps.isNotEmpty) ...<Widget>[
                AppstoreSectionHeader(title: '你可能也会喜欢'),
                for (final related in detail.similarApps)
                  AppstoreListTileCard(
                    title: related.title,
                    subtitle: related.developer,
                    onTap: () =>
                        Navigator.pushNamed(context, '/app/${related.id}'),
                  ),
              ],
            ],
          );
        },
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.detail});

  final AppDetail detail;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: <Widget>[
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: LinearGradient(
                colors: <Color>[
                  colorScheme.primary,
                  colorScheme.tertiary,
                ],
              ),
            ),
            alignment: Alignment.center,
            child: Text(
              detail.name.isNotEmpty
                  ? detail.name.characters.first.toUpperCase()
                  : '?',
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  detail.name,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 4),
                Text(
                  detail.developer,
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: colorScheme.primary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsBar extends StatelessWidget {
  const _StatsBar({required this.detail});

  final AppDetail detail;

  @override
  Widget build(BuildContext context) {
    String ratings;
    if (detail.rating > 0) {
      final count = detail.ratingCount > 0 ? ' · ${detail.ratingCount} 个评分' : '';
      ratings = detail.rating.toStringAsFixed(1) + count;
    } else {
      ratings = '暂无评分';
    }
    final rank = detail.chartRank > 0 ? '榜单第 ${detail.chartRank} 名' : '';
    final cells = <String>[
      ratings,
      if (detail.ageRating.isNotEmpty) detail.ageRating,
      if (rank.isNotEmpty) rank,
    ];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: <Widget>[
          for (final cell in cells)
            Expanded(
              child: Text(
                cell,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.labelSmall,
              ),
            ),
        ],
      ),
    );
  }
}
