import '../models/charts_models.dart';

enum ChartsStatus { idle, loading, ready, error }

class ChartsState {
  const ChartsState({
    this.status = ChartsStatus.idle,
    this.lastResult,
    this.error,
  });

  final ChartsStatus status;
  final ChartsPageResult<Object?>? lastResult;
  final String? error;

  ChartsState loading() => const ChartsState(status: ChartsStatus.loading);

  ChartsState loaded(ChartsPageResult<Object?> result) =>
      ChartsState(status: ChartsStatus.ready, lastResult: result);

  ChartsState failed(String message) =>
      ChartsState(status: ChartsStatus.error, error: message);
}
