import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/publisher_messages.dart';
import '../models/publisher_models.dart';
import '../services/publisher_service.dart';

/// Publisher console screens (canonical routes
/// `console.store.publisher.overview` / `app-create` / `app-manage`).
///
/// The [screen] discriminator picks the presentation per canonical route:
/// overview lists my listings, app-create bootstraps a draft, app-manage shows
/// releases of one listing. Data calls gate on the injected service.
class PublisherScreen extends StatelessWidget {
  const PublisherScreen({
    required this.service,
    required this.screen,
    this.listingId,
    this.appType = 'APP',
    super.key,
  });

  final PublisherService service;

  /// Canonical screen token: `overview`, `app-create`, or `app-manage`.
  final String screen;

  final String? listingId;

  /// Store application type preset for the create flow (APP | WEBSITE | PROMO).
  final String appType;

  @override
  Widget build(BuildContext context) {
    if (screen == 'app-create') {
      return _CreateAppView(service: service, appType: appType);
    }
    if (screen == 'app-manage') {
      return _ManageAppView(service: service, listingId: listingId ?? '');
    }
    return _OverviewView(service: service);
  }
}

class _OverviewView extends StatelessWidget {
  const _OverviewView({required this.service});

  final PublisherService service;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(publisherMessages['titleZh'] ?? '开发者中心'),
        actions: <Widget>[
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: '新建应用',
            onPressed: () => Navigator.pushNamed(context, '/publisher/apps/new'),
          ),
        ],
      ),
      body: FutureBuilder<List<PublisherListingRow>>(
        future: service.loadMyListings(),
        builder: (
          BuildContext context,
          AsyncSnapshot<List<PublisherListingRow>> snapshot,
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
              onRetry: () => service.loadMyListings(),
            );
          }
          final listings = snapshot.data ?? const <PublisherListingRow>[];
          if (listings.isEmpty) {
            return AppstoreScreenState(
              kind: AppstoreScreenStateKind.empty,
              message: '还没有上架的应用，点右上角新建',
            );
          }
          return ListView(
            children: <Widget>[
              for (final listing in listings)
                AppstoreListTileCard(
                  title: listing.title,
                  subtitle: listing.status.isEmpty
                      ? listing.currentVersion
                      : listing.status + ' · ' + listing.currentVersion,
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.pushNamed(
                      context, '/publisher/apps/' + listing.id),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _CreateAppView extends StatelessWidget {
  const _CreateAppView({required this.service, this.appType = 'APP'});

  final PublisherService service;

  /// Store application type preset (APP | WEBSITE | PROMO).
  final String appType;

  @override
  Widget build(BuildContext context) {
    final nameController = TextEditingController();
    final keyController = TextEditingController();
    return Scaffold(
      appBar: AppBar(title: const Text('新建应用')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          TextField(
            controller: nameController,
            decoration: const InputDecoration(
              labelText: '应用名称',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: keyController,
            decoration: const InputDecoration(
              labelText: 'App Key（如 my-first-app）',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: () async {
              final name = nameController.text.trim();
              final appKey = keyController.text.trim();
              if (name.isEmpty || appKey.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('请填写应用名称与 App Key')));
                return;
              }
              try {
                await service.createApp(
                  displayName: name,
                  appKey: appKey,
                  appType: appType,
                );
                if (context.mounted) {
                  Navigator.pop(context);
                }
              } catch (error) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('创建失败，请稍后重试')));
                }
              }
            },
            child: const Text('创建应用草稿'),
          ),
        ],
      ),
    );
  }
}

class _ManageAppView extends StatelessWidget {
  const _ManageAppView({required this.service, required this.listingId});

  final PublisherService service;
  final String listingId;

  Future<void> _reload() async {
    await service.loadReleases(listingId);
  }

  Future<void> _createRelease(BuildContext context) async {
    final nameController = TextEditingController();
    final codeController = TextEditingController();
    final created = await showDialog<bool>(
      context: context,
      builder: (BuildContext dialogContext) => AlertDialog(
        title: const Text('创建版本'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: '版本号（如 1.0.0）'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: codeController,
              decoration: const InputDecoration(labelText: '版本代码（如 100）'),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('创建'),
          ),
        ],
      ),
    );
    if (created != true || !context.mounted) {
      return;
    }
    try {
      await service.createRelease(
        listingId: listingId,
        versionName: nameController.text.trim(),
        versionCode: codeController.text.trim(),
      );
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('版本已创建')));
      }
      await _reload();
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('创建失败，请稍后重试')));
      }
    }
  }

  Future<void> _submitRelease(BuildContext context, PublisherReleaseRow release) async {
    try {
      await service.submitReleaseForReview(listingId: listingId, releaseId: release.id);
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('已提交审核')));
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('提交失败，请稍后重试')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('管理应用')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _createRelease(context),
        icon: const Icon(Icons.add),
        label: const Text('创建版本'),
      ),
      body: FutureBuilder<List<PublisherReleaseRow>>(
        future: service.loadReleases(listingId),
        builder: (
          BuildContext context,
          AsyncSnapshot<List<PublisherReleaseRow>> snapshot,
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
              onRetry: () => service.loadReleases(listingId),
            );
          }
          final releases = snapshot.data ?? const <PublisherReleaseRow>[];
          return ListView(
            children: <Widget>[
              AppstoreSectionHeader(title: '版本发布 · ${releases.length}'),
              if (releases.isEmpty)
                const AppstoreScreenState(
                  kind: AppstoreScreenStateKind.empty,
                  message: '该应用还没有发布版本，点右下角创建',
                )
              else
                for (final release in releases)
                  AppstoreListTileCard(
                    title: 'v' + release.version,
                    subtitle: release.notes.isEmpty ? release.status : release.notes,
                    trailing: TextButton(
                      onPressed: () => _submitRelease(context, release),
                      child: const Text('提交审核'),
                    ),
                  ),
            ],
          );
        },
      ),
    );
  }
}
