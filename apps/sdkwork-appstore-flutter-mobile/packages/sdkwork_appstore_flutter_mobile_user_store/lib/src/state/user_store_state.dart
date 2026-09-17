import '../models/user_store_models.dart';

enum UserStoreStatus { idle, loading, ready, error }

class UserStoreState {
  const UserStoreState({
    this.status = UserStoreStatus.idle,
    this.lastResult,
    this.error,
  });

  final UserStoreStatus status;
  final UserStorePageResult<Object?>? lastResult;
  final String? error;

  UserStoreState loading() => const UserStoreState(status: UserStoreStatus.loading);

  UserStoreState loaded(UserStorePageResult<Object?> result) =>
      UserStoreState(status: UserStoreStatus.ready, lastResult: result);

  UserStoreState failed(String message) =>
      UserStoreState(status: UserStoreStatus.error, error: message);
}
