import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/events_messages.dart';
import '../models/events_models.dart';
import '../services/events_service.dart';

/// Store event screen (canonical route `app.store.events.detail`).
///
/// Mirrors the PC EventPage: gradient header with schedule and status badge
/// plus order-preserving participating listing rows.
class EventScreen extends StatefulWidget {
  const EventScreen({required this.service, required this.eventId, super.key});

  final EventsService service;
  final String eventId;

  @override
  State<EventScreen> createState() => _EventScreenState();
}

class _EventScreenState extends State<EventScreen> {
  late Future<EventDetail> _detailFuture;

  @override
  void initState() {
    super.initState();
    _detailFuture = widget.service.loadDetail(widget.eventId);
  }

  void _reload() {
    setState(() => _detailFuture = widget.service.loadDetail(widget.eventId));
  }

  String get _statusLabel {
    return '进行中';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(eventsMessages['titleZh'] ?? '限时活动')),
      body: FutureBuilder<EventDetail>(
        future: _detailFuture,
        builder: (BuildContext context, AsyncSnapshot<EventDetail> snapshot) {
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
                      Theme.of(context).colorScheme.tertiary,
                      Theme.of(context).colorScheme.error,
                    ],
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Chip(
                      label: Text(
                        _statusLabel,
                        style: TextStyle(
                          fontSize: 11,
                          color: Theme.of(context).colorScheme.onTertiaryContainer,
                        ),
                      ),
                      visualDensity: VisualDensity.compact,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      detail.title,
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
                    if (detail.startsAt.isNotEmpty || detail.endsAt.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 8),
                      Text(
                        '开始 ' + detail.startsAt + ' / 结束 ' + detail.endsAt,
                        style: Theme.of(context)
                            .textTheme
                            .labelSmall
                            ?.copyWith(color: Colors.white70),
                      ),
                    ],
                  ],
                ),
              ),
              AppstoreSectionHeader(title: '活动应用 · ' + detail.apps.length.toString()),
              if (detail.apps.isEmpty)
                const AppstoreScreenState(
                  kind: AppstoreScreenStateKind.empty,
                  message: '该活动暂无参加应用',
                )
              else
                for (final app in detail.apps)
                  AppstoreListTileCard(
                    title: app.title,
                    subtitle: app.developer,
                    onTap: () => Navigator.pushNamed(context, '/app/' + app.id),
                  ),
            ],
          );
        },
      ),
    );
  }
}
