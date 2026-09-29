import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/apps_messages.dart';
import '../models/apps_models.dart';
import '../services/apps_service.dart';

/// Apps browse screen (canonical route `app.store.apps.index`).
///
/// Mirrors the PC AppsPage: keyset-paged catalog list with subcategory filter
/// chips and load-more paging.
class AppsScreen extends StatefulWidget {
  const AppsScreen({required this.service, super.key});

  final AppsService service;

  @override
  State<AppsScreen> createState() => _AppsScreenState();
}

class _AppsScreenState extends State<AppsScreen> {
  static const List<String> _categories = <String>['全部', '效率', '社交', '工具', '摄影'];

  final List<AppsListEntry> _items = <AppsListEntry>[];
  String? _nextCursor;
  String _category = '全部';
  bool _loading = true;
  bool _loadingMore = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  Future<void> _reload() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final page = await widget.service.loadPage(category: _category);
      if (!mounted) {
        return;
      }
      setState(() {
        _items
          ..clear()
          ..addAll(page.items);
        _nextCursor = page.nextCursor;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = AppstoreScreenStateMessages.error;
        _loading = false;
      });
    }
  }

  Future<void> _loadMore() async {
    final cursor = _nextCursor;
    if (cursor == null || _loadingMore) {
      return;
    }
    setState(() => _loadingMore = true);
    try {
      final page = await widget.service.loadPage(cursor: cursor, category: _category);
      if (!mounted) {
        return;
      }
      setState(() {
        _items.addAll(page.items);
        _nextCursor = page.nextCursor;
        _loadingMore = false;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() => _loadingMore = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(appsMessages['titleZh'] ?? '应用')),
      body: Column(
        children: <Widget>[
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: <Widget>[
                for (final category in _categories)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(category),
                      selected: _category == category,
                      onSelected: (bool selected) {
                        if (!selected) {
                          return;
                        }
                        setState(() => _category = category);
                        _reload();
                      },
                    ),
                  ),
              ],
            ),
          ),
          Expanded(
            child: _buildBody(context),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context) {
    if (_loading) {
      return const AppstoreScreenState(
        kind: AppstoreScreenStateKind.loading,
        message: AppstoreScreenStateMessages.loading,
      );
    }
    if (_error != null) {
      return AppstoreScreenState(
        kind: AppstoreScreenStateKind.error,
        message: _error!,
        onRetry: _reload,
      );
    }
    if (_items.isEmpty) {
      return const AppstoreScreenState(
        kind: AppstoreScreenStateKind.empty,
        message: AppstoreScreenStateMessages.empty,
      );
    }
    return ListView(
      children: <Widget>[
        for (final item in _items)
          AppstoreListTileCard(
            title: item.title,
            subtitle: item.subtitle.isEmpty ? item.category : item.subtitle,
            onTap: () => Navigator.pushNamed(context, '/app/${item.id}'),
          ),
        if (_nextCursor != null)
          Padding(
            padding: const EdgeInsets.all(16),
            child: OutlinedButton(
              onPressed: _loadingMore ? null : _loadMore,
              child: Text(_loadingMore ? '加载中…' : '加载更多'),
            ),
          ),
      ],
    );
  }
}
