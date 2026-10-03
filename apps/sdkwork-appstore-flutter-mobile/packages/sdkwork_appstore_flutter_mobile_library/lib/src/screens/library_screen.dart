import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/library_messages.dart';
import '../models/library_models.dart';
import '../services/library_service.dart';

/// Library screen (canonical route `app.store.library.index`, auth required).
///
/// Mirrors the PC LibraryPage: installed listing rows with uninstall actions.
/// No demo apps are ever injected — a failed load renders the error state.
class LibraryScreen extends StatefulWidget {
  const LibraryScreen({required this.service, super.key});

  final LibraryService service;

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  late Future<List<LibraryEntry>> _installedFuture;

  @override
  void initState() {
    super.initState();
    _installedFuture = widget.service.loadInstalled();
  }

  void _reload() {
    setState(() => _installedFuture = widget.service.loadInstalled());
  }

  Future<void> _uninstall(LibraryEntry entry) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        title: Text('卸载「${entry.title}」？'),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('卸载'),
          ),
        ],
      ),
    );
    if (confirmed != true) {
      return;
    }
    try {
      await widget.service.uninstall(entry.libraryItemId);
      _reload();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('卸载失败，请稍后重试')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(libraryMessages['titleZh'] ?? '我的库')),
      body: RefreshIndicator(
        onRefresh: () async => _reload(),
        child: FutureBuilder<List<LibraryEntry>>(
        future: _installedFuture,
        builder: (BuildContext context, AsyncSnapshot<List<LibraryEntry>> snapshot) {
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
          final entries = snapshot.data ?? const <LibraryEntry>[];
          return ListView(
            children: <Widget>[
              _QuickLinksSection(onNavigate: _openQuickLink),
              const SizedBox(height: 8),
              if (entries.isEmpty)
                const AppstoreScreenState(
                  kind: AppstoreScreenStateKind.empty,
                  message: '还没有已获取的应用',
                ),
              for (final entry in entries)
                AppstoreListTileCard(
                  title: entry.title,
                  subtitle: entry.installedVersion.isEmpty
                      ? entry.developer
                      : entry.developer + ' · v' + entry.installedVersion,
                  trailing: TextButton(
                    onPressed: () => _uninstall(entry),
                    child: const Text('卸载'),
                  ),
                  onTap: () =>
                      Navigator.pushNamed(context, '/app/' + entry.listingId),
                ),
            ],
          );
        },
      ),
    ),
    );
  }

  void _openQuickLink(String path) {
    Navigator.pushNamed(context, path);
  }
}

/// Quick-access entry points for the account-scoped screens that have no
/// bottom tab (canonical routes; `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`
/// section 7).
class _QuickLinksSection extends StatelessWidget {
  const _QuickLinksSection({required this.onNavigate});

  final void Function(String path) onNavigate;

  static const List<(String, String, IconData)> _links = <(String, String, IconData)>[
    ('/updates', '更新中心', Icons.system_update_outlined),
    ('/wishlist', '收藏夹', Icons.favorite_outline),
    ('/charts', '排行榜', Icons.leaderboard_outlined),
    ('/user-store', '我的店铺', Icons.storefront_outlined),
    ('/publisher', '开发者中心', Icons.rocket_launch_outlined),
    ('/console/settings', '设置', Icons.settings_outlined),
  ];

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children: <Widget>[
            for (final (path, label, icon) in _links)
              ActionChip(
                avatar: Icon(icon, size: 18),
                label: Text(label),
                onPressed: () => onNavigate(path),
              ),
          ],
        ),
      ),
    );
  }
}