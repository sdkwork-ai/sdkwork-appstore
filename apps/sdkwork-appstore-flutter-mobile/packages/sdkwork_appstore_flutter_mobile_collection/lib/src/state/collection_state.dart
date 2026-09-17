import '../models/collection_models.dart';

enum CollectionStatus { idle, loading, ready, error }

class CollectionState {
  const CollectionState({
    this.status = CollectionStatus.idle,
    this.lastResult,
    this.error,
  });

  final CollectionStatus status;
  final CollectionPageResult<Object?>? lastResult;
  final String? error;

  CollectionState loading() => const CollectionState(status: CollectionStatus.loading);

  CollectionState loaded(CollectionPageResult<Object?> result) =>
      CollectionState(status: CollectionStatus.ready, lastResult: result);

  CollectionState failed(String message) =>
      CollectionState(status: CollectionStatus.error, error: message);
}
