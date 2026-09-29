import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/category_messages.dart';
import '../models/category_models.dart';
import '../services/category_service.dart';

/// Category detail screen (canonical route `app.store.category.detail`).
///
/// Mirrors the PC CategoryPage: gradient header card plus the category's
/// listing rows.
class CategoryScreen extends StatefulWidget {
  const CategoryScreen({required this.service, required this.categoryId, super.key});

  final CategoryService service;
  final String categoryId;

  @override
  State<CategoryScreen> createState() => _CategoryScreenState();
}

class _CategoryScreenState extends State<CategoryScreen> {
  late Future<CategoryDetail> _detailFuture;

  @override
  void initState() {
    super.initState();
    _detailFuture = widget.service.loadDetail(widget.categoryId);
  }

  void _reload() {
    setState(() => _detailFuture = widget.service.loadDetail(widget.categoryId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(categoryMessages['titleZh'] ?? '分类')),
      body: FutureBuilder<CategoryDetail>(
        future: _detailFuture,
        builder: (BuildContext context, AsyncSnapshot<CategoryDetail> snapshot) {
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
            children: <Widget>[
              Container(
                margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  gradient: LinearGradient(
                    colors: <Color>[
                      Theme.of(context).colorScheme.primary,
                      Theme.of(context).colorScheme.tertiary,
                    ],
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      detail.name,
                      style: Theme.of(context)
                          .textTheme
                          .headlineSmall
                          ?.copyWith(color: Colors.white),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      detail.description.isEmpty
                          ? '浏览「${detail.name}」分类下的精选应用'
                          : detail.description,
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(color: Colors.white70),
                    ),
                  ],
                ),
              ),
              AppstoreSectionHeader(title: '全部应用 · ${detail.apps.length}'),
              if (detail.apps.isEmpty)
                const AppstoreScreenState(
                  kind: AppstoreScreenStateKind.empty,
                  message: '该分类下暂无应用',
                )
              else
                for (final app in detail.apps)
                  AppstoreListTileCard(
                    title: app.title,
                    subtitle: app.developer,
                    onTap: () => Navigator.pushNamed(context, '/app/${app.id}'),
                  ),
            ],
          );
        },
      ),
    );
  }
}
