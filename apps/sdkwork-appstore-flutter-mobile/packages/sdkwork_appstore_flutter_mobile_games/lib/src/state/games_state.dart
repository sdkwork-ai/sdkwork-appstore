import '../models/games_models.dart';

enum GamesStatus { idle, loading, ready, error }

class GamesState {
  const GamesState({
    this.status = GamesStatus.idle,
    this.lastResult,
    this.error,
  });

  final GamesStatus status;
  final GamesPageResult<Object?>? lastResult;
  final String? error;

  GamesState loading() => const GamesState(status: GamesStatus.loading);

  GamesState loaded(GamesPageResult<Object?> result) =>
      GamesState(status: GamesStatus.ready, lastResult: result);

  GamesState failed(String message) =>
      GamesState(status: GamesStatus.error, error: message);
}
