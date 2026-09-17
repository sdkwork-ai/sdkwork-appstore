import '../models/settings_models.dart';

enum SettingsStatus { idle, loading, ready, error }

class SettingsState {
  const SettingsState({
    this.status = SettingsStatus.idle,
    this.lastResult,
    this.error,
  });

  final SettingsStatus status;
  final SettingsPageResult<Object?>? lastResult;
  final String? error;

  SettingsState loading() => const SettingsState(status: SettingsStatus.loading);

  SettingsState loaded(SettingsPageResult<Object?> result) =>
      SettingsState(status: SettingsStatus.ready, lastResult: result);

  SettingsState failed(String message) =>
      SettingsState(status: SettingsStatus.error, error: message);
}
