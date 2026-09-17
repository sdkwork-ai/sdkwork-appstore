import '../models/app_detail_models.dart';

enum AppDetailStatus { idle, loading, ready, error }

class AppDetailState {
  const AppDetailState({
    this.status = AppDetailStatus.idle,
    this.lastResult,
    this.error,
  });

  final AppDetailStatus status;
  final AppDetailPageResult<Object?>? lastResult;
  final String? error;

  AppDetailState loading() => const AppDetailState(status: AppDetailStatus.loading);

  AppDetailState loaded(AppDetailPageResult<Object?> result) =>
      AppDetailState(status: AppDetailStatus.ready, lastResult: result);

  AppDetailState failed(String message) =>
      AppDetailState(status: AppDetailStatus.error, error: message);
}
