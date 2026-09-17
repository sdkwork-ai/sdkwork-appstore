import '../models/apps_models.dart';

enum AppsStatus { idle, loading, ready, error }

class AppsState {
  const AppsState({
    this.status = AppsStatus.idle,
    this.lastResult,
    this.error,
  });

  final AppsStatus status;
  final AppsPageResult<Object?>? lastResult;
  final String? error;

  AppsState loading() => const AppsState(status: AppsStatus.loading);

  AppsState loaded(AppsPageResult<Object?> result) =>
      AppsState(status: AppsStatus.ready, lastResult: result);

  AppsState failed(String message) =>
      AppsState(status: AppsStatus.error, error: message);
}
