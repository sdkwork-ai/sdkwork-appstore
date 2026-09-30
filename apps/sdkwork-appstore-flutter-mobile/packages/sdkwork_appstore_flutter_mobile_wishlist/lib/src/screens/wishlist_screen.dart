import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/wishlist_messages.dart';
import '../models/wishlist_models.dart';
import '../services/wishlist_service.dart';

/// Wishlist screen (canonical route `app.store.wishlist.index`, auth required).
///
/// Mirrors the PC WishlistPage: saved listing rows with remove actions.
class WishlistScreen extends StatefulWidget {
  const WishlistScreen({required this.service, super.key});

  final WishlistService service;

  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {
  late Future<List<WishlistEntry>> _wishlistFuture;

  @override
  void initState() {
    super.initState();
    _wishlistFuture = widget.service.loadWishlist();
  }

  void _reload() {
    setState(() => _wishlistFuture = widget.service.loadWishlist());
  }

  Future<void> _remove(WishlistEntry entry) async {
    try {
      await widget.service.remove(entry.listingId);
      _reload();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('移除失败，请稍后重试')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(wishlistMessages['titleZh'] ?? '心愿单')),
      body: RefreshIndicator(
        onRefresh: () async => _reload(),
        child: FutureBuilder<List<WishlistEntry>>(
        future: _wishlistFuture,
        builder: (
          BuildContext context,
          AsyncSnapshot<List<WishlistEntry>> snapshot,
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
          final entries = snapshot.data ?? const <WishlistEntry>[];
          if (entries.isEmpty) {
            return const AppstoreScreenState(
              kind: AppstoreScreenStateKind.empty,
              message: '还没有收藏的应用',
            );
          }
          return ListView(
            children: <Widget>[
              for (final entry in entries)
                AppstoreListTileCard(
                  title: entry.title,
                  subtitle: entry.developer,
                  trailing: IconButton(
                    icon: const Icon(Icons.favorite, color: Colors.redAccent),
                    tooltip: '移除心愿单',
                    onPressed: () => _remove(entry),
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
}