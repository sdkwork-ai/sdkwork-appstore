import '../models/updates_models.dart';

enum UpdatesStatus { idle, loading, ready, error }

class UpdatesState {
  const UpdatesState({
    this.status = UpdatesStatus.idle,
    this.lastResult,
    this.error,
  });

  final UpdatesStatus status;
  final UpdatesPageResult<Object?>? lastResult;
  final String? error;

  UpdatesState loading() => const UpdatesState(status: UpdatesStatus.loading);

  UpdatesState loaded(UpdatesPageResult<Object?> result) =>
      UpdatesState(status: UpdatesStatus.ready, lastResult: result);

  UpdatesState failed(String message) =>
      UpdatesState(status: UpdatesStatus.error, error: message);
}
