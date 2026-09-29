import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/search_messages.dart';
import '../models/search_models.dart';
import '../services/search_service.dart';

/// Search screen (canonical route `app.store.search.index`).
///
/// Mirrors the PC SearchPage: query-driven search, type filter chips, and
/// result rows; trending and history rails land with the Dart SDK transport.
class SearchScreen extends StatefulWidget {
  const SearchScreen({required this.service, this.initialQuery = '', super.key});

  final SearchService service;
  final String initialQuery;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  static const List<String> _typeFilters = <String>[
    '全部', '应用', '游戏', '效率', '小游戏', '工具', 'AI',
  ];

  late final TextEditingController _controller =
      TextEditingController(text: widget.initialQuery);
  String _typeFilter = '全部';
  Future<List<SearchEntry>>? _resultsFuture;
  String _submittedQuery = '';

  @override
  void initState() {
    super.initState();
    _submittedQuery = widget.initialQuery;
    if (_submittedQuery.isNotEmpty) {
      _resultsFuture = widget.service.search(_submittedQuery, _typeFilter);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit(String query) {
    setState(() {
      _submittedQuery = query.trim();
      _resultsFuture = widget.service.search(_submittedQuery, _typeFilter);
    });
  }

  void _selectFilter(String filter) {
    if (filter == _typeFilter) {
      return;
    }
    setState(() {
      _typeFilter = filter;
      if (_submittedQuery.isNotEmpty) {
        _resultsFuture = widget.service.search(_submittedQuery, _typeFilter);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(searchMessages['titleZh'] ?? '搜索')),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: TextField(
              controller: _controller,
              textInputAction: TextInputAction.search,
              onSubmitted: _submit,
              decoration: InputDecoration(
                hintText: searchMessages['placeholderZh'] ?? '搜索应用与游戏',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(28),
                  borderSide: BorderSide.none,
                ),
                filled: true,
              ),
            ),
          ),
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: <Widget>[
                for (final filter in _typeFilters)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(filter),
                      selected: _typeFilter == filter,
                      onSelected: (bool selected) => _selectFilter(filter),
                    ),
                  ),
              ],
            ),
          ),
          Expanded(
            child: _buildResults(context),
          ),
        ],
      ),
    );
  }

  Widget _buildResults(BuildContext context) {
    if (_submittedQuery.isEmpty) {
      return const AppstoreScreenState(
        kind: AppstoreScreenStateKind.empty,
        message: '输入关键词开始搜索，或看看分类和榜单',
      );
    }
    return FutureBuilder<List<SearchEntry>>(
      future: _resultsFuture,
      builder: (BuildContext context, AsyncSnapshot<List<SearchEntry>> snapshot) {
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
            onRetry: () => _submit(_submittedQuery),
          );
        }
        final results = snapshot.data ?? const <SearchEntry>[];
        if (results.isEmpty) {
          return const AppstoreScreenState(
            kind: AppstoreScreenStateKind.empty,
            message: '没有匹配的结果，换个关键词试试',
          );
        }
        return ListView(
          children: <Widget>[
            for (final entry in results)
              AppstoreListTileCard(
                title: entry.title,
                subtitle: entry.developer,
                trailing: Text(
                  entry.pricingModel == 'PAID' ? '付费' : '免费',
                  style: Theme.of(context).textTheme.labelSmall,
                ),
                onTap: () => Navigator.pushNamed(context, '/app/${entry.id}'),
              ),
          ],
        );
      },
    );
  }
}
