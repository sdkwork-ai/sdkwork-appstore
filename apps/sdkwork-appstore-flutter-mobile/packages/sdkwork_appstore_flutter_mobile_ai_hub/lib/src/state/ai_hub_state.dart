import '../models/ai_hub_models.dart';

enum AiHubStatus { idle, loading, ready, error }

class AiHubState {
  const AiHubState({
    this.status = AiHubStatus.idle,
    this.lastResult,
    this.error,
  });

  final AiHubStatus status;
  final AiHubPageResult<Object?>? lastResult;
  final String? error;

  AiHubState loading() => const AiHubState(status: AiHubStatus.loading);

  AiHubState loaded(AiHubPageResult<Object?> result) =>
      AiHubState(status: AiHubStatus.ready, lastResult: result);

  AiHubState failed(String message) =>
      AiHubState(status: AiHubStatus.error, error: message);
}
