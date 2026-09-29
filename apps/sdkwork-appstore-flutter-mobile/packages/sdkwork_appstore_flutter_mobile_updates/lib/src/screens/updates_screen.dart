import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/updates_messages.dart';
import '../models/updates_models.dart';
import '../services/updates_service.dart';

/// Updates screen (canonical route `app.store.updates.index`, auth required).
///
/// Mirrors the PC UpdatesPage: pending update rows with per-item update
/// actions and version diff labels.
class UpdatesScreen extends StatefulWidget {
  const UpdatesScreen({required this.service, super.key});

  final UpdatesService service;

  @override
  State<UpdatesScreen> createState() => _UpdatesScreenState();
}

class _UpdatesScreenState extends State<UpdatesScreen> {
  late Future<List<PendingUpdateEntry>> _updatesFuture;
  final Set<String> _updatingIds = <String>{};

  @override
  void initState() {
    super.initState();
    _updatesFuture = widget.service.loadPendingUpdates();
  }

  void _reload() {
    setState(() => _updatesFuture = widget.service.loadPendingUpdates());
  }

  Future<void> _updateOne(PendingUpdateEntry entry) async {
    if (_updatingIds.contains(entry.listingId)) {
      return;
    }
    setState(() => _updatingIds.add(entry.listingId));
    try {
      await widget.service.update(entry.listingId);
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('「${entry.title}」更新已开始')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('更新失败，请稍后重试')));
      }
    } finally {
      if (mounted) {
        setState(() => _updatingIds.remove(entry.listingId));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(updatesMessages['titleZh'] ?? '更新')),
      body: FutureBuilder<List<PendingUpdateEntry>>(
        future: _updatesFuture,
        builder: (
          BuildContext context,
          AsyncSnapshot<List<PendingUpdateEntry>> snapshot,
        ) {
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
          final entries = snapshot.data ?? const <PendingUpdateEntry>[];
          if (entries.isEmpty) {
            return const AppstoreScreenState(
              kind: AppstoreScreenStateKind.empty,
              message: '所有应用都是最新版本',
            );
          }
          return ListView(
            children: <Widget>[
              AppstoreSectionHeader(title: '可用更新 · ${entries.length}'),
              for (final entry in entries)
                AppstoreListTileCard(
                  title: entry.title,
                  subtitle: entry.currentVersion.isEmpty
                      ? entry.developer
                      : 'v' + entry.currentVersion + ' → v' + entry.availableVersion,
                  trailing: TextButton(
                    onPressed: _updatingIds.contains(entry.listingId)
                        ? null
                        : () => _updateOne(entry),
                    child: Text(
                      _updatingIds.contains(entry.listingId) ? '更新中…' : '更新',
                    ),
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
