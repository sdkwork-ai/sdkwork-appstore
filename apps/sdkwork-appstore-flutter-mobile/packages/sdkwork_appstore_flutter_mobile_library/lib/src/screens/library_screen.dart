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
      await widget.service.uninstall(entry.listingId);
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
      body: FutureBuilder<List<LibraryEntry>>(
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
          if (entries.isEmpty) {
            return const AppstoreScreenState(
              kind: AppstoreScreenStateKind.empty,
              message: '还没有已获取的应用',
            );
          }
          return ListView(
            children: <Widget>[
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
    );
  }
}
