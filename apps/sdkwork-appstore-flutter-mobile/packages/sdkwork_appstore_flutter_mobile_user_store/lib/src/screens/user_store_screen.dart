import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/user_store_messages.dart';
import '../models/user_store_models.dart';
import '../services/user_store_service.dart';

/// Personal appstore screens (canonical routes `app.store.user-store.index`
/// and `app.store.user-store.public`).
///
/// Owner view: custom categories plus share links (create/copy/revoke).
/// Public view: anonymous share rendering by [shareToken]; invalid/revoked/
/// expired shares all render the same invalid state (anti-enumeration).
class UserStoreScreen extends StatefulWidget {
  const UserStoreScreen({
    required this.service,
    this.shareToken,
    super.key,
  });

  final UserStoreService service;

  /// Non-null renders the anonymous public view for this token.
  final String? shareToken;

  @override
  State<UserStoreScreen> createState() => _UserStoreScreenState();
}

class _UserStoreScreenState extends State<UserStoreScreen> {
  late Future<Object> _loadFuture;

  @override
  void initState() {
    super.initState();
    _loadFuture = _load();
  }

  Future<Object> _load() {
    final token = widget.shareToken;
    if (token != null) {
      return widget.service.loadPublicView(token);
    }
    return Future.wait<Object>(<Future<Object>>[
      widget.service.loadCategories(),
      widget.service.loadShares(),
    ]);
  }

  void _reload() {
    setState(() => _loadFuture = _load());
  }

  @override
  Widget build(BuildContext context) {
    if (widget.shareToken != null) {
      return _PublicView(
        service: widget.service,
        shareToken: widget.shareToken!,
        loadFuture: _loadFuture as Future<PublicUserStoreView>,
        reload: _reload,
      );
    }
    return _OwnerView(
      service: widget.service,
      loadFuture: _loadFuture as Future<List<Object>>,
      reload: _reload,
    );
  }
}

typedef _Reload = void Function();

class _OwnerView extends StatelessWidget {
  const _OwnerView({
    required this.service,
    required this.loadFuture,
    required this.reload,
  });

  final UserStoreService service;
  final Future<List<Object>> loadFuture;
  final _Reload reload;

  Future<void> _createCategory(BuildContext context) async {
    final controller = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        title: const Text('新建分类'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(hintText: '分类名称'),
        ),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('创建'),
          ),
        ],
      ),
    );
    if (name == null || name.isEmpty) {
      return;
    }
    try {
      await service.createCategory(name);
      reload();
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('创建失败，请稍后重试')));
      }
    }
  }

  Future<void> _createShare(BuildContext context) async {
    try {
      await service.createShare('我的 Appstore');
      reload();
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('创建分享失败，请稍后重试')));
      }
    }
  }

  Future<void> _revokeShare(BuildContext context, UserStoreShareLink share) async {
    try {
      await service.revokeShare(share.id);
      reload();
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('撤销失败，请稍后重试')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(user_storeMessages['titleZh'] ?? '我的 Appstore')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _createCategory(context),
        icon: const Icon(Icons.create_new_folder_outlined),
        label: const Text('新建分类'),
      ),
      body: FutureBuilder<List<Object>>(
        future: loadFuture,
        builder: (BuildContext context, AsyncSnapshot<List<Object>> snapshot) {
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
              onRetry: reload,
            );
          }
          final categories = snapshot.data![0] as List<UserStoreCategory>;
          final shares = snapshot.data![1] as List<UserStoreShareLink>;
          final activeShares =
              shares.where((UserStoreShareLink share) => share.status == 'active').toList();
          return ListView(
            padding: const EdgeInsets.only(bottom: 96),
            children: <Widget>[
              AppstoreSectionHeader(title: '自定义分类 · ${categories.length}'),
              if (categories.isEmpty)
                const AppstoreScreenState(
                  kind: AppstoreScreenStateKind.empty,
                  message: '还没有分类，先创建一个吧',
                )
              else
                for (final category in categories)
                  AppstoreListTileCard(
                    title: category.name,
                    subtitle: '${category.itemCount} 个应用',
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline),
                      tooltip: '删除分类',
                      onPressed: () async {
                        try {
                          await service.deleteCategory(category.id);
                          reload();
                        } catch (error) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('删除失败，请稍后重试')));
                          }
                        }
                      },
                    ),
                  ),
              AppstoreSectionHeader(
                title: '分享链接 · ${activeShares.length}',
                trailing: TextButton.icon(
                  onPressed: () => _createShare(context),
                  icon: const Icon(Icons.add_link, size: 16),
                  label: const Text('生成链接'),
                ),
              ),
              if (activeShares.isEmpty)
                const AppstoreScreenState(
                  kind: AppstoreScreenStateKind.empty,
                  message: '还没有分享链接',
                )
              else
                for (final share in activeShares)
                  AppstoreListTileCard(
                    title: '/store/${share.shareToken}',
                    subtitle: '${share.viewCount} 次浏览',
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        IconButton(
                          icon: const Icon(Icons.copy, size: 18),
                          tooltip: '复制链接',
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('已复制分享路径')));
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.link_off, size: 18),
                          tooltip: '撤销分享',
                          onPressed: () => _revokeShare(context, share),
                        ),
                      ],
                    ),
                  ),
            ],
          );
        },
      ),
    );
  }
}

class _PublicView extends StatelessWidget {
  const _PublicView({
    required this.service,
    required this.shareToken,
    required this.loadFuture,
    required this.reload,
  });

  final UserStoreService service;
  final String shareToken;
  final Future<PublicUserStoreView> loadFuture;
  final _Reload reload;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('个人 Appstore')),
      body: FutureBuilder<PublicUserStoreView>(
        future: loadFuture,
        builder: (
          BuildContext context,
          AsyncSnapshot<PublicUserStoreView> snapshot,
        ) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const AppstoreScreenState(
              kind: AppstoreScreenStateKind.loading,
              message: AppstoreScreenStateMessages.loading,
            );
          }
          if (snapshot.hasError) {
            return AppstoreScreenState(
              kind: AppstoreScreenStateKind.empty,
              message: '分享链接不存在或已失效',
            );
          }
          final view = snapshot.data!;
          return ListView(
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: <Widget>[
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                      child: Icon(
                        Icons.storefront,
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(view.title, style: Theme.of(context).textTheme.titleLarge),
                    if (view.description.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 4),
                      Text(view.description,
                          style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ],
                ),
              ),
              for (final category in view.categories) ...<Widget>[
                AppstoreSectionHeader(title: '${category.name} · ${category.apps.length}'),
                if (category.apps.isEmpty)
                  const AppstoreScreenState(
                    kind: AppstoreScreenStateKind.empty,
                    message: '该分类还没有公开分享应用',
                  )
                else
                  for (final app in category.apps)
                    AppstoreListTileCard(
                      title: app.title,
                      subtitle: app.subtitle,
                      onTap: () =>
                          Navigator.pushNamed(context, '/app/' + app.listingId),
                    ),
              ],
            ],
          );
        },
      ),
    );
  }
}
