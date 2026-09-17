import '../models/discover_models.dart';

enum DiscoverStatus { idle, loading, ready, error }

class DiscoverState {
  const DiscoverState({
    this.status = DiscoverStatus.idle,
    this.lastResult,
    this.error,
  });

  final DiscoverStatus status;
  final DiscoverPageResult<Object?>? lastResult;
  final String? error;

  DiscoverState loading() => const DiscoverState(status: DiscoverStatus.loading);

  DiscoverState loaded(DiscoverPageResult<Object?> result) =>
      DiscoverState(status: DiscoverStatus.ready, lastResult: result);

  DiscoverState failed(String message) =>
      DiscoverState(status: DiscoverStatus.error, error: message);
}
