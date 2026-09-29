import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/collection_messages.dart';
import '../models/collection_models.dart';
import '../services/collection_service.dart';

/// Editorial collection screen (canonical route `app.store.collection.detail`).
///
/// Mirrors the PC CollectionPage: gradient header card plus order-preserving
/// listing rows resolved from the collection's listing ids.
class CollectionScreen extends StatefulWidget {
  const CollectionScreen({required this.service, required this.collectionId, super.key});

  final CollectionService service;
  final String collectionId;

  @override
  State<CollectionScreen> createState() => _CollectionScreenState();
}

class _CollectionScreenState extends State<CollectionScreen> {
  late Future<CollectionDetail> _detailFuture;

  @override
  void initState() {
    super.initState();
    _detailFuture = widget.service.loadDetail(widget.collectionId);
  }

  void _reload() {
    setState(() => _detailFuture = widget.service.loadDetail(widget.collectionId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(collectionMessages['titleZh'] ?? '精选合集')),
      body: FutureBuilder<CollectionDetail>(
        future: _detailFuture,
        builder: (BuildContext context, AsyncSnapshot<CollectionDetail> snapshot) {
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
                      Theme.of(context).colorScheme.secondary,
                      Theme.of(context).colorScheme.primary,
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
                    if (detail.description.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 8),
                      Text(
                        detail.description,
                        style: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.copyWith(color: Colors.white70),
                      ),
                    ],
                  ],
                ),
              ),
              AppstoreSectionHeader(title: '精选应用 · ${detail.apps.length}'),
              if (detail.apps.isEmpty)
                const AppstoreScreenState(
                  kind: AppstoreScreenStateKind.empty,
                  message: '该合集暂无应用',
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
