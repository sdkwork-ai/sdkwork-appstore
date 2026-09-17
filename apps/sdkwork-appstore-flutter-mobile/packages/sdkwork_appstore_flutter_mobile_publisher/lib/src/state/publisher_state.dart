import '../models/publisher_models.dart';

enum PublisherStatus { idle, loading, ready, error }

class PublisherState {
  const PublisherState({
    this.status = PublisherStatus.idle,
    this.lastResult,
    this.error,
  });

  final PublisherStatus status;
  final PublisherPageResult<Object?>? lastResult;
  final String? error;

  PublisherState loading() => const PublisherState(status: PublisherStatus.loading);

  PublisherState loaded(PublisherPageResult<Object?> result) =>
      PublisherState(status: PublisherStatus.ready, lastResult: result);

  PublisherState failed(String message) =>
      PublisherState(status: PublisherStatus.error, error: message);
}
