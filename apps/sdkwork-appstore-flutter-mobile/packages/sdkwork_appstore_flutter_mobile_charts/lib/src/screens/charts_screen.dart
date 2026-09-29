import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/charts_messages.dart';
import '../models/charts_models.dart';
import '../services/charts_service.dart';

/// Charts screen (canonical route `app.store.charts.index`).
///
/// Mirrors the PC ChartsPage: free/paid segmented tabs, ranked list with rank
/// badges, loading and empty states.
class ChartsScreen extends StatefulWidget {
  const ChartsScreen({required this.service, super.key});

  final ChartsService service;

  @override
  State<ChartsScreen> createState() => _ChartsScreenState();
}

class _ChartsScreenState extends State<ChartsScreen> {
  String _kind = 'free';
  late Future<List<ChartEntry>> _chartFuture;

  @override
  void initState() {
    super.initState();
    _chartFuture = widget.service.loadChart(_kind);
  }

  void _selectKind(String kind) {
    if (kind == _kind) {
      return;
    }
    setState(() {
      _kind = kind;
      _chartFuture = widget.service.loadChart(kind);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(chartsMessages['titleZh'] ?? '排行榜')),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.all(16),
            child: SegmentedButton<String>(
              segments: const <ButtonSegment<String>>[
                ButtonSegment<String>(value: 'free', label: Text('免费榜')),
                ButtonSegment<String>(value: 'paid', label: Text('付费榜')),
              ],
              selected: <String>{_kind},
              onSelectionChanged: (Set<String> selection) => _selectKind(selection.first),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<ChartEntry>>(
              future: _chartFuture,
              builder: (
                BuildContext context,
                AsyncSnapshot<List<ChartEntry>> snapshot,
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
                    onRetry: () => _selectKind(_kind == 'free' ? 'paid' : 'free'),
                  );
                }
                final entries = snapshot.data ?? const <ChartEntry>[];
                if (entries.isEmpty) {
                  return const AppstoreScreenState(
                    kind: AppstoreScreenStateKind.empty,
                    message: '榜单暂无内容',
                  );
                }
                return ListView(
                  children: <Widget>[
                    for (final entry in entries)
                      AppstoreListTileCard(
                        title: entry.title,
                        subtitle: entry.developer,
                        leadingColor: entry.rank <= 3
                            ? Theme.of(context).colorScheme.primaryContainer
                            : null,
                        trailing: Text(
                          '${entry.rank}',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        onTap: () => Navigator.pushNamed(context, '/app/${entry.id}'),
                      ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
